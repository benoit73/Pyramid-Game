import { Card, RANKS, SUITS, getCardValue } from '../models/Card';

export const generateDeck = (): Card[] => {
    const deck: Card[] = [];
    SUITS.forEach(suit => {
        RANKS.forEach(rank => {
            deck.push({
                id: `${rank}-${suit}-${Math.random().toString(36).substr(2, 9)}`,
                suit,
                rank,
                value: getCardValue(rank),
                hidden: true,
            });
        });
    });
    return deck;
};

export const shuffleDeck = (deck: Card[]): Card[] => {
    console.log("Shuffling deck of size:", deck.length);
    const newDeck = [...deck];
    for (let i = newDeck.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        const temp = newDeck[i];
        newDeck[i] = newDeck[j];
        newDeck[j] = temp;
    }
    console.log("First 3 cards after shuffle:", newDeck.slice(0, 3).map(c => `${c.rank}-${c.suit}`));
    console.log("Last 3 cards after shuffle:", newDeck.slice(-3).map(c => `${c.rank}-${c.suit}`));
    return newDeck;
};
