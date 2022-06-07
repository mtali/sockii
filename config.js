const path = require('path');

module.exports = {
    namespace: 'PubSub',
    redis: {
        client: 'redis',
        options: {
            host: '127.0.0.1',
            port: 6379,
            connect_timeout: 3600000,
        },
    },
    logger: {
        enabled: true,
        options: {
            level: 'info',  
            streams: [
                {
                    path: path.normalize(`${__dirname}/logs/redis-smq.log`)
                },
            ],

        },
    },
    messages: {
      store: false,
    },

    server: {
        host: '127.0.0.1',
        port: 5000,
        socketOpts: {
         
        }
      }
    
};