# Twitter Monitor & News Preparer

A private automated system to monitor a Twitter (X) account via Nitter and prepare news content for manual publishing.

## 🚀 Features
- **Scraping**: Automatically fetches tweets without using the official Twitter API.
- **Telegram Integration**: Sends formatted news and images to a Telegram bot.
- **Arabic Dashboard**: Minimal RTL admin interface to review and copy news.
- **Status Tracking**: Track news as New, Reviewed, or Published.
- **No-Code Automation Free**: Pure Node.js implementation.

## ⚙️ Requirements
- Node.js installed.
- Telegram Bot Token & Chat ID.

## 📁 Project Structure
```
/src
  ├── scraper.js    # Nitter scraping logic
  ├── telegram.js   # Telegram Bot API integration
  ├── formatter.js  # Arabic text formatting
  ├── db.js         # SQLite database management
  ├── scheduler.js  # Background monitoring job
  └── server.js      # API & Dashboard server
/dashboard
  ├── index.html    # RTL Dashboard UI
  ├── style.css     # Modern CSS styles
  └── app.js        # Frontend logic
```

## 🛠️ Setup
1. Clone this repository.
2. Run `npm install`.
3. Create a `.env` file based on `.env.example`:
   ```
   BOT_TOKEN=your_bot_token
   CHAT_ID=your_chat_id
   TWITTER_USERNAME=target_username
   PORT=3000
   CHECK_INTERVAL=3
   ```
4. Run the application:
   ```
   npm start
   ```

## 🚢 Deployment on Railway
1. Connect your GitHub repository to Railway.
2. Add the environment variables in the Railway dashboard.
3. Railway will automatically detect `npm start` and deploy the system.
4. Ensure the `data` directory is persisted if using a volume, or use a managed database if preferred for long-term storage (though SQLite works fine for this scale).

## 🔐 Security
- The system is intended for private use. 
- Access to the dashboard should be restricted (e.g., via Railway's private networking or basic authentication if deployed publicly).

## 📰 News Format
Each news item is formatted as:
```
📰 خبر جديد
العنوان: [Generated Title]
التفاصيل: [Full Tweet Text]
المصدر: تويتر
التاريخ: [DD/MM/YYYY]
```
