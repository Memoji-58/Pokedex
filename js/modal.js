const pokemonDialog = document.querySelector('#pokemon-dialog');
const closeDialogButton = document.querySelector('#close-dialog-button');
const previousPokemonButton = document.querySelector('#prev-button');
const nextPokemonButton = document.querySelector('#next-button');
const evolutionButton = document.querySelector('#evolution-button');
let dialogPokemonList = [];
let dialogPokemonIndex = 0;
let previouslyFocusedElement = null;

function openPokemonDialog(pokemon, pokemonList, cardButton) {
    dialogPokemonList = pokemonList;
    dialogPokemonIndex = 0;
    for (let i = 0; i < pokemonList.length; i++) {
        if (pokemonList[i].name === pokemon.name) {
            dialogPokemonIndex = i;
            break;
        }
    }
    previouslyFocusedElement = cardButton;
    renderPokemonDetails(pokemon);

    if (!pokemonDialog.open) {
        pokemonDialog.showModal();
    }

    document.body.classList.add('dialog-open');
    closeDialogButton.focus();
}

function closePokemonDialog() {
    if (pokemonDialog.open) {
        pokemonDialog.close();
    }
}

function restorePageAfterDialog() {
    document.body.classList.remove('dialog-open');
    if (previouslyFocusedElement) {
        previouslyFocusedElement.focus();
    }
}

function closeDialogFromBackdrop(event) {
    if (event.target !== pokemonDialog) {
        return;
    }

    const dialogBounds = pokemonDialog.getBoundingClientRect();
    const clickOutsideDialog = event.clientX < dialogBounds.left ||
        event.clientX > dialogBounds.right ||
        event.clientY < dialogBounds.top ||
        event.clientY > dialogBounds.bottom;

    if (clickOutsideDialog) {
        closePokemonDialog();
    }
}

function handleDialogKeyboard(event) {
    if (!pokemonDialog.open) {
        return;
    }
    if (event.key === 'Escape') {
        event.preventDefault();
        closePokemonDialog();
    }
    if (event.key === 'ArrowLeft') {
        moveToPokemon(-1);
    }
    if (event.key === 'ArrowRight') {
        moveToPokemon(1);
    }
}

function moveToPokemon(direction) {
    const nextIndex = dialogPokemonIndex + direction;
    if (nextIndex < 0 || nextIndex >= dialogPokemonList.length) {
        return;
    }

    dialogPokemonIndex = nextIndex;
    renderPokemonDetails(dialogPokemonList[dialogPokemonIndex]);
}

function renderPokemonDetails(pokemon) {
    const pokemonType = pokemon.types[0].type.name;
    const pokemonImage = pokemon.sprites.other['official-artwork'].front_default ||
        pokemon.sprites.front_default;
    const pokemonAbilities = [];

    for (let i = 0; i < pokemon.abilities.length; i++) {
        pokemonAbilities.push(
            pokemon.abilities[i].ability.name.replace(/-/g, ' ')
        );
    }

    document.querySelector('#dialog-name').textContent =
        formatPokemonName(pokemon.name);
    document.querySelector('#dialog-id').textContent =
        `#${String(pokemon.id).padStart(4, '0')}`;
    document.querySelector('#dialog-image').src = pokemonImage;
    document.querySelector('#dialog-image').alt =
        `${pokemon.name} official artwork`;
    document.querySelector('#dialog-height').textContent =
        `${pokemon.height / 10} m`;
    document.querySelector('#dialog-weight').textContent =
        `${pokemon.weight / 10} kg`;
    document.querySelector('#dialog-abilities').textContent = pokemonAbilities.join(', ');
    renderPokemonTypes(pokemon);
    renderPokemonStats(pokemon);
    resetEvolutionDisplay();
    pokemonDialog.dataset.type = pokemonType;
    previousPokemonButton.disabled = dialogPokemonIndex === 0;
    nextPokemonButton.disabled =
        dialogPokemonIndex === dialogPokemonList.length - 1;
}

function renderPokemonTypes(pokemon) {
    const typeContainer = document.querySelector('#dialog-types');
    let typeLabels = '';

    for (let i = 0; i < pokemon.types.length; i++) {
        const typeName = pokemon.types[i].type.name;
        typeLabels += `<span class="type-${typeName}">${typeName}</span>`;
    }

    typeContainer.innerHTML = typeLabels;
}

function renderPokemonStats(pokemon) {
    const statNames = {
        hp: 'HP',
        attack: 'Attack',
        defense: 'Defense',
        'special-attack': 'Special Attack',
        'special-defense': 'Special Defense',
        speed: 'Speed'
    };

    let statRows = '';

    for (let i = 0; i < pokemon.stats.length; i++) {
        const currentStat = pokemon.stats[i];
        const value = currentStat.base_stat;
        const barWidth = Math.min(100, value / 1.8);
        statRows += `<div class="stat-row"><span>${statNames[currentStat.stat.name]}</span><strong>${value}</strong><div class="stat-track"><i style="width:${barWidth}%"></i></div></div>`;
    }

    document.querySelector('#dialog-stats').innerHTML = statRows;
}

function resetEvolutionDisplay() {
    document.querySelector('#evolution-chain').replaceChildren();
    evolutionButton.textContent = 'Show Evolution Chain';
    evolutionButton.disabled = false;
}

async function showEvolutionChain() {
    const pokemon = dialogPokemonList[dialogPokemonIndex];
    const evolutionContainer = document.querySelector('#evolution-chain');
    evolutionButton.disabled = true;
    evolutionContainer.textContent = 'Loading...';

    try {
        const evolutions = await getEvolutionChain(pokemon);
        let evolutionNames = '';
        for (let i = 0; i < evolutions.length; i++) {
            if (i > 0) {
                evolutionNames += '<b>→</b>';
            }
            evolutionNames += `<span>${evolutions[i].name.replace(/-/g, ' ')}</span>`;
        }
        evolutionContainer.innerHTML = evolutionNames;
        evolutionButton.textContent = 'Evolution Chain Loaded';
    } catch (error) {
        evolutionContainer.textContent = 'Evolution data could not be loaded.';
        evolutionButton.disabled = false;
    }
}

closeDialogButton.addEventListener('click', closePokemonDialog);
previousPokemonButton.addEventListener('click', function () {
    moveToPokemon(-1);
});
nextPokemonButton.addEventListener('click', function () {
    moveToPokemon(1);
});
evolutionButton.addEventListener('click', showEvolutionChain);
pokemonDialog.addEventListener('cancel', function (event) {
    event.preventDefault();
    closePokemonDialog();
});
pokemonDialog.addEventListener('close', restorePageAfterDialog);
pokemonDialog.addEventListener('click', closeDialogFromBackdrop);
document.addEventListener('keydown', handleDialogKeyboard);
