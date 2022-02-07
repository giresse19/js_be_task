import express from 'express'

import './services/externalService';
import {HOST, PORT} from "./config";
import {apiResponse, noResource} from './middlewares/apiResponse';

const app = express();

app.use((req: express.Request, res: express.Response, next: express.NextFunction) => {
    apiResponse
    next();
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