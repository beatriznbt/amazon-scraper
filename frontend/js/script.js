// Attach a click event listener to the 'searchButton' element
document.getElementById('searchButton').addEventListener('click', fetchData);

// Function to handle the fetching of data based on the user's keyword input
function fetchData() {
    const keyword = document.getElementById('searchInput').value; // Get the keyword from the input field
    if (!keyword.trim()) { // Check if the input is only whitespace
        alert('Please enter a keyword'); // Alert the user to input a valid keyword
        return; // Exit the function if no keyword is provided
    }
    console.log(`Searching for: ${keyword}`); // Log the keyword being searched

    // Perform a fetch request to the server with the keyword
    fetch(`http://localhost:3000/api/scrape?keyword=${encodeURIComponent(keyword)}`)
        .then(response => {
            if (!response.ok) { // Check if the response status is not OK
                throw new Error('Network response was not ok'); // Throw an error if the network response was bad
            }
            return response.json(); // Parse the JSON from the response
        })
        .then(data => displayResults(data)) // Handle the parsed data with `displayResults` function
        .catch(error => {
            console.error('Error:', error); // Log any errors that occur during the fetch
            alert('Failed to fetch results'); // Alert the user about the fetch failure
        });
}

// Function to convert numeric rating to stars (full, half, and empty)
function getStarRating(rating) {
    let numericRating = parseFloat(rating); // Convert string rating to a number
    let starsFull = Math.floor(numericRating); // Determine the number of full stars
    let starsHalf = numericRating % 1 >= 0.5 ? 1 : 0; // Determine if there should be a half star
    let starsEmpty = 5 - starsFull - starsHalf; // Calculate the number of empty stars
    return '★'.repeat(starsFull) + '✰'.repeat(starsHalf) + '☆'.repeat(starsEmpty); // Create the string of stars
}

// Function to display product results in the HTML
function displayResults(data) {
    const resultsContainer = document.getElementById('results'); // Get the container for displaying results
    resultsContainer.innerHTML = ''; // Clear previous results

    data.forEach(item => {
        const div = document.createElement('div');
        div.className = 'product'; // Set the class for styling
        
        const imgContainer = document.createElement('div');
        imgContainer.className = 'product-image'; // Class for the image container
        
        const img = document.createElement('img');
        img.src = item.imageUrl; // Set the source of the product image
        img.alt = item.title; // Set the alt text as the product title

        imgContainer.appendChild(img);
        div.appendChild(imgContainer);

        const title = document.createElement('h2');
        title.textContent = item.title; // Set the product title

        const rating = document.createElement('p');
        rating.className = 'rating'; // Set class for styling
        const starRating = getStarRating(parseFloat(item.rating)); // Get the star rating
        rating.innerHTML = `Rating: <span class="star-rating">${starRating}</span> <span class="num-reviews">(${item.numReviews} reviews)</span>`; // Display rating and number of reviews

        div.appendChild(title);
        div.appendChild(rating);
        resultsContainer.appendChild(div); // Append each product to the results container
    });
}
