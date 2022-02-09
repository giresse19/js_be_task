import axios from "axios";
import axiosRetry from 'axios-retry';

const API_URL:string = 'https://api.veriff.internal';

export const PORT:number =  3000;
export const PROBABILITY_EQUILIBRIUM:number =  0.5;
export const HOST:string = 'localhost';
export const SESSION_UUID:string = '90d61876-b99a-443e-994c-ba882c8558b6';
export const API = axios.create({
    baseURL: `${API_URL}`,
});
axiosRetry(API, { retries: 3 });