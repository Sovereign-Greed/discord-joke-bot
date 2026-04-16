import { printEnvStatus } from './env.js';

const ok = printEnvStatus();
process.exit(ok ? 0 : 1);
