import { Collection } from 'discord.js';

import collection from './collection.js';
/**
 * A database structure
 */
export default class database {
    /**
     *
     * @param {string} apiKey Your API key
     * @param {string} name Database name
     * @param {Map.<string, collection>} collections collections to add by default
     */
    constructor(name, collections) {
        this.name = name;
        /**
         * @type {Collection<string, collection>}
         */
        this.collections = new Collection(collections.map((c) => [c.name, c]));
    }
    /**
     *
     * @param {string} name Name of the collection to create
     */
    addCollection(name) {
        this.collections.set(name, new collection(this.apiKey, name, [], this.name));
    }
}
