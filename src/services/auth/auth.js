import api from '../api.js';

export const loginWithCredentials = async (email, password) => {
  try {
    const response = await api.post('/auth/login', {
      email: email,
      password: password
    });
    // Assuming the response contains token and user data
    if (response.data.token) {
      localStorage.setItem('authToken', response.data.token);
      localStorage.setItem('userRole', response.data.user.role);
    }

    console.log("response login with credentials", response.data);
    return {
      token: response.data.token,
      user: response.data.user,
      role: response.data.user.role
    };
  } catch (error) {
    throw error;
  }
};

export const loginWithMicrosoft = async (idToken) => {
  try {
    const response = await api.post('/auth/login/microsoft', {
      idToken: idToken
    });
    // Assuming the response contains token and user data
    if (response.data.token) {
      localStorage.setItem('authToken', response.data.token);
    }
    return {
      token: response.data.token,
      user: response.data.user
    };
  } catch (error) {
    throw error;
  }
};

export const logout = async () => {
  const token = localStorage.getItem("authToken");

  try {
    await api.post("/auth/logout",{});
  } catch (error) {
    console.error("Logout API error:", error);
  } finally {
    // Clear frontend session
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  }
};
