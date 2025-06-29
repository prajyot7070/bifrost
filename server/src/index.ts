import net from 'net'
import { nextTick } from 'process'
import { BufferSource } from 'stream/web';
import { TCPServer } from './tcpServer';
import { HTTPServer } from './httpServer';

const TCP_PORT = 8080
const HTTP_PORT = 7070

export const connectionMap = new  Map<string, any>();

const tcp = new TCPServer(TCP_PORT);
const http_proxy = new HTTPServer(HTTP_PORT);

http_proxy.createServer();

tcp.setHTTPServer(http_proxy);
tcp.createServer();


