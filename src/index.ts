import express from 'express'

import './services/externalService';
import SessionMediaContext from './services/SessionMediaContext'
import {HOST, PORT} from "./config";
import {apiResponse, noResource} from './middlewares/apiResponse';

const app = express();

app.get('/api/sessions/:sessionId/media-context', (req: express.Request, res: express.Response) => {
    const sessionMediaContext = new SessionMediaContext(res, req.params.sessionId, apiResponse)
    return sessionMediaContext.sessionMediaContext();
});

app.use((req: express.Request, res: express.Response) => apiResponse(res, {
    status: 404,
    message: 'Resource not found'
}, noResource()));

app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => apiResponse(res, {
    status: 500,
    message: 'Server Error'
}, noResource()));

process.on('uncaughtException', error => {
    console.error(`Uncaught Exception: ${500} - ${error.message}, Stack: ${error.stack}`)
});

app.listen(PORT, () => {
    console.info(`Service is listening at http://${HOST}:${PORT}`);
});