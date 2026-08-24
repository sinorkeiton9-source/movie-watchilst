// API Configuration
const API_KEY = 'c41b7758';
const API_URL = 'https://www.omdbapi.com/';

// Search state
let searchTimeout = null;

// DOM Elements
const searchInput = document.getElementById('searchInput');
const searchBtn = document.getElementById('searchBtn');
const searchResults = document.getElementById('searchResults');

// Create autocomplete dropdown
const autocompleteDropdown = document.createElement('div');
autocompleteDropdown.className = 'autocomplete-dropdown';
autocompleteDropdown.id = 'autocompleteDropdown';
document.querySelector('.search-container').appendChild(autocompleteDropdown);

// Event Listeners
searchBtn.addEventListener('click', searchMovies);

searchInput.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') {
    e.preventDefault();
    autocompleteDropdown.classList.remove('show');
    searchMovies();
  }
});

searchInput.addEventListener('input', () => {
  clearTimeout(searchTimeout);
  const query = searchInput.value.trim();
  
  if (query.length < 2) {
    autocompleteDropdown.classList.remove('show');
    return;
  }
  
  searchTimeout = setTimeout(() => fetchAutocomplete(query), 300);
});

document.addEventListener('click', (e) => {
  if (!e.target.closest('.search-container')) {
    autocompleteDropdown.classList.remove('show');
  }
});

// Autocomplete function
async function fetchAutocomplete(query) {
  try {
    const response = await fetch(`${API_URL}?apikey=${API_KEY}&s=${encodeURIComponent(query)}`);
    const data = await response.json();
    
    if (data.Response === 'True' && data.Search) {
      displayAutocomplete(data.Search.slice(0, 6));
    } else {
      autocompleteDropdown.classList.remove('show');
    }
  } catch (error) {
    console.error('Autocomplete error:', error);
    autocompleteDropdown.classList.remove('show');
  }
}

function displayAutocomplete(movies) {
  autocompleteDropdown.innerHTML = '';
  
  movies.forEach(movie => {
    const item = document.createElement('div');
    item.className = 'autocomplete-item';
    
    let poster = movie.Poster;
    if (poster === 'N/A' || !poster) {
      poster = 'https://via.placeholder.com/32x48/333/666?text=🎬';
    }
    
    const typeLabel = movie.Type === 'series' ? '📺 TV Series' : '🎬 Movie';
    
    item.innerHTML = `
      <img src="${poster}" alt="${movie.Title}" onerror="this.src='https://via.placeholder.com/32x48/333/666?text=🎬'">
      <div class="autocomplete-item-info">
        <h4>${movie.Title}</h4>
        <p>${movie.Year} • ${typeLabel}</p>
      </div>
    `;
    
    item.addEventListener('click', () => {
      searchInput.value = movie.Title;
      autocompleteDropdown.classList.remove('show');
      searchMovies();
    });
    
    autocompleteDropdown.appendChild(item);
  });
  
  autocompleteDropdown.classList.add('show');
}

// Search movies
async function searchMovies() {
  const query = searchInput.value.trim();
  
  if (!query) {
    searchResults.innerHTML = '<p style="text-align:center;color:var(--text-secondary);">Please enter a movie title.</p>';
    return;
  }
  
  searchResults.innerHTML = '<p style="text-align:center;color:var(--text-secondary);">Searching...</p>';
  
  try {
    const response = await fetch(`${API_URL}?apikey=${API_KEY}&s=${encodeURIComponent(query)}`);
    const data = await response.json();
    
    if (data.Response === 'False') {
      searchResults.innerHTML = '<p style="text-align:center;color:var(--text-secondary);">No results found. Try another title.</p>';
      return;
    }
    
    displaySearchResults(data.Search.slice(0, 8));
  } catch (error) {
    searchResults.innerHTML = '<p style="text-align:center;color:var(--text-secondary);">Error searching. Please try again.</p>';
    console.error('Search error:', error);
  }
}

function displaySearchResults(movies) {
  searchResults.innerHTML = '';
  
  movies.forEach(movie => {
    const item = document.createElement('div');
    item.className = 'search-result-item';
    
    let poster = movie.Poster;
    if (poster === 'N/A' || !poster) {
      poster = 'https://via.placeholder.com/48x72/333/666?text=🎬';
    }
    
    const typeLabel = movie.Type === 'series' ? '📺 TV Series' : '🎬 Movie';
    
    item.innerHTML = `
      <img src="${poster}" alt="${movie.Title}" onerror="this.src='https://via.placeholder.com/48x72/333/666?text=🎬'">
      <div class="search-result-info">
        <h3>${movie.Title}</h3>
        <p>${movie.Year} • ${typeLabel}</p>
      </div>
      <button class="add-btn" onclick="addToWatchlist('${movie.imdbID}')">+ Add</button>
    `;
    
    searchResults.appendChild(item);
  });
}