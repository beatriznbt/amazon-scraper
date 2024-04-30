const axios = require('axios');
const { JSDOM } = require('jsdom');

// Lista de User-Agents para rotatividade
const userAgents = [
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/103.0.5060.114 Safari/537.36',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:105.0) Gecko/20100101 Firefox/105.0',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0.3 Safari/605.1.15',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/103.0.0.0 Safari/537.36 Edg/103.0.1264.49',
    'Mozilla/5.0 (Linux; Android 11; Pixel 5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/103.0.5060.53 Mobile Safari/537.36',
    'Mozilla/5.0 (Android 10; Mobile; rv:78.0) Gecko/78.0 Firefox/78.0',
    'Mozilla/5.0 (iPad; CPU OS 14_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0 Mobile/15E148 Safari/604.1',
    'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/103.0.5060.134 Safari/537.36'
];

async function delay(time) {
    return new Promise(resolve => setTimeout(resolve, time));
}

async function fetchAmazonResults(keyword, retryCount = 0) {
    try {
        // Aumentando o delay com cada retry para diminuir a chance de bloqueio
        await delay(5000 * Math.pow(2, retryCount)); 

        const url = `https://www.amazon.com/s?k=${encodeURIComponent(keyword)}`;
        const userAgent = userAgents[Math.floor(Math.random() * userAgents.length)];

        const response = await axios.get(url, {
            headers: {
                'User-Agent': userAgent,
                'Accept-Language': 'en-US,en;q=0.9',
                
            }
        });

        const dom = new JSDOM(response.data);
        const document = dom.window.document;
        const productItems = document.querySelectorAll('.s-result-item');
        let products = [];

        productItems.forEach(item => {
            const titleElement = item.querySelector('h2.a-size-mini.a-spacing-none.a-color-base.s-line-clamp-4 > a.a-link-normal');
            const title = titleElement ? titleElement.textContent.trim() : null;
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
    } catch (error) {
        console.error(`Retry ${retryCount + 1}: Error fetching data: ${error}`);
        if (retryCount < 3) { // Aumentei o número de retries
            console.log(`Retry ${retryCount + 1}: Retrying after error`);
            return fetchAmazonResults(keyword, retryCount + 1);
        } else {
            console.error('Max retries reached, throwing error');
            throw error;
        }
    }
}

module.exports = fetchAmazonResults;
