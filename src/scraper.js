const axios = require('axios');
const cheerio = require('cheerio');
const dotenv = require('dotenv');

dotenv.config();

const NITTER_INSTANCES = [
    'https://nitter.poast.org',
    'https://nitter.rawbit.ninja',
    'https://nitter.perennialte.ch',
    'https://nitter.cz',
    'https://nitter.mint.lgbt',
    'https://nitter.daura.pw',
    'https://nitter.projectsegfau.lt',
    'https://nitter.okf.sh'
];

function getMockTweets(username) {
    return [
        {
            tweet_id: '1234567890',
            username,
            text: 'هذا منشور تجريبي للتأكد من عمل النظام بشكل صحيح. #تطوير #أتمتة',
            images: ['https://picsum.photos/800/600'],
            link: 'https://twitter.com/elonmusk/status/1234567890',
            created_at: new Date().toISOString()
        },
        {
            tweet_id: '0987654321',
            username,
            text: 'تغريدة ثانية تحتوي على معلومات هامة حول المشروع الجديد. ترقبوا التفاصيل!',
            images: [],
            link: 'https://twitter.com/elonmusk/status/0987654321',
            created_at: new Date(Date.now() - 3600000).toISOString()
        },
        {
            tweet_id: '1122334455',
            username,
            text: 'RT @someone: This is a retweet and should be ignored.',
            images: [],
            link: 'https://twitter.com/elonmusk/status/1122334455',
            created_at: new Date(Date.now() - 7200000).toISOString()
        }
    ];
}

async function fetchTweets(username) {
    if (process.env.USE_MOCK_DATA === 'true') {
        console.log('Using mock data for tweets...');
        const allMock = getMockTweets(username);
        return allMock.filter(t => !t.text.startsWith('RT @'));
    }

    let tweets = [];
    let lastError = null;

    for (const instance of NITTER_INSTANCES) {
        try {
            console.log(`Trying Nitter instance: ${instance}...`);
            const rssUrl = `${instance}/${username}/rss`;
            const response = await axios.get(rssUrl, {
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
                },
                timeout: 10000
            });

            const $ = cheerio.load(response.data, { xmlMode: true });

            // Clear tweets array for the current instance attempt
            tweets = [];

            $('item').each((i, el) => {
                const title = $(el).find('title').text();
                const description = $(el).find('description').text();

                // Skip retweets (Nitter RSS prefix)
                if (title.startsWith('RT @') || description.startsWith('RT @')) {
                    return;
                }

                const link = $(el).find('link').text();
                const pubDate = $(el).find('pubDate').text();
                const guid = $(el).find('guid').text(); // This is usually the tweet ID or link

                // Extract tweet ID from guid or link
                const tweetIdMatch = guid.match(/status\/(\d+)/) || link.match(/status\/(\d+)/);
                const tweet_id = tweetIdMatch ? tweetIdMatch[1] : guid;

                // Extract images from description (they are in <img> tags)
                const descHtml = cheerio.load(description);
                const images = [];
                descHtml('img').each((j, img) => {
                    const src = descHtml(img).attr('src');
                    if (src && !src.includes('syndication.twitter.com')) {
                        // Convert relative URLs to absolute if necessary
                        const fullSrc = src.startsWith('http') ? src : `${instance}${src}`;
                        images.push(fullSrc);
                    }
                });

                // Clean text (remove HTML if any, though RSS description is usually HTML)
                const text = descHtml.text().trim();

                tweets.push({
                    tweet_id,
                    username,
                    text,
                    images,
                    link,
                    created_at: new Date(pubDate).toISOString()
                });
            });

            if (tweets.length > 0) {
                console.log(`Successfully fetched ${tweets.length} tweets from ${instance}`);
                return tweets;
            } else {
                console.warn(`No tweets found at ${instance}, trying next...`);
            }
        } catch (error) {
            console.error(`Error fetching tweets from ${instance}:`, error.message);
            lastError = error;
        }
    }

    if (lastError && tweets.length === 0) {
        throw lastError;
    }
    return tweets;
}

module.exports = {
    fetchTweets
};
