import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, spacing, borderRadius } from '../theme/theme';
import { Card } from '../models/Card';

interface Props {
    card: Card;
    size?: 'small' | 'medium' | 'large';
}

export const CardComponent = ({ card, size = 'medium' }: Props) => {
    if (card.hidden) {
        return (
            <View style={[styles.card, styles[size], styles.cardBack]}>
                <View style={styles.pattern} />
            </View>
        );
    }

    const isRed = card.suit === 'hearts' || card.suit === 'diamonds';
    const suitSymbol = {
        hearts: '♥',
        diamonds: '♦',
        clubs: '♣',
        spades: '♠',
    }[card.suit];

    return (
        <View style={[styles.card, styles[size], styles.cardFront]}>
            <Text style={[styles.rank, { color: isRed ? colors.primary : colors.text }]}>
                {card.rank}
            </Text>
            <Text style={[styles.suit, { color: isRed ? colors.primary : colors.text }]}>
                {suitSymbol}
            </Text>
        </View>
    );
};

const styles = StyleSheet.create({
    card: {
        borderRadius: borderRadius.m,
        justifyContent: 'center',
        alignItems: 'center',
        margin: spacing.xs,
        borderWidth: 1,
        borderColor: '#333',
    },
    cardBack: {
        backgroundColor: colors.cardBack,
    },
    cardFront: {
        backgroundColor: '#FFF',
    },
    pattern: {
        width: '60%',
        height: '60%',
        backgroundColor: 'rgba(0,0,0,0.1)',
        borderRadius: borderRadius.s,
    },
    small: { width: 40, height: 60 },
    medium: { width: 60, height: 90 },
    large: { width: 100, height: 150 },
    rank: {
        fontWeight: 'bold',
        fontSize: 18,
    },
    suit: {
        fontSize: 24,
    }
});
