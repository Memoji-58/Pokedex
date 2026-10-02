function onloadFunc() {
fetch('https://pokeapi.co/api/v2/pokemon?limit=100&offset=0')
.then((response) => {
if(!response.ok) {
    throw new Error('Daten konnten nicht geladen werden.')
}
return response.json();
})
.then((responseAsJson) => {
    console.log(responseAsJson);
})
.catch((error) => {
console.error(error.message);
});
};