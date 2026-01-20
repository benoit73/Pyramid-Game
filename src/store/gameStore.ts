import { create } from 'zustand';
import { Card } from '../models/Card';
import { GameState } from '../models/GameState';
import { updateGameState } from '../services/firebase';
import { generateDeck, shuffleDeck } from '../utils/deckUtils';

interface GameStore extends GameState {
    // Local Actions (that push to DB)
    setRoomId: (roomId: string) => void;
    setLocalPlayerId: (playerId: string) => void;
    syncState: (state: Partial<GameState>) => void;

    // Game Actions
    startGame: () => Promise<void>;
    nextPhase: () => Promise<void>;

    // Phase 1 Actions
    drawCard: () => Promise<void>;
    submitAnswer: (answer: string) => Promise<void>;
    resolveTurn: (correct: boolean) => Promise<void>;

    // Phase 2 Actions
    initializePyramid: () => Promise<void>;
    revealPyramidCard: () => Promise<void>;

    // New Interactive Actions
    allocateSips: (targetPlayerId: string, amount: number) => Promise<void>;
    confirmPhase2Turn: () => Promise<void>;
    respondToAllocation: (allocationId: string, action: 'ACCEPT' | 'CHALLENGE') => Promise<void>;
    resolveChallenge: (cardIdToReveal: string) => Promise<void>;

    // Legacy support or alias
    answerQuestion: (correct: boolean) => Promise<void>;

    localPlayerId: string | null;
}

const INITIAL_STATE: Omit<GameStore, 'setRoomId' | 'setLocalPlayerId' | 'syncState' | 'startGame' | 'nextPhase' | 'answerQuestion' | 'drawCard' | 'submitAnswer' | 'resolveTurn' | 'localPlayerId' | 'initializePyramid' | 'revealPyramidCard' | 'allocateSips' | 'respondToAllocation' | 'resolveChallenge' | 'confirmPhase2Turn'> = {
    roomId: '',
    players: {},
    deck: [],
    pyramid: [],
    currentPhase: 'LOBBY',
    currentTurnPlayerId: null,
    activeCard: null,
    currentQuestionIndex: 0,
    currentPyramidRow: 5,
    revealedPyramidCards: [],
    pendingAllocations: {},
    confirmedTurnPlayers: [],
    activeChallenge: null,
    lastEvent: null,
};

export const useGameStore = create<GameStore>((set, get) => ({
    ...INITIAL_STATE,
    localPlayerId: null,

    setRoomId: (roomId) => set({ roomId }),
    setLocalPlayerId: (localPlayerId) => set({ localPlayerId }),

    syncState: (state) => {
        // Merge remote state into local
        set((prev) => ({ ...prev, ...state }));
    },

    startGame: async () => {
        const { roomId, players } = get();
        const playerIds = Object.keys(players);
        if (playerIds.length === 0) return;

        console.log("Starting game...");
        const deck = shuffleDeck(generateDeck());

        // Auto-draw first card for first player
        const firstCard = deck.pop();
        if (!firstCard) {
            console.error("Deck empty after creation!");
            return;
        }
        console.log("First card drawn:", firstCard.rank, firstCard.suit);

        // Initialize Phase 1
        const updates: Partial<GameState> = {
            currentPhase: 'PHASE_1_DISTRIBUTION',
            deck,
            currentTurnPlayerId: playerIds[0],
            currentQuestionIndex: 0,
            activeCard: firstCard,
            lastEvent: {
                id: Date.now().toString(),
                type: 'GAME_START',
                message: 'The game begins! First card drawn.',
            }
        };

        await updateGameState(roomId, updates);
    },

    nextPhase: async () => {
        // TODO: Implement phase transition logic
    },


    drawCard: async () => {
        const { deck, activeCard, roomId } = get();
        if (activeCard) {
            console.log("Cannot draw: Active card already exists:", activeCard.rank, activeCard.suit);
            return;
        }

        console.log("Drawing card, deck size before pop:", deck.length);
        const newDeck = [...deck];
        const card = newDeck.pop();

        if (!card) {
            console.log("No cards left in deck!");
            return;
        }

        console.log("Drawn Card:", card.rank, card.suit, card.id);

        await updateGameState(roomId, {
            deck: newDeck,
            activeCard: card,
            lastEvent: {
                id: Date.now().toString(),
                type: 'CARD_DRAWN',
                message: 'MJ drew a card',
            }
        });
    },

    resolveTurn: async (correct) => {
        const { roomId, players, currentTurnPlayerId, activeCard, currentQuestionIndex } = get();
        if (!currentTurnPlayerId || !activeCard) return;

        const player = players[currentTurnPlayerId];
        const currentCards = player.cards || [];
        const updatedPlayer = { ...player, cards: [...currentCards, activeCard] };

        let eventPayload: any = {};
        if (correct) {
            updatedPlayer.sipsGiven += 1;
            eventPayload = {
                type: 'SIP_DISTRIBUTE',
                message: `${player.name} distributes 1 sip!`,
                amount: 1
            };
        } else {
            updatedPlayer.sipsTaken += 1;
            eventPayload = {
                type: 'SIP_TAKE',
                message: `${player.name} drinks 1 sip!`,
                targetPlayerId: player.id,
                amount: 1
            };
        }

        const playerIds = Object.keys(players);
        const currentIndex = playerIds.indexOf(currentTurnPlayerId);
        let nextIndex = currentIndex + 1;
        let nextQuestionIndex = currentQuestionIndex;

        if (nextIndex >= playerIds.length) {
            nextIndex = 0;
            nextQuestionIndex += 1;
        }

        let nextPhase = get().currentPhase;
        if (nextQuestionIndex >= 5) {
            nextPhase = 'PHASE_2_PYRAMID';
        }

        const phaseChanged = nextPhase !== get().currentPhase;

        // Prepare next turn updates
        let nextActiveCard = null;
        let newDeck = get().deck; // Get freshest deck from store (should be synced?) 
        // Or better: use deck from current state, but wait, if it wasn't modified in this function yet...
        // We need to be careful. The deck in 'get()' might be stale if we didn't just update it?
        // Actually, 'get()' returns current store state. 

        // Wait, we need to ensure we are using the deck that results after potential previous updates?
        // In this function, we haven't touched deck yet. So 'get().deck' is correct.

        if (!phaseChanged) {
            newDeck = [...get().deck]; // copy
            const card = newDeck.pop();
            if (card) {
                nextActiveCard = card;
                console.log("Auto-drawing next card:", card.rank, card.suit);
            } else {
                console.log("Deck empty on auto-draw!");
            }
        }

        await updateGameState(roomId, {
            players: { ...players, [player.id]: updatedPlayer },
            activeCard: nextActiveCard, // Set new card
            deck: phaseChanged ? get().deck : newDeck, // Update deck if we drew
            currentTurnPlayerId: playerIds[nextIndex],
            currentQuestionIndex: nextQuestionIndex,
            currentPhase: nextPhase,
            lastEvent: {
                id: Date.now().toString(),
                type: 'SIP_TAKE',
                ...eventPayload
            }
        });

        if (phaseChanged && nextPhase === 'PHASE_2_PYRAMID') {
            await get().initializePyramid();
        }
    },

    initializePyramid: async () => {
        const { deck, roomId } = get();
        // Need 15 cards for 5+4+3+2+1
        const newDeck = [...deck];
        const pyramidCards: Card[] = [];
        for (let i = 0; i < 15; i++) {
            const card = newDeck.pop();
            if (card) pyramidCards.push({ ...card, hidden: true });
        }

        await updateGameState(roomId, {
            deck: newDeck,
            pyramid: pyramidCards,
            currentPyramidRow: 5, // Start at bottom row
            revealedPyramidCards: [],
            lastEvent: {
                id: Date.now().toString(),
                type: 'PHASE_CHANGE',
                message: 'PHASE 2: THE PYRAMID BEGINS!',
            }
        });
    },

    revealPyramidCard: async () => {
        const { pyramid, revealedPyramidCards, roomId, currentPyramidRow } = get();

        const unrevealedIndex = pyramid.findIndex(c => c.hidden);
        if (unrevealedIndex === -1) return; // All revealed

        const newPyramid = [...pyramid];
        newPyramid[unrevealedIndex].hidden = false;

        const card = newPyramid[unrevealedIndex];

        // determine row for logic if needed (not strictly needed for MVP logic yet)

        await updateGameState(roomId, {
            pyramid: newPyramid,
            revealedPyramidCards: [...revealedPyramidCards, card.id],
            activeCard: card, // Set as the active card for this round
            currentPhase: 'PHASE_2_ALLOCATE', // Trigger interactive phase
            pendingAllocations: {}, // Reset allocations
            confirmedTurnPlayers: [], // Reset confirmations
            activeChallenge: null,
            lastEvent: {
                id: Date.now().toString(),
                type: 'PHASE_CHANGE',
                message: `Revealed: ${card.rank} of ${card.suit}. Allocation Phase!`,
            }
        });
    },

    submitAnswer: async (answer) => {
        const { activeCard, currentQuestionIndex, players, currentTurnPlayerId, resolveTurn } = get();
        if (!activeCard || !currentTurnPlayerId) return;

        const player = players[currentTurnPlayerId];
        let correct = false;

        const cardVal = activeCard.value;
        const cardColor = (activeCard.suit === 'hearts' || activeCard.suit === 'diamonds') ? 'red' : 'black';

        switch (currentQuestionIndex) {
            case 0: // Red/Black
                correct = (answer === cardColor);
                break;
            case 1: // Higher/Lower
                const firstCardVal = player.cards[0].value;
                if (answer === 'more') correct = cardVal > firstCardVal;
                if (answer === 'less') correct = cardVal < firstCardVal;
                // Equal usually counts as wrong or push, sticking to strict for now
                break;
            case 2: // In/Out
                if (player.cards.length >= 2) {
                    const c1 = player.cards[0].value;
                    const c2 = player.cards[1].value;
                    const min = Math.min(c1, c2);
                    const max = Math.max(c1, c2);
                    if (answer === 'in') correct = (cardVal > min && cardVal < max);
                    if (answer === 'out') correct = (cardVal < min || cardVal > max);
                }
                break;
            case 3: // Suit
                correct = (answer === activeCard.suit);
                break;
            case 4: // Exact (Just lucky guess usually)
            // For simplified UI, we might skip exact guess or make it simple suit guess again?
            // Rules say "Quelle est la carte exacte ?"
            // We'll assume the user just repeats suit guess or color for now to keep flow fast?
            // No, let's implement Suit guess as "Color" again or just "Suit".
            // Actually round 4 is Suit. Round 5 is Exact.
            // It's extremely hard to guess exact. I'll make it "Same Suit OR Value" for better odds?
            // No, sticking to rules: Exact Card.
            // UI should probably just ask for Suit+Rank.
            // For MVP, I will make Round 5 "Red or Black" again but with higher stakes? NO, rules are rules.
            // I will make it "Guess Suit" again for simplicity in this iteration unless User complains.
            case 4: // Exact (Rank + Suit)
                // Answer format: "RANK-SUIT" (e.g. "7-hearts")
                const parts = answer.split('-');
                if (parts.length === 2) {
                    const [guessRank, guessSuit] = parts;
                    correct = (guessRank === activeCard.rank && guessSuit === activeCard.suit);
                } else {
                    correct = false;
                }
                break;
        }

        await resolveTurn(correct);
    },

    allocateSips: async (targetPlayerId, amount) => {
        const { roomId, localPlayerId, players, activeCard, pyramid, pendingAllocations } = get();
        if (!localPlayerId || !activeCard) return;

        // Calculate Max Sips based on Pyramid Row
        const pyramidIndex = pyramid.findIndex(c => c.id === activeCard.id);
        let sipsPerCard = 1;
        if (pyramidIndex >= 5) sipsPerCard = 2; // Row 4
        if (pyramidIndex >= 9) sipsPerCard = 3; // Row 3
        if (pyramidIndex >= 12) sipsPerCard = 4; // Row 2
        if (pyramidIndex >= 14) sipsPerCard = 5; // Row 1

        const maxSips = sipsPerCard * 3; // Max 3 cards matching in hand

        // Calculate current given sips
        const currentGiven = Object.values(pendingAllocations)
            .filter(a => a.fromPlayerId === localPlayerId)
            .reduce((sum, a) => sum + a.amount, 0);

        if (currentGiven + amount > maxSips) {
            console.warn(`Cannot allocate sips: Limit is ${maxSips}, already given ${currentGiven}`);
            // Ideally we'd show a toast/alert here, but safe to just return for now
            return;
        }

        const allocationId = Date.now().toString();
        const allocation = {
            fromPlayerId: localPlayerId,
            toPlayerId: targetPlayerId,
            amount,
            usingCardId: 'unknown',
            status: 'PENDING' as const
        };

        const newAllocations = { ...pendingAllocations, [allocationId]: allocation };

        await updateGameState(roomId, {
            pendingAllocations: newAllocations,
            // Don't show event yet if purely secret? No, "X is allocating" is fine or keep hidden until resolve?
            // "Players should confirm -> Then resolve".
            // So we update state, but maybe suppress event or keep generic?
            // User said: "Challenges sending only after all confirmed".
            // So we store allocation, but phase is ALLOCATE.
        });
    },

    confirmPhase2Turn: async () => {
        const { roomId, localPlayerId, confirmedTurnPlayers, players, currentPhase } = get();
        if (!localPlayerId || currentPhase !== 'PHASE_2_ALLOCATE') return;

        if (confirmedTurnPlayers.includes(localPlayerId)) return;

        const newConfirmed = [...confirmedTurnPlayers, localPlayerId];
        const allConfirmed = Object.keys(players).every(pid => newConfirmed.includes(pid));

        let updates: Partial<GameState> = {
            confirmedTurnPlayers: newConfirmed,
        };

        if (allConfirmed) {
            updates.currentPhase = 'PHASE_2_RESOLVE';
            updates.lastEvent = {
                id: Date.now().toString(),
                type: 'PHASE_CHANGE',
                message: 'Allocations complete! RESOLVE your sips!',
            };
        }

        await updateGameState(roomId, updates);
    },

    respondToAllocation: async (allocationId, action) => {
        const { roomId, pendingAllocations, players } = get();
        const allocation = pendingAllocations[allocationId];
        if (!allocation) return;

        if (action === 'ACCEPT') {
            // Target drinks
            const target = players[allocation.toPlayerId];
            const updatedTarget = { ...target, sipsTaken: target.sipsTaken + allocation.amount };

            // Remove allocation
            const newAllocations = { ...pendingAllocations };
            delete newAllocations[allocationId];

            await updateGameState(roomId, {
                players: { ...players, [target.id]: updatedTarget },
                pendingAllocations: newAllocations,
                lastEvent: {
                    id: Date.now().toString(),
                    type: 'SIP_TAKE',
                    message: `${target.name} accepts and drinks ${allocation.amount} sips!`,
                }
            });
        } else if (action === 'CHALLENGE') {
            // MENTEUR!
            await updateGameState(roomId, {
                activeChallenge: {
                    challengerId: allocation.toPlayerId,
                    targetId: allocation.fromPlayerId,
                    allocationId: allocationId,
                    status: 'ACTIVE'
                },
                lastEvent: {
                    id: Date.now().toString(),
                    type: 'PHASE_CHANGE',
                    message: `${players[allocation.toPlayerId].name} calls MENTEUR!`,
                }
            });
        }
    },

    resolveChallenge: async (cardIdToReveal) => {
        const { roomId, activeChallenge, players, pendingAllocations, activeCard } = get();
        if (!activeChallenge || !activeCard) return;

        const allocation = pendingAllocations[activeChallenge.allocationId];
        const giver = players[activeChallenge.targetId];
        const challenger = players[activeChallenge.challengerId];

        // Logic: Does the giver actually have a card matching activeCard rank?
        // In a real app, 'cardIdToReveal' would be the card they choose to show.
        // For automated valid logic: Check if giver has a card with same rank as activeCard.

        const matchingCard = giver.cards.find(c => c.rank === activeCard.rank);
        const playerHasMatch = !!matchingCard;

        // Verify if the card they REVEALED is the match (simulated here by checking truth)
        // If they have the card, they win. Challenger drinks double.
        // If they don't, they lose. Giver drinks double.

        let message = "";
        let updatedPlayers = { ...players };

        if (playerHasMatch) {
            message = `${giver.name} HAD IT! ${challenger.name} drinks ${allocation.amount * 2} sips!`;
            updatedPlayers[challenger.id].sipsTaken += (allocation.amount * 2);
        } else {
            message = `${giver.name} WAS LYING! ${giver.name} drinks ${allocation.amount * 2} sips!`;
            updatedPlayers[giver.id].sipsTaken += (allocation.amount * 2);
        }

        // Clear challenge and allocation
        const newAllocations = { ...pendingAllocations };
        delete newAllocations[activeChallenge.allocationId];

        await updateGameState(roomId, {
            players: updatedPlayers,
            activeChallenge: null,
            pendingAllocations: newAllocations,
            lastEvent: {
                id: Date.now().toString(),
                type: 'SIP_TAKE',
                message: message,
            }
        });
    },

    answerQuestion: async (correct) => {
        // Legacy
        get().resolveTurn(correct);
    }
}));
