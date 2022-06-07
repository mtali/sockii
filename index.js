const { createServer } = require("http");
const { Server } = require("socket.io");
const { instrument } = require("@socket.io/admin-ui");
const { registerConsumerPlugin, registerProducerPlugin } = require('redis-smq');
const { ConsumerMessageRatePlugin, ProducerMessageRatePlugin } = require('redis-smq-monitor');
const { Message, Producer} = require('redis-smq');
const { Consumer } = require('redis-smq');
const { MonitorServer } = require('redis-smq-monitor');

const server = createServer();
const PORT = process.env.PORT || 3000;
const io = new Server(server, {
  cors: {
    origin: ["https://admin.socket.io"],
    credentials: true
  }
});
const config = require('./config')



// Config Monitor
const monitorServer = MonitorServer.createInstance(config);
registerConsumerPlugin(ConsumerMessageRatePlugin);
registerProducerPlugin(ProducerMessageRatePlugin);


monitorServer.listen(() => {
    console.log('it works');
});

// Queue
const { QueueManager } = require('redis-smq');

const producer = new Producer(config);
const consumer = new Consumer(config);


QueueManager.createInstance(config, (err, queueManager) => {
    if (err) console.log(`Error ${err}`);
    else queueManager.queue.create('test_queue', false, (err) => {

    });
})


io.on('connection', (socket) => {
    console.log('a user connected');
    socket.on('disconnect', () => {
        console.log('user disconnected');
    });

    socket.on('publish', (msg, param, callback) => {
        console.log('SocketIO message ' + msg);
        const message = new Message();
        message.setBody(msg)
            .setTTL(3600000) // in millis
            .setQueue('test_queue');
        
        producer.produce(message, (err) => {
            if (err) console.log(err);
            else {
                const msgId = message.getId(); // string
                callback({
                    status: 'ok',
                    messageId: msgId
                });
            }
        });
        
    });
});

instrument(io, {
  auth: false
});

server.listen(PORT, '0.0.0.0', () => {
    var host = server.address().address;
    var port = server.address().port;
    console.log("Server is listening at http://%s:%s", host, port);
});

const messageHandler = (msg, cb) => {
    const payload = msg.getBody();
    console.log('Consuming message', payload);
    cb(); // acknowledging the message
 };

 consumer.consume('test_queue', messageHandler, (err) => {
    if (err) console.error(`Fuck errors ${err}`);
 });

 consumer.run();