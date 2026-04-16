import axios from 'axios';
import { CAT_API_URL } from '../constants/api.js';

export async function fetchCatImageSearch() {
	return axios({ url: CAT_API_URL });
}
