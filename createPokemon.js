const fs = require("fs");
const csv = require("csvtojson");

const createPokemon = async () => {
  let newData = (await csv().fromFile("pokemon.csv")).slice(0, 721);

  let pokemons = JSON.parse(fs.readFileSync("pokemons.json"));

  newData = new Set(
    newData.map((e, index) => ({
      id: index + 1,
      name: e.Name,
      types: [e.Type1 || "", e.Type2 || null],
      url: `http://localhost:8000/images/${index + 1}.png`,
    }))
  );
  newData = Array.from(newData);
  pokemons.data = newData;
  fs.writeFileSync("pokemons.json", JSON.stringify(pokemons), "utf-8");
};

createPokemon();
