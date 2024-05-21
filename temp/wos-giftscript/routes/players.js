var express = require("express");
var router = express.Router();
var players = require("../controllers/players");

/* GET players listing. */
router.get("/", async (req, res, next) => {
  const allPlayers = await players.getAllPlayers();
  //res.send(allPlayers);
  res.render("players", { title: "Player list", players: allPlayers });
});

module.exports = router;
