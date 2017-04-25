/**
 * Created by debovequentin on 13/02/2017.
 */

import {Card} from "./Card";

export class Player {

    constructor(
        private nickName: String,
        private id: String,
        private score: number = 0,
        private effect: number = 0,
        private futureEffect: number = 0,
        private hand: Set<Card> = new Set<Card>(),
        private cardPlayed = null,
        private effectSet = false
    ) {}

    public getName(): String {
        return this.nickName;
    }

    public getScore(): number {
        return this.score;
    }

    public getId(): String {
        return this.id;
    }

    public addPointToScore(number: number): void {
        this.score += number;
    }

    public getEffect(): number {
        return this.effect;
    }

    public setEffect(): void {
        this.effect = this.futureEffect;
    }

    public setFutureEffect(number: number): void {
        this.futureEffect = number;
    }

    public getHand(): Set<Card> {
        return this.hand;
    }

    public getHandLength(): number {
        return this.hand.size;
    }

    public getCardPlayed(): Card {
        return this.cardPlayed;
    }

    public setCardPlayed(hashCode: String): boolean {
        if(this.cardPlayed !== null) {
            return false;
        }
        for(let card of this.hand) {
            if(card.getHashCode() == hashCode) {
                this.cardPlayed = card;
                return this.hand.delete(card);
            }
        }
        return false;
    }

    public findCard(hashCode: String): Card {
        for(let card of this.hand) {
            if(card.getHashCode() == hashCode) {
                return card;
            }
        }
        return null;
    }

    public addCardsToHand(cards: Array<Card>): void {
        for(let card of cards) {
            this.hand.add(card);
        }
    }

    public canDraw(quantity = 0): boolean {
        return (this.hand.size + quantity) <= 3;
    }

    public canPlay(): boolean {
        return this.cardPlayed == null;
    }

    public resetCardPlayed(): void {
        this.cardPlayed = null;
    }

    public isEffectSet(): boolean {
        return this.effectSet;
    }

    public setEffectSet(value: boolean): void {
        this.effectSet = value;
    }

}