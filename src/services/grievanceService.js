import api from './api'

export async function submitGrievance(grievanceData) {
  try {
    const response = await api.post('/employee/grievance', grievanceData);
    return response.data;
  } catch (error) {
    throw error;
  }
}

export async function fetchGrievances() {
  try {
    const response = await api.get('/employee/grievance/my');
    return response.data;
  } catch (error) {
    throw error;
  }
}

export async function addGrievanceComment(grievanceId, message) {
  try {
    const response = await api.post(`/employee/grievance/${grievanceId}/comment`, {
      message: message
    });
    return response.data;
  } catch (error) {
    throw error;
  }
}

export async function updateGrievance(grievanceId, updateData) {
  try {
    const response = await api.put(`/employee/grievance/${grievanceId}`, updateData);
    return response.data;
  } catch (error) {
    throw error;
  }
}

export async function updateGrievanceStatus(grievanceId, status) {
  try {
    const response = await api.put(`/employee/grievance/${grievanceId}/status`, {
      status: status
    });
    return response.data;
  } catch (error) {
    throw error;
  }
}

export async function fetchAllGrievances() {
  try {
    const response = await api.get('/employee/grievance/all');
    return response.data;
  } catch (error) {
    throw error;
  }
}

