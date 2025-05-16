import { boot } from 'quasar/wrappers'
import axios from 'axios'
import Cookies from 'js-cookie';
import ip from './ips';

const uploadFiles = async ({ files, title, name, content, parent, approvalRequests }) => {
  const token = Cookies.get('authToken'); // Get the token from cookies
  const formData = new FormData();

  // Append all files to the 'files' field
  if (files.length > 0) {
    files.forEach((file) => {
      formData.append('files', file);
    });
  }

  // Append other form fields
  formData.append('title', title);
  formData.append('name', name);
  formData.append('content', JSON.stringify(content)); // Assuming content is an object or array
  formData.append('parent', parent); // Assuming parent is a string or object ID

  // Append ApprovalRequests
  if (approvalRequests && approvalRequests.length > 0) {
    formData.append('approvalRequests', JSON.stringify(approvalRequests));
  }

  try {
    const response = await axios.post(`${ip}/directories/create-file?authToken=${token}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error uploading files:', error);
    throw error;
  }
};

const uploadImages = async (files) => {
  const token = Cookies.get('authToken'); // Get the token from cookies
  const formData = new FormData();

  // Append all files to the 'files' field
  files.forEach((file) => {
    formData.append('files', file);
  });

  try {
    const response = await axios.post(`${ip}/directories/uppload-images-from-body?authToken=${token}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error uploading images:', error);
    throw error;
  }
};


const editFile = async ({ fileId, name, title, content, files }) => {
  const token = Cookies.get('authToken'); // Get the token from cookies
  const formData = new FormData();

  // Append file data
  formData.append('name', name);
  formData.append('title', title);
  formData.append('content', JSON.stringify(content));

  // Append files if any
  if (files && files.length > 0) {
    files.forEach((file) => {
      formData.append('files', file);
    });
  }

  try {
    const response = await axios.post(`${ip}/directories/edit-file/${fileId}?authToken=${token}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error editing file:', error);
    throw error;
  }
};


const createNewFileVersion = async ({ fileId, name, title, content, files, approvalRequests }) => {
  const token = Cookies.get('authToken'); // Get the token from cookies
  const formData = new FormData();

  // Append file data
  formData.append('fileId', fileId);
  formData.append('name', name);
  formData.append('title', title);
  formData.append('content', JSON.stringify(content));

  // Append files if any
  if (files && files.length > 0) {
    files.forEach((file) => {
      formData.append('files', file);
    });
  }

  // Append ApprovalRequests
  if (approvalRequests && approvalRequests.length > 0) {
    formData.append('approvalRequests', JSON.stringify(approvalRequests));
  }

  try {
    const response = await axios.post(`${ip}/directories/new-version?authToken=${token}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error creating new file version:', error);
    throw error;
  }
};

const compareFaces = async ({ image1, image2 }) => {
  const token = Cookies.get('authToken'); // Get the token from cookies
  const formData = new FormData();

  // Append images for cosine similarity request
  formData.append('files', image1);
  formData.append('files', image2);

  try {
    const response = await axios.post(`${ip}/facerecog/redirect`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error comparing faces:', error);
    throw error;
  }
};

export default boot(({ app }) => {
  // Make functions available globally via this.$editorCloudF in Vue components
  app.config.globalProperties.$editorCloudF = {
    uploadFiles,
    uploadImages,
    editFile,
    createNewFileVersion,
    compareFaces
  };
});

export { uploadFiles, uploadImages, editFile, createNewFileVersion, compareFaces };
