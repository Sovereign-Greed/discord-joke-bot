import axios from 'axios';
import { HTTP_TIMEOUT_MS } from '../constants/limits.js';

export const http = axios.create({
	timeout: HTTP_TIMEOUT_MS,
});
