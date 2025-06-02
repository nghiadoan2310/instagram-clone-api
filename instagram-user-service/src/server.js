require('dotenv').config()
import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser'

import * as initRedis from './config/redis'

const app = express();

const host = '192.168.9.4'
const port = 8080

app.use(cookieParser())

app.use(cors()); // Enable CORS for all requests

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

initRedis.initRedis({ url: process.env.URL_REDIS })
app.use(require('./routes'))

app.listen(port, host, () => {
    console.log(`Server is running at http://${host}:${port}`);
})
