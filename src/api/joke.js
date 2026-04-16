import { JOKE_API_URL } from '../constants/endpoints.js';
import { http } from './http.js';

export async function fetchRandomSingleJoke() {
	return http.get(JOKE_API_URL);
}
