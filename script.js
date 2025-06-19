
const SUPABASE_URL = 'https://bkoxobkfrbwjotydwxzf.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJrb3hvYmtmcmJ3am90eWR3eHpmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTAzMTQzOTksImV4cCI6MjA2NTg5MDM5OX0.oTZliwHNoV6AufydmNU4sv1hVa3LDkCW1S5uk75iqD0';

const supabase = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

class MovieWebsite {
  constructor() {
    this.movies = [];
    this.filteredMovies = [];
    this.currentPage = 1;
    this.moviesPerPage = 20;
    this.init();
  }

  async init() {
    await this.loadMoviesFromSupabase();
    this.filteredMovies = [...this.movies];
    this.displayMovies();
    this.setupEventListeners();
  }

  async loadMoviesFromSupabase() {
    const { data, error } = await supabase.from('movies').select('*').order('date_added', { ascending: false });
    if (error) {
      console.error('Error loading movies:', error);
      return;
    }
    this.movies = data;
  }

  displayMovies() {
    const container = document.getElementById('movieGrid');
    container.innerHTML = '';
    const start = (this.currentPage - 1) * this.moviesPerPage;
    const moviesToShow = this.filteredMovies.slice(start, start + this.moviesPerPage);
    for (const movie of moviesToShow) {
      const card = document.createElement('div');
      card.className = 'movie-card';

      const img = document.createElement('img');
      img.src = movie.banner_url;
      img.alt = movie.title;

      const info = document.createElement('div');
      info.className = 'movie-info';
      info.innerHTML = `<div class="movie-title">${movie.title}</div><div class="movie-description">${movie.description}</div>`;

      card.appendChild(img);
      card.appendChild(info);
      card.addEventListener('click', () => {
        window.open(movie.download_url, '_blank');
      });

      container.appendChild(card);
    }
  }

  setupEventListeners() {
    const form = document.getElementById('adminForm');
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      await this.addMovieToSupabase();
    });
  }

  async addMovieToSupabase() {
    const title = document.getElementById('movieTitle').value.trim();
    const bannerUrl = document.getElementById('bannerUrl').value.trim();
    const downloadUrl = document.getElementById('downloadUrl').value.trim();
    const description = document.getElementById('movieDescription').value.trim();

    if (!title || !bannerUrl || !downloadUrl) {
      alert('Please fill in all required fields.');
      return;
    }

    const { error } = await supabase.from('movies').insert({
      title,
      banner_url: bannerUrl,
      download_url: downloadUrl,
      description: description || 'No description',
    });

    if (error) {
      console.error('Error adding movie:', error);
      alert('Failed to add movie');
    } else {
      alert('Movie added successfully!');
      await this.loadMoviesFromSupabase();
      this.filteredMovies = [...this.movies];
      this.displayMovies();
    }
  }
}

document.addEventListener('DOMContentLoaded', () => {
  window.movieWebsite = new MovieWebsite();
});
