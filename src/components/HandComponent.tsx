import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { Card } from '../models/Card';
import { borderRadius, colors, spacing, typography } from '../theme/theme';

interface HandComponentProps {
    cards: Card[];
    playerName?: string;
    faceDown?: boolean;
}

export const HandComponent: React.FC<HandComponentProps> = ({ cards, playerName, faceDown = false }) => {
    if (!cards || cards.length === 0) {
        return (
            <View style={styles.container}>
                <Text style={styles.emptyText}>No cards yet</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            {playerName && <Text style={styles.label}>{playerName}'s Hand:</Text>}
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
                {cards.map((card, index) => (
                    <View key={`${card.id}-${index}`} style={[styles.card, faceDown && styles.cardBack]}>
                        {!faceDown ? (
                            <>
                                <Text style={[styles.cardText, { color: (card.suit === 'hearts' || card.suit === 'diamonds') ? colors.error : colors.text }]}>
                                    {card.rank}
                                </Text>
                                <Text style={[styles.suitText, { color: (card.suit === 'hearts' || card.suit === 'diamonds') ? colors.error : colors.text }]}>
                                    {getSuitIcon(card.suit)}
                                </Text>
                            </>
                        ) : (
                            <Text style={styles.cardBackText}>?</Text>
                        )}
                    </View>
                ))}
            </ScrollView>
        </View>
    );
};

const getSuitIcon = (suit: string) => {
    switch (suit) {
        case 'hearts': return '♥';
        case 'diamonds': return '♦';
        case 'clubs': return '♣';
        case 'spades': return '♠';
        default: return '';
    }
};

const styles = StyleSheet.create({
    container: {
        marginTop: spacing.m,
        padding: spacing.s,
        alignItems: 'center',
        width: '100%',
        height: 120, // Fixed height for area
    },
    label: {
        ...typography.body,
        color: colors.textSecondary,
        marginBottom: spacing.xs,
    },
    emptyText: {
        color: colors.textSecondary,
        fontStyle: 'italic',
    },
    scrollContent: {
        paddingHorizontal: spacing.s,
        alignItems: 'center',
    },
    card: {
        width: 60,
        height: 90,
        backgroundColor: colors.surface,
        borderRadius: borderRadius.m,
        justifyContent: 'center',
        alignItems: 'center',
        marginHorizontal: spacing.xs,
        borderWidth: 1,
        borderColor: colors.accent,
    },
    cardBack: {
        backgroundColor: colors.cardBack,
        borderColor: colors.primary,
    },
    cardBackText: {
        color: colors.text,
        fontSize: 24,
        fontWeight: 'bold',
    },
    cardText: {
        fontSize: 20,
        fontWeight: 'bold',
    },
    suitText: {
        fontSize: 24,
    }
});
