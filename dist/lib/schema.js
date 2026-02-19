"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.feedFollows = exports.feeds = exports.users = void 0;
const pg_core_1 = require("drizzle-orm/pg-core");
exports.users = (0, pg_core_1.pgTable)('users', {
    id: (0, pg_core_1.serial)('id').primaryKey(),
    name: (0, pg_core_1.text)('name').notNull().unique(),
    createdAt: (0, pg_core_1.timestamp)('created_at').defaultNow().notNull(),
    updatedAt: (0, pg_core_1.timestamp)('updated_at').defaultNow().notNull(),
});
exports.feeds = (0, pg_core_1.pgTable)('feeds', {
    id: (0, pg_core_1.serial)('id').primaryKey(),
    name: (0, pg_core_1.text)('name').notNull(),
    url: (0, pg_core_1.text)('url').notNull().unique(),
    userId: (0, pg_core_1.integer)('user_id').references(() => exports.users.id, { onDelete: 'cascade' }).notNull(),
    createdAt: (0, pg_core_1.timestamp)('created_at').defaultNow().notNull(),
    updatedAt: (0, pg_core_1.timestamp)('updated_at').defaultNow().notNull(),
});
exports.feedFollows = (0, pg_core_1.pgTable)('feed_follows', {
    id: (0, pg_core_1.serial)('id').primaryKey(),
    userId: (0, pg_core_1.integer)('user_id').references(() => exports.users.id, { onDelete: 'cascade' }).notNull(),
    feedId: (0, pg_core_1.integer)('feed_id').references(() => exports.feeds.id, { onDelete: 'cascade' }).notNull(),
    createdAt: (0, pg_core_1.timestamp)('created_at').defaultNow().notNull(),
    updatedAt: (0, pg_core_1.timestamp)('updated_at').defaultNow().notNull(),
}, (table) => ({
    uniqueFollow: (0, pg_core_1.unique)().on(table.userId, table.feedId),
}));
