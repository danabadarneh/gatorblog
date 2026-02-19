"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.fetchFeed = fetchFeed;
const fast_xml_parser_1 = require("fast-xml-parser");
async function fetchFeed(feedURL) {
    const response = await fetch(feedURL, {
        headers: {
            'User-Agent': 'gator',
        },
    });
    if (!response.ok) {
        throw new Error(`Failed to fetch feed: ${response.status}`);
    }
    const xmlText = await response.text();
    const parser = new fast_xml_parser_1.XMLParser();
    const parsed = parser.parse(xmlText);
    if (!parsed.rss || !parsed.rss.channel) {
        throw new Error('Invalid RSS feed structure');
    }
    const channel = parsed.rss.channel;
    if (!channel.title || !channel.link || !channel.description) {
        throw new Error('Missing required channel fields');
    }
    let items = [];
    if (channel.item) {
        const rawItems = Array.isArray(channel.item) ? channel.item : [channel.item];
        items = rawItems
            .filter((item) => item.title && item.link && item.description && item.pubDate)
            .map((item) => ({
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
