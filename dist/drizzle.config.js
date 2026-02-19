"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = {
    schema: './lib/schema.ts',
    out: './drizzle',
    dialect: 'pg',
    dbCredentials: {
        url: 'postgres://danabadarneh:@localhost:5432/gator?sslmode=disable',
    },
};
