import { StorageService } from './StorageService';

export class LocalStorageService extends StorageService {
    get(key) {
        try {
            const item = localStorage.getItem(key);
            return item ? JSON.parse(item) : null;
        } catch (error) {
            console.error(`Error getting key ${key} from localStorage`, error);
            return null;
        }
    }

    set(key, value) {
        try {
            localStorage.setItem(key, JSON.stringify(value));
        } catch (error) {
            console.error(`Error setting key ${key} to localStorage`, error);
        }
    }

    remove(key) {
        try {
            localStorage.removeItem(key);
        } catch (error) {
            console.error(`Error removing key ${key} from localStorage`, error);
        }
    }
}

export const storage = new LocalStorageService();
