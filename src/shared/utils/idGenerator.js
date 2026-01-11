/**
 * Generates a new Request ID in the format REQ-YYMMDD-NNNN
 * @param {Array} existingRequests - List of existing requests to check for sequence
 * @returns {string} New Request ID
 */
export const generateRequestId = (existingRequests = []) => {
    const now = new Date();
    const yy = now.getFullYear().toString().slice(-2);
    const mm = String(now.getMonth() + 1).padStart(2, '0');
    const dd = String(now.getDate()).padStart(2, '0');
    const todayPrefix = `REQ-${yy}${mm}${dd}`;

    // Filter requests created today
    const todayRequests = existingRequests.filter(req =>
        req.id && req.id.startsWith(todayPrefix)
    );

    // Find max sequence number
    let maxSeq = 0;
    todayRequests.forEach(req => {
        const parts = req.id.split('-');
        if (parts.length === 3) {
            const seq = parseInt(parts[2], 10);
            if (!isNaN(seq) && seq > maxSeq) {
                maxSeq = seq;
            }
        }
    });

    const newSeq = String(maxSeq + 1).padStart(4, '0');
    return `${todayPrefix}-${newSeq}`;
};
