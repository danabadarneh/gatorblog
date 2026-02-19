"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const config_1 = require("./config");
const users_1 = require("./lib/db/queries/users");
const feeds_1 = require("./lib/db/queries/feeds");
const feedFollows_1 = require("./lib/db/queries/feedFollows");
const rss_1 = require("./lib/rss");
function printFeed(feed, user) {
    console.log(`* ID:            ${feed.id}`);
    console.log(`* Name:          ${feed.name}`);
    console.log(`* URL:           ${feed.url}`);
    console.log(`* User:          ${user.name}`);
    console.log(`* LastFetchedAt: ${feed.createdAt}`);
}
function middlewareLoggedIn(handler) {
    return async (args) => {
        const config = (0, config_1.readConfig)();
        if (!config.current_user_name) {
            throw new Error('No user logged in');
        }
        const user = await (0, users_1.getUserByName)(config.current_user_name);
        if (!user) {
            throw new Error('User not found');
        }
        await handler('middlewareLoggedIn', user, ...args);
    };
}
const handlerAddFeed = async (cmdName, user, ...args) => {
    if (args.length < 2) {
        throw new Error('Name and URL are required');
    }
    const name = args[0];
    const url = args[1];
    const feed = await (0, feeds_1.createFeed)(name, url, user.id);
    const follow = await (0, feedFollows_1.createFeedFollow)(user.id, feed.id);
    console.log(`* ${follow.feedName}`);
    console.log(`  User: ${follow.userName}`);
};
const handlerFollow = async (cmdName, user, ...args) => {
    if (args.length === 0) {
        throw new Error('URL is required');
    }
    const url = args[0];
    const feed = await (0, feeds_1.getFeedByUrl)(url);
    if (!feed) {
        throw new Error('Feed not found');
    }
    const follow = await (0, feedFollows_1.createFeedFollow)(user.id, feed.id);
    console.log(`* ${follow.feedName}`);
    console.log(`  User: ${follow.userName}`);
};
const handlerFollowing = async (cmdName, user, ...args) => {
    const follows = await (0, feedFollows_1.getFeedFollowsForUser)(user.id);
    for (const follow of follows) {
        console.log(`* ${follow.feedName}`);
    }
};
const handlerUnfollow = async (cmdName, user, ...args) => {
    if (args.length === 0) {
        throw new Error('URL is required');
    }
    const url = args[0];
    await (0, feedFollows_1.deleteFeedFollow)(user.id, url);
    console.log('Successfully unfollowed the feed');
};
const commands = {
    register: async (args) => {
        if (args.length === 0) {
            throw new Error('Name is required');
        }
        const name = args[0];
        const existingUser = await (0, users_1.getUserByName)(name);
        if (existingUser) {
            throw new Error('User already exists');
        }
        const user = await (0, users_1.createUser)(name);
        const config = (0, config_1.readConfig)();
        config.current_user_name = name;
        (0, config_1.writeConfig)(config);
        console.log(`User ${name} created:`, user);
    },
    login: async (args) => {
        if (args.length === 0) {
            throw new Error('Name is required');
        }
        const name = args[0];
        const user = await (0, users_1.getUserByName)(name);
        if (!user) {
            throw new Error('User does not exist');
        }
        const config = (0, config_1.readConfig)();
        config.current_user_name = name;
        (0, config_1.writeConfig)(config);
        console.log(`Logged in as ${name}`);
    },
    reset: async (args) => {
        await (0, users_1.deleteAllUsers)();
        console.log('Database reset successfully');
    },
    users: async (args) => {
        const allUsers = await (0, users_1.getUsers)();
        const config = (0, config_1.readConfig)();
        for (const user of allUsers) {
            const suffix = user.name === config.current_user_name ? ' (current)' : '';
            console.log(`* ${user.name}${suffix}`);
        }
    },
    agg: async (args) => {
        const feed = await (0, rss_1.fetchFeed)('https://www.wagslane.dev/index.xml');
        console.log(JSON.stringify(feed, null, 2));
    },
    addfeed: middlewareLoggedIn(handlerAddFeed),
    feeds: async (args) => {
        const feedsWithUsers = await (0, feeds_1.getFeedsWithUsers)();
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
async function runCommand(command, args) {
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
    }
    catch (error) {
        console.error(error.message);
        process.exit(1);
    }
}
main().then(() => process.exit(0));
