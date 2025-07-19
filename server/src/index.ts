import { TCPServer } from './tcpServer';
import { HTTPServer } from './httpServer';
import process from 'process';
import dotenv from 'dotenv';

dotenv.config();

const TCP_PORT : number = parseInt(process.env.TCP_PORT || '0', 10);
const HTTP_PORT : number = parseInt(process.env.HTTP_PORT || '0', 10);

export const connectionMap = new  Map<string, any>();

const tcp = new TCPServer(TCP_PORT);
const http_proxy = new HTTPServer(HTTP_PORT);

http_proxy.createServer();

tcp.setHTTPServer(http_proxy);
tcp.createServer();


