const { createServer } = require("http");
const { Server } = require("socket.io");
const { instrument } = require("@socket.io/admin-ui");

const server = createServer();

const PORT = process.env.PORT || 3000;

const io = new Server(server, {
  cors: {
    origin: ["https://admin.socket.io"],
    credentials: true
  }
});

io.on('connection', (socket) => {
    console.log('a user connected');
    socket.on('disconnect', () => {
        console.log('user disconnected');
    });

    socket.on('publish', (msg, param, callback) => {
        console.log('Received publish message: ' + msg);
        callback({
            status: 'ok'
        });
    });
});

instrument(io, {
  auth: false
});

server.listen(PORT, '0.0.0.0', () => {
    var host = server.address().address;
    var port = server.address().port;
    console.log("server is listening at http://%s:%s", host, port);
});