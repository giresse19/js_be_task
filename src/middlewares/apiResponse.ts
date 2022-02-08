import {SessionResponse, Error} from "../interfaces/externalService";
import express from "express";

export const apiResponse = (res:express.Response, err:Error, data:SessionResponse|string):void => {
    res.setHeader('Content-Type', 'application/json');

    let code = err ? (err.status || 500) : 200;
    data = err && err.message || data;
    return res.status(code).end(JSON.stringify({code, data}));
}

export const noResource = ():SessionResponse => {
    return {
        id: '', media: {'document-front': [], "document-back": []}, status: ''
    }
}