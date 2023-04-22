var express = require("express");
var router = express.Router();

/* GET home page. */
const pokemonApi = require("./pokemons.js");
router.use("/pokemons", pokemonApi);

module.exports = router;
