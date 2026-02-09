const cron = require('node-cron');
const { fetchTweets } = require('./scraper');
const { saveTweet, isTweetProcessed } = require('./db');
const { formatNews } = require('./formatter');
const { sendTweetToTelegram } = require('./telegram');
const dotenv = require('dotenv');

dotenv.config();

const username = process.env.TWITTER_USERNAME || 'elonmusk';
const interval = process.env.CHECK_INTERVAL || 3; // minutes

async function checkNewTweets() {
    console.log(`[${new Date().toLocaleString()}] Checking for new tweets from @${username}...`);

    try {
        const tweets = await fetchTweets(username);

        // Process tweets in reverse order (oldest first in the batch)
        for (const tweet of tweets.reverse()) {
            if (!isTweetProcessed(tweet.tweet_id)) {
                console.log(`New tweet found: ${tweet.tweet_id}`);

                // Save to DB
                saveTweet(tweet);

                // Format for Telegram
                const formatted = formatNews(tweet);

                // Send to Telegram
                await sendTweetToTelegram(formatted.message, tweet.images);

                console.log(`Processed tweet ${tweet.tweet_id} successfully.`);
            }
        }
    } catch (error) {
        console.error('Error in scheduler:', error.message);
    }
}

function startScheduler() {
    // Run immediately on start
    checkNewTweets();

    // Schedule based on interval
    cron.schedule(`*/${interval} * * * *`, () => {
        checkNewTweets();
    });

    console.log(`Scheduler started. Checking @${username} every ${interval} minutes.`);
}

module.exports = {
    startScheduler
};
