import { db } from "..";
import { feedFollows, feeds, users } from "../../schema";
import { eq, and } from "drizzle-orm";

export async function createFeedFollow(userId: number, feedId: number) {
  const [inserted] = await db
    .insert(feedFollows)
    .values({ userId, feedId })
    .returning({ id: feedFollows.id });

  const [result] = await db
    .select({
      id: feedFollows.id,
      userName: users.name,
      feedName: feeds.name,
      createdAt: feedFollows.createdAt,
      updatedAt: feedFollows.updatedAt,
    })
    .from(feedFollows)
    .innerJoin(users, eq(feedFollows.userId, users.id))
    .innerJoin(feeds, eq(feedFollows.feedId, feeds.id))
    .where(eq(feedFollows.id, inserted.id));

  return result;
}

export async function getFeedFollowsForUser(userId: number) {
  return await db
    .select({
      id: feedFollows.id,
      feedName: feeds.name,
      userName: users.name,
      createdAt: feedFollows.createdAt,
      updatedAt: feedFollows.updatedAt,
    })
    .from(feedFollows)
    .innerJoin(users, eq(feedFollows.userId, users.id))
    .innerJoin(feeds, eq(feedFollows.feedId, feeds.id))
    .where(eq(feedFollows.userId, userId));
}

export async function deleteFeedFollow(userId: number, feedUrl: string) {
  // First, find the feed by URL
  const feed = await db.select().from(feeds).where(eq(feeds.url, feedUrl)).limit(1);
  if (feed.length === 0) {
    throw new Error('Feed not found');
  }
  const feedId = feed[0].id;

  // Then delete the follow
  await db
    .delete(feedFollows)
    .where(and(eq(feedFollows.userId, userId), eq(feedFollows.feedId, feedId)));
}