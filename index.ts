import { readConfig, writeConfig } from './config';
import { createUser, getUserByName, deleteAllUsers, getUsers } from './lib/db/queries/users';
import { createFeed, getFeedsWithUsers, getFeedByUrl } from './lib/db/queries/feeds';
import { createFeedFollow, getFeedFollowsForUser, deleteFeedFollow } from './lib/db/queries/feedFollows';
import { fetchFeed } from './lib/rss';
import { feeds, users, feedFollows } from './lib/schema';

export type Feed = typeof feeds.$inferSelect;
export type User = typeof users.$inferSelect;
export type FeedFollow = typeof feedFollows.$inferSelect;

function printFeed(feed: Feed, user: User) {
  console.log(`* ID:            ${feed.id}`);
  console.log(`* Name:          ${feed.name}`);
  console.log(`* URL:           ${feed.url}`);
  console.log(`* User:          ${user.name}`);
  console.log(`* LastFetchedAt: ${feed.createdAt}`);
}

type CommandHandler = (args: string[]) => Promise<void>;

type UserCommandHandler = (
  cmdName: string,
  user: User,
  ...args: string[]
) => Promise<void>;

type middlewareLoggedIn = (handler: UserCommandHandler) => CommandHandler;

function middlewareLoggedIn(handler: UserCommandHandler): CommandHandler {
  return async (args: string[]) => {
    const config = readConfig();
    if (!config.current_user_name) {
      throw new Error('No user logged in');
    }
    const user = await getUserByName(config.current_user_name);
    if (!user) {
      throw new Error('User not found');
    }
    await handler('middlewareLoggedIn', user, ...args);
  };
}

const handlerAddFeed: UserCommandHandler = async (cmdName, user, ...args) => {
  if (args.length < 2) {
    throw new Error('Name and URL are required');
  }
  const name = args[0];
  const url = args[1];
  const feed = await createFeed(name, url, user.id);
  const follow = await createFeedFollow(user.id, feed.id);
  console.log(`* ${follow.feedName}`);
  console.log(`  User: ${follow.userName}`);
};

const handlerFollow: UserCommandHandler = async (cmdName, user, ...args) => {
  if (args.length === 0) {
    throw new Error('URL is required');
  }
  const url = args[0];
  const feed = await getFeedByUrl(url);
  if (!feed) {
    throw new Error('Feed not found');
  }
  const follow = await createFeedFollow(user.id, feed.id);
  console.log(`* ${follow.feedName}`);
  console.log(`  User: ${follow.userName}`);
};

const handlerFollowing: UserCommandHandler = async (cmdName, user, ...args) => {
  const follows = await getFeedFollowsForUser(user.id);
  for (const follow of follows) {
    console.log(`* ${follow.feedName}`);
  }
};

const handlerUnfollow: UserCommandHandler = async (cmdName, user, ...args) => {
  if (args.length === 0) {
    throw new Error('URL is required');
  }
  const url = args[0];
  await deleteFeedFollow(user.id, url);
  console.log('Successfully unfollowed the feed');
};

const commands: Record<string, CommandHandler> = {
  register: async (args: string[]) => {
    if (args.length === 0) {
      throw new Error('Name is required');
    }
    const name = args[0];
    const existingUser = await getUserByName(name);
    if (existingUser) {
      throw new Error('User already exists');
    }
    const user = await createUser(name);
    const config = readConfig();
    config.current_user_name = name;
    writeConfig(config);
    console.log(`User ${name} created:`, user);
  },
  login: async (args: string[]) => {
    if (args.length === 0) {
      throw new Error('Name is required');
    }
    const name = args[0];
    const user = await getUserByName(name);
    if (!user) {
      throw new Error('User does not exist');
    }
    const config = readConfig();
    config.current_user_name = name;
    writeConfig(config);
    console.log(`Logged in as ${name}`);
  },
  reset: async (args: string[]) => {
    await deleteAllUsers();
    console.log('Database reset successfully');
  },
  users: async (args: string[]) => {
    const allUsers = await getUsers();
    const config = readConfig();
    for (const user of allUsers) {
      const suffix = user.name === config.current_user_name ? ' (current)' : '';
      console.log(`* ${user.name}${suffix}`);
    }
  },
  agg: async (args: string[]) => {
    const feed = await fetchFeed('https://www.wagslane.dev/index.xml');
    console.log(JSON.stringify(feed, null, 2));
  },
  addfeed: middlewareLoggedIn(handlerAddFeed),
  feeds: async (args: string[]) => {
    const feedsWithUsers = await getFeedsWithUsers();
    for (const feed of feedsWithUsers) {
      console.log(`* ${feed.name}`);
      console.log(`  URL: ${feed.url}`);
      console.log(`  User: ${feed.userName}`);
      console.log();
    }
  },
  follow: middlewareLoggedIn(handlerFollow),
  following: middlewareLoggedIn(handlerFollowing),
  unfollow: middlewareLoggedIn(handlerUnfollow),
};

async function runCommand(command: string, args: string[]): Promise<void> {
  const handler = commands[command];
  if (!handler) {
    throw new Error(`Unknown command: ${command}`);
  }
  await handler(args);
}

async function main() {
  const args = process.argv.slice(2);
  if (args.length === 0) {
    console.log('Usage: npm run start <command> [args...]');
    return;
  }
  const command = args[0];
  const commandArgs = args.slice(1);
  try {
    await runCommand(command, commandArgs);
  } catch (error) {
    console.error((error as Error).message);
    process.exit(1);
  }
}

main().then(() => process.exit(0));