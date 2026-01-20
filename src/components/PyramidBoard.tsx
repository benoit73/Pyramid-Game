import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useGameStore } from '../store/gameStore';
import { borderRadius, colors, spacing } from '../theme/theme';
import { CardComponent } from './CardComponent';

export const PyramidBoard = () => {
    const pyramid = useGameStore(state => state.pyramid);
    const revealPyramidCard = useGameStore(state => state.revealPyramidCard);
    const players = useGameStore(state => state.players);
    const localPlayerId = useGameStore(state => state.localPlayerId);
    const currentPhase = useGameStore(state => state.currentPhase);

    const isHost = localPlayerId ? players[localPlayerId]?.isHost : false;

    // Check if there are unrevealed cards
    const hasUnrevealedCards = pyramid.some(card => card.hidden);

    // Pyramid structure: 15 cards.
    // Row 5: Indices 0,1,2,3,4
    // Row 4: Indices 5,6,7,8
    // Row 3: Indices 9,10,11
    // Row 2: Indices 12,13
    // Row 1: Index 14

    const rows = [
        pyramid.slice(0, 5),
        pyramid.slice(5, 9),
        pyramid.slice(9, 12),
        pyramid.slice(12, 14),
        pyramid.slice(14, 15),
    ].reverse(); // Render top to bottom (Row 1 at top) ? 
    // Usually Pyramid is Base at Bottom.
    // If we want Base at Bottom, we render Row 1 (Index 14) at top, Row 5 at bottom.
    // Yes.

    return (
        <ScrollView contentContainerStyle={styles.container}>
            <View style={styles.board}>
                {rows.map((row, rowIndex) => (
                    <View key={rowIndex} style={styles.row}>
                        {row.map(card => (
                            <CardComponent key={card.id} card={card} size="medium" />
                        ))}
                    </View>
                ))}
            </View>

            {/* Show Reveal Button when in PHASE_2_PYRAMID and there are unrevealed cards */}
            {currentPhase === 'PHASE_2_PYRAMID' && hasUnrevealedCards && isHost && (
                <TouchableOpacity
                    style={styles.revealBtn}
                    onPress={revealPyramidCard}
                >
                    <Text style={styles.revealText}>REVEAL NEXT CARD</Text>
                </TouchableOpacity>
            )}
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        padding: spacing.m,
        alignItems: 'center',
    },
    board: {
        marginBottom: spacing.l,
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginVertical: spacing.xs,
    },
    revealBtn: {
        backgroundColor: colors.accent,
        paddingHorizontal: spacing.xl,
        paddingVertical: spacing.m,
        borderRadius: borderRadius.l,
        marginTop: spacing.m,
    },
    revealText: {
        color: colors.text,
        fontWeight: 'bold',
        fontSize: 18,
    }
});
