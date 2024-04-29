const express = require('express');
const cors = require('cors');
const axios = require('axios');
const { JSDOM } = require('jsdom');
const rateLimit = require('express-rate-limit');
const path = require('path');
const app = express();
const PORT = 3000;

const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per windowMs
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});

app.use(limiter);
app.use(cors());

// Configurando o caminho para os arquivos estáticos
const staticFilesPath = path.join('C:', 'Users', 'Beatriz', 'Carvalho-Aleixo-Internship', 'amazon-scraper', 'frontend');
app.use(express.static(staticFilesPath));

// Rota principal para servir o arquivo index.html
app.get('/', (req, res) => {
    res.sendFile(path.join(staticFilesPath, 'index.html'));
});

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
