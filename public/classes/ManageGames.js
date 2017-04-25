/**
 * Created by debovequentin on 01/04/2017.
 */
"use strict";
const Game_1 = require("./Game");
const Player_1 = require("./Player");
class ManageGames {
    constructor(allGames = new Array(), players = new Array()) {
        this.allGames = allGames;
        this.players = players;
    }
    startNewGame(gameNumber, quantityOfCard, fullDeck) {
        this.allGames.push(new Game_1.Game(this.players[0], this.players[1], gameNumber, quantityOfCard, fullDeck));
        this.players = [];
    }
    getGameByID(id) {
        return this.allGames[id];
    }
    getNumberOfGames() {
        return this.allGames.length;
    }
    createPlayer(nickName, id) {
        this.players.push(new Player_1.Player(nickName, id));
    }
    canStartNewGame() {
        return this.players.length == 2;
    }
    verifyAvailabilityNickname(nickname) {
        return this.players.length == 0 || this.players[0].getName() != nickname;
    }
    getStatusOfCurrentGame() {
        return this.players.length;
    }
    resetPlayer() {
        this.players = [];
    }
}
exports.ManageGames = ManageGames;
//# sourceMappingURL=ManageGames.js.map