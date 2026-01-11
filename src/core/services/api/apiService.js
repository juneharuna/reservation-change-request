/**
 * API Service to handle communication with the backend
 */

export const apiService = {
    /**
     * Fetch all requests from the server
     */
    async fetchRequests() {
        try {
            const response = await fetch('/api/requests');
            if (!response.ok) {
                throw new Error('Failed to fetch requests');
            }
            return await response.json();
        } catch (error) {
            console.error('apiService.fetchRequests error:', error);
            throw error;
        }
    },

    /**
     * Save all requests to the server
     * @param {Array} requests - The complete list of requests
     */
    async saveRequests(requests) {
        try {
            const response = await fetch('/api/requests', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(requests),
            });
            if (!response.ok) {
                throw new Error('Failed to save requests');
            }
            return await response.json();
        } catch (error) {
            console.error('apiService.saveRequests error:', error);
            throw error;
        }
    }
};
