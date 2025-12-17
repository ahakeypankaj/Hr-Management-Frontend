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
 * Get all onboarding records
 * @returns {Promise} API response with onboarding list
 */
export async function getAllOnboardings() {
  try {
    const response = await api.get('/onboard/all');
    return response.data;
  } catch (error) {
    console.error('Error fetching onboardings:', error);
    throw error;
  }
}

/**
 * Manager approve/reject onboarding employee
 * @param {string} onboardingId - The ID of the onboarding record
 * @param {Object} approvalData - Object containing:
 *   - action: "approved" or "rejected"
 *   - comments: string (optional)
 * @returns {Promise} API response
 */
export async function managerApproveOnboarding(onboardingId, approvalData) {
  console.log("=== Service: managerApproveOnboarding ===");
  console.log("Onboarding ID:", onboardingId);
  console.log("Approval Data:", approvalData);
  
  try {
    console.log("Making POST request to:", `/onboard/manager-approve/${onboardingId}`);
    const response = await api.post(`/onboard/manager-approve/${onboardingId}`, approvalData);
    console.log("API Response Status:", response.status);
    console.log("API Response Data:", response.data);
    return response.data;
  } catch (error) {
    console.error('=== Error approving/rejecting onboarding employee ===');
    console.error('Error object:', error);
    console.error('Error response:', error.response);
    console.error('Error response data:', error.response?.data);
    console.error('Error message:', error.message);
    throw error;
  }
}

/**
 * BGV approve onboarding employee
 * @param {string} onboardingId - The ID of the onboarding record
 * @param {Object} bgvData - Object containing:
 *   - remarks: string
 * @returns {Promise} API response
 */
export async function bgvApproveOnboarding(onboardingId, bgvData) {
  console.log("=== Service: bgvApproveOnboarding ===");
  console.log("Onboarding ID:", onboardingId);
  console.log("BGV Data:", bgvData);
  
  try {
    console.log("Making POST request to:", `/onboard/bgv/${onboardingId}/approve`);
    const response = await api.post(`/onboard/bgv/${onboardingId}/approve`, bgvData);
    console.log("API Response Status:", response.status);
    console.log("API Response Data:", response.data);
    return response.data;
  } catch (error) {
    console.error('=== Error approving BGV ===');
    console.error('Error object:', error);
    console.error('Error response:', error.response);
    console.error('Error response data:', error.response?.data);
    console.error('Error message:', error.message);
    throw error;
  }
}

/**
 * BGV reject onboarding employee
 * @param {string} onboardingId - The ID of the onboarding record
 * @param {Object} bgvData - Object containing:
 *   - remarks: string (or reject: string)
 * @returns {Promise} API response
 */
export async function bgvRejectOnboarding(onboardingId, bgvData) {
  console.log("=== Service: bgvRejectOnboarding ===");
  console.log("Onboarding ID:", onboardingId);
  console.log("BGV Data:", bgvData);
  
  try {
    console.log("Making POST request to:", `/onboard/bgv/${onboardingId}/reject`);
    const response = await api.post(`/onboard/bgv/${onboardingId}/reject`, bgvData);
    console.log("API Response Status:", response.status);
    console.log("API Response Data:", response.data);
    return response.data;
  } catch (error) {
    console.error('=== Error rejecting BGV ===');
    console.error('Error object:', error);
    console.error('Error response:', error.response);
    console.error('Error response data:', error.response?.data);
    console.error('Error message:', error.message);
    throw error;
  }
}

/**
 * Create onboarding employee
 * @param {FormData} formData - FormData containing:
 *   - candidateName: string
 *   - personalEmail: string
 *   - phone: string
 *   - jobDetails: JSON string
 *   - addressInfo: JSON string
 *   - resume: File
 * @returns {Promise} API response
 */
export async function createOnboardingEmployee(formData) {
  console.log("=== Service: createOnboardingEmployee ===");
  console.log("FormData received:", formData);
  
  // Log FormData entries in service
  console.log("=== FormData Entries in Service ===");
  for (let pair of formData.entries()) {
    if (pair[1] instanceof File) {
      console.log(pair[0] + ":", `File - ${pair[1].name} (${pair[1].size} bytes, type: ${pair[1].type})`);
    } else {
      console.log(pair[0] + ":", pair[1]);
    }
  }
  
  try {
    console.log("Making POST request to: /onboard/create");
    console.log("Base URL:", api.defaults.baseURL);
    console.log("Full URL will be:", `${api.defaults.baseURL}/onboard/create`);
    const response = await api.post('/onboard/create', formData);
    console.log("API Response Status:", response.status);
    console.log("API Response:", response);
    console.log("API Response Data:", response.data);
    return response.data;
  } catch (error) {
    console.error('=== Error creating onboarding employee ===');
    console.error('Error object:', error);
    console.error('Error response:', error.response);
    console.error('Error response data:', error.response?.data);
    console.error('Error message:', error.message);
    throw error;
  }
}
