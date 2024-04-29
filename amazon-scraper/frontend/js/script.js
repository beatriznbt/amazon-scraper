function fetchData() {
    const keyword = document.getElementById('searchInput').value;
    if (!keyword) {
        alert('Please enter a keyword');
        return;
    }

    fetch(`http://localhost:3000/api/scrape?keyword=${encodeURIComponent(keyword)}`)
        .then(response => response.json())
        .then(data => displayResults(data))
        .catch(error => console.error('Error:', error));
}

function displayResults(data) {
    console.log(data);  // Isso vai mostrar os dados no console do navegador
    const resultsContainer = document.getElementById('results');
    resultsContainer.innerHTML = '';

    data.forEach(item => {
        const div = document.createElement('div');
        div.className = 'product';
        div.innerHTML = `
            <img src="${item.imageUrl}" alt="${item.title}" style="width:100px; height:auto;">
            <h2>${item.title}</h2>
            <p>Rating: ${item.rating} (${item.numReviews} reviews)</p>
        `;
        resultsContainer.appendChild(div);
    });
}
