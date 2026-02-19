import { XMLParser } from 'fast-xml-parser';

export type RSSItem = {
  title: string;
  link: string;
  description: string;
  pubDate: string;
};

export type RSSFeed = {
  channel: {
    title: string;
    link: string;
    description: string;
    item: RSSItem[];
  };
};

export async function fetchFeed(feedURL: string): Promise<RSSFeed> {
  const response = await fetch(feedURL, {
    headers: {
      'User-Agent': 'gator',
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch feed: ${response.status}`);
  }

  const xmlText = await response.text();

  const parser = new XMLParser();
  const parsed = parser.parse(xmlText);

  if (!parsed.rss || !parsed.rss.channel) {
    throw new Error('Invalid RSS feed structure');
  }

  const channel = parsed.rss.channel;

  if (!channel.title || !channel.link || !channel.description) {
    throw new Error('Missing required channel fields');
  }

  let items: RSSItem[] = [];
  if (channel.item) {
    const rawItems = Array.isArray(channel.item) ? channel.item : [channel.item];
    items = rawItems
      .filter((item: any) => item.title && item.link && item.description && item.pubDate)
      .map((item: any) => ({
        title: item.title,
        link: item.link,
        description: item.description,
        pubDate: item.pubDate,
      }));
  }

  return {
    channel: {
      title: channel.title,
      link: channel.link,
      description: channel.description,
      item: items,
    },
  };
}