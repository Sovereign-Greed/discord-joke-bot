import { CAT_API_URL } from '../constants/endpoints.js';
import { http } from './http.js';

export async function fetchCatImageSearch() {
	return http.get(CAT_API_URL);
}
