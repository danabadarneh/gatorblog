"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createFeed = createFeed;
exports.getFeeds = getFeeds;
exports.getFeedByUrl = getFeedByUrl;
exports.getFeedsWithUsers = getFeedsWithUsers;
const __1 = require("..");
const schema_1 = require("../../schema");
const drizzle_orm_1 = require("drizzle-orm");
async function createFeed(name, url, userId) {
    const [result] = await __1.db.insert(schema_1.feeds).values({ name, url, userId }).returning();
    return result;
}
async function getFeeds() {
    return await __1.db.select().from(schema_1.feeds);
}
async function getFeedByUrl(url) {
    const [result] = await __1.db.select().from(schema_1.feeds).where((0, drizzle_orm_1.eq)(schema_1.feeds.url, url));
    return result;
}
async function getFeedsWithUsers() {
    return await __1.db
        .select({
        id: schema_1.feeds.id,
        name: schema_1.feeds.name,
        url: schema_1.feeds.url,
        userName: schema_1.users.name,
        createdAt: schema_1.feeds.createdAt,
        updatedAt: schema_1.feeds.updatedAt,
    })
        .from(schema_1.feeds)
        .innerJoin(schema_1.users, (0, drizzle_orm_1.eq)(schema_1.feeds.userId, schema_1.users.id));
}
