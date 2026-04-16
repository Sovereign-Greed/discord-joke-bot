import axios from 'axios';
import { JOKE_API_URL } from '../constants/api.js';
import { HTTP_TIMEOUT_MS } from '../constants/limits.js';

export async function fetchRandomSingleJoke() {
	return axios.get(JOKE_API_URL, { timeout: HTTP_TIMEOUT_MS });
}
