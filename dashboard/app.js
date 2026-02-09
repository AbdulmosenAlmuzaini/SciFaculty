let currentTweets = [];
let selectedTweet = null;

const tweetList = document.getElementById('tweet-list');
const previewPanel = document.getElementById('preview-panel');
const refreshBtn = document.getElementById('refresh-btn');
const toast = document.getElementById('toast');

async function fetchTweets() {
    tweetList.innerHTML = '<div class="loading">جاري التحميل...</div>';
    try {
        const response = await fetch('/api/tweets');
        currentTweets = await response.json();
        renderTweetList();
    } catch (error) {
        tweetList.innerHTML = '<div class="error">خطأ في تحميل البيانات</div>';
    }
}

function renderTweetList() {
    if (currentTweets.length === 0) {
        tweetList.innerHTML = '<div class="empty">لا توجد أخبار حالياً</div>';
        return;
    }

    tweetList.innerHTML = currentTweets.map(tweet => `
        <div class="tweet-card ${tweet.status} ${selectedTweet?.id === tweet.id ? 'active' : ''}" onclick="selectTweet(${tweet.id})">
            <h3>${generateTitle(tweet.text)}</h3>
            <div class="meta">${new Date(tweet.created_at).toLocaleString('ar-EG')} | ${translateStatus(tweet.status)}</div>
        </div>
    `).join('');
}

function selectTweet(id) {
    selectedTweet = currentTweets.find(t => t.id === id);
    renderTweetList();
    renderPreview();
}

function generateTitle(text) {
    const firstLine = text.split('\n')[0];
    const words = firstLine.split(' ');
    return words.length > 7 ? words.slice(0, 7).join(' ') + '...' : firstLine;
}

function translateStatus(status) {
    const map = {
        'New': 'جديد',
        'Reviewed': 'تمت المراجعة',
        'Published': 'تم النشر'
    };
    return map[status] || status;
}

function renderPreview() {
    if (!selectedTweet) {
        previewPanel.innerHTML = '<div class="preview-placeholder"><p>اختر خبراً للمعاينة</p></div>';
        return;
    }

    const { title, message } = formatForDisplay(selectedTweet);

    previewPanel.innerHTML = `
        <div class="preview-header">
            <h2>${title}</h2>
            <div class="meta">${new Date(selectedTweet.created_at).toLocaleString('ar-EG')}</div>
        </div>
        <div class="preview-content" id="formatted-text">${message}</div>
        
        ${selectedTweet.images && selectedTweet.images.length > 0 ? `
            <div class="preview-images">
                ${selectedTweet.images.map(img => `<img src="${img}" alt="Tweet image" onclick="downloadImage('${img}')">`).join('')}
            </div>
        ` : ''}

        <div class="controls">
            <button class="btn primary" onclick="copyText()">نسخ النص</button>
            <button class="btn secondary" onclick="updateStatus('Reviewed')">تحديد كمتمت مراجعته</button>
            <button class="btn success" onclick="updateStatus('Published')">تحديد كمنشور</button>
        </div>
    `;
}

function formatForDisplay(tweet) {
    const date = new Date(tweet.created_at);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    const time = `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;

    const title = generateTitle(tweet.text);
    const message = `📰 خبر جديد
العنوان: ${title}
التفاصيل: ${tweet.text}
المصدر: تويتر
التاريخ: ${day}/${month}/${year} (${time})`;

    return { title, message };
}

async function updateStatus(status) {
    if (!selectedTweet) return;
    try {
        const response = await fetch(`/api/tweets/${selectedTweet.id}/status`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status })
        });
        if (response.ok) {
            selectedTweet.status = status;
            fetchTweets(); // Refresh list to update status colors
            renderPreview();
        }
    } catch (error) {
        alert('خطأ في تحديث الحالة');
    }
}

function copyText() {
    const text = document.getElementById('formatted-text').innerText;
    navigator.clipboard.writeText(text).then(() => {
        showToast();
    });
}

function showToast() {
    toast.style.display = 'block';
    setTimeout(() => {
        toast.style.display = 'none';
    }, 2000);
}

function downloadImage(url) {
    const a = document.createElement('a');
    a.href = url;
    a.download = 'tweet_image.jpg';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
}

refreshBtn.addEventListener('click', fetchTweets);

// Initial Load
fetchTweets();
