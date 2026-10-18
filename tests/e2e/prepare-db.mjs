import { execSync } from 'node:child_process';
import { rmSync } from 'node:fs';

// Запускається з env тестового сервера (webServer.env у playwright.config.ts).
// Захист: ніколи не видаляти робочу базу dev.db.
if (process.env.DATABASE_URL !== 'file:./test.db') {
  throw new Error('prepare-db: DATABASE_URL must be file:./test.db');
}

rmSync('test.db', { force: true });
execSync('npx prisma migrate deploy', { stdio: 'inherit' });
execSync('npx prisma db seed', { stdio: 'inherit' });
