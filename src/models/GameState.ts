import { Card } from './Card';

export interface Player {
    id: string;
    name: string;
    cards: Card[]; // Hand
    sipsGiven: number;
    sipsTaken: number;
    isHost: boolean;
    isConnected: boolean;
}

// Phase 2 Sub-Phases
export type GamePhase =
    | 'LOBBY'
    | 'PHASE_1_DISTRIBUTION'
    | 'PHASE_2_PYRAMID' // Generic Phase 2
    // Fine-grained Phase 2 states:
    | 'PHASE_2_REVEAL'
    | 'PHASE_2_ALLOCATE'
    | 'PHASE_2_RESOLVE'
    | 'GAME_OVER';

export interface SipAllocation {
    fromPlayerId: string;
    toPlayerId: string;
    amount: number;
    usingCardId: string; // The card they claim to have
    status: 'PENDING' | 'ACCEPTED' | 'CHALLENGED';
}

export interface Challenge {
    challengerId: string; // The person saying "Menteur"
    targetId: string; // The person who gave the sip
    allocationId: string;
    status: 'ACTIVE' | 'RESOLVED';
}

export interface GameState {
    roomId: string;
    players: Record<string, Player>; // Map by ID
    deck: Card[];
    pyramid: Card[]; // Flattened pyramid
    currentPhase: GamePhase;
    currentTurnPlayerId: string | null;
    activeCard: Card | null; // The card currently being played/revealed

    // Phase 1 specific
    currentQuestionIndex: number; // 0-4

    // Phase 2 specific
    currentPyramidRow: number; // 1-5
    revealedPyramidCards: string[]; // IDs of revealed cards

    // Phase 2 Interactive State
    pendingAllocations: Record<string, SipAllocation>; // Allocations in current round
    confirmedTurnPlayers: string[]; // IDs of players who clicked "Done"
    activeChallenge: Challenge | null; // One challenge at a time for simplicity?

    // Event System
    lastEvent: GameEvent | null;
}

export interface GameEvent {
    id: string;
    type: 'SIP_DISTRIBUTE' | 'SIP_TAKE' | 'CARD_DRAWN' | 'PHASE_CHANGE' | 'GAME_START';
    message: string;
    targetPlayerId?: string;
    amount?: number;
}
