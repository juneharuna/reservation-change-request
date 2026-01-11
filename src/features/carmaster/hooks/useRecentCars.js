import { useState } from 'react';

const RECENT_CARS_KEY = 'recent_car_searches';

// localStorage에서 초기값을 가져오는 헬퍼 함수
const getInitialRecentCars = () => {
    try {
        const stored = localStorage.getItem(RECENT_CARS_KEY);
        if (stored) {
            const parsed = JSON.parse(stored);
            if (Array.isArray(parsed)) {
                return parsed;
            }
        }
    } catch (_e) {
        console.error('Failed to parse recent cars');
    }
    return [];
};

export const useRecentCars = () => {
    // Lazy initializer 패턴: useState에 함수를 전달하면 초기 렌더링 시에만 실행됨
    const [recentCars, setRecentCars] = useState(getInitialRecentCars);

    const pushRecentCar = (carNumber) => {
        if (!carNumber) return;

        const normalized = carNumber.trim().replace(/\s/g, '');
        setRecentCars(prev => {
            // Remove existing entry to avoid duplicates and move to front
            const filtered = prev.filter(c => c !== normalized);
            const updated = [normalized, ...filtered].slice(0, 3);
            localStorage.setItem(RECENT_CARS_KEY, JSON.stringify(updated));
            return updated;
        });
    };

    const clearRecentCars = () => {
        localStorage.removeItem(RECENT_CARS_KEY);
        setRecentCars([]);
    };

    return { recentCars, pushRecentCar, clearRecentCars };
};
