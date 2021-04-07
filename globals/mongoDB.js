import { mongodbInteractor } from '../mongoDB/export.js';
export default new mongodbInteractor(process.env.MONGODB_USERNAME, process.env.MONGODB_PASSWORD);
