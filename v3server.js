//Defining utility functions
import { timerToString } from './remastered-lib/util/export.js';
import epoch from './epoch.js';

const serverEpoch = 1613122192045;
console.log(`It's been ${timerToString(Date.now() - serverEpoch)} since the server epoch`);
import { mongoDB, startBots, stopBots } from './globals/export.js';
//Server Requirements
import path from 'path';
import fs from 'fs';
import http from 'http';
import https from 'https';
import { dirname } from 'path';
import { fileURLToPath } from 'url';
//Middleware
import cors from 'cors';
import express from 'express';
import WebSocket from 'ws';
const app = express();
/**
 * @type {http.Server}
 */
let httpsServer;
/**
 * @type {https.Server}
 */
let httpServer;
if (process.env.NODE_ENV == 'development') {
    process.env.PORT = process.env.PORT || 443;
    //HTTP/HTTPS server requirements
    const key = fs.readFileSync('encryption/server.key') + '';
    const cert = fs.readFileSync('encryption/www_collapsa_io.crt') + '';
    const ca = fs.readFileSync('encryption/www_collapsa_io.ca-bundle') + '';
    let httpsOptions = {
        key: key,
        cert: cert,
        ca: ca,
    };
    httpsServer = https.createServer(httpsOptions, app).listen(443, () => {
        console.log('listening on port 443');
        //loadEvents.set('HTTPS Server', ['HTTPS Server is listening', timerToString(Date.now() - loginStart)]);
        //checkStatus();
    });
    global.hServer = httpsServer;
} else {
    process.env.PORT = process.env.PORT || 80;
    httpServer = http.createServer(app).listen(process.env.PORT, () => {
        console.log('listening on port 80');
    });
    app.use(function (req, res, next) {
        /*res.setHeader('Strict-Transport-Security', 'max-age=8640000; includeSubDomains');
        if (req.headers['x-forwarded-proto'] && req.headers['x-forwarded-proto'] === 'http') {
            return res.redirect(301, 'https://' + req.hostname + req.url);
        } else {
            return next();
        }*/
        next();
    });
    global.hServer = httpServer;
}
//import discordBotClient from './globals/discordBotClient.js';
//Server Routing
app.use(express.json());
app.use(express.text());
app.use(cors());
//API
/*
import apiRouter from './api/routes/apiRouter.js';
app.use('/api', apiRouter);
*/
//Game related
const __dirname = dirname(fileURLToPath(import.meta.url));
const serveDir = (reqPath, searchPath) => {
    if (process.env.NODE_ENV === 'development') app.use(reqPath, express.static(__dirname + searchPath));
    else
        app.use(reqPath, (req, res, next) => {
            if (fs.existsSync('.' + searchPath + req.url)) res.sendFile(path.join(__dirname, searchPath + req.url));
            else next();
        });
};
app.get('/', (req, res) => res.sendFile(path.join(__dirname, '/v3client/html/index.html')));
/*app.get('/rakurekillhtml', (req, res) => {
    stopBot();
    res.send('');
    res.end();
});
app.get('/rakurestarthtml', (req, res) => {
    startBot();
    res.send('');
    res.end();
});*/
serveDir('/v3client', '/v3client');
serveDir('/client', '/client');
serveDir('/', '/v3client');
serveDir('/shared', '/shared');
app.use((req, res, next) => {
    res.status(404).sendFile(__dirname + '/v3client/html/404.html');
});
//Game Stuff
import { Game, Games } from './v3lib/Game.js';
new Game('usaeast1');
global.hServer.on('upgrade', (request, socket, head) => {
    if (request.url.match(/^\/games\//)) {
        if (Games.has(request.url.match(/^\/games\/(.*)/)[1])) {
            Games.get(request.url.match(/^\/games\/(.*)/)[1]).wss.handleUpgrade(request, socket, head, (ws) => {
                Games.get(request.url.match(/^\/games\/(.*)/)[1]).wss.emit('connection', ws, request);
            });
        } else socket.destroy();
    } else if (request.url === '/localbot') {
        wss.handleUpgrade(request, socket, head, (ws) => {
            wss.emit('connection', ws, request);
        });
    } else console.log(request.url);
});
