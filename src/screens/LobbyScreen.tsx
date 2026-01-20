import React, { useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import { colors, spacing, typography, borderRadius } from '../theme/theme';
import { useGameStore } from '../store/gameStore';
import { useGameSync } from '../hooks/useGameSync';
import { useNavigation } from '@react-navigation/native';

export const LobbyScreen = () => {
    const navigation = useNavigation<any>();
    const roomId = useGameStore(state => state.roomId);
    const players = useGameStore(state => state.players);
    const localPlayerId = useGameStore(state => state.localPlayerId);
    const startGame = useGameStore(state => state.startGame);
    const currentPhase = useGameStore(state => state.currentPhase);

    // Enable Sync
    useGameSync(roomId);

    const playerList = Object.values(players);
    const isHost = localPlayerId ? players[localPlayerId]?.isHost : false;

    useEffect(() => {
        if (currentPhase === 'PHASE_1_DISTRIBUTION') {
            navigation.navigate('Game');
        }
    }, [currentPhase, navigation]);

    return (
        <View style={styles.container}>
            <Text style={styles.codeLabel}>ROOM CODE</Text>
            <Text style={styles.code}>{roomId}</Text>

            <Text style={styles.sectionTitle}>PLAYERS ({playerList.length})</Text>

            <FlatList
                data={playerList}
                keyExtractor={item => item.id}
                renderItem={({ item }) => (
                    <View style={styles.playerRow}>
                        <Text style={styles.playerName}>{item.name}</Text>
                        {item.isHost && <Text style={styles.hostBadge}>HOST</Text>}
                    </View>
                )}
                contentContainerStyle={styles.list}
            />

            {isHost ? (
                <TouchableOpacity style={styles.startButton} onPress={startGame}>
                    <Text style={styles.buttonText}>START THE GAME</Text>
                </TouchableOpacity>
            ) : (
                <Text style={styles.waitingText}>Waiting for host to start...</Text>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
        padding: spacing.l,
        alignItems: 'center',
    },
    codeLabel: {
        color: colors.textSecondary,
        marginBottom: spacing.xs,
        marginTop: spacing.xl,
    },
    code: {
        ...typography.h1,
        color: colors.primary,
        fontSize: 48,
        marginBottom: spacing.xl,
    },
    sectionTitle: {
        ...typography.h2,
        color: colors.text,
        alignSelf: 'flex-start',
        marginBottom: spacing.m,
    },
    list: {
        width: '100%',
    },
    playerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.surface,
        padding: spacing.m,
        borderRadius: borderRadius.m,
        marginBottom: spacing.s,
        width: '100%',
    },
    playerName: {
        color: colors.text,
        fontSize: 18,
        flex: 1,
    },
    hostBadge: {
        color: colors.secondary, // Might need contrast check
        backgroundColor: colors.text,
        paddingHorizontal: spacing.s,
        paddingVertical: 2,
        borderRadius: borderRadius.s,
        fontWeight: 'bold',
        fontSize: 10,
    },
    startButton: {
        backgroundColor: colors.success,
        padding: spacing.m,
        borderRadius: borderRadius.m,
        width: '100%',
        alignItems: 'center',
        marginBottom: spacing.l,
    },
    buttonText: {
        color: colors.text,
        fontWeight: 'bold',
        fontSize: 18,
    },
    waitingText: {
        color: colors.textSecondary,
        marginBottom: spacing.l,
        fontStyle: 'italic',
    }
});
