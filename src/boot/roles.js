
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


// Helper methods for roles

// Create a group
const createGroup = async (data) => {
  try {
    console.log(data);
    const response = await apiClient.post('/roles/create-group', data);
    return response.data;
  } catch (error) {
    console.error('Error creating group:', error.response ? error.response.data : error.message);
    throw error;
  }
};

const addUsersToGroups = async (data) => {
  try {
    const response = await apiClient.post('/roles/add-users-to-group', data);
    return response.data;
  } catch (error) {
    console.error('Error adding users to groups:', error.response ? error.response.data : error.message);
    throw error;
  }
};

// Add a directory to a group
const addDirectoryToGroup = async (data) => {
  try {
    const response = await apiClient.post('/roles/add-directory-to-group', data);
    return response.data;
  } catch (error) {
    console.error('Error adding directory to group:', error.response ? error.response.data : error.message);
    throw error;
  }
};

// Remove a group from a directory
const removeGroupFromDirectory = async (data) => {
  try {
    const response = await apiClient.post('/roles/remove-group-from-directory', data);
    return response.data;
  } catch (error) {
    console.error('Error removing group from directory:', error.response ? error.response.data : error.message);
    throw error;
  }
};

// Assign roles to a user
const assignRolesToUser = async (data) => {
  try {
    const response = await apiClient.post('/roles/assign-roles-to-user', data);
    return response.data;
  } catch (error) {
    console.error('Error assigning roles to user:', error.response ? error.response.data : error.message);
    throw error;
  }
};

// Get current user's roles
const getCurrentUserRoles = async () => {
  try {
    const response = await apiClient.get('/roles/get-current-user-role');
    return response.data;
  } catch (error) {
    console.error('Error fetching current user roles:', error.response ? error.response.data : error.message);
    throw error;
  }
};

const getCurrentUserGroups = async () => {
  try {
    const response = await apiClient.get('/roles/get-current-user-groups');
    return response.data;
  } catch (error) {
    console.error('Error fetching current user roles:', error.response ? error.response.data : error.message);
    throw error;
  }
};

const getUserRolesAndGroups = async (page = 1) => {
  try {
    const response = await apiClient.get('/roles/get-user-roles-groups', { params: { page } });
    return response.data;
  } catch (error) {
    console.error('Error fetching user roles and groups:', error.response ? error.response.data : error.message);
    throw error;
  }
};

const getUserByUsername = async (username) => {
  try {
    const token = Cookies.get('authToken');
    if (!token) {
      throw new Error('Authentication token not found');
    }

    const response = await apiClient.get('/roles/get-user-by-username', {
      params: {
        username: username,
        authToken: token
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching user details:', error.response ? error.response.data : error.message);
    throw error;
  }
};




const getAllGroups = async () => {
  try {
    const response = await apiClient.get('/roles/get-all-groups');
    return response.data;
  } catch (error) {
    console.error('Error fetching all groups:', error.response ? error.response.data : error.message);
    throw error;
  }
};


const createGroupInDirectory = async (directoryId, groupData) => {
  try {
    const response = await apiClient.post('/roles/create-group-in-directory', groupData, {
      params: { directoryId }
    });
    return response.data;
  } catch (error) {
    console.error('Error creating group in directory:', error.response ? error.response.data : error.message);
    throw error;
  }
};


const get_current_directory_groups_user_in = async (directoryId) => {
  try {
    const response = await apiClient.get('/roles/get-current-directory-groups-user-in', {
      params: { directoryId }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching current directory groups:', error.response ? error.response.data : error.message);
    throw error;
  }
};

const getAllUsersInCurrentDirectoryGroup = async (directoryId) => {
  try {
    const response = await apiClient.get('/roles/get-all-users-in-current-directory', {
      params: { directoryId }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching all users in current directory group:', error.response ? error.response.data : error.message);
    throw error;
  }
};

const getAllGroupsAndChildrenInDirectory = async (directoryId) => {
  try {
    const response = await apiClient.get('/roles/get-all-groups-children-in-directory', {
      params: { directoryId }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching all groups and children in directory:', error.response ? error.response.data : error.message);
    if (error.response) {
      if (error.response.status === 400) {
        throw new Error('Invalid directory ID');
      } else if (error.response.status === 404) {
        throw new Error('Directory not found');
      } else if (error.response.status === 403) {
        throw new Error('You do not have permission to view groups in this directory');
      }
    }
    throw new Error('Internal server error');
  }
};


const addUsersToGroupFromDirectory = async (directoryId, groupId, userIds) => {
  try {
    const response = await apiClient.post('/roles/add-users-to-group-from-directory',
      { groupId, userIds },
      { params: { directoryId } }
    );
    return response.data;
  } catch (error) {
    console.error('Error adding users to group:', error.response ? error.response.data : error.message);
    throw error;
  }
};

const getUsersInGroup = async (groupId, page = 1, limit = 10) => {
  try {
    const response = await apiClient.get(`/roles/groups/${groupId}/users`, {
      params: { page, limit }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching users in group:', error.response ? error.response.data : error.message);
    throw error;
  }
};

const addDirToGroupFromDirectory = async (directoryId, groupId, subDirectoryId) => {
  try {
    const response = await apiClient.post('/roles/add-dir-to-group-from-directory', {
      directoryId,
      groupId,
      subDirectoryId
    });
    return response.data;
  } catch (error) {
    console.error('Error adding directory to group:', error.response ? error.response.data : error.message);
    throw error;
  }
};

// function to get approvers for a file
const getApprovers = async (dirId) => {
  try {
    const response = await apiClient.get(`/roles/get-approvers/${dirId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching approvers for file:', error.response ? error.response.data : error.message);
    throw error;
  }
};

// From GC
const addGroupToDirectory = async (groupId, directoryId) => {
  try {
    const response = await apiClient.post('/roles/add-group-to-directory', {
      groupId,
      directoryId
    });
    return response.data;
  } catch (error) {
    console.error('Error adding group to directory:', error.response ? error.response.data : error.message);
    throw error;
  }
};


const getUserLogs = async (page = 1, limit = 20, options = {}) => {
  try {
    const {
      fromDate,
      toDate,
      userSearch,
      filter,
      sortBy,
      descending
    } = options;

    const params = {
      page,
      limit,
      ...(fromDate && { fromDate }),
      ...(toDate && { toDate }),
      ...(userSearch && { userSearch }),
      ...(filter && { filter }),
      ...(sortBy && { sortBy }),
      ...(descending !== undefined && { descending: descending.toString() })
    };

    const response = await apiClient.get('/roles/get-users-logs', { params });
    return response.data;
  } catch (error) {
    console.error('Error fetching user logs:', error.response ? error.response.data : error.message);
    throw error;
  }
};


// New function to get approval responses
const getApprovalResponses = async () => {
  try {
    const response = await apiClient.get('/roles/approval-responses');
    return response.data;
  } catch (error) {
    console.error('Error fetching approval responses:', error);
    throw error;
  }
};

const getApproverRequests = async () => {
  try {
    const response = await apiClient.get('/roles/approver-requests');
    return response.data;
  } catch (error) {
    console.error('Error fetching approver requests:', error);
    throw error;
  }
};


const getAllUsers = async () => {
  try {
    const response = await apiClient.get('/roles/get-all-users');
    return response.data;
  } catch (error) {
    console.error('Error fetching all users:', error.response ? error.response.data : error.message);
    throw error;
  }
};

const removeUserFromGroup = async (groupName, username) => {
  try {
    const response = await apiClient.post('/roles/remove-user-from-group', { groupName, username });
    return response.data;
  } catch (error) {
    console.error('Error removing user from group:', error.response ? error.response.data : error.message);
    throw error;
  }
};

const activateUser = async (username) => {
  try {
    const response = await apiClient.patch(`/roles/activate/${username}`);
    return response.data;
  } catch (error) {
    console.error('Error activating user:', error.response ? error.response.data : error.message);
    throw error;
  }
};

const deactivateUser = async (username) => {
  try {
    const response = await apiClient.patch(`/roles/deactivate/${username}`);
    return response.data;
  } catch (error) {
    console.error('Error deactivating user:', error.response ? error.response.data : error.message);
    throw error;
  }
};





// Export the helper methods
export default boot(({ app }) => {
  // Add methods to the app instance
  app.config.globalProperties.$roles = {
    deactivateUser,
    activateUser,
    getAllUsers,
    getApproverRequests,
    getApprovalResponses,
    getUserLogs,
    getUsersInGroup,
    getAllGroupsAndChildrenInDirectory,
    getAllUsersInCurrentDirectoryGroup,
    createGroup,
    addUsersToGroups,
    addDirectoryToGroup,
    removeGroupFromDirectory,
    assignRolesToUser,
    getCurrentUserRoles,
    getCurrentUserGroups,
    getUserRolesAndGroups,
    getUserByUsername,
    getAllGroups,
    createGroupInDirectory,
    get_current_directory_groups_user_in,
    addUsersToGroupFromDirectory,
    addDirToGroupFromDirectory,
    getApprovers,
    addDirToGroupFromDirectory,
    addGroupToDirectory,
    removeUserFromGroup
  }
})

export {
  deactivateUser,
  activateUser,
  getApproverRequests,
  createGroup,
  addUsersToGroups,
  addDirectoryToGroup,
  removeGroupFromDirectory,
  assignRolesToUser,
  getCurrentUserRoles,
  getCurrentUserGroups,
  getUserRolesAndGroups,
  getUserByUsername,
  getAllGroups,
  createGroupInDirectory,
  get_current_directory_groups_user_in,
  getAllGroupsAndChildrenInDirectory,
  getAllUsersInCurrentDirectoryGroup,
  addUsersToGroupFromDirectory,
  addDirToGroupFromDirectory,
  getApprovers,
  addGroupToDirectory,
  getUserLogs,
  getApprovalResponses,
  getAllUsers,
  removeUserFromGroup
}
