const express = require('express');
const basicAuth = require('express-basic-auth');
const cors = require('cors');
const path = require('path');
const dotenv = require('dotenv');
const { getTweets, updateTweetStatus } = require('./db');
const { startScheduler } = require('./scheduler');

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

// Basic Dashboard Protection
const adminUser = process.env.ADMIN_USER || 'admin';
const adminPass = process.env.ADMIN_PASS || 'password';

app.use(basicAuth({
    users: { [adminUser]: adminPass },
    challenge: true,
    realm: 'Twitter Monitor Admin',
}));

app.use(cors());
app.use(express.json());

// Serve Static Dashboard Files
app.use(express.static(path.join(__dirname, '../dashboard')));

// API Endpoints
app.get('/api/tweets', (req, res) => {
    try {
        const tweets = getTweets();
        res.json(tweets);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.post('/api/tweets/:id/status', (req, res) => {
    const { id } = req.params;
    const { status } = req.body;

    if (!['New', 'Reviewed', 'Published'].includes(status)) {
        return res.status(400).json({ error: 'Invalid status' });
    }

    try {
        updateTweetStatus(id, status);
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Root route redirects to dashboard
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../dashboard/index.html'));
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);

    // Start the Twitter monitoring scheduler
    startScheduler();
});

module.exports = app;
