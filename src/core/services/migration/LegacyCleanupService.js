import { storage } from '../storage/LocalStorageService';

const LEGACY_KEYS = [
    'reservation_change_request',
    'reservation_change_request_v2',
    'reservation_change_request_v3'
];

export const runLegacyCleanup = () => {
    LEGACY_KEYS.forEach(key => {
        if (localStorage.getItem(key)) {
            storage.remove(key);
            console.log(`🧹 Cleaned up legacy storage: ${key}`);
        }
    });
};
