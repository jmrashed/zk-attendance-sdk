import dotenv from 'dotenv';
import fs from 'node:fs';
import path from 'node:path';

// Load env vars for tests.
// Priority: .env.test (if present) then .env.
const rootDir = path.resolve(__dirname, '..');

const envTestPath = path.join(rootDir, '.env.test');
if (fs.existsSync(envTestPath)) {
  dotenv.config({ path: envTestPath, override: false, quiet: true });
}

const envPath = path.join(rootDir, '.env');
if (fs.existsSync(envPath)) {
  dotenv.config({ path: envPath, override: false, quiet: true });
}
