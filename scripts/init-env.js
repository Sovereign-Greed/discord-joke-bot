import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');
const examplePath = path.join(root, '.env.example');
const envPath = path.join(root, '.env');

if (!fs.existsSync(examplePath)) {
	console.error('Missing .env.example — cannot create .env.');
	process.exit(1);
}

if (fs.existsSync(envPath)) {
	console.log('.env already exists; leaving it unchanged.');
	process.exit(0);
}

fs.copyFileSync(examplePath, envPath);
console.log('Created .env from .env.example. Edit .env and add your real values.');
process.exit(0);
