document.getElementById('searchButton').addEventListener('click', fetchData);

function fetchData() {
    const keyword = document.getElementById('searchInput').value;
    if (!keyword.trim()) { // Adiciona trim para evitar pesquisa de strings vazias
        alert('Please enter a keyword');
        return;
    }
    console.log(`Searching for: ${keyword}`);

    fetch(`http://localhost:3000/api/scrape?keyword=${encodeURIComponent(keyword)}`)
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => displayResults(data))
        .catch(error => {
            console.error('Error:', error);
            alert('Failed to fetch results');
        });
}

function getStarRating(rating) {
    let numericRating = parseFloat(rating); // Converte a classificação de string para número
    let starsFull = Math.floor(numericRating);
    let starsHalf = numericRating % 1 >= 0.5 ? 1 : 0;
    let starsEmpty = 5 - starsFull - starsHalf;
    return '★'.repeat(starsFull) + '✰'.repeat(starsHalf) + '☆'.repeat(starsEmpty);
}

function displayResults(data) {
    const resultsContainer = document.getElementById('results');
    resultsContainer.innerHTML = '';

    data.forEach(item => {
        const div = document.createElement('div');
        div.className = 'product';
        
        const imgContainer = document.createElement('div');
        imgContainer.className = 'product-image';
        
        const img = document.createElement('img');
        img.src = item.imageUrl;
        img.alt = item.title;

        imgContainer.appendChild(img);
        div.appendChild(imgContainer);

        const title = document.createElement('h2');
        title.textContent = item.title;

        const rating = document.createElement('p');
        rating.className = 'rating';
        const starRating = getStarRating(parseFloat(item.rating));
        rating.innerHTML = `Rating: <span class="star-rating">${starRating}</span> <span class="num-reviews">(${item.numReviews} reviews)</span>`;

        div.appendChild(title);
        div.appendChild(rating);
        resultsContainer.appendChild(div);
    });
}