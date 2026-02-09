const TelegramBot = require('node-telegram-bot-api');
const dotenv = require('dotenv');

dotenv.config();

const token = process.env.BOT_TOKEN;
const chatId = process.env.CHAT_ID;

let bot = null;

if (token) {
    bot = new TelegramBot(token, { polling: false });
}

async function sendTweetToTelegram(formattedMessage, images) {
    if (!bot || !chatId) {
        console.error('Telegram bot not configured. Set BOT_TOKEN and CHAT_ID in .env');
        return;
    }

    try {
        if (images && images.length > 0) {
            // Send first image with caption
            if (images.length === 1) {
                await bot.sendPhoto(chatId, images[0], { caption: formattedMessage });
            } else {
                // Send as media group for multiple images
                const media = images.slice(0, 10).map((img, index) => ({
                    type: 'photo',
                    media: img,
                    caption: index === 0 ? formattedMessage : ''
                }));
                await bot.sendMediaGroup(chatId, media);
            }
        } else {
            // Send text only
            await bot.sendMessage(chatId, formattedMessage);
        }
    } catch (error) {
        console.error('Error sending message to Telegram:', error.message);
    }
}

module.exports = {
    sendTweetToTelegram
};
