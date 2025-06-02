import * as redis from 'redis';

let client = {}

let statusConnectRedis = {
    CONNECT: 'connect',
    END: 'end',
    RECONNECT: 'reconnecting',
    ERROR: 'error',
}

const handleEventConnect = ({ connectionRedis }) => {
    connectionRedis.on(statusConnectRedis.CONNECT, () => {
        console.log('connectionRedis - Connection status: connected'); 
    })
    
    connectionRedis.on(statusConnectRedis.RECONNECT, () => {
        console.log('connectionRedis - Connection status: reconnecting'); 
    })

    connectionRedis.on(statusConnectRedis.END, () => {
        console.log('connectionRedis - Connection status: disconnected'); 
    })

    connectionRedis.on(statusConnectRedis.ERROR, (err) => {
        console.error('connectionRedis - Error:', err);
    })
}

const initRedis = (config) => {
    const instanceRedis = redis.createClient(config)
    client.instanceConnect = instanceRedis
    handleEventConnect({ connectionRedis: instanceRedis})
}

const getRedis = () => {
    return client
}

const closeRedis = () => {

}

export {
    initRedis,
    getRedis,
    closeRedis,
}