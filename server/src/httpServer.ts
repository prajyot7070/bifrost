import http from 'http'
import { json } from 'stream/consumers';
import { connectionMap } from '.';
import { ClientConnection } from './tcpServer';

export class HTTPServer {
  port: number;
  server: http.Server | null = null;
  private pendingRequests = new Map<string, http.ServerResponse>(); //<requestId, response handler>
  private userRequestTimestamp = new Map<string, number>(); //<subdomain, time in sec>
  private clientRequests = new Map<string, Set<string>>(); //<clientConnection.id , Set<requestId's, . . .>>
  private readonly RATE_LIMIT_WINDOW = 1000; // 1 sec

  constructor(port: number) {
    this.port = port;
  }

  createServer() {
    this.server = http.createServer((req, res) => {
      const host = req.headers.host;
      if(!host) {
        res.writeHead(400, {'Content-Type': 'text/plain'});
        res.end('Bad Request: Missing Host header');
        return;
      }

      const subdomain = this.extractSubdomain(host);
      if (!subdomain) {
        res.writeHead(404, { 'Content-Type': 'text/plain'});
        res.end('Tunnel not found');
        return;
      }

      console.log(`subdomain :- ${subdomain}`);
      const clientConnectioon = connectionMap.get(subdomain);
      if (!clientConnectioon || !clientConnectioon.isActive) {
        res.writeHead(404, {'Content-Type': 'text/plain'});
        res.end('Tunnel not active');
        return;
      }
      this.forwardToClient(req, res, clientConnectioon);
    })
    this.server?.listen(this.port, () => {
        console.log(`HTTP server listening on localhost://${this.port}`);
      })
  }

  private extractSubdomain(host: string) : string | null {
    const parts = host.split('.');
    if (parts.length >= 3) {
      return parts[0];
    }
    return null;
  }

  private async forwardToClient(
    req: http.IncomingMessage, 
    res: http.ServerResponse, 
    clientConnection: ClientConnection
  ) {
    try {
      //check for rate limit
      const now = Date.now();
      const userIp = req.socket.remoteAddress ?? 'unknown';
      const userRequestTime = this.userRequestTimestamp.get(userIp) || 0;
      if (now - userRequestTime < this.RATE_LIMIT_WINDOW) {
        console.warn(`Rate limit exceeded for ${clientConnection.subdomain}`);
        res.writeHead(429,{'content-type':'text/plain'});
        res.end('Too many requests');
      }
      //update the userRequestTime 
      this.userRequestTimestamp.set(userIp, now);

      // Prepare HTTP request data to send to client
      const requestData = {
        type: 'HTTP_REQUEST',
        requestId: this.generateRequestId(),
        method: req.method,
        url: req.url,
        headers: req.headers,
        body: await this.readRequestBody(req)
      };

      // Store response handler for this request
      const requestId = requestData.requestId;
      this.pendingRequests.set(requestId, res);
      //store the clientId and requests
      if (!this.clientRequests.has(clientConnection.id)) {
        this.clientRequests.set(clientConnection.id, new Set());
      }
      this.clientRequests.get(clientConnection.id)!.add(requestId);

      // Send request to client via TCP connection FIX: added \n
      clientConnection.socket.write(JSON.stringify(requestData) + '\n');

      // Set timeout for the request
      setTimeout(() => {
        if (this.pendingRequests.has(requestId)) {
          this.pendingRequests.delete(requestId);
          this.clientRequests.get(clientConnection.id)?.delete(requestId);
          if (!res.headersSent) {
            res.writeHead(504, { 'Content-Type': 'text/plain' });
            res.end('Gateway Timeout');
          }
        }
      }, 30000); // 30 second timeout

    } catch (error) {
      console.error('Error forwarding request:', error);
      if (!res.headersSent) {
        res.writeHead(500, { 'Content-Type': 'text/plain' });
        res.end('Internal Server Error');
      }
    }
  }

  private generateRequestId(): string {
    return Math.random().toString(36).substring(2) + Date.now().toString(36);
  }

  private readRequestBody(req: http.IncomingMessage): Promise<string> {
    return new Promise((resolve) => {
      let body = '';
      req.on('data', (chunk) => {
        body += chunk.toString();
      });
      req.on('end', () => {
        resolve(body);
      })
    })
  }

  handleClientResponse(responseData: any) {
    const { requestId, statusCode, headers, body } = responseData;
    const res = this.pendingRequests.get(requestId);
    
    if (res && !res.headersSent) {
      res.writeHead(statusCode || 200, headers || {});
      res.end(body || '');
      this.pendingRequests.delete(requestId);
    }
  }

  cleanupClientRequests(clientId: string) {
    if (this.clientRequests.has(clientId)) {
      const requestIds = this.clientRequests.get(clientId);
      if (requestIds) {
        for (const requestId of requestIds) {
          const res = this.pendingRequests.get(requestId);
          if (res && !res.headersSent) {
            res.writeHead(502, { 'Content-Type': 'text/plain' });
            res.end('Bad Gateway: The tunnel connection was closed.');
          }
          this.pendingRequests.delete(requestId);
        }
        this.clientRequests.delete(clientId);
      }
      
    }
  }

}
