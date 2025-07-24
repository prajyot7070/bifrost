import { randomBytes } from "crypto";
import net from "net"
import { connectionMap } from ".";
import { HTTPServer } from "./httpServer";
import { connect } from "http2";
import { error } from "console";

export interface ClientConnection {
  id: string;
  apiKey: string;
  socket: net.Socket;
  subdomain: string;
  localPort: number;
  publicUrl: string;
  isActive: boolean;
  requestCount: number;
  lastActivity: Date;
}

export class TCPServer {
  port: number;
  server: net.Server | null = null;
  httpServer: HTTPServer | null = null;
  private connections = new Set<net.Socket>(); //set of connections
  private readonly MAX_CONNECTIONS = 1000;
  private readonly CONNECTION_TIMEOUT = 300000;
  private readonly HEARTBEAT_INTERVAL = 30000;

  //constructor
  constructor(port: number) {
    this.port = port;
  }

  setHTTPServer(httpServer: HTTPServer) {
    this.httpServer = httpServer;
  }

  generateUniqueId(): string {
    return randomBytes(6).toString('hex');
  }
  
  createPublicURL(subdomain: string): string {
    const domain = "bifrost.prajyot.dev"; //put this in config
    return `https://${subdomain}.${domain}`
  }
  
  //create tcp server and start listening 
  createServer() {
    this.server = net.createServer((socket) => {
      // Client should send token with 'CONNECT' msg
	    console.log(`Client connected from ${socket.remoteAddress}:${socket.remotePort}`);
	    socket.setTimeout(this.CONNECTION_TIMEOUT);
	    //check connection limit
	    if (this.connections.size >= this.MAX_CONNECTIONS) {
	        console.warn('Connection limit reached, rejecting new connection');
	        socket.end('{"type":"ERROR", "message":"Connection limit reached"}');
	        return;
	      }
	    this.connections.add(socket);
	    let clientConnection: ClientConnection | null = null;
	    let heartbeatInterval: NodeJS.Timeout | null = null;
      let messageBuff = '';
      //heartbeat 
      const startHeartbeat = () => {
        heartbeatInterval = setInterval(() => {
          if (clientConnection) {
            const timeSinceLastActivity = new Date().getTime() - clientConnection.lastActivity.getTime();
            if (timeSinceLastActivity > this.HEARTBEAT_INTERVAL * 2) {
              console.log(`Heartbeat timeout for client ${clientConnection.id}. Disconnecting`);
              socket.destroy();
              //delete the tunnel from db
				      this.removeClientConnectionById(clientConnection.id);
              return;
            }
          }
          this.sendHeartBeat(socket);
        }, this.HEARTBEAT_INTERVAL);
      };

      const stopHeartBeat = () => {
        if (heartbeatInterval) {
          clearInterval(heartbeatInterval);
        }
      }

			socket.on('data', async (data) => {
        messageBuff += data.toString();
        let boundary = messageBuff.indexOf('\n');
        while (boundary !== -1) {
          const messageString = messageBuff.substring(0, boundary);
          messageBuff = messageBuff.substring(boundary+1);
          if (messageString) {
            try {
		          const message = JSON.parse(messageString);
		          console.log("message :-", message);
		          if(message.type === 'CONNECT') {
		            clientConnection = await this.handleConnect(message, socket);
		            if (clientConnection) {
		              startHeartbeat();
		            }
		          } else if (clientConnection) {
                switch (message.type) {
                  case 'HTTP_RESPONSE':
                    this.handleHTTPResponse(message, clientConnection);
                    break;
                  case 'HEARTBEAT_RESPONSE':
                    clientConnection.lastActivity = new Date();
                    console.log(`Heartbeat response from ${clientConnection.id}`);
                  default:
                    console.log(`Received message of unknown type: ${message.type}`);
                    break;
                }
		          } else {
                console.warn("Received message before connection was established");
              }
	          } catch (error) {
			          console.error(`Error parsing client message: ${error}`);
			          socket.write(JSON.stringify({
			            type: 'ERROR',
			            message: 'Invalid message format'
			          }) + '\n');
	          }   
          }
          boundary = messageBuff.indexOf('\n');
        }
	        
			});

			socket.on('close', (hadError) => {
        stopHeartBeat();
	      this.connections.delete(socket);
	      if (clientConnection) {
          console.log(`Client ${clientConnection.id} disconnected`); 
          clientConnection.isActive = false;
	        connectionMap.delete(clientConnection.subdomain);
	        if (this.httpServer) {
	          this.httpServer.cleanupClientRequests(clientConnection.id);
	        }
	      } else {
          console.log("An anonymous client disconnected");
        }
	      console.log(`Client disconnected. Total connections ${this.connections.size}`);
			  });

			socket.on('error', (err) => {
			  console.log("Socket error :- ", err.message);
			  })
	
	    socket.on('timeout', () => {
	        console.log('Socket timeout, closing connection');
	        socket.destroy();
	      })
	
			});
			
			this.server.listen(this.port,() => {
			  console.log(`TCP server is listening on port ${this.port}`);
			});
  }

  private handleHTTPResponse(message: any, clientConnection: ClientConnection) {
    //http server will send back this as response to the recieved request
    console.log(`Received HTTP response from client ${clientConnection.id}`);
    if (this.httpServer) {
      this.httpServer.handleClientResponse(message);
    }
  }

  private async handleConnect(message: any, socket: net.Socket) : Promise<ClientConnection | null> {
    const clientId = this.generateUniqueId();
	  const subdomain = `tunnel-${clientId}`;
	  const publicUrl = this.createPublicURL(subdomain);
    const apiKey = message.apikey;
	 
	  const clientConnection = {
	    id: clientId,
      apiKey: apiKey,
	    socket: socket,
	    subdomain: subdomain,
	    localPort: message.localPort,
	    publicUrl: publicUrl,
	    isActive: true,
	    requestCount: 0,
	    lastActivity: new Date()
	  };
	
    //add new tunnel to database
    try {
      const res = await fetch('https://bifrost.prajyot.dev/api/tunnels', {
      method: "POST",
      headers: {
        "Content-Type":"application/json",
        "Authorization":`Bearer ${apiKey}`
      },
      body: JSON.stringify({
        clientId: clientId,
	      subdomain: subdomain,
	      publicUrl: publicUrl,
	      localPort: message.localPort,
	      lastActivity: new Date().toISOString()
      }),
    });
      if (!res.ok) {
      console.error(await res.json());
      throw new Error(await res.json());
    }
    } catch (error) {
      console.error(error);
    }
   	
    connectionMap.set(subdomain, clientConnection);

	  const response = {
	    type: 'CONNECTION_ESTABLISHED',
	    clientId: clientId,
	    publicUrl: publicUrl,
	    status: 'success'
	  };
	 
	  socket.write(JSON.stringify(response) + '\n');
	  console.log(`Client connected :- ${clientId} -> ${publicUrl}`);
    return clientConnection;

  }

  private async removeClientConnectionById(clientId: string) {
    const conn = [...connectionMap.values()].find(c => c.id === clientId);
    if (!conn) return;
    try {
      await fetch("https://bifrost.prajyot.dev/tunnels",{ //need to put this url in config or env file
        method: "DELETE",
        headers: {
          "Content-Type":"application/json",
          "Authorization":`Bearer ${conn.apikey}`,
        },
        body: JSON.stringify({tunnelId: conn.id})
      })
    } catch (error) {
      console.error("Error while deleting connection from db:",error);
    }
  }

  private sendHeartBeat(socket: net.Socket) {
    try {
      const heartbeat = {
        type : 'HEARTBEAT',
        timestamp: Date.now()
      };
      socket.write(JSON.stringify(heartbeat) + '\n');
      console.log("Sent heartbeat");
    } catch (error) {
      console.error(`Error sending heartbeat: ${error}`);
    }
  }
}
