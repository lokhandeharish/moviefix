let startYear = 2012;
const api_Key = "api_key=bf388abad0e6e262e3fdd564f4a91c82"
const Base_URL = 'https://api.themoviedb.org/3/discover/movie?api_key=bf388abad0e6e262e3fdd564f4a91c82&page=1&sort_by=popularity.desc'
const api = `${Base_URL}+&primary_release_year=${startYear}`;
const cre = 'https://api.themoviedb.org/3/movie/'
const movieList = document.getElementById('movie-listing');
const img_Api = 'https://image.tmdb.org/t/p/w500';

const tagsEl = document.getElementById("genres");

const modalEl = document.querySelector('.movie-details-modal')

const genresData = [{
		id: 28,
		name: "Action",
	},
	{
		id: 12,
		name: "Adventure",
	},
	{
		id: 16,
		name: "Animation",
	},
	{
		id: 35,
		name: "Comedy",
	},
	{
		id: 80,
		name: "Crime",
	},
	{
		id: 99,
		name: "Documentary",
	},
	{
		id: 18,
		name: "Drama",
	},
	{
		id: 10751,
		name: "Family",
	},
	{
		id: 14,
		name: "Fantasy",
	},
	{
		id: 36,
		name: "History",
	},
	{
		id: 27,
		name: "Horror",
	},
	{
		id: 10402,
		name: "Music",
	},
	{
		id: 9648,
		name: "Mystery",
	},
	{
		id: 10749,
		name: "Romance",
	},
	{
		id: 878,
		name: "Science Fiction",
	},
	{
		id: 10770,
		name: "TV Movie",
	},
	{
		id: 53,
		name: "Thriller",
	},
	{
		id: 10752,
		name: "War",
	},
	{
		id: 37,
		name: "Western",
	},
];

let selectedGenre = [];
setGenre();

function setGenre() {
	tagsEl.innerHTML = "";
	genresData.forEach((genre) => {
		const genreEl = document.createElement("div");
		genreEl.classList.add("genre-link");
		genreEl.id = genre.id;
		genreEl.innerText = genre.name;
		genreEl.addEventListener("click", () => {
			movieList.innerHTML = '';
			if (selectedGenre.length == 0) {
				selectedGenre.push(genre.id);
			} else {
				if (selectedGenre.includes(genre.id)) {
					selectedGenre.forEach((id, idx) => {
						if (id == genre.id) {
							selectedGenre.splice(idx, 1);
						}
					});
				} else {
					selectedGenre.push(genre.id);
				}
			}
			console.log(selectedGenre)
			$(window).unbind('scroll');
			getMovies(Base_URL + "&with_genres=" + encodeURI(selectedGenre.join(",")));
			activeSelected();
		});
		tagsEl.append(genreEl);
	});
}

function activeSelected() {
	const tags = document.querySelectorAll(".genre-link");
	tags.forEach((tag) => {
		tag.classList.remove("active");
	});
	if (selectedGenre.length != 0) {
		selectedGenre.forEach((id) => {
			const activeTag = document.getElementById(id);
			activeTag.classList.add("active");
		});
	}
}

const getMovies = async (url) => {
	const response = await fetch(url)
	const data = await response.json()
	showMovies(data.results)
}
getMovies(api)

const showMovies = (data) => {
	data.forEach(element => {
		const {
			title,
			poster_path,
			id
		} = element;
		const releaseYear = new Date(element.release_date).getFullYear();;
		const movieEl = document.createElement('div');
		movieEl.classList.add('movie-card');
		movieEl.setAttribute("id", id)
		movieEl.innerHTML = `
         <div class="movie-info">
		   <div class="release-year">${releaseYear}</div>
           <img class="movie-img" src="${poster_path? img_Api + poster_path: "http://via.placeholder.com/1080x1580"}" alt="${title}">
           <div class="movie-title">${title}</div>
         </div> `
		movieList.appendChild(movieEl);
	});

	const cards = document.querySelectorAll('.movie-card')
	add_click_effect_to_card(cards)

	function add_click_effect_to_card(cards) {
		cards.forEach(card => {
			card.addEventListener('click', () => {
				showModal(card)
			})
		})
	}

	async function get_movie_by_id(id) {
		const resp = await fetch(`https://api.themoviedb.org/3/movie/${id}?api_key=bf388abad0e6e262e3fdd564f4a91c82`)
		const respData = await resp.json()
		return respData
	}

	async function get_movie_by_credits(id) {
		const respCredits = await fetch(cre + id + "/credits?" + api_Key)
		const creditsData = await respCredits.json()
		return creditsData
	}

	async function showModal(card) {
		modalEl.innerHTML = " "
		modalEl.classList.add('modal-shown')

		const movie_id = card.getAttribute('id')
		const movie = await get_movie_by_id(movie_id)
		const movieCredits = await get_movie_by_credits(movie_id)

		modalEl.style.background = `linear-gradient(rgba(0, 0, 0, .8), rgba(0, 0, 0, 1)), url(${img_Api + movie.poster_path})`

		modalEl.innerHTML = `
            <span class="x-icon">&#10006;</span>
            <div class="poster-img">
                        <img src="${img_Api + movie.poster_path}" alt="" class="movie-details-img">
            </div>
			<div class="right">
			    <h2>${movie.title}</h2>
                <h3>${movie.tagline}</h3>
				<div class="genres">
                    <h2>Genres</h2>
                     <div class="genre-names">${movie.genres.map(e => ` ${e.name}`).join(' | ')}</div>
                </div>
                    <div class="description">
                        <h2>Overview</h2>
                        <p>${movie.overview}</p>
                  </div>
			</div>
                   
    `
		const x_icon = document.querySelector('.x-icon')
		x_icon.addEventListener('click', () => modalEl.classList.remove('modal-shown'))

		const description = document.querySelector('.description')
		const dirEl = document.createElement('div');
		dirEl.classList.add('director-name');
		const castEl = document.createElement('div');
		castEl.classList.add('cast-names');

		let datamap = movieCredits.crew.filter(e => e.job == "Director")
		datamap.forEach(e => {
			dirEl.innerHTML = `
            Directed By: ${e.name}
		`
		})
		description.prepend(dirEl)

		let castData = [];
		movieCredits.cast.forEach((e, idx) => {
			if (e.known_for_department == "Acting" && idx <= 4) {
				castData.push(e.name);
				castEl.innerHTML = `
            Cast: ${castData}
		`
			}
		})
		description.prepend(castEl)
	}
}

async function loadMore() {
	let currentDate = new Date().getFullYear();
	if (startYear < currentDate) {
		startYear++
		await getMovies(`https://api.themoviedb.org/3/discover/movie?api_key=bf388abad0e6e262e3fdd564f4a91c82&page=1&primary_release_year=${startYear}&sort_by=popularity.desc`);
		$(window).unbind('scroll');
	}
	$(window).bind('scroll', bindScroll);
}

function bindScroll() {
	var clientWidth= document.body.clientWidth;
	if(clientWidth < 1025){
		if ($(document).scrollTop() + $(document).height() > $(document).height() - 10) {
			$(window).unbind('scroll');
			setTimeout(function() {
				loadMore();
			}, 1000)
		}
   } else {
		if ($(window).scrollTop() + $(window).height() > $(document).height() - 10) {
			$(window).unbind('scroll');
				setTimeout(function() {
					loadMore();
				}, 1000)
		}
   }
}
$(window).scroll(bindScroll);
