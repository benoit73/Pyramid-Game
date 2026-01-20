import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useGameStore } from '../store/gameStore';
import { borderRadius, colors, spacing, typography } from '../theme/theme';

export const Phase2Controller = () => {
    const activeCard = useGameStore(state => state.activeCard);
    const players = useGameStore(state => state.players);
    const localPlayerId = useGameStore(state => state.localPlayerId);
    const activeChallenge = useGameStore(state => state.activeChallenge);
    const pendingAllocations = useGameStore(state => state.pendingAllocations);
    const confirmedTurnPlayers = useGameStore(state => state.confirmedTurnPlayers || []);
    const pyramid = useGameStore(state => state.pyramid);
    const currentPhase = useGameStore(state => state.currentPhase);

    const allocateSips = useGameStore(state => state.allocateSips);
    const respondToAllocation = useGameStore(state => state.respondToAllocation);
    const resolveChallenge = useGameStore(state => state.resolveChallenge);
    const confirmPhase2Turn = useGameStore(state => state.confirmPhase2Turn);

    const [selectedTargetId, setSelectedTargetId] = useState<string | null>(null);
    const [sipAmount, setSipAmount] = useState<number>(1);

    if (!activeCard) return null;

    const localPlayer = localPlayerId ? players[localPlayerId] : null;

    // Check if local player has confirmed
    const hasConfirmed = confirmedTurnPlayers.includes(localPlayerId || '');

    // Get allocations made by local player
    const myOutgoingAllocations = Object.entries(pendingAllocations)
        .filter(([_, alloc]) => alloc.fromPlayerId === localPlayerId)
        .map(([id, alloc]) => ({ id, ...alloc }));

    const handleGiveSip = () => {
        if (selectedTargetId && localPlayerId && sipAmount > 0) {
            allocateSips(selectedTargetId, sipAmount);
            setSelectedTargetId(null);
            setSipAmount(1);
        }
    };

    const handleConfirm = () => {
        confirmPhase2Turn();
    };

    const myIncomingAllocations = Object.entries(pendingAllocations)
        .filter(([_, alloc]) => alloc.toPlayerId === localPlayerId)
        .map(([id, alloc]) => ({ id, ...alloc }));

    const renderAllocationUI = () => (
        <View style={styles.section}>
            <Text style={styles.sectionTitle}>GIVE SIPS</Text>
            <Text style={styles.hint}>Does anyone match {activeCard.rank}?</Text>

            {/* Display current allocations */}
            {myOutgoingAllocations.length > 0 && (
                <View style={styles.allocationsDisplay}>
                    <Text style={styles.allocationsTitle}>Your allocations:</Text>
                    {myOutgoingAllocations.map(alloc => (
                        <Text key={alloc.id} style={styles.allocationText}>
                            → {players[alloc.toPlayerId]?.name}: {alloc.amount} sip(s)
                        </Text>
                    ))}
                </View>
            )}

            {!hasConfirmed && (
                <>
                    {/* Player selection */}
                    <ScrollView horizontal style={styles.playerList}>
                        {Object.values(players)
                            .filter(p => p.id !== localPlayerId) // Don't give to self
                            .map(player => (
                                <TouchableOpacity
                                    key={player.id}
                                    style={[styles.playerBtn, selectedTargetId === player.id && styles.selectedBtn]}
                                    onPress={() => setSelectedTargetId(player.id)}
                                >
                                    <Text style={styles.playerBtnText}>{player.name}</Text>
                                </TouchableOpacity>
                            ))}
                    </ScrollView>

                    {/* Sip amount selector */}
                    {selectedTargetId && (
                        <View style={styles.sipSelector}>
                            <Text style={styles.sipSelectorLabel}>Number of sips:</Text>
                            <View style={styles.sipButtons}>
                                {[1, 2, 3, 4, 5].map(num => (
                                    <TouchableOpacity
                                        key={num}
                                        style={[styles.sipBtn, sipAmount === num && styles.sipBtnSelected]}
                                        onPress={() => setSipAmount(num)}
                                    >
                                        <Text style={[styles.sipBtnText, sipAmount === num && styles.sipBtnTextSelected]}>{num}</Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </View>
                    )}

                    {/* Give sip button */}
                    <TouchableOpacity
                        style={[styles.actionBtn, !selectedTargetId && styles.disabledBtn]}
                        onPress={handleGiveSip}
                        disabled={!selectedTargetId}
                    >
                        <Text style={styles.actionBtnText}>GIVE {sipAmount} SIP(S)</Text>
                    </TouchableOpacity>
                </>
            )}

            {/* Done/Skip button */}
            <TouchableOpacity
                style={[styles.confirmBtn, hasConfirmed && styles.disabledBtn]}
                onPress={handleConfirm}
                disabled={hasConfirmed}
            >
                <Text style={styles.confirmBtnText}>
                    {hasConfirmed ? '✓ WAITING FOR OTHERS...' : myOutgoingAllocations.length > 0 ? 'DONE' : 'SKIP (NO CARDS)'}
                </Text>
            </TouchableOpacity>
        </View>
    );

    const renderIncomingUI = () => (
        <View style={styles.section}>
            <Text style={styles.sectionTitle}>INCOMING SIPS!</Text>
            {myIncomingAllocations.length === 0 ? (
                <Text style={styles.emptyText}>You are safe... for now.</Text>
            ) : (
                myIncomingAllocations.map(alloc => (
                    <View key={alloc.id} style={styles.incomingRow}>
                        <Text style={styles.incomingText}>
                            {players[alloc.fromPlayerId]?.name} gave you {alloc.amount} sip(s)!
                        </Text>
                        <View style={styles.rowButtons}>
                            <TouchableOpacity
                                style={[styles.miniBtn, styles.drinkBtn]}
                                onPress={() => respondToAllocation(alloc.id, 'ACCEPT')}
                            >
                                <Text style={styles.miniBtnText}>DRINK</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.miniBtn, styles.challengeBtn]}
                                onPress={() => respondToAllocation(alloc.id, 'CHALLENGE')}
                            >
                                <Text style={styles.miniBtnText}>MENTEUR!</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                ))
            )}
        </View>
    );

    const renderChallengeUI = () => {
        if (!activeChallenge) return null;

        const isChallenger = activeChallenge.challengerId === localPlayerId;
        const isTarget = activeChallenge.targetId === localPlayerId; // The person being accused (Target of challenge = Giver of sip)

        return (
            <View style={styles.challengeBox}>
                <Text style={styles.challengeTitle}>CHALLENGE!</Text>
                <Text style={styles.challengeText}>
                    {players[activeChallenge.challengerId]?.name} calls MENTEUR on {players[activeChallenge.targetId]?.name}!
                </Text>

                {isTarget ? (
                    <View>
                        <Text style={styles.instruction}>Prove you have a {activeCard.rank}!</Text>
                        <TouchableOpacity
                            style={styles.revealBtn}
                            onPress={() => resolveChallenge('any-card-id')}
                        >
                            <Text style={styles.revealBtnText}>REVEAL CARDS</Text>
                        </TouchableOpacity>
                    </View>
                ) : (
                    <Text style={styles.instruction}>Waiting for resolution...</Text>
                )}
            </View>
        );
    };

    return (
        <View style={styles.container}>
            <View style={styles.activeCardContainer}>
                <Text style={styles.label}>Current Card:</Text>
                <View style={styles.cardDisplay}>
                    <Text style={[styles.cardRank, { color: (activeCard.suit === 'hearts' || activeCard.suit === 'diamonds') ? colors.error : colors.text }]}>
                        {activeCard.rank}
                    </Text>
                    <Text style={[styles.cardSuit, { color: (activeCard.suit === 'hearts' || activeCard.suit === 'diamonds') ? colors.error : colors.text }]}>
                        {getSuitIcon(activeCard.suit)}
                    </Text>
                </View>
            </View>

            {activeChallenge && renderChallengeUI()}

            {/* Show Allocation UI only in ALLOCATE phase or if waiting for others */}
            {(currentPhase === 'PHASE_2_ALLOCATE') && renderAllocationUI()}

            {/* Show Incoming UI only in RESOLVE phase */}
            {(currentPhase === 'PHASE_2_RESOLVE') && renderIncomingUI()}
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
        width: '100%',
        padding: spacing.m,
        backgroundColor: 'rgba(0,0,0,0.3)',
        borderRadius: borderRadius.l,
        marginTop: spacing.m,
    },
    activeCardContainer: {
        alignItems: 'center',
        marginBottom: spacing.l,
    },
    label: {
        color: colors.textSecondary,
        marginBottom: spacing.xs,
    },
    cardDisplay: {
        width: 80,
        height: 120,
        backgroundColor: colors.surface,
        borderRadius: borderRadius.m,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: colors.primary,
    },
    cardRank: {
        fontSize: 32,
        fontWeight: 'bold',
    },
    cardSuit: {
        fontSize: 32,
    },
    section: {
        marginBottom: spacing.l,
        width: '100%',
    },
    sectionTitle: {
        ...typography.h2,
        color: colors.text,
        marginBottom: spacing.s,
        fontSize: 18,
    },
    hint: {
        color: colors.textSecondary,
        fontStyle: 'italic',
        marginBottom: spacing.s,
    },
    playerList: {
        flexDirection: 'row',
        marginBottom: spacing.s,
    },
    playerBtn: {
        backgroundColor: colors.surface,
        padding: spacing.m,
        borderRadius: borderRadius.m,
        marginRight: spacing.s,
        borderWidth: 1,
        borderColor: colors.accent,
    },
    selectedBtn: {
        backgroundColor: colors.primary,
        borderColor: colors.text,
    },
    playerBtnText: {
        color: colors.text,
        fontWeight: 'bold',
    },
    actionRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: spacing.m,
    },
    actionBtn: {
        backgroundColor: colors.primary,
        padding: spacing.m,
        borderRadius: borderRadius.m,
        alignItems: 'center',
        flex: 1,
        marginRight: spacing.s,
    },
    confirmBtn: {
        backgroundColor: colors.success,
        padding: spacing.m,
        borderRadius: borderRadius.m,
        alignItems: 'center',
        width: '100%',
        marginTop: spacing.m,
    },
    confirmBtnText: {
        color: colors.text,
        fontWeight: 'bold',
    },
    disabledBtn: {
        backgroundColor: colors.disabled,
    },
    actionBtnText: {
        color: colors.text,
        fontWeight: 'bold',
    },
    emptyText: {
        color: colors.textSecondary,
        fontStyle: 'italic',
    },
    incomingRow: {
        backgroundColor: colors.surface,
        padding: spacing.m,
        borderRadius: borderRadius.m,
        marginBottom: spacing.s,
    },
    incomingText: {
        color: colors.text,
        marginBottom: spacing.s,
        fontWeight: 'bold',
    },
    rowButtons: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    miniBtn: {
        padding: spacing.s,
        borderRadius: borderRadius.s,
        width: '45%',
        alignItems: 'center',
    },
    drinkBtn: {
        backgroundColor: colors.secondary,
    },
    challengeBtn: {
        backgroundColor: colors.error,
    },
    miniBtnText: {
        color: colors.text,
        fontWeight: 'bold',
    },
    challengeBox: {
        backgroundColor: colors.error,
        padding: spacing.m,
        borderRadius: borderRadius.m,
        alignItems: 'center',
    },
    challengeTitle: {
        color: colors.text,
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: spacing.s,
    },
    challengeText: {
        color: colors.text,
        marginBottom: spacing.m,
        textAlign: 'center',
    },
    instruction: {
        color: colors.text,
        fontStyle: 'italic',
        marginTop: spacing.s,
        textAlign: 'center',
    },
    revealBtn: {
        backgroundColor: colors.text,
        padding: spacing.m,
        borderRadius: borderRadius.m,
        marginTop: spacing.m,
    },
    revealBtnText: {
        color: colors.error,
        fontWeight: 'bold',
    },
    allocationsDisplay: {
        backgroundColor: 'rgba(255,255,255,0.1)',
        padding: spacing.m,
        borderRadius: borderRadius.m,
        marginBottom: spacing.m,
    },
    allocationsTitle: {
        color: colors.accent,
        fontWeight: 'bold',
        marginBottom: spacing.xs,
    },
    allocationText: {
        color: colors.text,
        marginBottom: spacing.xs,
    },
    sipSelector: {
        marginVertical: spacing.m,
        alignItems: 'center',
    },
    sipSelectorLabel: {
        color: colors.text,
        fontWeight: 'bold',
        marginBottom: spacing.s,
    },
    sipButtons: {
        flexDirection: 'row',
        justifyContent: 'center',
        gap: spacing.s,
    },
    sipBtn: {
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: colors.surface,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: colors.accent,
    },
    sipBtnSelected: {
        backgroundColor: colors.primary,
        borderColor: colors.text,
    },
    sipBtnText: {
        color: colors.text,
        fontSize: 18,
        fontWeight: 'bold',
    },
    sipBtnTextSelected: {
        color: colors.text,
    }
});
