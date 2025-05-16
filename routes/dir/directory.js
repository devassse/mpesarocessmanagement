const express = require('express');
const multer = require('multer');

const createDirectory = require('../../controllers/dir/create_dir');
const createFile = require('../../controllers/dir/create_file');
const getRootItems = require('../../controllers/dir/get_root');
const getDirectoryById = require('../../controllers/dir/get_dir');
const getFileById = require('../../controllers/dir/get_file');
const deleteFile = require('../../controllers/dir/delete_file');
const getUploadedFileById = require('../../controllers/dir/get_uploaded_file');
const deleteUploadedFileById = require('../../controllers/dir/delete_uploaded_file.js');
const deleteDirectory = require('../../controllers/dir/delete_dir');
const getDirectories = require('../../controllers/dir/getDirectoryStructure.js');
const uppload_images_from_body = require('../../controllers/dir/uppload_image_from_body.js');
const deleteGridFSFileIds = require('../../controllers/dir/delete_file_attachments.js');
const editFile = require('../../controllers/dir/edit_file.js');
const approveFile = require('../../controllers/dir/approve_file.js');
const createNewFileVersion = require('../../controllers/dir/create_new_version.js');
const getAllVersions = require('../../controllers/dir/get_all_versions.js');
const getDirectoriesByGroup = require('../../controllers/dir/get_dir_by_group.js');
const getUnassociatedRootDirectories = require('../../controllers/dir/get_unassociated_root_dir.js');
const deleteGroup = require('../../controllers/roles/delete_group.js');
const { requireAdmin } = require('../../middleware/permission_check.js');

const storage = multer.memoryStorage(); // Store files in memory before processing
const upload = multer({ storage });
const dirRouter = express.Router();

dirRouter.post('/create-dir', createDirectory);
dirRouter.post('/create-file', upload.array('files', 10), createFile); // Accept up to 10 files
dirRouter.post('/edit-file/:fileId', upload.array('files', 10), editFile); // Accept up to 10 files
dirRouter.post("/uppload-images-from-body", upload.array('files', 10), uppload_images_from_body)
// Read root directories and files
dirRouter.get('/root-items', getRootItems);

// Get specific directory by ID
dirRouter.get('/directory/:id', getDirectoryById);

// Get specific file by ID
dirRouter.get('/file/:id', getFileById);

dirRouter.post('/delete-file-attachments', deleteGridFSFileIds)


// Delete uploaded file
dirRouter.delete('/uploaded-file/:id', deleteUploadedFileById);

// Soft delete specific file by ID
dirRouter.delete('/file/:id', deleteFile);

dirRouter.delete('/directory/:id', deleteDirectory);

dirRouter.get('/directory-structure', getDirectories)
dirRouter.post('/:fileId/approval-requests/:requestId', approveFile)
dirRouter.post('/new-version', upload.array('files', 10), createNewFileVersion);
dirRouter.get('/file-versions/:fileId', getAllVersions)

dirRouter.get("/get-directories-by-group/:groupId", getDirectoriesByGroup)
dirRouter.get('/unassociated-root-directories/:groupId',getUnassociatedRootDirectories)
dirRouter.post('/delete-group', requireAdmin, deleteGroup)

module.exports = dirRouter;
