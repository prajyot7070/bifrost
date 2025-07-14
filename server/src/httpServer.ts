import http from 'http'
import { json } from 'stream/consumers';
import { connectionMap } from '.';
import { ClientConnection } from './tcpServer';
import { getRandomValues } from 'crypto';

export class HTTPServer {
  port: number;
  server: http.Server | null = null;
  private pendingRequests = new Map<string, http.ServerResponse>(); //<requestId, response handler>
  private userRequestStats = new Map<string, {count: number, windowStart: number}>(); //<ip_addr, time in sec>
  private clientRequests = new Map<string, Set<string>>(); //<clientConnection.id , Set<requestId's, . . .>>
  private readonly RATE_LIMIT_WINDOW_MS = 1000 * 60; // 1 sec
  private readonly MAX_REQ_PER_WINDOW = 100;

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
      let userStats = this.userRequestStats.get(userIp);
      if (!userStats || now - userStats.windowStart >= this.RATE_LIMIT_WINDOW_MS) {
        userStats = {
          count: 1,
          windowStart: now,
        };
      } else {
        userStats.count++;
        this.userRequestStats.set(userIp, userStats);
        if (userStats.count > this.MAX_REQ_PER_WINDOW) {
          console.warn(`Rate limit exceeded for Ip ${userIp}\n Subdomain: ${req.headers.host}\n Requests: ${userStats.count} in ${this.RATE_LIMIT_WINDOW_MS / 1000}s`);
          res.writeHead(429, {'content-type': 'text/plain'});
          res.end('Too many requests. Please try again later');
        }
      }

      const headers = this.normalizeHTTPHeaders(req.headers as {[key: string] : string | string[]});

      // Prepare HTTP request data to send to client
      const requestData = {
        type: 'HTTP_REQUEST',
        requestId: this.generateRequestId(),
        method: req.method,
        url: req.url,
        headers: headers,
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
      console.log(`Request received :- ${requestData}`);
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

  normalizeHTTPHeaders(headers: {[key: string] : string | string[]}) : {[key: string] : string[]} {
    const normalised : {[key: string] : string[]} = {};
    for (const key in headers) {
      if(Object.prototype.hasOwnProperty.call(headers, key)){
        const value = headers[key];
        normalised[key] = Array.isArray(value) ? value : [String(value)];
      }
    }
    return normalised;
  }

}
