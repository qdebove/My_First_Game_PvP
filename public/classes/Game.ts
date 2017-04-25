/**
 * Created by debovequentin on 13/02/2017.
 */

import {Player} from "./Player";
import {Deck} from "./Deck";
import {Graveyard} from "./Graveyard";
import {maleOrFemale} from "../cardDescription";



export class Game {
    private game_id: number;
    private deck: Deck;
    private graveyard: Graveyard;
    private player1: Player;
    private player2: Player;

    constructor(player1: Player, player2: Player, gameNumber: number, quantityOfCard: number,
                fullDeck: Array<{value: number, bonus: number,
                                points: number, image: String,
                                suit: String, weak: String,
                                power: String}>)
    {
        this.player1 = player1;
        this.player2 = player2;
        this.game_id = gameNumber;
        this.deck = new Deck(quantityOfCard, fullDeck);
        this.graveyard = new Graveyard();

    }

    public getPlayer1(): Player {
        return this.player1;
    }

    public getPlayer2(): Player {
        return this.player2;
    }

    public getPlayerById(id: String): Player {
        if(this.player1.getId() == id) {
            return this.player1;
        } else if(this.player2.getId() == id) {
            return this.player2;
        } else {
            return null;
        }
    }


    public getOpponent(id: String): Player {
        if(this.player1.getId() == id) {
            return this.player2;
        }
        return this.player1;
    }

    public getDeck(): Deck {
        return this.deck;
    }

    public getGraveyard(): Graveyard {
        return this.graveyard;
    }

    public isFinish(): boolean {
        return (this.deck.getRemaining() == 0 && this.player1.getHandLength() == 0 && this.player2.getHandLength() == 0);
    }

    public setGameEffects(idPlayer: String): void {
        let effects;
        let currentPlayer = this.getPlayerById(idPlayer);
        let currentOpponent = this.getOpponent(idPlayer);
        if (this.getGameOutcome(idPlayer).victory == true) {
            effects = this.effectCalc(currentPlayer.getCardPlayed().bonus, currentOpponent.getCardPlayed().bonus);
            currentPlayer.setFutureEffect(effects.winner);
            currentPlayer.addPointToScore(currentPlayer.getCardPlayed().points + currentOpponent.getCardPlayed().points);
        } else {
            if(this.getGameOutcome(idPlayer).victory != null) {
                effects = this.effectCalc(currentOpponent.getCardPlayed().bonus, currentPlayer.getCardPlayed().bonus);
                currentPlayer.setFutureEffect(effects.looser);
            } else {
                currentPlayer.setFutureEffect(0);
            }
        }
    }

    private getGameOutcome(idPlayer: String): {result, victory} {
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
        let playerCard = maleOrFemale(suitPlayer, un) + suitPlayer;
        let opponentCard = maleOrFemale(suitOpponent, un) + suitOpponent;
        let result = `<p> Vous avez joué ${playerCard}.<br>Votre adversaire a joué ${opponentCard}.</p>`;
        let winOrLoose;
        let victory;
        if (suitPlayer === suitOpponent) {
            if (totalPuissancePlayer > totalPuissanceOpponent) {
                winOrLoose = `<p>Vous avez gagné, votre ${suitPlayer} de puissance totale 
            (${totalPuissancePlayer}) a plus de puissance que votre adversaire (${totalPuissanceOpponent}).</p>`;
                victory = true;

            } else if (totalPuissancePlayer < totalPuissanceOpponent) {
                winOrLoose = `<p>Vous avez perdu, votre ${suitPlayer} de puissance totale 
            (${totalPuissancePlayer}) a moins de puissance que votre adversaire (${totalPuissanceOpponent}).</p>`;
                victory = false;

            } else if (totalPuissancePlayer === totalPuissanceOpponent) {
                winOrLoose = `<p>Vous avez fait égalité, votre ${suitPlayer} de puissance totale 
            (${totalPuissancePlayer}) a la même puissance que votre adversaire (${totalPuissanceOpponent}).</p>`;
                victory = null;
            }

        } else if (powerPlayer === suitOpponent || suitPlayer === weakOpponent) {
            winOrLoose = `<p>Vous avez gagné, votre ${suitPlayer} est fort contre ${maleOrFemale(suitOpponent, le)} ${suitOpponent}
        de votre adversaire.</p>`;
            victory = true;

        } else if (weakPlayer === suitOpponent || powerOpponent === suitPlayer) {
            winOrLoose = `<p>Vous avez perdu, votre ${suitPlayer} est faible contre ${maleOrFemale(suitOpponent, le)} ${suitOpponent} 
        de votre adversaire.</p>`;
            victory = false;

        }
        return {
            result: result + winOrLoose,
            victory: victory
        };
    }

    public getGamesInformation(playerID: String): Object {
        return {
            game_id: this.game_id,
            graveyard: this.graveyard.getCards(),
            player1: this.player1.getId() == playerID ? this.player1 : this.player2,
            player2: this.player2.getId() == playerID ? this.player1 : this.player2
        }
    }

    public nextTurn(): void {
        if(!this.isFinish()) {
            this.player1.setEffect();
            this.player2.setEffect();
            this.player1.setFutureEffect(0);
            this.player2.setFutureEffect(0);
            if(this.player1.getCardPlayed() != null && this.player2.getCardPlayed() != null) {
                this.graveyard.addCards(this.player1.getCardPlayed());
                this.graveyard.addCards(this.player2.getCardPlayed());
            }
            this.player1.resetCardPlayed();
            this.player2.resetCardPlayed();
        }
    }

    public getBattleResult(player: Player, opponent: Player): Object {
        let result = {
            result: this.getGameOutcome(player.getId()).result,
            score: {
                player: player.getScore() == 0 ? "0" : player.getScore(),
                opponent: opponent.getScore() == 0 ? "0" : opponent.getScore()
            },
            next: ""
        };
        if(this.isFinish()) {
            result.next = "Connaître le gagnant";
        } else {
            result.next = "Tour suivant";
        }
        return result;
    }

    public getWinnerOfTheGame(idPlayer: String): Object {
        if(!this.isFinish()) {
            return null
        }
        let currentPlayer = this.getPlayerById(idPlayer);
        let currentOpponent = this.getOpponent(idPlayer);
        let winOrLoose = "Vous avez : ";
        if (currentPlayer.getScore() > currentOpponent.getScore()) {
            winOrLoose += "gagné !!!";
        } else if (currentPlayer.getScore() === currentOpponent.getScore()) {
            winOrLoose += "fait égalité !!";
        } else {
            winOrLoose += "perdu !";
        }
        return {
            winOrLoose: `${winOrLoose}`,
            wannaReplay: `Voulez-vous rejouer ?`
        };
    }

    private effectCalc(bonusWinner: number, bonusLooser: number): {winner, looser} {
        let effects = {
            winner: 0,
            looser: 0
        };
        if (bonusWinner < 0 && bonusLooser >= 0) {
            effects.winner = bonusWinner;
            effects.looser = bonusLooser;
        } else if (bonusWinner < 0 && bonusLooser < 0) {
            effects.winner = bonusWinner;
            effects.looser = 0;
        } else if (bonusWinner >= 0 && bonusLooser >= 0) {
            effects.winner = 0;
            effects.looser = bonusLooser;
        } else {
            effects.winner = 0;
            effects.looser = 0;
        }
        return effects;
    }
}
