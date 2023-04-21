const express = require("express");
const router = express.Router();
const fs = require("fs");

// GET all pokemons and filter by Type or Name
const allPokemons = JSON.parse(fs.readFileSync("pokemons.json", "utf-8"));
router.get("/", (req, res, next) => {
  const allowedFilter = ["name", "type"];
  try {
    let { page, limit, ...filterQuery } = req.query;
    console.log(req.query);
    page = parseInt(page) || 1;
    limit = parseInt(limit) | 20;

    const filterKeys = Object.keys(filterQuery);
    console.log(filterQuery);
    filterKeys.forEach((key) => {
      console.log(key);
      if (!allowedFilter.includes(key)) {
        const exception = new Error(`Query ${key} is not allowed`);
        exception.statusCode = 401;
        throw exception;
      }
      if (!filterQuery[key]) delete filterQuery[key];
    });
    let offset = limit * (page - 1);
    const { data } = allPokemons;
    let result = data.slice();
    if (filterKeys.length) {
      filterKeys.forEach((condition) => {
        if (condition === "type") {
          const type = filterQuery.type;
          result = result.filter((pokemon) =>
            pokemon.types.some(
              (t) => t && t.toLowerCase() === type.toLowerCase()
            )
          );
        } else {
          result = result.filter((pokemon) => {
            const value = filterQuery[condition];
            return (
              pokemon[condition] &&
              pokemon[condition].toLowerCase() === value.toLowerCase()
            );
          });
        }
      });
    }

    result = result.slice(offset, offset + limit);
    res.status(200).send({ data: result });
  } catch (error) {
    next(error);
  }
});

// getting a single Pokémon information together with the previous and next pokemon information
router.get("/:id", (req, res, next) => {
  try {
    const pokemonId = Number(req.params.id);
    const pokemonIndex = allPokemons.data.findIndex(
      (pokemon) => pokemon.id === pokemonId
    );

    if (pokemonIndex === -1) {
      // Pokemon not found
      res.status(404).send("Pokemon not found");
      return;
    }

    const previousPokemon = allPokemons.data[pokemonIndex - 1];
    const currentPokemon = allPokemons.data[pokemonIndex];
    const nextPokemon = allPokemons.data[pokemonIndex + 1];

    const result = {
      previous: previousPokemon || null,
      current: currentPokemon,
      next: nextPokemon || null,
    };

    res.status(200).send(result);
  } catch (error) {
    next(error);
  }
});

// Create a new pokemon
router.post("/", (req, res, next) => {
  try {
    const { name, types } = req.body;
    if (!name || !types) {
      const exception = new Error("Missing required data.");
      exception.statusCode = 401;
      throw exception;
    }
    if (!Array.isArray(types)) {
      const exception = new Error("Pokémon's type is invalid.");
      exception.statusCode = 401;
      throw exception;
    }
    if (types.length > 2) {
      const exception = new Error("Pokémon can only have one or two types.");
      exception.statusCode = 401;
      throw exception;
    }
    if (allPokemons.data.some((pokemon) => pokemon.name === name)) {
      const exception = new Error("The Pokémon already exists.");
      exception.statusCode = 401;
      throw exception;
    }
    let { data } = allPokemons;
    const index = data.length;
    // console.log(index);
    const newPokemon = {
      id: index + 1,
      name,
      types,
      url: `http://localhost:8000/images/${index + 1}.png`,
    };

    data.push(newPokemon);
    allPokemons.data = data;
    let allPokemonsString = JSON.stringify(allPokemons);
    fs.writeFileSync("pokemons.json", allPokemonsString);
    res.status(200).send(newPokemon);
  } catch (err) {
    res.status(err.statusCode).send(err.message);
    next();
  }
});

module.exports = router;
