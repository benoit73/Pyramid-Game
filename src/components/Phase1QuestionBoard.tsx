import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { RANKS } from '../models/Card';
import { useGameStore } from '../store/gameStore';
import { borderRadius, colors, spacing, typography } from '../theme/theme';

export const Phase1QuestionBoard = () => {
    const currentQuestionIndex = useGameStore(state => state.currentQuestionIndex);
    const activeCard = useGameStore(state => state.activeCard);
    const submitAnswer = useGameStore(state => state.submitAnswer);

    // State for Exact Card Guess
    const [selectedRank, setSelectedRank] = useState<string | null>(null);
    const [selectedSuit, setSelectedSuit] = useState<string | null>(null);

    // QUESTIONS
    const QUESTIONS = [
        "Red or Black?",
        "Higher, Lower or Equal?",
        "In or Out?",
        "Suit?",
        "Exact Card Details?"
    ];

    const handleAnswer = (ans: string) => {
        submitAnswer(ans);
    };

    const handleExactGuess = () => {
        if (selectedRank && selectedSuit) {
            // Combine rank and suit for validation logic maybe? 
            // Or just pass both as a string "RANK-SUIT" and parse in store?
            // For now, let's pass "SUIT" to keep it working with current store, 
            // OR better: pass "RANK-SUIT" and I will update store next.
            handleAnswer(`${selectedRank}-${selectedSuit}`);
        }
    };

    const renderButtons = () => {
        switch (currentQuestionIndex) {
            case 0:
                return (
                    <View style={styles.buttonRow}>
                        <TouchableOpacity style={[styles.btn, { backgroundColor: colors.primary }]} onPress={() => handleAnswer('red')}>
                            <Text style={styles.btnText}>RED</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={[styles.btn, { backgroundColor: colors.secondary }]} onPress={() => handleAnswer('black')}>
                            <Text style={styles.btnText}>BLACK</Text>
                        </TouchableOpacity>
                    </View>
                );
            case 1:
                return (
                    <View style={styles.buttonRow}>
                        <TouchableOpacity style={styles.btn} onPress={() => handleAnswer('more')}>
                            <Text style={styles.btnText}>HIGHER</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.btn} onPress={() => handleAnswer('less')}>
                            <Text style={styles.btnText}>LOWER</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.btn} onPress={() => handleAnswer('equal')}>
                            <Text style={styles.btnText}>EQUAL</Text>
                        </TouchableOpacity>
                    </View>
                );
            case 2:
                return (
                    <View style={styles.buttonRow}>
                        <TouchableOpacity style={styles.btn} onPress={() => handleAnswer('in')}>
                            <Text style={styles.btnText}>IN</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.btn} onPress={() => handleAnswer('out')}>
                            <Text style={styles.btnText}>OUT</Text>
                        </TouchableOpacity>
                    </View>
                );
            case 3:
                return (
                    <View style={styles.grid}>
                        <TouchableOpacity style={styles.btnSmall} onPress={() => handleAnswer('hearts')}><Text style={styles.btnText}>♥</Text></TouchableOpacity>
                        <TouchableOpacity style={styles.btnSmall} onPress={() => handleAnswer('diamonds')}><Text style={styles.btnText}>♦</Text></TouchableOpacity>
                        <TouchableOpacity style={styles.btnSmall} onPress={() => handleAnswer('spades')}><Text style={styles.btnText}>♠</Text></TouchableOpacity>
                        <TouchableOpacity style={styles.btnSmall} onPress={() => handleAnswer('clubs')}><Text style={styles.btnText}>♣</Text></TouchableOpacity>
                    </View>
                );
            case 4:
                return (
                    <View style={styles.exactContainer}>
                        <Text style={styles.subLabel}>Pick Rank:</Text>
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.rankScroll}>
                            {RANKS.map(rank => (
                                <TouchableOpacity
                                    key={rank}
                                    style={[styles.rankBtn, selectedRank === rank && styles.selectedBtn]}
                                    onPress={() => setSelectedRank(rank)}
                                >
                                    <Text style={[styles.rankText, selectedRank === rank && styles.selectedText]}>{rank}</Text>
                                </TouchableOpacity>
                            ))}
                        </ScrollView>

                        <Text style={styles.subLabel}>Pick Suit:</Text>
                        <View style={styles.grid}>
                            {['hearts', 'diamonds', 'spades', 'clubs'].map(suit => (
                                <TouchableOpacity
                                    key={suit}
                                    style={[styles.btnSmall, selectedSuit === suit && styles.selectedBtn]}
                                    onPress={() => setSelectedSuit(suit)}
                                >
                                    <Text style={styles.btnText}>{getSuitIcon(suit)}</Text>
                                </TouchableOpacity>
                            ))}
                        </View>

                        <TouchableOpacity
                            style={[styles.submitBtn, (!selectedRank || !selectedSuit) && styles.disabledBtn]}
                            onPress={handleExactGuess}
                            disabled={!selectedRank || !selectedSuit}
                        >
                            <Text style={styles.submitText}>GUESS EXACT</Text>
                        </TouchableOpacity>
                    </View>
                );
            default:
                return null;
        }
    };

    if (!activeCard) {
        return (
            <View style={styles.container}>
                <Text style={styles.question}>Loading next card...</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <Text style={styles.question}>{QUESTIONS[currentQuestionIndex]}</Text>
            {renderButtons()}
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
        alignItems: 'center',
        width: '100%',
        padding: spacing.m,
    },
    question: {
        ...typography.h2,
        color: colors.text,
        marginBottom: spacing.l,
        textAlign: 'center',
    },
    buttonRow: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        width: '100%',
    },
    grid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'center',
    },
    btn: {
        backgroundColor: colors.primary,
        padding: spacing.m,
        borderRadius: borderRadius.m,
        minWidth: 100,
        alignItems: 'center',
        margin: spacing.xs,
    },
    btnSmall: {
        backgroundColor: colors.surface,
        padding: spacing.l,
        borderRadius: borderRadius.m,
        margin: spacing.s,
        minWidth: 60,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: colors.accent,
    },
    btnText: {
        color: colors.text,
        fontWeight: 'bold',
        fontSize: 18,
    },
    drawBtn: {
        backgroundColor: colors.accent,
        padding: spacing.xl,
        borderRadius: borderRadius.l,
    },
    drawText: {
        color: colors.text,
        fontWeight: 'bold',
        fontSize: 24,
    },
    exactContainer: {
        width: '100%',
        alignItems: 'center',
    },
    subLabel: {
        color: colors.textSecondary,
        marginBottom: spacing.s,
        marginTop: spacing.s,
    },
    rankScroll: {
        flexGrow: 0,
        marginBottom: spacing.m,
        height: 60,
    },
    rankBtn: {
        backgroundColor: colors.surface,
        width: 50,
        height: 50,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: borderRadius.m,
        marginHorizontal: spacing.xs,
        borderWidth: 1,
        borderColor: colors.accent,
    },
    rankText: {
        color: colors.text,
        fontSize: 16,
        fontWeight: 'bold',
    },
    selectedBtn: {
        backgroundColor: colors.primary,
        borderColor: colors.primary,
    },
    selectedText: {
        color: colors.background,
    },
    submitBtn: {
        backgroundColor: colors.success,
        padding: spacing.m,
        borderRadius: borderRadius.m,
        marginTop: spacing.l,
        width: '80%',
        alignItems: 'center',
    },
    disabledBtn: {
        backgroundColor: colors.disabled,
        opacity: 0.5,
    },
    submitText: {
        color: colors.text,
        fontWeight: 'bold',
        fontSize: 18,
    }
});
