import express from 'express';
import v1Router from './v1/v1Router.js';
import { JSONtoString } from '../../remastered-lib/util/export.js';
const apiRouter = express.Router();
apiRouter.use((req, res, next) => {
    process.reqCount++;
    req.collapsaAPI = {};
    next();
});
apiRouter.get('/', (req, res) => {
    res.set('Content-Type', 'text/javascript');
    res.send(
        JSONtoString({
            availableVersions: ['v1'],
        }),
    );
});
apiRouter.use('/v1', v1Router);
export default apiRouter;
