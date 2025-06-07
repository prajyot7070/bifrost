import net from 'net'
import { nextTick } from 'process'
import { BufferSource } from 'stream/web';
import { ClientConnection, TCPServer } from './tcpServer';
import { HTTPServer } from './httpServer';

const TCP_PORT = 8080
const HTTP_PORT = 7070

let connectionMap: Map<string, ClientConnection>;

const tcp = new TCPServer(TCP_PORT);
const http_proxy = new HTTPServer(HTTP_PORT);

tcp.createServer();
http_proxy.createServer();

