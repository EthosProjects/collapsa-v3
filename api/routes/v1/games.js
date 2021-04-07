import express from 'express';
import { util } from '../../../remastered-lib/export.js';
const JSONtoString = util.JSONtoString;
import mongoDB from '../../../globals/mongoDB.js';
let gameRouter = express.Router();
gameRouter
    .get('/', (req, res) => {
        res.set('Content-Type', 'text/javascript');
        res.send(JSONtoString([...Games.keys()])).end();
    })
    .get('/:gamelink', (req, res) => {
        let auth = req.collapsaAPI.auth;
        if (!req.headers['authorization']) return res.status(401).send('Unauthorized').end();
        if (!(auth.user.authorization & 2)) return res.status(401).send('Unauthorized').end();
        let gamelink = req.params.gamelink;
        if (!Games.has(gamelink)) return res.status(404).send('Not Found').end();
        console.log(`Administrative access has been authorized for ${auth.user.username} with id ${auth.user.id}`);
        res.status(200).send().end();
    })
    .post('/:gamelink/login', (req, res) => {
        let auth = req.collapsaAPI.auth;
        if (!req.headers['authorization']) return res.status(401).send('Unauthorized');
        if (!(auth.user.authorization & 1)) return res.status(401).send('Unauthorized');
        let gamelink = req.params.gamelink;
        if (!Games.has(gamelink)) return res.status(404).send('Not Found');
        const openGame = Games.get(gamelink);
        let sockets = [...openGame.wss.clients.values()];
        for (let i = 0; i < sockets.length; i++) {
            let socket = sockets[i];
            if (socket.id === req.body) {
                socket.userid = auth.user.id;
                return res.status(200).end();
            }
        }
        return res.status(404).send('Not found').end();
    });
export default gameRouter;
