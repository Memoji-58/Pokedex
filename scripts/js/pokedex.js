function onloadFunc() {
    fetch('https://pokeapi.co/api/v2/pokemon?limit=100&offset=0')
        .then((response) => {
            if (!response.ok) {
                throw new Error('Daten konnten nicht geladen werden.');
            }
            return response.json();
        })
        .then((responseAsJson) => {
            const pokeContainer = document.getElementById('poke-container');
            pokeContainer.innerHTML = '';

            const pokemons = responseAsJson.results;

            for (let i = 0; i < pokemons.length; i++) {
                const pokemon = pokemons[i];
const pokemonId = pokemon.url.split('/').filter(Boolean).pop();
                pokeContainer.innerHTML += `
                  <article class="box">
<div class="box-header">
 <p>${pokemonId}</p>  <p>${pokemon.name}</p>
</div>
<div class="box-img">
 <img src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${i + 1}.png" alt="${pokemon.name}" >
 </div>
<div class="box-footer"><p>element</p> <p>element</p></div>

</article>
                `;
            }
        })
        .catch((error) => {
            console.error(error.message);
        });
}