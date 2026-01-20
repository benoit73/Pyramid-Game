import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { colors, spacing, typography, borderRadius } from '../theme/theme';
import { useNavigation } from '@react-navigation/native';
import { createRoom, joinRoom } from '../services/firebase';
import { useGameStore } from '../store/gameStore';

export const HomeScreen = () => {
    const navigation = useNavigation<any>();
    const [name, setName] = useState('');
    const [roomCode, setRoomCode] = useState('');
    const setLocalPlayerId = useGameStore(state => state.setLocalPlayerId);
    const setRoomId = useGameStore(state => state.setRoomId);

    const generatePlayerId = () => `${name}-${Date.now().toString().slice(-4)}`;

    const handleCreateRoom = async () => {
        if (!name) return Alert.alert('Enter Name', 'Please enter your name first.');

        const newRoomCode = Math.random().toString(36).substring(2, 6).toUpperCase();
        const playerId = generatePlayerId();

        const player = {
            id: playerId,
            name,
            cards: [],
            sipsGiven: 0,
            sipsTaken: 0,
            isHost: true,
            isConnected: true,
        };

        const initialState = {
            roomId: newRoomCode,
            players: { [playerId]: player },
            currentPhase: 'LOBBY',
            deck: [],
            pyramid: [],
            currentTurnPlayerId: null,
            activeCard: null,
            currentQuestionIndex: 0,
            currentPyramidRow: 5,
            revealedPyramidCards: [],
        };

        try {
            await createRoom(newRoomCode, initialState);
            setLocalPlayerId(playerId);
            setRoomId(newRoomCode);
            navigation.navigate('Lobby');
        } catch (e) {
            Alert.alert('Error', 'Could not create room.');
            console.error(e);
        }
    };

    const handleJoinRoom = async () => {
        if (!name) return Alert.alert('Enter Name', 'Please enter your name first.');
        if (!roomCode) return Alert.alert('Enter Code', 'Please enter a room code.');

        const playerId = generatePlayerId();
        const player = {
            id: playerId,
            name,
            cards: [],
            sipsGiven: 0,
            sipsTaken: 0,
            isHost: false,
            isConnected: true,
        };

        try {
            await joinRoom(roomCode.toUpperCase(), player);
            setLocalPlayerId(playerId);
            setRoomId(roomCode.toUpperCase());
            navigation.navigate('Lobby');
        } catch (e) {
            Alert.alert('Error', 'Could not join room. Check code.');
            console.error(e);
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>PYRAMID</Text>

            <View style={styles.inputContainer}>
                <Text style={styles.label}>Your Name</Text>
                <TextInput
                    style={styles.input}
                    value={name}
                    onChangeText={setName}
                    placeholder="Enter name"
                    placeholderTextColor={colors.textSecondary}
                />
            </View>

            <TouchableOpacity style={styles.buttonPrimary} onPress={handleCreateRoom}>
                <Text style={styles.buttonText}>CREATE ROOM</Text>
            </TouchableOpacity>

            <View style={styles.divider}>
                <Text style={styles.dividerText}>OR</Text>
            </View>

            <View style={styles.inputContainer}>
                <Text style={styles.label}>Room Code</Text>
                <TextInput
                    style={styles.input}
                    value={roomCode}
                    onChangeText={setRoomCode}
                    placeholder="ABCD"
                    placeholderTextColor={colors.textSecondary}
                    autoCapitalize="characters"
                />
            </View>

            <TouchableOpacity style={styles.buttonSecondary} onPress={handleJoinRoom}>
                <Text style={styles.buttonText}>JOIN ROOM</Text>
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
        padding: spacing.l,
        justifyContent: 'center',
    },
    title: {
        ...typography.h1,
        color: colors.primary,
        textAlign: 'center',
        marginBottom: spacing.xxl,
        letterSpacing: 4,
    },
    inputContainer: {
        marginBottom: spacing.m,
    },
    label: {
        color: colors.textSecondary,
        marginBottom: spacing.xs,
    },
    input: {
        backgroundColor: colors.surface,
        color: colors.text,
        padding: spacing.m,
        borderRadius: borderRadius.m,
        fontSize: 18,
    },
    buttonPrimary: {
        backgroundColor: colors.primary,
        padding: spacing.m,
        borderRadius: borderRadius.m,
        alignItems: 'center',
        marginTop: spacing.s,
    },
    buttonSecondary: {
        backgroundColor: colors.secondary,
        padding: spacing.m,
        borderRadius: borderRadius.m,
        alignItems: 'center',
        marginTop: spacing.s,
    },
    buttonText: {
        color: colors.text,
        fontWeight: 'bold',
        fontSize: 16,
    },
    divider: {
        marginVertical: spacing.l,
        alignItems: 'center',
    },
    dividerText: {
        color: colors.textSecondary,
    },
});
