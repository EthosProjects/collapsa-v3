import express from 'express';
import fs from 'fs';
import https from 'https';
import bcrypt from 'bcrypt';
import { util } from '../../../remastered-lib/export.js';
const { JSONtoString, genSnowflake, formFormat } = util;
import mongoDB from '../../../globals/mongoDB.js';

import { discorduserbaseUser, discordguildbaseGuild, collapsauserbaseUser } from '../../models/export.js';
const development =
    process.env.NODE_ENV !== 'development'
        ? {}
        : {
              usersAPILogStream: fs.createWriteStream('./api/logs/api.users.log', { flags: 'w' }),
          };
const writeToLog = (data) => {
    if (process.env.NODE_ENV == 'development') development.usersAPILogStream.write(data);
    else console.log(data);
};
let usersRouter = express.Router();
usersRouter
    .route('/')
    .get((req, res) => {
        const collapsauserbase = mongoDB.databases.get('collapsa').collections.get('collapsauserbase');
        let userArray = Array.from(collapsauserbase.documents)
            .map(([key, value]) => value)
            .map((u) => new collapsauserbaseUser(u.data).public);
        if (req.query.sort == 'true') {
            userArray.sort((a, b) => b.highscore - a.highscore);
        }
        if (req.query.discord) {
            const discorduserbase = mongoDB.databases.get('collapsa').collections.get('discorduserbase');
            let discordUsers = Array.from(
                discorduserbase.filterDocuments((document) => {
                    if (!document.data.guilds['709240989012721717']) return false;
                    if (!collapsauserbase.findDocument((doc) => doc.data.discordid == document.name)) return false;
                    return true;
                }),
            ).map(([key, val]) => new discorduserbaseUser(val.data));
            discordUsers.forEach(
                (dUser) =>
                    (userArray.find((cUser) => cUser.discordid == dUser.id).discordexp =
                        dUser.guilds['709240989012721717'].exp.amount),
            );
        }
        writeToLog('Successfully returned public user data\n');
        res.status(206).send(JSON.stringify(userArray)).end();
    })
    .post(async (req, res, next) => {
        const collapsauserbase = mongoDB.databases.get('collapsa').collections.get('collapsauserbase');
        let username = req.body.username;
        let password = req.body.password;
        let email = req.body.email;
        if (!username || !password || !email) return res.status(400).send('form invalid').end();
        if (collapsauserbase.findDocument((d) => d.data.username == username))
            return res.status(400).send('username taken').end();
        if (collapsauserbase.findDocument((d) => d.data.email == email))
            return res.status(400).send('email taken').end();
        let valid = [0, 0, 0];
        let validatePassword = (sup) => {
            if (sup.match(/^(?=.*[a-zA-Z0-9]).{8,16}$/)) valid[1] = 1;
        };
        let validateEmail = (sue) => {
            let email = /^\w.+@\w{2,253}\.\w{2,63}$/;
            if (sue.match(email)) {
                valid[2] = 1;
            } else if (sue.length == 0) {
                valid[2] = 0;
            } else {
                valid[2] = 0;
            }
        };
        let validateUsername = (suu) => {
            if (!suu.match(/^[a-zA-Z]{1}[ \w]{5,11}$/)) valid[0] = 0;
            else valid[0] = 1;
        };
        validatePassword(password);
        validateUsername(username);
        validateEmail(email);
        if (valid.every((d) => d)) {
            let id = genSnowflake(2, 0);
            let token = await bcrypt.genSalt(10);
            let psw = await bcrypt.hash(password, 10);
            let random = Math.floor(Math.random() * 100).toString();
            token = 'Aph_' + (random.length == 2 ? random : '0' + random) + 'yght' + token.substr(7);
            let user = new collapsauserbaseUser({
                id: id,
                token: token,
                password: psw,
                username: username,
                email: email,
            });
            await collapsauserbase.addDocument(Object.assign({}, user));
            var d = new Date();
            d.setTime(d.getTime() + 30 * 24 * 60 * 60 * 1000);
            var expires = 'Expires=' + d.toUTCString();
            res.set('Set-Cookie', `token=${token}; ${expires}; path=/`);
            res.status(201).send(user.private).end();
        } else {
            res.status(400);
            if (!valid[0] && !valid[1] && !valid[2]) res.send('Request Faulty').end();
            else if (!valid[0] && !valid[1]) res.send('username and password invalid').end();
            else if (!valid[0] && !valid[2]) res.send('username and email invalid').end();
            else if (!valid[1] && !valid[2]) res.send('password and email invalid').end();
            else if (!valid[0]) res.send('username invalid').end();
            else if (!valid[1]) res.send('password invalid').end();
            else if (!valid[2]) res.send('email invalid').end();
        }
        res.end();
    });

usersRouter.get('/link', async (req, res, next) => {
    const collapsauserbase = mongoDB.databases.get('collapsa').collections.get('collapsauserbase');
    ('https://localhost:4000/api/v1/users/link?site=discord&code=5kqZibrReGM2Jq66uIITnNrvVzKGpD');
    if (!req.query.code) return res.redirect('../../');
    let client_id = '710904657811079258';
    let client_secret = 'ZabZmWdAlMZFPl2O7xGRqtqpZhIar9tE';
    let redirect_uri = `https://${req.hostname}/api/v1/users/link?site=discord`;
    let code = req.query.code;
    let obj = {
        code: code,
        client_id: client_id,
        client_secret: client_secret,
        redirect_uri: redirect_uri,
        scope: 'identify email',
    };
    let tokens = await new Promise((resolve, reject) => {
        let tokenReq = https
            .request({
                host: 'discord.com',
                path: `/api/oauth2/token?grant_type=authorization_code`,
                method: 'POST',
                headers: {
                    'content-type': 'application/x-www-form-urlencoded',
                },
            })
            .on('response', (res) => {
                let buffer = [];
                res.on('data', (data) => buffer.push(data)).on('end', () => resolve(JSON.parse(buffer.join(''))));
            });
        tokenReq.write(formFormat(obj));
        tokenReq.end();
    });
    if (tokens.error) {
        writeToLog('Link Request timed out\n');
        return res.status(408).send('Request Timeout').end();
    }
    let access_token = tokens.access_token;
    let user = await new Promise((resolve, reject) => {
        https
            .get({
                host: 'discord.com',
                path: `/api/v6/users/@me`,
                headers: {
                    Authorization: `Bearer ${access_token}`,
                },
            })
            .on('response', (res) => {
                let buffer = [];
                res.on('data', (data) => buffer.push(data));
                res.on('end', () => resolve(JSON.parse(buffer.join(''))));
            });
    });
    if (user.error) {
        writeToLog('Discord user not found?\n');
        return res.status(400).send('Discord user not found').end();
    }
    function getCookie(cname) {
        var name = cname + '=';
        var decodedCookie = decodeURIComponent(req.headers.cookie);
        var ca = decodedCookie.split(';');
        for (var i = 0; i < ca.length; i++) {
            var c = ca[i];
            while (c.charAt(0) == ' ') {
                c = c.substring(1);
            }
            if (c.indexOf(name) == 0) {
                return c.substring(name.length, c.length);
            }
        }
        return '';
    }
    if (getCookie('token')) {
        if (collapsauserbase.findDocument((document) => document.data.token == getCookie('token'))) {
            let cUser = new collapsauserbaseUser(
                collapsauserbase.findDocument((document) => document.data.token == getCookie('token')).data,
            );
            if (
                collapsauserbase.findDocument(
                    (document) => document.data.discordid == user.id && document.data.id !== cUser.id,
                )
            ) {
                let dUser = new collapsauserbaseUser(
                    collapsauserbase.findDocument(
                        (document) => document.data.discordid == user.id && document.data.id !== cUser.id,
                    ),
                );
                cUser.collapsaCoins += dUser.collapsaCoins;
                cUser.highscore > dUser.highscore ? null : (cUser.highscore = dUser.highscore);
                cUser.email = user.email;
                await collapsauserbase.removeDocument(dUser.id);
                await collapsauserbase.updateDocument(Object.assign({}, cUser));
                writeToLog(
                    `Combined collapsa ${cUser.id} and collapsa discord account ${dUser.id} ${cUser.discordid} account\n`,
                );
            } else {
                cUser.discordid = user.id;
                writeToLog(`Linked collapsa ${cUser.id} and discord ${user.id} account\n`);
                await collapsauserbase.updateDocument(Object.assign({}, cUser));
            }
        }
        res.redirect('../../../');
    } else if (collapsauserbase.findDocument((document) => document.data.discordid == user.id)) {
        let cUser = new collapsauserbaseUser(
            collapsauserbase.findDocument((document) => document.data.discordid == user.id).data,
        );
        var d = new Date();
        d.setTime(d.getTime() + 30 * 24 * 60 * 60 * 1000);
        var expires = 'Expires=' + d.toUTCString();
        res.set('Set-Cookie', `token=${cUser.token}; ${expires}; path=/`);
        writeToLog(`Logged in user ${cUser.id} through discord\n`);
        res.redirect('../../../');
    } else {
        if (collapsauserbase.findDocument((d) => d.data.username == user.username)) {
            writeToLog('Username was taken\n');
            return res.status(400).send('username taken').end();
        }
        if (collapsauserbase.findDocument((d) => d.data.email == user.email)) {
            writeToLog('Email was taken\n');
            return res.status(400).send('email taken').end();
        }
        let id = genSnowflake(2, 0);
        let token = await bcrypt.genSalt(10);
        let random = Math.floor(Math.random() * 100).toString();
        token = 'Aph_' + (random.length == 2 ? random : '0' + random) + 'yght' + token.substr(7);
        let cUser = new collapsauserbaseUser({
            id: id,
            token: token,
            discordid: user.id,
            username: user.username,
            email: user.email,
        });
        await collapsauserbase.addDocument(Object.assign({}, cUser));
        var d = new Date();
        d.setTime(d.getTime() + 30 * 24 * 60 * 60 * 1000);
        var expires = 'Expires=' + d.toUTCString();
        res.set('Set-Cookie', `token=${token}; ${expires}; path=/`);
        writeToLog(`Created user account ${id} using discord id\n`);
        res.redirect('../../../');
    }
});
usersRouter
    .route('/:userid')
    .get((req, res) => {
        const collapsauserbase = mongoDB.databases.get('collapsa').collections.get('collapsauserbase');
        if (!collapsauserbase.documents.has(req.params.userid)) return res.status(404).send('Not Found').end();
        let openUser = new collapsauserbaseUser(collapsauserbase.documents.get(req.params.userid).data);
        if (!req.headers['authorization']) {
            writeToLog(`Sent public user ${openUser.id} data\n`);
            res.status(206).send(openUser.public).end();
        }
        let auth = req.collapsaAPI.auth;
        let user = auth.user;
        if (user.id !== openUser.id && !(auth.user.authorization & 2)) {
            writeToLog(`User ${user.id} is unauthorized for private user ${openUser.id} data\n`);
            return res.status(401).send('Unauthorized').end();
        }
        writeToLog(`Sent private user ${openUser.id} data\n`);
        res.status(302).send(openUser.private).end();
    })
    .put(async (req, res) => {
        const collapsauserbase = mongoDB.databases.get('collapsa').collections.get('collapsauserbase');
        if (!collapsauserbase.documents.has(req.params.userid)) return res.status(404).send('Not Found').end();
        let openUser = new collapsauserbaseUser(collapsauserbase.documents.get(req.params.userid).data);
        let auth = req.collapsaAPI.auth;
        let user = auth.user;
        if (!req.headers['authorization']) {
            writeToLog(`No authorization\n`);
            return res.status(401).send('Unauthorized').end();
        }
        if (user.id !== openUser.id && !(auth.user.authorization & 2)) {
            writeToLog(`User ${user.id} is unauthorized for updating user ${openUser.id} data\n`);
            return res.status(401).send('Unauthorized').end();
        }
        let username = req.body.username;
        let email = req.body.email;
        let newPassword = req.body.newPassword;
        let password = req.body.password;
        let newDoc = Object.assign({}, openUser);
        if (!(auth.user.authorization & 2)) {
            if (!password) {
                if (openUser.password) {
                    writeToLog(`User ${openUser.id} requires a password\n`);
                    return res.status(400).send('password needed').end();
                }
            } else if (openUser.password) {
                let successful = await bcrypt.compare(password, openUser.password);
                if (!successful) {
                    writeToLog(`Password incorrect\n`);
                    return res.status(400).send('password incorrect').end();
                }
            }
        }
        if (newPassword) {
            if (!newPassword.match(/^(?=.*[a-zA-Z0-9]).{8,16}$/)) {
                writeToLog(`Bad request\n`);
                return res.status(400).send('new password invalid').end();
            }
        }
        if (username !== openUser.email) {
            if (!username.match(/^[a-zA-Z]{1}[ \w]{5,11}$/)) {
                writeToLog(`Bad request\n`);
                return res.status(400).send('username invalid').end();
            }
        }
        if (email !== openUser.email) {
            if (!email.match(/^\w.+@\w{2,253}\.\w{2,63}$/)) {
                writeToLog(`Bad request\n`);
                return res.status(400).send('email invalid').end();
            }
        }
        if (newPassword) newDoc.password = await bcrypt.hash(newPassword, 10);
        newDoc.email = email;
        newDoc.username = username;
        await collapsauserbase.updateDocument(newDoc);

        writeToLog(`Successfully updated account for user ${openUser.id} by user ${user.id}\n`);
        res.status(202).send('Account update successful').end();
    });
usersRouter.post('/login', async (req, res) => {
    const collapsauserbase = mongoDB.databases.get('collapsa').collections.get('collapsauserbase');
    process.reqCount++;
    if (req.body.token) {
        if (!collapsauserbase.findDocument((d) => d.data.token == req.body.token)) {
            writeToLog(`Invalid login token`);
            return res.status(400).send('token invalid').end();
        }
        let document = collapsauserbase.findDocument((d) => d.data.token == req.body.token);
        let user = new collapsauserbaseUser(document.data);
        writeToLog(`Successfully logged in user ${user.id} using token`);
        res.status(202).send(user.private).end();
        return;
    }
    let username = req.body.username;
    let password = req.body.password;
    if (!collapsauserbase.findDocument((d) => d.data.username == username)) {
        writeToLog(`Incorrect username`);
        return res.status(400).send('Incorrect username or password').end();
    }
    let document = collapsauserbase.findDocument((d) => d.data.username == username);
    let user = new collapsauserbaseUser(document.data);
    if (!document.data.password) {
        let acceptedLogins = [];
        if (user.discordid) acceptedLogins.push('Discord');
        return res.status(400).send(acceptedLogins).end();
    }
    let successful = await bcrypt.compare(password, user.password);
    if (successful) {
        var d = new Date();
        d.setTime(d.getTime() + 30 * 24 * 60 * 60 * 1000);
        var expires = 'Expires=' + d.toUTCString();
        res.set('Set-Cookie', `token=${user.token}; ${expires}; path=/`);
        writeToLog(`Successfully logged in user ${user.id} using username and password`);
        res.status(202).send(JSON.stringify(user.private)).end();
    } else {
        writeToLog(`Incorrect passowrd`);
        res.status(400).send('incorrect username or password').end();
    }
});
export default usersRouter;
