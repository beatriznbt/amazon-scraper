const axios = require('axios');
const { JSDOM } = require('jsdom');

async function fetchAmazonResults(keyword) {
    const url = `https://www.amazon.com/s?k=${encodeURIComponent(keyword)}`;
    const response = await axios.get(url, {
        headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.36',
            'Accept-Language': 'en-US,en;q=0.9', // Definindo a preferência de idioma para inglês
            'Cookie': 'i18n-prefs=USD; lc-main=en_US' // Definindo os cookies para usar dólar americano e inglês dos EUA
        }
    });
    const dom = new JSDOM(response.data);
    const document = dom.window.document;
    const productItems = document.querySelectorAll('.s-result-item');
    let products = [];

    productItems.forEach(item => {
        // Alterando o seletor para o título
        const titleElement = item.querySelector('h2.a-size-mini.a-spacing-none.a-color-base.s-line-clamp-4 > a.a-link-normal');
        const title = titleElement ? titleElement.textContent.trim() : 'Title not found';
        const ratingText = item.querySelector('.a-icon-alt')?.textContent.trim();
        const rating = ratingText ? parseFloat(ratingText.match(/[0-9.]+/)[0]) : null;
        const numReviews = item.querySelector('.a-size-small .a-size-base')?.textContent.trim();
        const imageUrl = item.querySelector('.s-image')?.src;
    
        if (title && rating && numReviews && imageUrl) {
            products.push({
                title,
                rating,
                numReviews,
                imageUrl
            });
        }
    });
    
    return products;
}

module.exports = fetchAmazonResults;
