/**
 * 날짜 문자열에서 숫자 부분만 추출하여 Date 객체를 생성합니다.
 * @param {string} dateStr - '2025. 12. 26. 17:45' 형식의 문자열
 * @returns {Date|null}
 */
export const parseCustomDate = (dateStr) => {
    if (!dateStr) return null;
    const parts = dateStr.match(/\d+/g);
    if (!parts || parts.length < 3) return null;
    return new Date(parts[0], parts[1] - 1, parts[2]);
};

/**
 * 현재 날짜와 대상 날짜 사이의 일수 차이를 계산합니다.
 * @param {Date} targetDate 
 * @returns {number}
 */
export const getDiffDays = (targetDate) => {
    if (!targetDate) return Infinity;
    const now = new Date();
    return (now - targetDate) / (1000 * 60 * 60 * 24);
};

/**
 * 현재 시간을 기반으로 한국어 형식의 날짜 및 시간 문자열을 반환합니다.
 * @returns {string} - '2025. 12. 26. 21시 30분' 형식
 */
export const getCurrentFormattedDateTime = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');

    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
};
