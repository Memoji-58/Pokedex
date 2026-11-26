const pokemonListElement = document.querySelector('#pokemon-list');
const statusMessageElement = document.querySelector('#status-message');
const notFoundElement = document.querySelector('#not-found');
const loadMoreButtonElement = document.querySelector('#load-more-button');

function formatPokemonName(name) {
    return name.replace(/-/g, ' ').toUpperCase();
}

function getPokemonImage(pokemon) {
    return pokemon.sprites.other['official-artwork'].front_default ||
        pokemon.sprites.front_default ||
        'assets/images/pokemon-placeholder.svg';
}

function createPokemonCard(pokemon) {
    const pokemonType = pokemon.types[0].type.name;
    const listItem = document.createElement('li');
    let typeLabels = '';

    for (let i = 0; i < pokemon.types.length; i++) {
        typeLabels += `<span>${pokemon.types[i].type.name}</span>`;
    }

    listItem.className = 'pokemon-card-item';
    listItem.innerHTML = `<button class="pokemon-card type-${pokemonType}" data-id="card" type="button" aria-label="View ${pokemon.name} details">
        <span class="card-top"><span>#${String(pokemon.id).padStart(4, '0')}</span><span class="card-arrow">↗</span></span>
        <img data-id="card-image" src="${getPokemonImage(pokemon)}" alt="${pokemon.name}" loading="lazy">
        <span class="card-bottom"><strong>${formatPokemonName(pokemon.name)}</strong><span class="card-types">${typeLabels}</span></span>
    </button>`;
    const pokemonImage = listItem.querySelector('img');
    pokemonImage.addEventListener('error', function () {
        pokemonImage.src = 'assets/images/pokemon-placeholder.svg';
    }, { once: true });
    listItem.firstElementChild.dataset.pokemonId = pokemon.id;
    listItem.firstElementChild.dataset.pokemonName = pokemon.name;
    return listItem;
}

function renderPokemonCards(pokemonList) {
    const fragment = document.createDocumentFragment();
    for (let i = 0; i < pokemonList.length; i++) {
        fragment.appendChild(createPokemonCard(pokemonList[i]));
    }
    pokemonListElement.appendChild(fragment);
}

function replacePokemonCards(pokemonList) {
    pokemonListElement.replaceChildren();
    if (pokemonList.length) {
        renderPokemonCards(pokemonList);
    }
}

function showLoadingMessage(message) {
    statusMessageElement.textContent = message;
    statusMessageElement.classList.add('is-visible');
}

function clearStatusMessage() {
    statusMessageElement.textContent = '';
    statusMessageElement.classList.remove('is-visible');
}

function showNotFoundMessage(visible) {
    notFoundElement.hidden = !visible;
}

function setLoadMoreLoading(loading) {
    loadMoreButtonElement.disabled = loading;
    loadMoreButtonElement.classList.toggle('is-loading', loading);
    loadMoreButtonElement.querySelector('span').textContent =
        loading ? 'Loading...' : 'Load More';
}
