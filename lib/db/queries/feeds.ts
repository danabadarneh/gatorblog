import { db } from "..";
import { feeds, users } from "../../schema";
import { eq } from "drizzle-orm";

export async function createFeed(name: string, url: string, userId: number) {
  const [result] = await db.insert(feeds).values({ name, url, userId }).returning();
  return result;
}

export async function getFeeds() {
  return await db.select().from(feeds);
}

export async function getFeedByUrl(url: string) {
  const [result] = await db.select().from(feeds).where(eq(feeds.url, url));
  return result;
}

export async function getFeedsWithUsers() {
  return await db
    .select({
      id: feeds.id,
      name: feeds.name,
      url: feeds.url,
      userName: users.name,
      createdAt: feeds.createdAt,
      updatedAt: feeds.updatedAt,
    })
    .from(feeds)
    .innerJoin(users, eq(feeds.userId, users.id));
}