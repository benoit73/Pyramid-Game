import { useEffect } from 'react';
import { subscribeToRoom } from '../services/firebase';
import { useGameStore } from '../store/gameStore';

export const useGameSync = (roomId: string) => {
    const syncState = useGameStore((state) => state.syncState);

    useEffect(() => {
        if (!roomId) return;

        const unsubscribe = subscribeToRoom(roomId, (data) => {
            if (data) {
                syncState(data);
            }
        });

        return () => unsubscribe();
    }, [roomId, syncState]);
};
