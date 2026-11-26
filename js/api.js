const apiBaseUrl = 'https://pokeapi.co/api/v2';


let pokemonCache = [];
let pokemonListCache = [];
let evolutionCache = [];
let pokemonNameList = null;
let pokemonNameRequest = null;

async function getJson(url) {
    const response = await fetch(url);

    if (!response.ok) {
        const error = new Error('Pokémon data could not be loaded.');
        error.status = response.status;
        throw error;
    }

    return response.json();
}

async function getPokemonList(offset, limit) {
    const cacheKey = offset + '-' + limit;

    for (let i = 0; i < pokemonListCache.length; i++) {
        if (pokemonListCache[i].key === cacheKey) {
            return pokemonListCache[i].data;
        }
    }

    const url = apiBaseUrl + '/pokemon?offset=' + offset + '&limit=' + limit;
    const pokemonList = await getJson(url);

    pokemonListCache.push({
        key: cacheKey,
        data: pokemonList
    });

    return pokemonList;
}

async function getPokemonNames() {
    if (pokemonNameList) {
        return pokemonNameList;
    }

    if (!pokemonNameRequest) {
        pokemonNameRequest = loadAllPokemonNames();
    }

    try {
        pokemonNameList = await pokemonNameRequest;
        return pokemonNameList;
    } catch (error) {
        pokemonNameRequest = null;
        throw error;
    }
}

async function loadAllPokemonNames() {
    const pokemonList = await getPokemonList(0, 2000);
    const names = [];

    for (let i = 0; i < pokemonList.results.length; i++) {
        names.push(pokemonList.results[i].name);
    }

    return names;
}

async function getPokemon(value) {
    let pokemonNameOrId = String(value).trim().toLowerCase();

    if (!isNaN(pokemonNameOrId) && pokemonNameOrId !== '') {
        pokemonNameOrId = String(Number(pokemonNameOrId));
    }

    for (let i = 0; i < pokemonCache.length; i++) {
        const savedPokemon = pokemonCache[i];
        const sameName = savedPokemon.name === pokemonNameOrId;
        const sameId = String(savedPokemon.id) === pokemonNameOrId;

        if (sameName || sameId) {
            return savedPokemon.data;
        }
    }

    const url = apiBaseUrl + '/pokemon/' + encodeURIComponent(pokemonNameOrId);
    const cacheEntry = {
        name: pokemonNameOrId,
        id: '',
        data: getJson(url)
    };

    pokemonCache.push(cacheEntry);

    try {
        const pokemon = await cacheEntry.data;
        cacheEntry.name = pokemon.name;
        cacheEntry.id = pokemon.id;
        cacheEntry.data = pokemon;
        return pokemon;
    } catch (error) {
        for (let i = 0; i < pokemonCache.length; i++) {
            if (pokemonCache[i] === cacheEntry) {
                pokemonCache.splice(i, 1);
                break;
            }
        }

        throw error;
    }
}

async function getEvolutionChain(pokemon) {
    for (let i = 0; i < evolutionCache.length; i++) {
        if (evolutionCache[i].id === pokemon.id) {
            return evolutionCache[i].pokemon;
        }
    }

    const species = await getJson(pokemon.species.url);
    const chainData = await getJson(species.evolution_chain.url);
    const names = [];
    const pokemonToCheck = [chainData.chain];
    let pokemonNumber = 0;

    while (pokemonNumber < pokemonToCheck.length) {
        const currentPokemon = pokemonToCheck[pokemonNumber];
        names.push(currentPokemon.species.name);

        for (let i = 0; i < currentPokemon.evolves_to.length; i++) {
            pokemonToCheck.push(currentPokemon.evolves_to[i]);
        }

        pokemonNumber++;
    }

    const evolutionRequests = [];
    for (let i = 0; i < names.length; i++) {
        evolutionRequests.push(getPokemon(names[i]));
    }

    const evolutions = await Promise.all(evolutionRequests);
    evolutionCache.push({
        id: pokemon.id,
        pokemon: evolutions
    });

    return evolutions;
}
