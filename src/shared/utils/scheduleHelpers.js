
export const TIME_TYPES = {
    AM: 'AM',
    PM: 'PM',
    SPECIFIC: 'SPECIFIC'
};

export const TIME_TYPE_LABELS = {
    [TIME_TYPES.AM]: '오전 중',
    [TIME_TYPES.PM]: '오후 중',
    [TIME_TYPES.SPECIFIC]: '직접 선택'
};

/**
 * Formats a schedule object into a display string
 * @param {Object} schedule - { date: 'YYYY-MM-DD', timeType: 'AM'|'PM'|'SPECIFIC', timeValue: 'HH:mm'|null }
 * @returns {string} e.g., "2025. 12. 30. | 14:00" or "2025. 12. 30. | 오전 중"
 */
export const formatSchedule = (schedule) => {
    if (!schedule || !schedule.date) return '-';

    // Extract only the date part if it's an ISO string
    const pureDate = schedule.date.includes('T') ? schedule.date.split('T')[0] : schedule.date;

    // Format Date: 2025-12-30 -> 2025. 12. 30.
    const [year, month, day] = pureDate.split('-');
    const dateStr = `${year}. ${month}. ${day}.`;

    // Format Time
    let timeStr = '';
    if (schedule.timeType === TIME_TYPES.AM) {
        timeStr = TIME_TYPE_LABELS[TIME_TYPES.AM];
    } else if (schedule.timeType === TIME_TYPES.PM) {
        timeStr = TIME_TYPE_LABELS[TIME_TYPES.PM];
    } else if (schedule.timeType === TIME_TYPES.SPECIFIC) {
        timeStr = schedule.timeValue || '';
    }

    return `${dateStr} | ${timeStr}`;
};


/**
 * Formats a schedule object into a display string with Day of Week
 * @param {Object} schedule - { date: 'YYYY-MM-DD', timeType: 'AM'|'PM'|'SPECIFIC', timeValue: 'HH:mm'|null }
 * @returns {string} e.g., "2025-12-30(화) 14:00" or "2025-12-30(화) 오전 중"
 */
export const formatScheduleWithDay = (schedule) => {
    if (!schedule || !schedule.date) return '-';

    // Extract only the date part if it's an ISO string
    const pureDate = schedule.date.includes('T') ? schedule.date.split('T')[0] : schedule.date;

    // Format Date: 2025-12-30 -> 2025-12-30(화)
    const [year, month, day] = pureDate.split('-').map(Number);
    const dateObj = new Date(year, month - 1, day);
    const days = ['일', '월', '화', '수', '목', '금', '토'];
    const dayOfWeek = days[dateObj.getDay()];

    const dateStr = `${pureDate}(${dayOfWeek})`;

    // Format Time
    let timeStr = '';
    if (schedule.timeType === TIME_TYPES.AM) {
        timeStr = TIME_TYPE_LABELS[TIME_TYPES.AM];
    } else if (schedule.timeType === TIME_TYPES.PM) {
        timeStr = TIME_TYPE_LABELS[TIME_TYPES.PM];
    } else if (schedule.timeType === TIME_TYPES.SPECIFIC) {
        timeStr = schedule.timeValue || '';
    }

    return `${dateStr} ${timeStr}`;
};

