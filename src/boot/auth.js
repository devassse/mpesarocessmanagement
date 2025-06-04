import axios from 'axios';
import Cookies from 'js-cookie';
import ip from './ips';

const apiClient = axios.create({
  baseURL: ip,
  headers: {
    'Content-Type': 'application/json',
  },
});

const isElectron = typeof window !== 'undefined' && !!window.electronAPI;

const setCookie = async (name, value, days, minutes = 0) => {
  const expirationDate = new Date(Date.now() + (days * 24 * 60 * 60 * 1000) + (minutes * 60 * 1000));

  if (isElectron) {
    await window.electronAPI.setCookie(name, value,days, minutes);
  } else {
    Cookies.set(name, value, { expires: expirationDate });
  }
};


const removeCookie = async (name) => {
  if (isElectron) {
    await window.electronAPI.deleteCookie(name);
  } else {
    Cookies.remove(name);
  }
};

const signup = async ({ email, username, password, ticketId, department }) => {
  try {
    const response = await apiClient.post('/auth/signup', {
      email,
      username,
      password,
      ticketId,
      department
    });
    if (response.data.message) {
      console.log(response.data.message);
    }
    return response.data;
  } catch (error) {
    console.error('Error during signup:', error.response ? error.response.data : error.message);
    throw error;
  }
};


const login = async ({ email, password }) => {
  try {
    const response = await apiClient.post('/auth/sign', {
      email,
      password
    });

    await removeCookie('isAdmin');
    await removeCookie('isViewer');
    await removeCookie('isAuditor');
    await removeCookie('isEditor');

    const roles = response.data?.roles || [];
    await Promise.all(roles.map(async (role) => {
      const days = 0;
      const extraMinutes = 60 * 4; // 1 hour extra

      if (role === "Admin") {
        await setCookie('isAdmin', 'true', days, extraMinutes);
        console.log(`Cookie set for role: ${role}`);
      }
      if (role === "View") {
        await setCookie('isViewer', 'true', days, extraMinutes);
        console.log(`Cookie set for role: ${role}`);
      }
      if (role === "Audit log") {
        await setCookie('isAuditor', 'true', days, extraMinutes);
        console.log(`Cookie set for role: ${role}`);
      }
      if (role === "Editor") {
        await setCookie('isEditor', 'true', days, extraMinutes);
        console.log(`Cookie set for role: ${role}`);
      }
    }));

    return response.data;
  } catch (error) {
    console.error('Error during login:', error.response ? error.response.data : error.message);
    throw error;
  }
};

const getCurrentUser = async (authToken) => {
  try {
    const response = await apiClient.get(`/auth/current-user?authToken=${authToken}`);

    //Save User information on session storage
    sessionStorage.setItem('currentUser', JSON.stringify(response.data));
    
    return response.data;
  } catch (error) {
    console.error('Error fetching current user:', error.response ? error.response.data : error.message);
    throw error;
  }
};

import { boot } from 'quasar/wrappers';

export default boot(({ app }) => {
  app.config.globalProperties.$auth = { signup, login, getCurrentUser };
});

export { signup, login, getCurrentUser };
