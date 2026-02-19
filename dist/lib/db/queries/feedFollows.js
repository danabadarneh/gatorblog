"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createFeedFollow = createFeedFollow;
exports.getFeedFollowsForUser = getFeedFollowsForUser;
exports.deleteFeedFollow = deleteFeedFollow;
const __1 = require("..");
const schema_1 = require("../../schema");
const drizzle_orm_1 = require("drizzle-orm");
async function createFeedFollow(userId, feedId) {
    const [inserted] = await __1.db
        .insert(schema_1.feedFollows)
        .values({ userId, feedId })
        .returning({ id: schema_1.feedFollows.id });
    const [result] = await __1.db
        .select({
        id: schema_1.feedFollows.id,
        userName: schema_1.users.name,
        feedName: schema_1.feeds.name,
        createdAt: schema_1.feedFollows.createdAt,
        updatedAt: schema_1.feedFollows.updatedAt,
    })
        .from(schema_1.feedFollows)
        .innerJoin(schema_1.users, (0, drizzle_orm_1.eq)(schema_1.feedFollows.userId, schema_1.users.id))
        .innerJoin(schema_1.feeds, (0, drizzle_orm_1.eq)(schema_1.feedFollows.feedId, schema_1.feeds.id))
        .where((0, drizzle_orm_1.eq)(schema_1.feedFollows.id, inserted.id));
    return result;
}
async function getFeedFollowsForUser(userId) {
    return await __1.db
        .select({
        id: schema_1.feedFollows.id,
        feedName: schema_1.feeds.name,
        userName: schema_1.users.name,
        createdAt: schema_1.feedFollows.createdAt,
        updatedAt: schema_1.feedFollows.updatedAt,
    })
        .from(schema_1.feedFollows)
        .innerJoin(schema_1.users, (0, drizzle_orm_1.eq)(schema_1.feedFollows.userId, schema_1.users.id))
        .innerJoin(schema_1.feeds, (0, drizzle_orm_1.eq)(schema_1.feedFollows.feedId, schema_1.feeds.id))
        .where((0, drizzle_orm_1.eq)(schema_1.feedFollows.userId, userId));
}
async function deleteFeedFollow(userId, feedUrl) {
    // First, find the feed by URL
    const feed = await __1.db.select().from(schema_1.feeds).where((0, drizzle_orm_1.eq)(schema_1.feeds.url, feedUrl)).limit(1);
    if (feed.length === 0) {
        throw new Error('Feed not found');
    }
    const feedId = feed[0].id;
    // Then delete the follow
    await __1.db
        .delete(schema_1.feedFollows)
        .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.feedFollows.userId, userId), (0, drizzle_orm_1.eq)(schema_1.feedFollows.feedId, feedId)));
}
