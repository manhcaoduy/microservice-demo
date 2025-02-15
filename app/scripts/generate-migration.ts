import { execSync } from 'child_process';

const migrationName = process.argv[2];

if (!migrationName) {
  console.error('Please provide a migration name');
  process.exit(1);
}

const command = `ts-node ./node_modules/typeorm/cli.js migration:generate -d libs/postgres/src/datasource.config.ts ./migrations/${migrationName}`;

try {
  execSync(command, { stdio: 'inherit' });
} catch (error) {
  console.error('Error generating migration:', error);
  process.exit(1);
}
