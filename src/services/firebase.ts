import { initializeApp } from 'firebase/app';
import { Database, getDatabase, onValue, ref, set, update } from 'firebase/database';

// TODO: Replace with user's specific config
// For now, this is a placeholder. The app will crash if not replaced with valid config in a real env,
// but we can mock it for local dev if needed.
const firebaseConfig = {
    apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
    databaseURL: process.env.EXPO_PUBLIC_FIREBASE_DATABASE_URL,
    projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID
};

// Initialize only if not already initialized (singleton prevention)
const app = initializeApp(firebaseConfig);
export const db: Database = getDatabase(app);

export const ROOMS_REF = 'rooms';

export const createRoom = async (roomId: string, initialState: any) => {
    await set(ref(db, `${ROOMS_REF}/${roomId}`), initialState);
};

export const joinRoom = async (roomId: string, player: any) => {
    const playerRef = ref(db, `${ROOMS_REF}/${roomId}/players/${player.id}`);
    await set(playerRef, player);
};

export const subscribeToRoom = (roomId: string, callback: (data: any) => void) => {
    const roomRef = ref(db, `${ROOMS_REF}/${roomId}`);
    return onValue(roomRef, (snapshot) => {
        callback(snapshot.val());
    });
};

export const updateGameState = async (roomId: string, updates: any) => {
    const roomRef = ref(db, `${ROOMS_REF}/${roomId}`);
    await update(roomRef, updates);
}
