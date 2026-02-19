# Gator Blog CLI

Gator Blog is a command-line interface (CLI) program that fetches RSS feeds and displays posts in your terminal. The main goal is to aggregate posts from multiple feeds and manage them locally using a database.

## Features

- Add, remove, and list RSS feeds
- Aggregate posts from feeds in a continuous loop
- Print post titles to the console
- Track when each feed was last fetched
- CLI commands for interacting with feeds

## Commands

### agg

The `agg` command fetches all the RSS feeds, parses their posts, and prints the titles to the console. It runs in a continuous loop and fetches feeds one at a time, waiting a specified interval between requests to avoid overloading third-party servers.

#### Usage

```bash
node dist/main.js agg 1m

