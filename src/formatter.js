function formatNews(tweet) {
    const { text, created_at } = tweet;

    // Generate a simple title from the first few words (up to 7 words or first line)
    const firstLine = text.split('\n')[0];
    const words = firstLine.split(' ');
    const title = words.length > 7 ? words.slice(0, 7).join(' ') + '...' : firstLine;

    const date = new Date(created_at);
    const formattedDate = `${String(date.getDate()).padStart(2, '0')}/${String(date.getMonth() + 1).padStart(2, '0')}/${date.getFullYear()}`;
    const formattedTime = `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;

    const message = `📰 خبر جديد
العنوان: ${title}
التفاصيل: ${text}
المصدر: تويتر
التاريخ: ${formattedDate} (${formattedTime})`;

    return {
        title,
        message
    };
}

module.exports = {
    formatNews
};
