const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const path = require('path');
const fetchAmazonResults = require('../scraper/fetchAmazon');
const app = express();
const PORT = 3000;

const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutos
    max: 100, // Limite de 100 requisições por IP a cada 15 minutos
    standardHeaders: true, // Retorna informações do rate limit nos cabeçalhos `RateLimit-*`
    legacyHeaders: false, // Desativa os cabeçalhos `X-RateLimit-*`
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

// Rota da API para buscar produtos na Amazon
app.get('/api/scrape', async (req, res) => {
    const { keyword } = req.query;
    if (!keyword) {
        return res.status(400).json({ error: 'Keyword parameter is required' });
    }

    try {
        const products = await fetchAmazonResults(keyword);
        if (products.length === 0) {
            throw new Error("No products found");
        }
        res.json(products);
    } catch (error) {
        console.error('Error fetching data:', error);
        res.status(500).json({ error: error.message || 'Failed to fetch data' });
    }
});

// Inicia o servidor na porta especificada
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});