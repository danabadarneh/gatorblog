import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';

export interface Config {
  db_url: string;
  current_user_name?: string;
}

const configPath = path.join(os.homedir(), '.gatorconfig.json');

export function readConfig(): Config {
  try {
    const data = fs.readFileSync(configPath, 'utf-8');
    return JSON.parse(data);
  } catch {
    return { db_url: 'postgres://postgres:postgres@localhost:5432/gator' };
  }
}

export function writeConfig(config: Config): void {
  fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
}