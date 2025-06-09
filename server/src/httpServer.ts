import http from 'http'
import { json } from 'stream/consumers';
import { connectionMap } from '.';
import { ClientConnection } from './tcpServer';

export class HTTPServer {
  port: number;
  server: http.Server | null = null;
  private pendingRequests = new Map<string, http.ServerResponse>();

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

      // Send request to client via TCP connection
      clientConnection.socket.write(JSON.stringify(requestData));

      // Set timeout for the request
      setTimeout(() => {
        if (this.pendingRequests.has(requestId)) {
          this.pendingRequests.delete(requestId);
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
}
