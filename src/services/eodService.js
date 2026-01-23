import api from './api'

/**
 * Fetch EOD details for HR/Admin
 * @param {Object} params - { search, page, limit, status, startDate, endDate }
 * @returns {Promise} API response
 */
export async function fetchEODDetails(params = {}) {
    const query = new URLSearchParams();

    if (params.search) query.append('search', params.search);
    if (params.page) query.append('page', String(params.page));
    if (params.limit) query.append('limit', String(params.limit));
    if (params.status && params.status !== 'All') query.append('status', params.status);
    if (params.startDate) query.append('startDate', params.startDate);
    if (params.endDate) query.append('endDate', params.endDate);

    const queryString = query.toString();
    const url = `user/eod${queryString ? `?${queryString}` : ''}`;

    console.log(`[EOD] Fetching detailing: ${url}`);
    try {
        const response = await api.get(url);
        return response.data;
    } catch (error) {
        console.error('[EOD] Error fetching EOD details:', error);
        throw error;
    }
}

/**
 * Fetch particular employee data (including EODs)
 * @param {string} id - Employee ID
 * @param {string} fromDate - ISO date string
 * @param {string} toDate - ISO date string
 * @returns {Promise} API response
 */
export async function fetchEmployeeEOD(id, fromDate, toDate) {
    let url = `employee/getParticularEmployeeData/${id}`;

    if (fromDate && toDate) {
        url += `?from_date=${fromDate}&to_date=${toDate}`;
    }

    console.log(`[EOD] Fetching employee EOD: ${url}`);
    try {
        const response = await api.get(url);
        return response.data;
    } catch (error) {
        console.error('[EOD] Error fetching employee EOD:', error);
        throw error;
    }
}

/**
 * Download EOD report in Excel format
 * @param {string} startDate - ISO date string
 * @param {string} endDate - ISO date string
 * @returns {Promise} API response with blob
 */
export async function downloadEODExcel(startDate, endDate) {
    const query = new URLSearchParams();
    if (startDate) query.append('startDate', startDate);
    if (endDate) query.append('endDate', endDate);

    const url = `user/eod/download-excel${query.toString() ? `?${query.toString()}` : ''}`;

    try {
        const response = await api.get(url, {
            responseType: 'blob',
        });
        return response;
    } catch (error) {
        console.error('[EOD] Error downloading EOD excel:', error);
        throw error;
    }
}
