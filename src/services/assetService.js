import api from './api';

/**
 * Fetch all assets (HR Only)
 * @returns {Promise} API response
 */
export async function getAllAssets() {
    try {
        const response = await api.get('/assets');
        return response.data;
    } catch (error) {
        console.error('Error fetching all assets:', error);
        throw error;
    }
}

/**
 * Fetch only user's assigned assets
 * @returns {Promise} API response
 */
export async function getMyAssets() {
    try {
        const response = await api.get('/assets/my-assets');
        return response.data;
    } catch (error) {
        console.error('Error fetching my assets:', error);
        throw error;
    }
}

/**
 * Create a new asset (HR Only)
 * @param {Object} assetData - Data for the new asset
 * @returns {Promise} API response
 */
export async function createAsset(assetData) {
    try {
        const response = await api.post('/assets', assetData);
        return response.data;
    } catch (error) {
        console.error('Error creating asset:', error);
        throw error;
    }
}

/**
 * Update an asset (HR Only)
 * @param {string} assetId - ID of the asset to update
 * @param {Object} assetData - Updated data
 * @returns {Promise} API response
 */
export async function updateAsset(assetId, assetData) {
    try {
        const response = await api.put(`/assets/${assetId}`, assetData);
        return response.data;
    } catch (error) {
        console.error('Error updating asset:', error);
        throw error;
    }
}

/**
 * Delete an asset (HR Only)
 * @param {string} assetId - ID of the asset to delete
 * @returns {Promise} API response
 */
export async function deleteAsset(assetId) {
    try {
        const response = await api.delete(`/assets/${assetId}`);
        return response.data;
    } catch (error) {
        console.error('Error deleting asset:', error);
        throw error;
    }
}
