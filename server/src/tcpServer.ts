//manages the client to server tunnels
import { randomBytes } from "crypto";
import net from "net"
import { connectionMap } from ".";
import { HTTPServer } from "./httpServer";
import { connect } from "http2";

export interface ClientConnection {
  id: string;
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
      // Auth / Verification using API key 

	    console.log("Client connected");
	    socket.setTimeout(this.CONNECTION_TIMEOUT);
	
	    //check connection limit
	    if (this.connections.size >= this.MAX_CONNECTIONS) {
	        console.warn('Connection limit reached, rejecting new connection');
	        socket.end();
	        return;
	      }
	
	    this.connections.add(socket);
	
	    let clientConnection: ClientConnection | null = null;
	    let heartbeatInterval: NodeJS.Timeout | null = null;

      //heartbeat 
      const startHeartbeat = () => {
        heartbeatInterval = setInterval(() => {
          if (clientConnection) {
            const timeSinceLastActivity = new Date().getTime() - clientConnection.lastActivity.getTime();
            if (timeSinceLastActivity > this.HEARTBEAT_INTERVAL * 2) {
              console.log(`Heartbeat timeout for client ${clientConnection.id}. Disconnecting`);
              socket.destroy();
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
	
			socket.on('data', (data) => {
	        try {
	          const message = JSON.parse(data.toString());
	          console.log("message :-", message);
	          
	          if(message.type === 'CONNECT') {
	            clientConnection = this.handleConnect(message, socket);
	            if (clientConnection) {
	              heartbeatInterval = setTimeout(() => {
	                this.sendHeartBeat(socket);
	              }, 30000);
	            }
	          } 
	          else if (message.type === 'HTTP_RESPONSE' && clientConnection){
	            this.handleHTTPResponse(message, clientConnection);
	          } else if (message.type === 'HEARTBEAT_RESPONSE' && clientConnection) {
	              clientConnection.lastActivity = new Date();
	          } else {
            console.warn("Received unknown message type");
          }
	        } catch (error) {
	          console.error(`Error parsing client message: ${error}`);
	          socket.write(JSON.stringify({
	            type: 'ERROR',
	            message: 'Invalid message format'
	          }) + '\n');
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

  private handleConnect(message: any, socket: net.Socket) : ClientConnection | null {
    const clientId = this.generateUniqueId();
	  const subdomain = `tunnel-${clientId}`;
	  const publicUrl = this.createPublicURL(subdomain);
	 
	  const clientConnection = {
	    id: clientId,
	    socket: socket,
	    subdomain: subdomain,
	    localPort: message.localPort,
	    publicUrl: publicUrl,
	    isActive: true,
	    requestCount: 0,
	    lastActivity: new Date()
	  };
	 
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

  private sendHeartBeat(socket: net.Socket) {
    try {
      const heartbeat = {
        type : 'HEARTBEAT',
        timestamp: Date.now()
      };
      socket.write(JSON.stringify(heartbeat) + '\n');
    } catch (error) {
      console.error(`Error sending heartbeat: ${error}`);
    }
  }
}
