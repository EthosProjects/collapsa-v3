import express from 'express';
import fs from 'fs';
import { JSONtoString } from '../../../remastered-lib/util/export.js';
import { database, collection } from '../../../mongoDB/export.js'
import mongoDB from '../../../globals/mongoDB.js'
/**
 * @type {database}
 */
let collapsa;
/**
 * @type {collection}
 */
let collapsauserbase;
const development =
    process.env.NODE_ENV !== 'development'
        ? {}
        : {
            /**
             * @type {fs.WriteStream}
            */
            APILogStream: fs.createWriteStream('./api/logs/api.access.log', { flags: 'w' }),
        };
let v1Router = express.Router();
import usersRouter from './users.js';
import gamesRouter from './games.js';
v1Router.get('/', (req, res) => {
    res.set('Content-Type', 'text/javascript');
    res.send(
        JSONtoString({
            availableEndpoints: ['users', 'games'],
        }),
    );
});
const writeToLog = (data) => {
    if (process.env.NODE_ENV == 'development') development.APILogStream.write(data);
    else console.log(data);
};
v1Router.use((req, res, next) => {
    if (req.headers['authorization']) {
        let auth = req.headers['authorization'].split(' ');
        if (auth.length !== 2) {
            writeToLog(`Failed to authorize because authorization header is invalid\n`);
            res.status(401).send('Unauthorized');
        }
        let userDoc = collapsauserbase.findDocument((d) => d.data.token == auth[1]);
        if (userDoc === undefined) {
            writeToLog(`Failed to authorize because token is invalid\n`);
            return res.status(401).send('Unauthorized');
        }
        let user = new collapsauserbaseUser(userDoc.data);
        if (auth[0] === 'Basic')
            writeToLog(`Authorized User ${user.username} with id ${user.id} for ${req.hostname}${req.path}\n`);
        else if (auth[0] === 'Admin' && user.authorization & 2)
            writeToLog(`Authorized Admin ${user.username} with id ${user.id} for ${req.hostname}${req.path}\n`);
        else {
            writeToLog(`Failed to authorize user ${user} with level ${auth[0]}\n`);
            return res.status(401).send('Unauthorized');
        }
        req.collapsaAPI.auth = {
            user,
        };
        next();
    } else {
        next();
    }
});
v1Router.use('/users', usersRouter);
v1Router.use('/games', gamesRouter);
export default v1Router;