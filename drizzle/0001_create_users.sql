import { sql } from 'drizzle-orm';

export const up = async (db) => {
  await db.execute(sql`
    CREATE TABLE users (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL UNIQUE,
      created_at TIMESTAMP DEFAULT NOW(),
      updated_at TIMESTAMP DEFAULT NOW()
    );
  `);
};

export const down = async (db) => {
  await db.execute(sql`DROP TABLE users;`);
};