//manages the client to server tunnels
import { randomBytes } from "crypto";
import net from "net"
import { connectionMap } from ".";
import { HTTPServer } from "./httpServer";

export interface ClientConnection {
  id: string;
  socket: net.Socket;
  subdomain: string;
  localPort: number;
  publicUrl: string;
  isActive: boolean
}

export class TCPServer {
  port: number;
  server: net.Server | null = null;
  httpServer: HTTPServer | null = null;

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
    const domain = "www.prajyot.dev";
    return `https://${subdomain}.${domain}`
  }
  
  //create tcp server and start listening 
  createServer() {
    const server = net.createServer((socket) => {
    console.log("Client connected");

    let clientConnection: ClientConnection | null = null;

		socket.on('data', (data) => {
        try {
          const message = JSON.parse(data.toString());
          
          if(message.type === 'CONNECT') {
            const clientId = this.generateUniqueId();
            const subdomain = `tunnel-${clientId}`;
            const publicUrl = this.createPublicURL(subdomain);

            clientConnection = {
              id: clientId,
              socket: socket,
              subdomain: subdomain,
              localPort: message.localPort,
              publicUrl: publicUrl,
              isActive: true
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

          } 
          else if (message.type === 'HTTP_RESPONSE' && clientConnection){
            //client sent HTTP back
            this.handleHTTPResponse(message, clientConnection);
          }
        } catch (error) {
          console.error(`Error parsing client message: ${error}`);
          socket.write(JSON.stringify({
            type: 'ERROR',
            message: 'Invalid message format'
          }));
        }
		  });
		
    socket.on('end', () => {
		  console.log("Client disconnected");
		  });
		
		socket.on('error', (err) => {
		  console.log("Socket error :- ", err.message);
		  })
		  
		socket.on('close', (hadError) => {
		  if (hadError) {
		    console.log("Socket closed due to error");
		  } else {
		      console.log("Socket closed normally");
			}
		  });
		 
		});
		
		server.listen(this.port,() => {
		  console.log(`Server is listening on port ${this.port}`);
		});
  }

  private handleHTTPResponse(message: any, clientConnection: ClientConnection) {
    //http server will send back this as response to the recieved request
    console.log(`Received HTTP response from client ${clientConnection.id}`);
    if (this.httpServer) {
      this.httpServer.handleClientResponse(message);
    }
  }
}
