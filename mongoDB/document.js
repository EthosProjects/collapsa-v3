export default class document {
    /**
     *
     * @param {string} apiKey Your API key
     * @param {string} name Document name
     * @param {Object} data Document data
     */
    constructor(name, data) {
        this.name = name;
        this.data = data;
    }
}
