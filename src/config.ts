import axios from "axios";

const API_URL:string = 'https://api.veriff.internal';

export const PORT:Number =  3000;
export const HOST:string = 'localhost';
export const SESSION_UUID:string = '90d61876-b99a-443e-994c-ba882c8558b6';
export const API = axios.create({
    baseURL: `${API_URL}`,
});