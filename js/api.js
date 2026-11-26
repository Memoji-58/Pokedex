const apiBaseUrl = 'https://pokeapi.co/api/v2';
const pokemonCache = new Map();
const pokemonListCache = new Map();
const evolutionCache = new Map();
let pokemonNameList = null;
let pokemonNameRequest = null;

async function getJson(url) {
    const response = await fetch(url);
    if (!response.ok) {
        const error = new Error(`Unable to reach PokéAPI (${response.status})`);
        error.status = response.status;
        throw error;
    }
    return response.json();
}

async function getPokemonList(offset, limit) {
    const cacheKey = `${offset}:${limit}`;
    if (pokemonListCache.has(cacheKey)) {
        return pokemonListCache.get(cacheKey);
    }

    const url = `${apiBaseUrl}/pokemon?offset=${offset}&limit=${limit}`;
    const pokemonList = await getJson(url);
    pokemonListCache.set(cacheKey, pokemonList);
    return pokemonList;
}

async function getPokemonNames() {
    if (pokemonNameList) {
        return pokemonNameList;
    }

    if (!pokemonNameRequest) {
        pokemonNameRequest = getPokemonList(0, 2000).then(function (pokemonList) {
            pokemonNameList = pokemonList.results.map(function (pokemon) {
                return pokemon.name;
            });
            return pokemonNameList;
        }).catch(function (error) {
            pokemonNameRequest = null;
            throw error;
        });
    }

    return pokemonNameRequest;
}

async function getPokemon(value) {
    let pokemonNameOrId = String(value).trim().toLowerCase();
    if (/^\d+$/.test(pokemonNameOrId)) {
        pokemonNameOrId = String(Number(pokemonNameOrId));
    }

    if (pokemonCache.has(pokemonNameOrId)) {
        return pokemonCache.get(pokemonNameOrId);
    }

    const url = `${apiBaseUrl}/pokemon/${encodeURIComponent(pokemonNameOrId)}`;
    const request = getJson(url);
    pokemonCache.set(pokemonNameOrId, request);

    try {
        const pokemon = await request;
        pokemonCache.set(pokemon.id, pokemon);
        pokemonCache.set(pokemon.name, pokemon);
        return pokemon;
    } catch (error) {
        pokemonCache.delete(pokemonNameOrId);
        throw error;
    }
}

async function getEvolutionChain(pokemon) {
    if (evolutionCache.has(pokemon.id)) {
        return evolutionCache.get(pokemon.id);
    }

    const species = await getJson(pokemon.species.url);
    const chainData = await getJson(species.evolution_chain.url);
    const evolutionNames = [];
    let currentPokemon = chainData.chain;

    while (currentPokemon) {
        evolutionNames.push(currentPokemon.species.name);
        currentPokemon = currentPokemon.evolves_to[0];
    }

    const evolutionRequests = [];
    for (let i = 0; i < evolutionNames.length; i++) {
        evolutionRequests.push(getPokemon(evolutionNames[i]));
    }

    const evolutions = await Promise.all(evolutionRequests);
    evolutionCache.set(pokemon.id, evolutions);
    return evolutions;
}
