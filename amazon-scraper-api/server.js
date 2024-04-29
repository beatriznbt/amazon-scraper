const express = require('express');
const axios = require('axios');
const { JSDOM } = require('jsdom');
const app = express();
const PORT = 3000;

app.get('/api/scrape', async (req, res) => {
    const { keyword } = req.query;
    if (!keyword) {
        return res.status(400).json({ error: 'Keyword parameter is required' });
    }

    const url = `https://www.amazon.com/s?k=${encodeURIComponent(keyword)}`;

    try {
        const response = await axios.get(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.36'
            }
        });

        const dom = new JSDOM(response.data);
        const document = dom.window.document;
        const productItems = document.querySelectorAll('.s-result-item');
        let products = [];

        productItems.forEach(item => {
            const title = item.querySelector('.a-size-medium')?.textContent.trim();
            const rating = item.querySelector('.a-icon-alt')?.textContent.trim();
            const numReviews = item.querySelector('.a-size-small .a-size-base')?.textContent.trim();
            const imageUrl = item.querySelector('.s-image')?.src;

            if (title && rating && numReviews && imageUrl) {
                products.push({
                    title,
                    rating: rating.match(/[0-9.]+/g) ? rating.match(/[0-9.]+/g)[0] : 'No rating',
                    numReviews,
                    imageUrl
                });
            }
        });

        res.json(products);
    } catch (error) {
        console.error('Error fetching data:', error);
        res.status(500).json({ error: 'Failed to fetch data' });
    }
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
