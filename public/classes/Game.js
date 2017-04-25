/**
 * Created by debovequentin on 13/02/2017.
 */
"use strict";
const Deck_1 = require("./Deck");
const Graveyard_1 = require("./Graveyard");
const cardDescription_1 = require("../cardDescription");
class Game {
    constructor(player1, player2, gameNumber, quantityOfCard, fullDeck) {
        this.player1 = player1;
        this.player2 = player2;
        this.game_id = gameNumber;
        this.deck = new Deck_1.Deck(quantityOfCard, fullDeck);
        this.graveyard = new Graveyard_1.Graveyard();
    }
    getPlayer1() {
        return this.player1;
    }
    getPlayer2() {
        return this.player2;
    }
    getPlayerById(id) {
        if (this.player1.getId() == id) {
            return this.player1;
        }
        else if (this.player2.getId() == id) {
            return this.player2;
        }
        else {
            return null;
        }
    }
    getOpponent(id) {
        if (this.player1.getId() == id) {
            return this.player2;
        }
        return this.player1;
    }
    getDeck() {
        return this.deck;
    }
    getGraveyard() {
        return this.graveyard;
    }
    isFinish() {
        return (this.deck.getRemaining() == 0 && this.player1.getHandLength() == 0 && this.player2.getHandLength() == 0);
    }
    setGameEffects(idPlayer) {
        let effects;
        let currentPlayer = this.getPlayerById(idPlayer);
        let currentOpponent = this.getOpponent(idPlayer);
        if (this.getGameOutcome(idPlayer).victory == true) {
            effects = this.effectCalc(currentPlayer.getCardPlayed().bonus, currentOpponent.getCardPlayed().bonus);
            currentPlayer.setFutureEffect(effects.winner);
            currentPlayer.addPointToScore(currentPlayer.getCardPlayed().points + currentOpponent.getCardPlayed().points);
        }
        else {
            if (this.getGameOutcome(idPlayer).victory != null) {
                effects = this.effectCalc(currentOpponent.getCardPlayed().bonus, currentPlayer.getCardPlayed().bonus);
                currentPlayer.setFutureEffect(effects.looser);
            }
            else {
                currentPlayer.setFutureEffect(0);
            }
        }
    }
    getGameOutcome(idPlayer) {
        let playerCardPlayed = this.getPlayerById(idPlayer).getCardPlayed();
        let opponentCardPlayed = this.getOpponent(idPlayer).getCardPlayed();
        let powerPlayer = playerCardPlayed.power;
        let powerOpponent = opponentCardPlayed.power;
        let pointsPlayer = playerCardPlayed.points;
        let pointsOpponent = opponentCardPlayed.points;
        let weakPlayer = playerCardPlayed.weak;
        let weakOpponent = opponentCardPlayed.weak;
        let suitPlayer = playerCardPlayed.suit;
        let suitOpponent = opponentCardPlayed.suit;
        let totalPuissancePlayer = playerCardPlayed.value + this.player1.getEffect();
        let totalPuissanceOpponent = opponentCardPlayed.value + this.player2.getEffect();
        let le = "il";
        let un = "un";
        let playerCard = cardDescription_1.maleOrFemale(suitPlayer, un) + suitPlayer;
        let opponentCard = cardDescription_1.maleOrFemale(suitOpponent, un) + suitOpponent;
        let result = `<p> Vous avez joué ${playerCard}.<br>Votre adversaire a joué ${opponentCard}.</p>`;
        let winOrLoose;
        let victory;
        if (suitPlayer === suitOpponent) {
            if (totalPuissancePlayer > totalPuissanceOpponent) {
                winOrLoose = `<p>Vous avez gagné, votre ${suitPlayer} de puissance totale 
            (${totalPuissancePlayer}) a plus de puissance que votre adversaire (${totalPuissanceOpponent}).</p>`;
                victory = true;
            }
            else if (totalPuissancePlayer < totalPuissanceOpponent) {
                winOrLoose = `<p>Vous avez perdu, votre ${suitPlayer} de puissance totale 
            (${totalPuissancePlayer}) a moins de puissance que votre adversaire (${totalPuissanceOpponent}).</p>`;
                victory = false;
            }
            else if (totalPuissancePlayer === totalPuissanceOpponent) {
                winOrLoose = `<p>Vous avez fait égalité, votre ${suitPlayer} de puissance totale 
            (${totalPuissancePlayer}) a la même puissance que votre adversaire (${totalPuissanceOpponent}).</p>`;
                victory = null;
            }
        }
        else if (powerPlayer === suitOpponent || suitPlayer === weakOpponent) {
            winOrLoose = `<p>Vous avez gagné, votre ${suitPlayer} est fort contre ${cardDescription_1.maleOrFemale(suitOpponent, le)} ${suitOpponent}
        de votre adversaire.</p>`;
            victory = true;
        }
        else if (weakPlayer === suitOpponent || powerOpponent === suitPlayer) {
            winOrLoose = `<p>Vous avez perdu, votre ${suitPlayer} est faible contre ${cardDescription_1.maleOrFemale(suitOpponent, le)} ${suitOpponent} 
        de votre adversaire.</p>`;
            victory = false;
        }
        return {
            result: result + winOrLoose,
            victory: victory
        };
    }
    getGamesInformation(playerID) {
        return {
            game_id: this.game_id,
            graveyard: this.graveyard.getCards(),
            player1: this.player1.getId() == playerID ? this.player1 : this.player2,
            player2: this.player2.getId() == playerID ? this.player1 : this.player2
        };
    }
    nextTurn() {
        if (!this.isFinish()) {
            this.player1.setEffect();
            this.player2.setEffect();
            this.player1.setFutureEffect(0);
            this.player2.setFutureEffect(0);
            if (this.player1.getCardPlayed() != null && this.player2.getCardPlayed() != null) {
                this.graveyard.addCards(this.player1.getCardPlayed());
                this.graveyard.addCards(this.player2.getCardPlayed());
            }
            this.player1.resetCardPlayed();
            this.player2.resetCardPlayed();
        }
    }
    getBattleResult(player, opponent) {
        let result = {
            result: this.getGameOutcome(player.getId()).result,
            score: {
                player: player.getScore() == 0 ? "0" : player.getScore(),
                opponent: opponent.getScore() == 0 ? "0" : opponent.getScore()
            },
            next: ""
        };
        if (this.isFinish()) {
            result.next = "Connaître le gagnant";
        }
        else {
            result.next = "Tour suivant";
        }
        return result;
    }
    getWinnerOfTheGame(idPlayer) {
        if (!this.isFinish()) {
            return null;
        }
        let currentPlayer = this.getPlayerById(idPlayer);
        let currentOpponent = this.getOpponent(idPlayer);
        let winOrLoose = "Vous avez : ";
        if (currentPlayer.getScore() > currentOpponent.getScore()) {
            winOrLoose += "gagné !!!";
        }
        else if (currentPlayer.getScore() === currentOpponent.getScore()) {
            winOrLoose += "fait égalité !!";
        }
        else {
            winOrLoose += "perdu !";
        }
        return {
            winOrLoose: `${winOrLoose}`,
            wannaReplay: `Voulez-vous rejouer ?`
        };
    }
    effectCalc(bonusWinner, bonusLooser) {
        let effects = {
            winner: 0,
            looser: 0
        };
        if (bonusWinner < 0 && bonusLooser >= 0) {
            effects.winner = bonusWinner;
            effects.looser = bonusLooser;
        }
        else if (bonusWinner < 0 && bonusLooser < 0) {
            effects.winner = bonusWinner;
            effects.looser = 0;
        }
        else if (bonusWinner >= 0 && bonusLooser >= 0) {
            effects.winner = 0;
            effects.looser = bonusLooser;
        }
        else {
            effects.winner = 0;
            effects.looser = 0;
        }
        return effects;
    }
}
exports.Game = Game;
//# sourceMappingURL=Game.js.map