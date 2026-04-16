import axios from 'axios';
import { CAT_API_URL } from '../constants/api.js';
import { HTTP_TIMEOUT_MS } from '../constants/limits.js';

export async function fetchCatImageSearch() {
	return axios.get(CAT_API_URL, { timeout: HTTP_TIMEOUT_MS });
}
