import express from 'express';
import cors from 'cors';

const app = express();
const http = require("http").createServer(app)
const io = require("socket.io")(http)

const host = 'localhost'
const port = 8080

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(cors());

io.on('connection', socket => {
    // console.log('a user connected');

    socket.on('sendMessage', message => {
        socket.emit('newMessage', message)
    })
})

http.listen(6000, () => {
    console.log(`SocketIO is running at 6000`)
})

app.listen(port, host, () => {
    console.log(`Server running at http://${host}:${port}`)
})