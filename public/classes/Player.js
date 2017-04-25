/**
 * Created by debovequentin on 13/02/2017.
 */
"use strict";
class Player {
    constructor(nickName, id, score = 0, effect = 0, futureEffect = 0, hand = new Set(), cardPlayed = null, effectSet = false) {
        this.nickName = nickName;
        this.id = id;
        this.score = score;
        this.effect = effect;
        this.futureEffect = futureEffect;
        this.hand = hand;
        this.cardPlayed = cardPlayed;
        this.effectSet = effectSet;
    }
    getName() {
        return this.nickName;
    }
    getScore() {
        return this.score;
    }
    getId() {
        return this.id;
    }
    addPointToScore(number) {
        this.score += number;
    }
    getEffect() {
        return this.effect;
    }
    setEffect() {
        this.effect = this.futureEffect;
    }
    setFutureEffect(number) {
        this.futureEffect = number;
    }
    getHand() {
        return this.hand;
    }
    getHandLength() {
        return this.hand.size;
    }
    getCardPlayed() {
        return this.cardPlayed;
    }
    setCardPlayed(hashCode) {
        if (this.cardPlayed !== null) {
            return false;
        }
        for (let card of this.hand) {
            if (card.getHashCode() == hashCode) {
                this.cardPlayed = card;
                return this.hand.delete(card);
            }
        }
        return false;
    }
    findCard(hashCode) {
        for (let card of this.hand) {
            if (card.getHashCode() == hashCode) {
                return card;
            }
        }
        return null;
    }
    addCardsToHand(cards) {
        for (let card of cards) {
            this.hand.add(card);
        }
    }
    canDraw(quantity = 0) {
        return (this.hand.size + quantity) <= 3;
    }
    canPlay() {
        return this.cardPlayed == null;
    }
    resetCardPlayed() {
        this.cardPlayed = null;
    }
    isEffectSet() {
        return this.effectSet;
    }
    setEffectSet(value) {
        this.effectSet = value;
    }
}
exports.Player = Player;
//# sourceMappingURL=Player.js.map