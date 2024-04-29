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
    resultsContainer.innerHTML = ''; // Limpa resultados antigos

    data.forEach(item => {
        const div = document.createElement('div');
        div.className = 'product';
        const starRating = getStarRating(parseFloat(item.rating)); // Converte a classificação numérica em estrelas
        div.innerHTML = `
            <img src="${item.imageUrl}" alt="${item.title}" style="width:100px; height:auto;">
            <h2>${item.title}</h2>
            <p class="rating">Rating: <span class="star-rating">${starRating}</span> (${item.numReviews} reviews)</p>
        `;
        resultsContainer.appendChild(div);
    });
}

