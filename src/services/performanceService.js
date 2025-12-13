/**
 * Create a new performance cycle
 * @param {Object} cycleData - The performance cycle data
 * @param {string} cycleData.name - Name of the performance cycle
 * @param {string} cycleData.startDate - Start date (YYYY-MM-DD)
 * @param {string} cycleData.endDate - End date (YYYY-MM-DD)
 * @param {Object} cycleData.stages - Stage dates object
 * @param {string} cycleData.stages.goalSetting - Goal setting date
 * @param {string} cycleData.stages.selfReview - Self review date
 * @param {string} cycleData.stages.managerReview - Manager review date
 * @param {string} cycleData.stages.calibration - Calibration date
 * @param {string} cycleData.stages.finalization - Finalization date
 * @returns {Promise} API response
 */
export async function createPerformanceCycle(cycleData) {
  try {
    // Get token from localStorage for authorization
    const token = localStorage.getItem('authToken');
    if (!token) {
      throw new Error('Authentication token not found. Please log in again.');
    }
    
    const response = await fetch('https://hrm-backend-caza.onrender.com/api/performance-cycle/create', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(cycleData)
    });
    
    if (!response.ok) {
      let errorMessage = 'Failed to create performance cycle';
      try {
        const errorData = await response.json();
        errorMessage = errorData.message || errorData.error || errorData.msg || errorMessage;
        if (response.status === 401) {
          errorMessage = errorMessage || 'Invalid or expired token. Please log in again.';
        }
      } catch (e) {
        errorMessage = response.statusText || errorMessage;
      }
      throw new Error(errorMessage);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error creating performance cycle:', error);
    throw error;
  }
}

/**
 * Assign a performance review to an employee
 * @param {Object} assignData - The performance assignment data
 * @param {string} assignData.userId - ID of the user (Employee) being reviewed
 * @param {string} assignData.reviewerId - ID of the reviewer/manager (Employee) assigned by HR
 * @param {string} assignData.cycleId - ID of the performance cycle
 * @param {Array} assignData.goals - Array of goals (can be empty)
 * @param {string} assignData.status - Status of the review (default: "goal-setting")
 * @returns {Promise} API response
 */
export async function assignPerformance(assignData) {
  try {
    const token = localStorage.getItem('authToken');
    if (!token) {
      throw new Error('Authentication token not found. Please log in again.');
    }
    
    const response = await fetch('https://hrm-backend-caza.onrender.com/api/performance/assign', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(assignData)
    });
    
    if (!response.ok) {
      let errorMessage = 'Failed to assign performance review';
      try {
        const errorData = await response.json();
        // Handle different error response formats
        errorMessage = errorData.message || errorData.error || errorData.msg || errorMessage;
        
        // If it's a 401, provide more specific guidance
        if (response.status === 401) {
          errorMessage = errorMessage || 'Invalid or expired token. Please log in again.';
        }
      } catch (e) {
        // If response is not JSON, use status text
        errorMessage = response.statusText || errorMessage;
      }
      throw new Error(errorMessage);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error assigning performance review:', error);
    throw error;
  }
}

/**
 * Assign goals to an employee
 * @param {string} userId - The user ID of the employee
 * @param {Object} goalsData - The goals data
 * @param {Array} goalsData.goals - Array of goal objects with title, description, and weightage
 * @returns {Promise} API response
 */
export async function assignGoalsToEmployee(userId, goalsData) {
  try {
    const token = localStorage.getItem('authToken');
    if (!token) {
      throw new Error('Authentication token not found. Please log in again.');
    }
    
    const response = await fetch(`https://hrm-backend-caza.onrender.com/api/performance/${userId}/goals`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(goalsData)
    });
    
    if (!response.ok) {
      let errorMessage = 'Failed to assign goals to employee';
      try {
        const errorData = await response.json();
        errorMessage = errorData.message || errorData.error || errorData.msg || errorMessage;
        if (response.status === 401) {
          errorMessage = errorMessage || 'Invalid or expired token. Please log in again.';
        }
      } catch (e) {
        errorMessage = response.statusText || errorMessage;
      }
      throw new Error(errorMessage);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error assigning goals to employee:', error);
    throw error;
  }
}

/**
 * Submit employee self-review
 * @param {string} userId - The user ID of the employee
 * @param {Object} reviewData - The self-review data
 * @param {Array} reviewData.goals - Array of goal objects with selfRating
 * @returns {Promise} API response
 */
export async function submitSelfReview(userId, reviewData) {
  try {
    const token = localStorage.getItem('authToken');
    if (!token) {
      throw new Error('Authentication token not found. Please log in again.');
    }
    
    const response = await fetch(`https://hrm-backend-caza.onrender.com/api/performance/${userId}/self-review`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(reviewData)
    });
    
    if (!response.ok) {
      let errorMessage = 'Failed to submit self-review';
      try {
        const errorData = await response.json();
        errorMessage = errorData.message || errorData.error || errorData.msg || errorMessage;
        if (response.status === 401) {
          errorMessage = errorMessage || 'Invalid or expired token. Please log in again.';
        }
      } catch (e) {
        errorMessage = response.statusText || errorMessage;
      }
      throw new Error(errorMessage);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error submitting self-review:', error);
    throw error;
  }
}

/**
 * Submit manager review
 * @param {string} userId - The user ID of the employee being reviewed
 * @param {Object} reviewData - The manager review data
 * @param {Array} reviewData.goals - Array of goal objects with managerRating and comments
 * @returns {Promise} API response
 */
export async function submitManagerReview(userId, reviewData) {
  try {
    const token = localStorage.getItem('authToken');
    if (!token) {
      throw new Error('Authentication token not found. Please log in again.');
    }
    
    const response = await fetch(`https://hrm-backend-caza.onrender.com/api/performance/${userId}/manager-review`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(reviewData)
    });
    
    if (!response.ok) {
      let errorMessage = 'Failed to submit manager review';
      try {
        const errorData = await response.json();
        errorMessage = errorData.message || errorData.error || errorData.msg || errorMessage;
        if (response.status === 401) {
          errorMessage = errorMessage || 'Invalid or expired token. Please log in again.';
        }
      } catch (e) {
        errorMessage = response.statusText || errorMessage;
      }
      throw new Error(errorMessage);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error submitting manager review:', error);
    throw error;
  }
}


