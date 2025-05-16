const express = require('express');
const createNewGroup = require('../../controllers/roles/create_group_role');
const addUsersToGroup = require('../../controllers/roles/add_users_to_group');
const addDirectoryToGroup = require('../../controllers/roles/add_dir_to_group');
const removeGroupFromDirectory = require('../../controllers/roles/remove_group_from_dir');
const assignRolesToUser = require('../../controllers/roles/assign_roles_user');
const get_current_user_roles = require('../../controllers/roles/get_user_roles');
const get_current_user_groups = require('../../controllers/roles/get_current_user_groups');
const getFolderGroupsAndMembers = require('../../controllers/roles/get_folder_group_members');
const get_user_roles_groups = require('../../controllers/roles/get_users_roles_groups');
const get_user_by_username = require('../../controllers/roles/get_user_by_username');
const get_all_groups = require('../../controllers/roles/get_all_groups');
const createGroupInDirectory = require('../../controllers/roles/from_directory/create_group_in_dir');
const get_current_directory_groups_user_in = require('../../controllers/roles/from_directory/get_current_directory_groups');
const getAllUsersInCurrentDirectoryGroup = require('../../controllers/roles/from_directory/get_all_users_in_current_dir');
const getAllGroupsAndChildrenInDirectory = require('../../controllers/roles/from_directory/get_all_current_dir_groups_n_childs');
const addUsersToGroupFromDirectory = require('../../controllers/roles/from_directory/add_users_to_groups_from_directory');
const getUsersInGroup = require('../../controllers/roles/from_directory/get_users_in_group');
const addDirectoryToGroupFromDir = require('../../controllers/roles/from_directory/from_dir_add_directory_to_group');
const getApprovers = require('../../controllers/roles/from_directory/get_approvers');
const fromGCaddGroupToDirectory = require('../../controllers/roles/from_GC_add_group_to_dir');
const get_user_logs = require('../../controllers/roles/user_log/get');
const get_approval_res = require('../../controllers/roles/get_approval_responses');
const get_approval_request = require('../../controllers/roles/get_approval_request');
const { requireAdmin, requireAdminOrAuditLog } = require('../../middleware/permission_check');
const get_all_users = require('../../controllers/roles/get_list_of_users');
const removeUserFromGroup = require('../../controllers/roles/remove-user-from-group');
const { deactivateUser, activateUser } = require('../../controllers/roles/user_status');

const rolesRouter = express.Router(); 

rolesRouter.post('/create-group',requireAdmin, createNewGroup);
rolesRouter.post('/add-users-to-group', requireAdmin, addUsersToGroup);
rolesRouter.post('/add-directory-to-group', requireAdmin, addDirectoryToGroup);
rolesRouter.post('/remove-group-from-directory', removeGroupFromDirectory);
rolesRouter.post('/assign-roles-to-user',requireAdmin, assignRolesToUser);
rolesRouter.get("/get-current-user-role", get_current_user_roles)
rolesRouter.get("/get-current-user-groups", get_current_user_groups)
rolesRouter.get("/get-current-directory-group-members", getFolderGroupsAndMembers)
rolesRouter.get("/get-user-roles-groups", requireAdmin, get_user_roles_groups)
rolesRouter.get("/get-user-by-username", requireAdmin, get_user_by_username)
rolesRouter.get("/get-all-groups",requireAdmin, get_all_groups)
rolesRouter.post("/create-group-in-directory", createGroupInDirectory)
rolesRouter.get("/get-current-directory-groups-user-in", get_current_directory_groups_user_in)
rolesRouter.get("/get-all-users-in-current-directory", getAllUsersInCurrentDirectoryGroup)
rolesRouter.get("/get-all-groups-children-in-directory", getAllGroupsAndChildrenInDirectory)
rolesRouter.post("/add-users-to-group-from-directory", addUsersToGroupFromDirectory)
rolesRouter.get("/groups/:groupId/users", getUsersInGroup)
rolesRouter.post("/add-dir-to-group-from-directory", addDirectoryToGroupFromDir)
rolesRouter.get("/get-approvers/:dirId", getApprovers)
rolesRouter.post("/add-group-to-directory", requireAdmin, fromGCaddGroupToDirectory)
rolesRouter.get('/get-users-logs', requireAdminOrAuditLog, get_user_logs)
rolesRouter.get("/approval-responses", get_approval_res)
rolesRouter.get('/approver-requests', get_approval_request)
// -------------- Not used
rolesRouter.get("/get-all-users", requireAdmin, get_all_users)
// ------------------
rolesRouter.post("/remove-user-from-group", removeUserFromGroup);
rolesRouter.patch('/activate/:username', activateUser);
rolesRouter.patch('/deactivate/:username', deactivateUser);

module.exports = rolesRouter;
