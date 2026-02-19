export default {
  schema: './lib/schema.ts',
  out: './drizzle',
  dialect: 'pg',
  dbCredentials: {
    url: 'postgres://danabadarneh:@localhost:5432/gator?sslmode=disable',
  },
};