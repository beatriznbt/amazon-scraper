const axios = require('axios');
const { JSDOM } = require('jsdom');

// Delay function to pause execution
function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// Array of User-Agents for rotation to mimic different browsers and avoid detection
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

// Function to fetch results from Amazon based on the search keyword
async function fetchAmazonResults(keyword, retryCount = 0) {
    try {
        // Delay increasing exponentially with the number of retries
        await delay(5000 * Math.pow(2, retryCount)); 

        // Construct the URL for the Amazon search page
        const url = `https://www.amazon.com/s?k=${encodeURIComponent(keyword)}`;
        // Randomly choose a user agent from the list
        const userAgent = userAgents[Math.floor(Math.random() * userAgents.length)];

        // Fetch the HTML content of the page
        const response = await axios.get(url, {
            headers: {
                'User-Agent': userAgent, // Set the user agent in the request header
            }
        });

        // Parse the HTML content using JSDOM
        const dom = new JSDOM(response.data);
        const document = dom.window.document;
        // Select all products listed on the page
        const productItems = document.querySelectorAll('.s-result-item');
        let products = [];

        // Extract details for each product
        productItems.forEach(item => {
            // Locate the product title within the item element
            const titleElement = item.querySelector('h2.a-size-mini.a-spacing-none.a-color-base.s-line-clamp-4 > a.a-link-normal');
            const title = titleElement ? titleElement.textContent.trim() : null;
            // Locate and parse the product rating
            const ratingText = item.querySelector('.a-icon-alt')?.textContent.trim();
            const rating = ratingText ? parseFloat(ratingText.match(/[0-9.]+/)[0]) : null;
            // Locate the number of reviews
            const numReviews = item.querySelector('.a-size-small .a-size-base')?.textContent.trim();
            // Locate the image URL
            const imageUrl = item.querySelector('.s-image')?.src;

            // Only add the product if all necessary details are present
            if (title && rating && numReviews && imageUrl) {
                products.push({
                    title,
                    rating,
                    numReviews,
                    imageUrl
                });
            }
        });

        // Return the list of products found
        return products;
    } catch (error) {
        // Handle errors and attempt retries up to a maximum of 3 retries
        console.error(`Retry ${retryCount + 1}: Error fetching data: ${error}`);
        if (retryCount < 3) {
            console.log(`Retry ${retryCount + 1}: Retrying after error`);
            return fetchAmazonResults(keyword, retryCount + 1);
        } else {
            console.error('Max retries reached, throwing error');
            throw error;
        }
    }
}

// Export the function for use in other parts of the application
module.exports = fetchAmazonResults;
