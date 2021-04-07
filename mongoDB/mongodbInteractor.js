import mongodb from 'mongodb';
const { MongoClient } = mongodb;
import { Collection } from 'discord.js';
import { EventEmitter } from 'events';
import document from './document.js';
import collection from './collection.js';
import database from './database.js';
export default class mongodbInteractor extends EventEmitter {
    constructor(username, password) {
        super();
        this.client = new MongoClient(
            `mongodb+srv://${username}:${password}@cluster0-cpzc9.mongodb.net/collapsa?retryWrites=true&w=majority`,
            { useUnifiedTopology: true },
        );
        /**
         * @type {Collection<string, collection>}
         */
        this.collections = new Collection();
        /**
         * @type {Collection<string, database>}
         */
        this.databases = new Collection();
        this.client.connect().then(
            async (client) => {
                let collapsa = this.client.db('collapsa');
                let collections = await collapsa.listCollections().toArray();
                let colPromises = collections.map((c) => {
                    return new Promise((resolve, reject) => {
                        let col = collapsa.collection(c.name);
                        col.find()
                            .toArray()
                            .then((ds) => {
                                let documents = ds.map((doc) => new document(doc.id, doc));
                                resolve(new collection(this.client, c.name, documents, 'collapsa'));
                            });
                    });
                });
                Promise.all(colPromises).then((cols) => {
                    this.emit('continueStartup', 'Using offsite database');
                    this.databases.set('collapsa', new database('collapsa', cols));
                    this.offline = false;
                    this.emit('ready');
                });
            },
            (error) => {
                this.emit('continueStartup', 'Using local database');
                this.databases.set(
                    'collapsa',
                    new database('collapsa', [
                        new collection(this.client, 'collapsauserbase', [
                            new document('100134991306755', {
                                _id: '100134991306755',
                                id: '100134991306755',
                                token: 'Aph_45yghtHmheTsNe1i5dFYaBZaZL/u',
                                username: 'Logos King',
                                email: 'logospiercing@gmail.com',
                                discordid: '3231',
                                authorization: 3,
                                highscore: 0,
                                collapsaCoins: 0,
                                password: '$2b$10$.dyFi5IuNm1pCqkH8E.Hu.jcqDGKwQKL5W95B6569ixbGIrmhUbeC',
                            }),
                            /*new document('1234129514231', {
                            id:'3212901',
                            discordid:'3231',
                            username:'Logos King',
                            highscore:'30'
                        })*/
                        ]),
                        new collection(this.client, 'discorduserbase', [
                            new document('3231', {
                                id: '3231',
                                guilds: {
                                    '709240989012721717': {
                                        exp: {
                                            amount: 300,
                                            level: 20,
                                        },
                                    },
                                },
                            }),
                        ]),
                    ]),
                );
                this.offline = true;
                this.client.offline = true;
                this.emit('ready');
            },
        );
    }
}
