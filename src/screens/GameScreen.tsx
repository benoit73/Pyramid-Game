import React, { useEffect } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { HandComponent } from '../components/HandComponent';
import { Phase1QuestionBoard } from '../components/Phase1QuestionBoard';
import { Phase2Controller } from '../components/Phase2Controller';
import { PyramidBoard } from '../components/PyramidBoard';
import { useGameSync } from '../hooks/useGameSync';
import { useGameStore } from '../store/gameStore';
import { borderRadius, colors, spacing, typography } from '../theme/theme';

export const GameScreen = () => {
    const roomId = useGameStore(state => state.roomId);
    const currentPhase = useGameStore(state => state.currentPhase);
    const players = useGameStore(state => state.players);
    const currentTurnPlayerId = useGameStore(state => state.currentTurnPlayerId);
    const localPlayerId = useGameStore(state => state.localPlayerId);
    const lastEvent = useGameStore(state => state.lastEvent);

    useGameSync(roomId);

    const currentPlayer = currentTurnPlayerId ? players[currentTurnPlayerId] : null;
    const isMyTurn = localPlayerId === currentTurnPlayerId;
    const localPlayer = localPlayerId ? players[localPlayerId] : null;

    useEffect(() => {
        if (lastEvent) {
            console.log("EVENT MSG:", lastEvent.message);
        }
    }, [lastEvent?.id]);

    return (
        <ScrollView
            style={styles.container}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
        >
            <View style={styles.header}>
                <Text style={styles.phaseTitle}>
                    {currentPhase === 'PHASE_2_PYRAMID' ? 'PHASE 2: THE PYRAMID' : 'PHASE 1: DISTRIBUTION'}
                </Text>
            </View>

            <View style={styles.mainContent}>
                {lastEvent && (
                    <View style={styles.eventBox}>
                        <Text style={styles.eventText}>{lastEvent.message}</Text>
                    </View>
                )}

                {currentPlayer && (
                    <Text style={styles.turnText}>Turn: {currentPlayer.name}</Text>
                )}

                {isMyTurn ? (
                    <Phase1QuestionBoard />
                ) : (
                    currentPhase === 'PHASE_1_DISTRIBUTION' && (
                        <Text style={styles.waiting}>Waiting for {currentPlayer?.name}...</Text>
                    )
                )}

                {currentPhase.startsWith('PHASE_2') && (
                    <>
                        <PyramidBoard />
                        <Phase2Controller />
                    </>
                )}
            </View>

            {/* Display Local Player's Hand inline with the content */}
            {localPlayer && (
                <View style={styles.footer}>
                    <HandComponent
                        cards={localPlayer.cards || []}
                        playerName="Your"
                        faceDown={currentPhase.startsWith('PHASE_2')}
                    />
                </View>
            )}
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    scrollContent: {
        paddingTop: spacing.xl,
        paddingBottom: spacing.xxl,
    },
    header: {
        alignItems: 'center',
        marginBottom: spacing.l,
    },
    phaseTitle: {
        ...typography.h1,
        color: colors.primary,
    },
    mainContent: {
        alignItems: 'center',
        paddingHorizontal: spacing.m,
        marginBottom: spacing.xl,
    },
    turnText: {
        ...typography.h2,
        color: colors.text,
        marginBottom: spacing.m,
    },
    waiting: {
        color: colors.textSecondary,
        fontStyle: 'italic',
        marginTop: spacing.xl,
        fontSize: 18,
    },
    eventBox: {
        marginTop: spacing.m,
        marginBottom: spacing.m,
        padding: spacing.m,
        backgroundColor: colors.surface,
        borderRadius: borderRadius.m,
        borderWidth: 1,
        borderColor: colors.accent,
    },
    eventText: {
        color: colors.text,
        fontWeight: 'bold',
    },
    footer: {
        paddingTop: spacing.l,
        paddingHorizontal: spacing.m,
        borderTopWidth: 1,
        borderTopColor: colors.surface,
    }
});
