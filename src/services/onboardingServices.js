import api from './api'

export async function fetchPendingOnboardings() {
  return [
    console.log('fetchPendingOnboardings')
  ]
}

export async function createEmployee(data) {
  return { data }
}

/**
 * Create onboarding request
 * @param {Object} onboardingData - The onboarding data
 * @param {Object} onboardingData.personalInfo - Personal information
 * @param {Object} onboardingData.bankDetails - Bank details (optional)
 * @param {Array} onboardingData.documents - Documents array
 * @param {Object} onboardingData.emergencyContact - Emergency contact info
 * @returns {Promise} API response
 */
export async function createOnboarding(onboardingData) {
  try {
    const response = await api.post('/api/onboarding', onboardingData);
    return response.data;
  } catch (error) {
    console.error('Error creating onboarding:', error);
    throw error;
  }
}
