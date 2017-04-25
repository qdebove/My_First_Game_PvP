/**
 * Created by debovequentin on 01/04/2017.
 */


import {Game} from "./Game";
import {Player} from "./Player";

export class ManageGames {

    constructor(
        private allGames = new Array<Game>(),
        private players = new Array<Player>()
    ){}

    public startNewGame (gameNumber: number, quantityOfCard: number,
        fullDeck: Array<
            {value: number, bonus: number,
            points: number, image: String,
            suit: String, weak: String,
            power: String}
            >):void {

            this.allGames.push(new Game(this.players[0], this.players[1], gameNumber, quantityOfCard, fullDeck));
            this.players = [];
    }

    public getGameByID(id: number) : Game {
        return this.allGames[id];
    }

    public getNumberOfGames(): number {
        return this.allGames.length;
    }

    public createPlayer(nickName: String, id: String): void {
        this.players.push(new Player(nickName, id));
    }

    public canStartNewGame(): boolean {
        return this.players.length == 2;
    }

    public verifyAvailabilityNickname(nickname: String): boolean {
        return this.players.length == 0 || this.players[0].getName() != nickname;
    }

    public getStatusOfCurrentGame(): number {
            return this.players.length;
    }

    public resetPlayer(): void {
        this.players = [];
    }
}
