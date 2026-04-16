import axios from 'axios';
import { JOKE_API_URL } from '../constants/api.js';

export async function fetchRandomSingleJoke() {
	return axios({ url: JOKE_API_URL });
}
