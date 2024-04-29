const axios = require('axios');
const { JSDOM } = require('jsdom');

async function fetchAmazonResults(keyword) {
    const url = `https://www.amazon.com/s?k=${encodeURIComponent(keyword)}`;

    try {
        const response = await axios.get(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.36'
            }
        });

        // Using JSDOM to parse the HTML content
        const dom = new JSDOM(response.data);
        const document = dom.window.document;

        // Query all product items
        const productItems = document.querySelectorAll('.s-result-item');

        // Array to hold all products
        let products = [];

        productItems.forEach(item => {
            const title = item.querySelector('.a-size-medium')?.textContent.trim();
            const rating = item.querySelector('.a-icon-alt')?.textContent.trim();
            const numReviews = item.querySelector('.a-size-small .a-size-base')?.textContent.trim();
            const imageUrl = item.querySelector('.s-image')?.src;

            // Push product info to array if it exists
            if (title && rating && numReviews && imageUrl) {
                products.push({
                    title,
                    rating: rating.match(/[0-9.]+/g) ? rating.match(/[0-9.]+/g)[0] : 'No rating',
                    numReviews,
                    imageUrl
                });
            }
        });

        // Log all product details
        console.log(products);

    } catch (error) {
        console.error('Error fetching data:', error);
    }
}

// Replace 'laptops' with any keyword you want to search for
fetchAmazonResults('laptops');
