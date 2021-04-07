import { Collection } from 'discord.js';

import document from './document.js';
/**
 * This is a cached collection of documents
 */
export default class collection {
    /**
     *
     * @param {string} client Your API key
     * @param {string} name The name of the collection
     * @param {Array.<document>} documents Collection documents
     * @param {string} databaseName Database the collection is in
     */
    constructor(client, name, documents, databaseName) {
        this.client = client;
        this.name = name;
        /**
         * @type {Collection<string, document>}
         */
        this.documents = new Collection(documents.map((doc) => [doc.name, doc]));
        /**
         * @type {String}
         */
        this.databaseName = databaseName;
    }
    addDocument(doc) {
        if (this.documents.has(doc.id)) return this.updateDocument(doc);
        if (this.client.offline) return this.documents.set(doc.id, new document(doc.id, doc));
        return new Promise((resolve, reject) => {
            let db = this.client.db(this.databaseName);
            let col = db.collection(this.name);
            col.insertOne(doc).then(() => {
                this.documents.set(doc.id, new document(doc.id, doc));
                resolve();
            });
        });
    }
    addDocuments(docs) {
        return Promise.all(docs.map((doc) => this.addDocument(doc)));
    }
    addDocumentsForce(docs) {
        let newDocs = docs.filter((doc) => !this.documents.has(doc.id));
        docs.map((doc) => this.documents.has(doc.id)).forEach((doc) => this.updateDocument(doc));
        return new Promise((resolve, reject) => {
            let db = this.client.db(this.databaseName);
            let col = db.collection(this.name);
            col.insertMany(docs).then(() => {
                resolve();
                docs.forEach((doc) => {
                    this.set(doc.id, new document(doc.id, doc));
                });
            });
        });
    }
    updateDocument(document) {
        if (!this.documents.has(document.id)) return this.addDocument(document);
        if (this.client.offline) {
            let newDoc = Object.assign({}, this.documents.get(document.id).data);
            Object.assign(newDoc, document);
            let doc = this.documents.get(document.id);
            Object.assign(doc.data, document);
            return this.documents.set(document.id, doc);
        }
        return new Promise((resolve, reject) => {
            let db = this.client.db(this.databaseName);
            let col = db.collection(this.name);
            let newDoc = Object.assign({}, this.documents.get(document.id).data);
            Object.assign(newDoc, document);
            col.findOneAndUpdate({ id: document.id }, { $set: newDoc }).then(() => {
                let doc = this.documents.get(document.id);
                Object.assign(doc.data, document);
                this.documents.set(document.id, doc);
                resolve();
            });
        });
    }
    removeDocument(documentID) {
        if (!this.documents.has(documentID)) return;
        if (this.client.offline) return this.documents.delete(documentID);
        return new Promise((resolve, reject) => {
            let db = this.client.db(this.databaseName);
            let col = db.collection(this.name);
            col.deleteOne({ id: documentID }).then(() => {
                this.documents.delete(documentID);
                resolve();
            });
        });
    }
    filterDocuments(fn) {
        let results = new Collection();
        [...this.documents.entries()].forEach(([key, val]) => {
            if (fn(val, key)) results.set(key, val);
        });
        return results;
    }
    findDocument(fn) {
        let r;
        [...this.documents.entries()].forEach(([key, val]) => {
            if (!r && fn(val, key)) r = val;
        });
        return r;
    }
}
