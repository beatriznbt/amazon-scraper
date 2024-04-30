const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const path = require('path');
const fetchAmazonResults = require('../scraper/fetchAmazon'); // Importing the scraping function
const app = express();
const PORT = 3000;

// Configure rate limiting to prevent abuse and to control load on the server
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // Set the time window to 15 minutes
    max: 100, // Limit each IP to 100 requests per window
    standardHeaders: true, // Return rate limit info in the RateLimit-* headers
    legacyHeaders: false, // Disable the X-RateLimit-* headers
});

app.use(limiter); // Apply the rate limiting middleware to all requests
app.use(cors()); // Enable CORS to allow cross-origin requests

// Define the path for static files, relative to the current file in the 'server' directory
const staticFilesPath = path.join(__dirname, '..', 'frontend');
app.use(express.static(staticFilesPath));

// Main route to serve the index.html from the frontend folder
app.get('/', (req, res) => {
    res.sendFile(path.join(staticFilesPath, 'index.html'));
});

// API route to fetch products from Amazon based on a keyword
app.get('/api/scrape', async (req, res) => {
    const { keyword } = req.query; // Extract the keyword from query parameters
    if (!keyword) {
        // If no keyword is provided, return an error
        return res.status(400).json({ error: 'Keyword parameter is required' });
    }

    try {
        const products = await fetchAmazonResults(keyword); // Fetch products using the scraper function
        if (products.length === 0) {
            // If no products are found, throw an error
            throw new Error("No products found");
        }
        res.json(products); // Send the products as a JSON response
    } catch (error) {
        // Handle errors from the scraping function
        console.error('Error fetching data:', error);
        res.status(500).json({ error: error.message || 'Failed to fetch data' });
    }
});

// Start the server on the specified port
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
