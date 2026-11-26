window.addEventListener('DOMContentLoaded', function () {
    const searchInput = document.querySelector('#search-input');
    const searchButton = document.querySelector('#search-button');
    const searchForm = document.querySelector('#search-form');
    const loadMoreButton = document.querySelector('#load-more-button');
    const pokemonListElement = document.querySelector('#pokemon-list');

    let displayedPokemon = [];
    let loadedPokemon = [];
    let nextOffset = 0;
    let isLoadingMore = false;
    let searchNumber = 0;
    let searchTimer;

    async function loadPokemon(offset) {
        const pokemonList = await getPokemonList(offset, 30);
        const requests = [];

        for (let i = 0; i < pokemonList.results.length; i++) {
            requests.push(getPokemon(pokemonList.results[i].name));
        }

        return Promise.all(requests);
    }

    function addNewPokemon(pokemonList) {
        const searchIsActive = searchInput.value.trim().length >= 3;

        for (let i = 0; i < pokemonList.length; i++) {
            let alreadyLoaded = false;

            for (let j = 0; j < loadedPokemon.length; j++) {
                if (loadedPokemon[j].name === pokemonList[i].name) {
                    alreadyLoaded = true;
                    break;
                }
            }

            if (!alreadyLoaded) {
                loadedPokemon.push(pokemonList[i]);

                if (!searchIsActive) {
                    displayedPokemon.push(pokemonList[i]);
                    renderPokemonCards([pokemonList[i]]);
                }
            }
        }
    }

    async function showFirstPokemon() {
        showLoadingMessage('Loading Pokémon...');
        loadMoreButton.disabled = true;

        try {
            loadedPokemon = await loadPokemon(0);
            displayedPokemon = loadedPokemon.slice();
            nextOffset = 30;
            replacePokemonCards(displayedPokemon);
            clearStatusMessage();
        } catch (error) {
            showLoadingMessage('Pokémon could not be loaded. Please try again.');
        }

        loadMoreButton.disabled = false;
    }

    async function loadMorePokemon() {
        if (isLoadingMore || searchInput.value.trim().length >= 3) {
            return;
        }

        isLoadingMore = true;
        setLoadMoreLoading(true);
        showLoadingMessage('Loading more Pokémon...');

        try {
            const newPokemon = await loadPokemon(nextOffset);
            addNewPokemon(newPokemon);
            nextOffset += 30;
            if (searchInput.value.trim().length < 3) {
                clearStatusMessage();
            }
        } catch (error) {
            showLoadingMessage('More Pokémon could not be loaded. Your current list is unchanged.');
        }

        isLoadingMore = false;
        setLoadMoreLoading(false);
    }

    function updateSearchButton() {
        searchButton.disabled = searchInput.value.trim().length < 3;
    }

    async function findMatchingPokemon(searchText) {
        if (/^\d+$/.test(searchText)) {
            return [await getPokemon(searchText)];
        }

        const pokemonNames = await getPokemonNames();
        const matchingNames = [];

        for (let i = 0; i < pokemonNames.length; i++) {
            if (pokemonNames[i].indexOf(searchText) === 0) {
                matchingNames.push(pokemonNames[i]);
            }
        }

        const requests = [];
        for (let i = 0; i < matchingNames.length; i++) {
            requests.push(getPokemon(matchingNames[i]));
        }

        return Promise.all(requests);
    }

    async function searchPokemon() {
        const searchText = searchInput.value.trim().toLowerCase();
        if (searchText.length < 3) {
            return;
        }

        searchNumber++;
        const currentSearch = searchNumber;
        showNotFoundMessage(false);
        showLoadingMessage('Searching Pokémon...');

        try {
            const results = await findMatchingPokemon(searchText);
            if (currentSearch !== searchNumber) {
                return;
            }

            displayedPokemon = results;
            replacePokemonCards(displayedPokemon);
            loadMoreButton.hidden = true;
            if (results.length === 0) {
                showNotFoundMessage(true);
            }
            clearStatusMessage();
        } catch (error) {
            if (currentSearch !== searchNumber) {
                return;
            }

            if (error.status === 404) {
                displayedPokemon = [];
                replacePokemonCards(displayedPokemon);
                showNotFoundMessage(true);
                loadMoreButton.hidden = true;
                clearStatusMessage();
            } else {
                showLoadingMessage('Search could not be completed. Please try again.');
                loadMoreButton.hidden = false;
            }
        }
    }

    function handleSearchInput() {
        updateSearchButton();
        clearTimeout(searchTimer);
        searchNumber++;

        if (searchInput.value.trim().length < 3) {
            displayedPokemon = loadedPokemon.slice();
            replacePokemonCards(displayedPokemon);
            showNotFoundMessage(false);
            clearStatusMessage();
            loadMoreButton.hidden = false;
            return;
        }

        loadMoreButton.hidden = true;
        showNotFoundMessage(false);
        searchTimer = setTimeout(searchPokemon, 250);
    }

    function openPokemonCard(event) {
        const cardButton = event.target.closest('[data-id="card"]');
        if (!cardButton) {
            return;
        }

        const pokemonName = cardButton.dataset.pokemonName;
        for (let i = 0; i < displayedPokemon.length; i++) {
            if (displayedPokemon[i].name === pokemonName) {
                openPokemonDialog(displayedPokemon[i], displayedPokemon, cardButton);
                return;
            }
        }
    }

    searchInput.addEventListener('input', handleSearchInput);
    searchForm.addEventListener('submit', function (event) {
        event.preventDefault();
        clearTimeout(searchTimer);
        searchPokemon();
    });
    loadMoreButton.addEventListener('click', loadMorePokemon);
    pokemonListElement.addEventListener('click', openPokemonCard);

    showFirstPokemon();
});
