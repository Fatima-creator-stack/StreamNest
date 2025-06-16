class MovieWebsite {
    constructor() {
        this.movies = JSON.parse(localStorage.getItem('movies')) || [];
        this.currentPage = 1;
        this.moviesPerPage = 20;
        this.filteredMovies = [...this.movies];
        this.searchTimeout = null;

        this.init();
    }

    init() {
        this.setupEventListeners();
        this.displayMovies();
        this.setupPagination();
        this.updateAdminButton();
    }

    setupEventListeners() {
        const searchInput = document.getElementById('searchInput');
        const searchBtn = document.getElementById('searchBtn');

        searchInput.addEventListener('input', (e) => {
            clearTimeout(this.searchTimeout);
            this.searchTimeout = setTimeout(() => {
                this.searchMovies(e.target.value);
            }, 300);
        });

        searchBtn.addEventListener('click', () => {
            this.searchMovies(searchInput.value);
        });

        document.addEventListener('change', (e) => {
            if (e.target.name === 'inputMethod') {
                const urlInputs = document.getElementById('urlInputs');
                const fileInputs = document.getElementById('fileInputs');
                
                if (e.target.value === 'url') {
                    urlInputs.style.display = 'block';
                    fileInputs.style.display = 'none';
                } else {
                    urlInputs.style.display = 'none';
                    fileInputs.style.display = 'block';
                }
            }
        });

        const adminBtn = document.getElementById('adminBtn');
        const adminModal = document.getElementById('adminModal');
        const loginModal = document.getElementById('loginModal');
        const closeBtn = document.querySelector('.close');
        const loginCloseBtn = document.querySelector('.login-close');
        const adminForm = document.getElementById('adminForm');
        const loginForm = document.getElementById('loginForm');

        adminBtn.addEventListener('click', () => {
            loginModal.style.display = 'block';
        });

        closeBtn.addEventListener('click', () => {
            adminModal.style.display = 'none';
        });

        loginCloseBtn.addEventListener('click', () => {
            loginModal.style.display = 'none';
        });

        window.addEventListener('click', (e) => {
            if (e.target === adminModal) {
                adminModal.style.display = 'none';
            }
            if (e.target === loginModal) {
                loginModal.style.display = 'none';
            }
        });

        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleLogin();
        });

        adminForm.addEventListener('submit', (e) => {
            e.preventDefault();
            this.addMovie();
        });
    }

    searchMovies(query) {
        const searchTerm = query.toLowerCase().trim();

        if (searchTerm === '') {
            this.filteredMovies = [...this.movies];
        } else {
            this.filteredMovies = this.movies.filter(movie =>
                movie.title.toLowerCase().includes(searchTerm) ||
                movie.description.toLowerCase().includes(searchTerm)
            );
        }

        this.currentPage = 1;
        this.displayMovies();
        this.setupPagination();
    }

    displayMovies() {
        const movieGrid = document.getElementById('movieGrid');
        const loading = document.getElementById('loading');
        
        loading.style.display = 'block';

        setTimeout(() => {
            const startIndex = (this.currentPage - 1) * this.moviesPerPage;
            const endIndex = startIndex + this.moviesPerPage;
            const moviesToShow = this.filteredMovies.slice(startIndex, endIndex);
            
            movieGrid.innerHTML = '';

            if (moviesToShow.length === 0) {
                movieGrid.innerHTML = '<p style="grid-column: 1/-1; text-align: center; font-size: 1.2rem; color: rgba(255,255,255,0.7);">No movies found matching your search.</p>';
            } else {
                moviesToShow.forEach(movie => {
                    const movieCard = this.createMovieCard(movie);
                    movieGrid.appendChild(movieCard);
                });
            }

            loading.style.display = 'none';
        }, 300);
    }

    createMovieCard(movie) {
        const card = document.createElement('div');
        card.className = 'movie-card';
        card.setAttribute('data-movie-id', movie.id);

        card.innerHTML = `
            <img src="${movie.bannerUrl}" alt="${movie.title}" class="movie-poster" onerror="this.src='data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjQ1MCIgdmlld0JveD0iMCAwIDMwMCA0NTAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIzMDAiIGhlaWdodD0iNDUwIiBmaWxsPSIjMUExQTFBIi8+Cjx0ZXh0IHg9IjE1MCIgeT0iMjI1IiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTgiIGZpbGw9IiNGRkZGRkYiIHRleHQtYW5jaG9yPSJtaWRkbGUiPk5vIEltYWdlPC90ZXh0Pgo8L3N2Zz4K'" crossorigin="anonymous">
            <div class="movie-info">
                <div class="movie-title">${movie.title}</div>
                <div class="movie-description">${movie.description}</div>
            </div>
        `;

        card.addEventListener('click', () => {
            this.downloadMovie(movie);
        });

        return card;
    }

    addMovie() {
        const titleInput = document.getElementById('movieTitle');
        const descriptionInput = document.getElementById('movieDescription');
        const inputMethod = document.querySelector('input[name="inputMethod"]:checked').value;

        const title = titleInput.value.trim();
        const description = descriptionInput.value.trim();

        if (!title) {
            alert('Please enter a movie title.');
            return;
        }

        let bannerUrl, downloadUrl;

        if (inputMethod === 'url') {
            const bannerUrlInput = document.getElementById('bannerUrl');
            const downloadUrlInput = document.getElementById('downloadUrl');

            bannerUrl = bannerUrlInput.value.trim();
            downloadUrl = downloadUrlInput.value.trim();

            if (!bannerUrl || !downloadUrl) {
                alert('Please enter both banner URL and download URL.');
                return;
            }
        } else {
            const bannerInput = document.getElementById('movieBanner');
            const movieInput = document.getElementById('movieFile');

            if (!bannerInput.files[0] || !movieInput.files[0]) {
                alert('Please select both banner image and movie file.');
                return;
            }

            const bannerFile = bannerInput.files[0];
            const movieFile = movieInput.files[0];
            bannerUrl = URL.createObjectURL(bannerFile);
            downloadUrl = URL.createObjectURL(movieFile);
        }

        const newMovie = {
            id: Date.now(),
            title: title,
            description: description || 'No description available.',
            bannerUrl: bannerUrl,
            downloadUrl: downloadUrl,
            dateAdded: new Date().toISOString()
        };

        this.movies.unshift(newMovie);
        this.filteredMovies = [...this.movies];
        this.saveMovies();

        document.getElementById('adminForm').reset();
        document.querySelector('input[name="inputMethod"][value="url"]').checked = true;
        document.getElementById('urlInputs').style.display = 'block';
        document.getElementById('fileInputs').style.display = 'none';

        this.displayMovies();
        this.setupPagination();
        this.displayAdminMovies();

        alert('Movie added successfully!');
    }

    saveMovies() {
        localStorage.setItem('movies', JSON.stringify(this.movies));
    }
}

// Initialize the website when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.movieWebsite = new MovieWebsite();
});
