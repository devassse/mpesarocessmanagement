import { boot } from 'quasar/wrappers'
import axios from 'axios'
import Cookies from 'js-cookie'
import ip from './ips'

const isElectron = typeof window !== 'undefined' && !!window.electronAPI

const getCookie = async (name) => {
  if (isElectron) {
    return await window.electronAPI.getCookie(name)
  } else {
    return Cookies.get(name)
  }
}

const apiClient = axios.create({
  baseURL: ip,
  headers: {
    'Content-Type': 'application/json',
  },
})

apiClient.interceptors.request.use(async config => {
  const token = await getCookie('authToken')
  if (token) {
    if (config.method === 'post' || config.method === 'put') {
      // Add token to request body for POST and PUT requests
      config.data = { ...config.data, authToken: token }
    } else {
      // Add token to URL parameters for GET, DELETE, and other requests
      config.params = { ...config.params, authToken: token }
    }
  }
  return config
}, error => {
  return Promise.reject(error)
})


// Helper methods

// Create a new report
const createReport = async (data) => {
  try {
    const response = await apiClient.post('reports/create-report', data);
    return response.data;
  } catch (error) {
    console.error('Error creating report (boot):', error.response ? error.response.data : error.message);
    throw error;
  }
}

// Fetch all reports
const getAllReports = async () => {
  try {
    const response = await apiClient.get('reports/get-all-reports');
    return response.data;
  } catch (error) {
    console.error('Error fetching reports:', error.response ? error.response.data : error.message);
    throw error;
  }
}

// Fetch a single report by ID
const getSingleReportById = async (id) => {
  try {
    const response = await apiClient.get(`reports/get-single-report/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching report:', error.response ? error.response.data : error.message);
    throw error;
  }
}

// Update a report
const updateReport = async (id, data) => {
  try {
    const response = await apiClient.put(`reports/update-report/${id}`, data);
    return response.data;
  } catch (error) {
    console.error('Error updating report:', error.response ? error.response.data : error.message);
    throw error;
  }
}

// Delete a report
const deleteReport = async (id) => {
  try {
    const response = await apiClient.delete(`reports/delete-report/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting report:', error.response ? error.response.data : error.message);
    throw error;
  }
}


// TODO: Other methods
const downloadReport = async (id) => {
  try {
    const response = await apiClient.get(`/report/${id}/download`, {
      responseType: 'blob',
    });
    return response.data;
  } catch (error) {
    console.error('Error downloading report:', error.response ? error.response.data : error.message);
    throw error;
  }
}

const getReportByGroup = async (groupId) => {
  try {
    const response = await apiClient.get(`/reports/group/${groupId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching reports by group:', error.response ? error.response.data : error.message);
    throw error;
  }
}

const getReportByUser = async (userId) => {
  try {
    const response = await apiClient.get(`/reports/user/${userId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching reports by user:', error.response ? error.response.data : error.message);
    throw error;
  }
}

const getReportByDate = async (startDate, endDate) => {
  try {
    const response = await apiClient.get(`/reports/date`, {
      params: { startDate, endDate }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching reports by date:', error.response ? error.response.data : error.message);
    throw error;
  }
}

const getReportByStatus = async (status) => {
  try {
    const response = await apiClient.get(`/reports/status/${status}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching reports by status:', error.response ? error.response.data : error.message);
    throw error;
  }
}

const getReportByType = async (type) => {
  try {
    const response = await apiClient.get(`/reports/type/${type}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching reports by type:', error.response ? error.response.data : error.message);
    throw error;
  }
}

const getReportByTag = async (tag) => {
  try {
    const response = await apiClient.get(`/reports/tag/${tag}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching reports by tag:', error.response ? error.response.data : error.message);
    throw error;
  }
}



// Export the helper methods
export default boot(({ app }) => {
  app.config.globalProperties.$reports = {
    createReport,
    getAllReports,
    updateReport,
    deleteReport,
    getSingleReportById,
    downloadReport,
    getReportByGroup,
    getReportByUser,
    getReportByDate,
    getReportByStatus,
    getReportByType,
    getReportByTag
  }
})

export {
  createReport,
  getAllReports,
  updateReport,
  deleteReport,
  getSingleReportById,
  downloadReport,
  getReportByGroup,
  getReportByUser,
  getReportByDate,
  getReportByStatus,
  getReportByType,
  getReportByTag
}
