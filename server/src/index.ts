import net from 'net'
import { nextTick } from 'process'
import { BufferSource } from 'stream/web';

const port = 8080

const server = net.createServer( (socket) => {
  console.log("Client connected");

  socket.on('data', (data) => {
    let time = Date.now();
    console.log(`Received :- ${data.toString()} time:- ${time}ms`);
    //eccho back
    process.nextTick
    socket.write(`Server Received :- ${data.toString()} time:- ${Date.now() - time}ms`);
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

server.listen(port,() => {
  console.log(`Server is listening on port ${port}`);
});

