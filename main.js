// State
let users = JSON.parse(localStorage.getItem('users')) || [];
let currentUser = JSON.parse(localStorage.getItem('currentUser')) || null;
let watchlist = JSON.parse(localStorage.getItem('watchlist')) || [];
let darkMode = JSON.parse(localStorage.getItem('darkMode')) || false;
let statusFilter = 'all';
let selectedAvatar = '👤';
let customPfp = null;

// Initialize default user
if (users.length === 0) {
  const defaultUser = {
    id: Date.now().toString(),
    name: 'Guest User',
    avatar: '👤',
    pfp: null,
    visibility: 'public',
    createdAt: new Date().toISOString()
  };
  users.push(defaultUser);
  currentUser = defaultUser.id;
  localStorage.setItem('users', JSON.stringify(users));
  localStorage.setItem('currentUser', JSON.stringify(currentUser));
}

function getCurrentUser() {
  return users.find(u => u.id === currentUser);
}

// DOM Elements
const watchlistContainer = document.getElementById('watchlist');
const countBadge = document.getElementById('count');
const sortSelect = document.getElementById('sortSelect');
const darkModeToggle = document.getElementById('darkModeToggle');
const darkModeIcon = document.getElementById('darkModeIcon');
const profileBtn = document.getElementById('profileBtn');
const profileDropdown = document.getElementById('profileDropdown');
const profileAvatar = document.getElementById('profileAvatar');
const profileName = document.getElementById('profileName');
const dropdownAvatar = document.getElementById('dropdownAvatar');
const dropdownName = document.getElementById('dropdownName');
const dropdownStats = document.getElementById('dropdownStats');
const editProfileBtn = document.getElementById('editProfileBtn');
const switchProfileBtn = document.getElementById('switchProfileBtn');
const discoverBtn = document.getElementById('discoverBtn');
const profileModal = document.getElementById('profileModal');
const closeModal = document.getElementById('closeModal');
const modalNameInput = document.getElementById('modalNameInput');
const saveProfileBtn = document.getElementById('saveProfileBtn');
const pfpInput = document.getElementById('pfpInput');
const pfpPreview = document.getElementById('pfpPreview');
const switchModal = document.getElementById('switchModal');
const closeSwitchModal = document.getElementById('closeSwitchModal');
const newProfileBtn = document.getElementById('newProfileBtn');
const userList = document.getElementById('userList');
const discoverModal = document.getElementById('discoverModal');
const closeDiscoverModal = document.getElementById('closeDiscoverModal');
const discoverList = document.getElementById('discoverList');
const viewUserModal = document.getElementById('viewUserModal');
const closeViewModal = document.getElementById('closeViewModal');
const viewUserName = document.getElementById('viewUserName');
const viewUserWatchlist = document.getElementById('viewUserWatchlist');

// Initialize
applyDarkMode();
updateProfileUI();
displayWatchlist();

// Event Listeners
sortSelect.addEventListener('change', displayWatchlist);
darkModeToggle.addEventListener('click', toggleDarkMode);
discoverBtn.addEventListener('click', showDiscoverModal);

profileBtn.addEventListener('click', () => {
  profileDropdown.classList.toggle('show');
});

document.addEventListener('click', (e) => {
  if (!e.target.closest('.profile-menu')) {
    profileDropdown.classList.remove('show');
  }
});

editProfileBtn.addEventListener('click', () => {
  profileDropdown.classList.remove('show');
  openEditProfile();
});

switchProfileBtn.addEventListener('click', () => {
  profileDropdown.classList.remove('show');
  showSwitchModal();
});

closeModal.addEventListener('click', () => profileModal.classList.remove('show'));
closeSwitchModal.addEventListener('click', () => switchModal.classList.remove('show'));
closeDiscoverModal.addEventListener('click', () => discoverModal.classList.remove('show'));
closeViewModal.addEventListener('click', () => viewUserModal.classList.remove('show'));

[profileModal, switchModal, discoverModal, viewUserModal].forEach(modal => {
  modal.addEventListener('click', (e) => {
    if (e.target === modal) modal.classList.remove('show');
  });
});

saveProfileBtn.addEventListener('click', saveProfile);
newProfileBtn.addEventListener('click', createNewProfile);

pfpInput.addEventListener('change', (e) => {
  const file = e.target.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = (event) => {
      customPfp = event.target.result;
      pfpPreview.src = customPfp;
      selectedAvatar = null;
      highlightSelectedAvatar();
    };
    reader.readAsDataURL(file);
  }
});

// Dark Mode
function toggleDarkMode() {
  darkMode = !darkMode;
  localStorage.setItem('darkMode', JSON.stringify(darkMode));
  applyDarkMode();
}

function applyDarkMode() {
  if (darkMode) {
    document.body.classList.add('dark-mode');
    darkModeIcon.textContent = '☀️';
  } else {
    document.body.classList.remove('dark-mode');
    darkModeIcon.textContent = '🌙';
  }
}

// Profile Functions
function updateProfileUI() {
  const user = getCurrentUser();
  if (!user) return;
  
  if (user.pfp) {
    profileAvatar.innerHTML = `<img src="${user.pfp}" style="width:28px;height:28px;border-radius:50%;object-fit:cover;">`;
    dropdownAvatar.innerHTML = `<img src="${user.pfp}" style="width:40px;height:40px;border-radius:50%;object-fit:cover;">`;
  } else {
    profileAvatar.textContent = user.avatar;
    dropdownAvatar.textContent = user.avatar;
  }
  
  profileName.textContent = user.name;
  dropdownName.textContent = user.name;
  dropdownStats.textContent = `${watchlist.length} movie${watchlist.length !== 1 ? 's' : ''} in watchlist`;
}

function openEditProfile() {
  const user = getCurrentUser();
  modalNameInput.value = user.name;
  selectedAvatar = user.avatar || '👤';
  customPfp = user.pfp;
  
  if (user.pfp) {
    pfpPreview.src = user.pfp;
  } else {
    pfpPreview.src = '';
  }
  
  document.querySelectorAll('input[name="visibility"]').forEach(radio => {
    radio.checked = radio.value === user.visibility;
  });
  
  highlightSelectedAvatar();
  profileModal.classList.add('show');
}

function selectAvatar(avatar) {
  selectedAvatar = avatar;
  customPfp = null;
  pfpPreview.src = '';
  pfpInput.value = '';
  highlightSelectedAvatar();
}

function highlightSelectedAvatar() {
  document.querySelectorAll('.avatar-option').forEach(btn => {
    if (btn.textContent === selectedAvatar) {
      btn.classList.add('selected');
    } else {
      btn.classList.remove('selected');
    }
  });
}

function saveProfile() {
  const user = getCurrentUser();
  const name = modalNameInput.value.trim();
  if (name) user.name = name;
  user.avatar = selectedAvatar;
  user.pfp = customPfp;
  
  const visibilityRadio = document.querySelector('input[name="visibility"]:checked');
  if (visibilityRadio) user.visibility = visibilityRadio.value;
  
  localStorage.setItem('users', JSON.stringify(users));
  updateProfileUI();
  profileModal.classList.remove('show');
}

function createNewProfile() {
  const name = prompt('Enter a name for the new profile:');
  if (!name || !name.trim()) return;
  
  const newUser = {
    id: Date.now().toString(),
    name: name.trim(),
    avatar: '👤',
    pfp: null,
    visibility: 'public',
    createdAt: new Date().toISOString()
  };
  
  users.push(newUser);
  currentUser = newUser.id;
  
  localStorage.setItem('users', JSON.stringify(users));
  localStorage.setItem('currentUser', JSON.stringify(currentUser));
  
  watchlist = [];
  localStorage.setItem('watchlist', JSON.stringify(watchlist));
  
  updateProfileUI();
  displayWatchlist();
  switchModal.classList.remove('show');
}

function showSwitchModal() {
  displayUserList();
  switchModal.classList.add('show');
}

function displayUserList() {
  userList.innerHTML = '';
  
  users.forEach(user => {
    const item = document.createElement('div');
    item.className = 'user-item';
    
    const avatarHtml = user.pfp 
      ? `<img src="${user.pfp}" alt="${user.name}">` 
      : `<span class="user-item-avatar">${user.avatar}</span>`;
    
    item.innerHTML = `
      ${avatarHtml}
      <div class="user-item-info">
        <p class="user-item-name">${user.name} ${user.id === currentUser ? '(Current)' : ''}</p>
        <p class="user-item-stats">Click to switch</p>
      </div>
    `;
    
    item.onclick = () => {
      if (user.id !== currentUser) {
        currentUser = user.id;
        localStorage.setItem('currentUser', JSON.stringify(currentUser));
        watchlist = JSON.parse(localStorage.getItem(`watchlist_${user.id}`)) || [];
        updateProfileUI();
        displayWatchlist();
      }
      switchModal.classList.remove('show');
    };
    
    userList.appendChild(item);
  });
}

function showDiscoverModal() {
  discoverList.innerHTML = '';
  
  const publicUsers = users.filter(u => u.visibility === 'public' && u.id !== currentUser);
  
  if (publicUsers.length === 0) {
    discoverList.innerHTML = '<p style="text-align:center;color:var(--text-secondary);">No public profiles found.</p>';
  }
  
  publicUsers.forEach(user => {
    const item = document.createElement('div');
    item.className = 'user-item';
    
    const avatarHtml = user.pfp 
      ? `<img src="${user.pfp}" alt="${user.name}">` 
      : `<span class="user-item-avatar">${user.avatar}</span>`;
    
    const userWatchlist = JSON.parse(localStorage.getItem(`watchlist_${user.id}`)) || [];
    
    item.innerHTML = `
      ${avatarHtml}
      <div class="user-item-info">
        <p class="user-item-name">${user.name}</p>
        <p class="user-item-stats">${userWatchlist.length} movies in watchlist</p>
      </div>
      <span class="user-item-badge badge-public">Public</span>
    `;
    
    item.onclick = () => viewUserProfile(user.id);
    discoverList.appendChild(item);
  });
  
  discoverModal.classList.add('show');
}

function viewUserProfile(userId) {
  const user = users.find(u => u.id === userId);
  if (!user) return;
  
  const userWatchlist = JSON.parse(localStorage.getItem(`watchlist_${userId}`)) || [];
  
  viewUserName.textContent = `${user.name}'s Watchlist`;
  viewUserWatchlist.innerHTML = '';
  
  if (userWatchlist.length === 0) {
    viewUserWatchlist.innerHTML = '<p style="text-align:center;color:var(--text-secondary);grid-column:1/-1;">This user has no movies yet.</p>';
  }
  
  userWatchlist.forEach(movie => {
    const card = document.createElement('div');
    card.className = 'movie-card';
    
    const statusBadge = movie.status === 'finished' 
      ? '<span class="movie-status status-finished">Finished</span>' 
      : '<span class="movie-status status-unfinished">Unfinished</span>';
    
    card.innerHTML = `
      <img src="${movie.poster}" alt="${movie.title}">
      <div class="movie-card-body">
        <h3>${movie.title}</h3>
        <p>${movie.year}</p>
        ${statusBadge}
        ${movie.rating > 0 ? `<p>Rating: ${'★'.repeat(movie.rating)}</p>` : ''}
      </div>
    `;
    
    viewUserWatchlist.appendChild(card);
  });
  
  discoverModal.classList.remove('show');
  viewUserModal.classList.add('show');
}

// Watchlist Functions
function addToWatchlist(imdbID) {
  fetch(`${API_URL}?apikey=${API_KEY}&i=${imdbID}&plot=short`)
    .then(response => response.json())
    .then(movie => {
      const movieData = {
        id: movie.imdbID,
        title: movie.Title,
        year: movie.Year,
        poster: movie.Poster !== 'N/A' ? movie.Poster : 'https://via.placeholder.com/180x250?text=No+Poster',
        genre: movie.Genre,
        rating: 0,
        status: 'unfinished',
        addedAt: Date.now()
      };
      
      if (watchlist.some(m => m.id === movieData.id)) {
        alert('This movie is already in your watchlist!');
        return;
      }
      
      watchlist.push(movieData);
      saveWatchlist();
      displayWatchlist();
      updateProfileUI();
      
      const searchResults = document.getElementById('searchResults');
      searchResults.innerHTML = '<p style="text-align:center;color:var(--text-secondary);">Added to watchlist! ✓</p>';
    })
    .catch(error => console.error('Add error:', error));
}

function removeFromWatchlist(id) {
  watchlist = watchlist.filter(movie => movie.id !== id);
  saveWatchlist();
  displayWatchlist();
  updateProfileUI();
}

function updateRating(id, rating) {
  const movie = watchlist.find(m => m.id === id);
  if (movie) {
    movie.rating = parseInt(rating);
    saveWatchlist();
  }
}

function toggleStatus(id) {
  const movie = watchlist.find(m => m.id === id);
  if (movie) {
    movie.status = movie.status === 'finished' ? 'unfinished' : 'finished';
    saveWatchlist();
    displayWatchlist();
  }
}

function setStatusFilter(status) {
  statusFilter = status;
  
  document.querySelectorAll('.status-tab').forEach(tab => {
    tab.classList.remove('active');
    if (tab.dataset.status === status) {
      tab.classList.add('active');
    }
  });
  
  displayWatchlist();
}

function saveWatchlist() {
  localStorage.setItem('watchlist', JSON.stringify(watchlist));
  localStorage.setItem(`watchlist_${currentUser}`, JSON.stringify(watchlist));
}

function displayWatchlist() {
  watchlistContainer.innerHTML = '';
  
  let filteredWatchlist = [...watchlist];
  
  if (statusFilter === 'finished') {
    filteredWatchlist = filteredWatchlist.filter(m => m.status === 'finished');
  } else if (statusFilter === 'unfinished') {
    filteredWatchlist = filteredWatchlist.filter(m => m.status === 'unfinished');
  }
  
  countBadge.textContent = `${filteredWatchlist.length} movie${filteredWatchlist.length !== 1 ? 's' : ''}`;
  
  if (filteredWatchlist.length === 0) {
    watchlistContainer.innerHTML = `
      <div class="empty-state">
        <p style="font-size:18px;font-weight:600;">No movies here</p>
        <p>${statusFilter === 'all' ? 'Search for movies above and add them here.' : 'No ' + statusFilter + ' movies.'}</p>
      </div>
    `;
    return;
  }
  
  const sortBy = sortSelect.value;
  
  if (sortBy === 'title') {
    filteredWatchlist.sort((a, b) => a.title.localeCompare(b.title));
  } else if (sortBy === 'oldest') {
    filteredWatchlist.sort((a, b) => a.addedAt - b.addedAt);
  } else if (sortBy === 'rating') {
    filteredWatchlist.sort((a, b) => b.rating - a.rating);
  } else {
    filteredWatchlist.sort((a, b) => b.addedAt - a.addedAt);
  }
  
  filteredWatchlist.forEach(movie => {
    const card = document.createElement('div');
    card.className = 'movie-card';
    
    const statusBadge = movie.status === 'finished' 
      ? '<span class="movie-status status-finished">Finished</span>' 
      : '<span class="movie-status status-unfinished">Unfinished</span>';
    
    const statusBtnText = movie.status === 'finished' ? 'Mark Unfinished' : 'Mark Finished';
    
    card.innerHTML = `
      <img src="${movie.poster}" alt="${movie.title}">
      <div class="movie-card-body">
        <h3>${movie.title}</h3>
        <p>${movie.year}${movie.genre ? ' • ' + movie.genre.split(',')[0] : ''}</p>
        ${statusBadge}
        <select class="rating-select" onchange="updateRating('${movie.id}', this.value)">
          <option value="0" ${movie.rating === 0 ? 'selected' : ''}>Unrated</option>
          <option value="1" ${movie.rating === 1 ? 'selected' : ''}>★ 1</option>
          <option value="2" ${movie.rating === 2 ? 'selected' : ''}>★ 2</option>
          <option value="3" ${movie.rating === 3 ? 'selected' : ''}>★ 3</option>
          <option value="4" ${movie.rating === 4 ? 'selected' : ''}>★ 4</option>
          <option value="5" ${movie.rating === 5 ? 'selected' : ''}>★ 5</option>
        </select>
        <button class="status-toggle-btn" onclick="toggleStatus('${movie.id}')">${statusBtnText}</button>
        <button class="remove-btn" onclick="removeFromWatchlist('${movie.id}')">Remove</button>
      </div>
    `;
    
    watchlistContainer.appendChild(card);
  });
}