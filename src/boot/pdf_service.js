import { boot } from 'quasar/wrappers'
import axios from 'axios'
import Cookies from 'js-cookie'
import ip from './ips'

// Configuration
const config = {
  pdfServerUrl: ip ? `${ip}/pdf` : 'http://localhost:3000/pdf',
  isElectron: typeof window !== 'undefined' && !!window.electronAPI,
  timeout: 30000, // 30 second timeout
}

// Type checking utilities
const isFile = (file) => {
  return file instanceof File || file instanceof Blob
}

// Cookie management
const getCookie = async (name) => {
  try {
    if (!name || typeof name !== 'string') {
      throw new Error('Invalid cookie name')
    }

    return config.isElectron
      ? await window.electronAPI.getCookie(name)
      : Cookies.get(name)
  } catch (error) {
    throw new Error(`Failed to get cookie: ${error.message}`)
  }
}

// Custom error class
class PDFServiceError extends Error {
  constructor(message, status, details = null) {
    super(message)
    this.name = 'PDFServiceError'
    this.status = status
    this.details = details
  }
}

// PDF Service
const pdfService = {
  async updateSignature(pdfId, signatureFile) {
    if (!pdfId) {
      throw new PDFServiceError('PDF ID is required', 400)
    }

    if (!signatureFile || !isFile(signatureFile)) {
      throw new PDFServiceError('Invalid signature file provided', 400)
    }

    let token
    try {
      token = await getCookie('authToken')
      if (!token) {
        throw new PDFServiceError('Authentication token not found', 401)
      }
    } catch (error) {
      throw new PDFServiceError('Authentication failed', 401, error.message)
    }

    try {
      const formData = new FormData()
      formData.append('signature', signatureFile, signatureFile.name)

      // Build URL with auth token as query parameter
      const url = new URL(`${config.pdfServerUrl}/update/${pdfId}/signature`)
      url.searchParams.append('authToken', token)

      const response = await axios.put(
        url.toString(),
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
          timeout: config.timeout,
          validateStatus: status => status >= 200 && status < 300,
        }
      )
      console.log(response.data)
      return response.data

    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.response) {
          throw new PDFServiceError(
            error.response.data?.message || 'Signature update failed',
            error.response.status,
            error.response.data
          )
        } else if (error.request) {
          throw new PDFServiceError(
            'No response received from server',
            500,
            { timeout: error.code === 'ECONNABORTED' }
          )
        }
      }

      throw new PDFServiceError(
        'Failed to update signature',
        500,
        { error: error.message }
      )
    }
  },

  async convertPDF(file) {

    if (!file || !isFile(file)) {
      throw new PDFServiceError('Invalid file provided', 400)
    }

    let token
    try {
      token = await getCookie('authToken')
      if (!token) {
        throw new PDFServiceError('Authentication token not found', 401)
      }
    } catch (error) {
      throw new PDFServiceError('Authentication failed', 401, error.message)
    }

    try {
      const formData = new FormData()
      formData.append('pdf', file, file.name)

      // Build URL with auth token as query parameter
      const url = new URL(`${config.pdfServerUrl}/redirect-to-pdf-server`)
      url.searchParams.append('authToken', token)

      const response = await axios.post(
        url.toString(),
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
          timeout: config.timeout,
          validateStatus: status => status >= 200 && status < 300,
        }
      )

      return response.data

    } catch (error) {
      if (axios.isAxiosError(error)) {

        if (error.response) {
          throw new PDFServiceError(
            error.response.data?.message || 'PDF conversion failed',
            error.response.status,
            error.response.data
          )
        } else if (error.request) {
          throw new PDFServiceError(
            'No response received from server',
            500,
            { timeout: error.code === 'ECONNABORTED' }
          )
        }
      }

      throw new PDFServiceError(
        'Failed to process PDF',
        500,
        { error: error.message }
      )
    }
  },

  async getAllPDFs() {
    try {
      const token = await getCookie('authToken')
      if (!token) {
        throw new PDFServiceError('Authentication token not found', 401)
      }

      const url = new URL(`${config.pdfServerUrl}-get/get_all_current_user_pdfs`)
      url.searchParams.append('authToken', token)

      const response = await axios.get(url.toString(), { timeout: config.timeout })
      return response.data
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.response) {
          throw new PDFServiceError(
            error.response.data?.message || 'Failed to retrieve PDFs',
            error.response.status,
            error.response.data
          )
        }
      }
      throw new PDFServiceError('Failed to retrieve PDFs', 500, error.message)
    }
  },
  // Add to pdfService object
  async getCover(fileId) {
    try {
      const token = await getCookie('authToken');
      if (!token) {
        throw new PDFServiceError('Authentication token not found', 401);
      }

      const url = new URL(`${config.pdfServerUrl}-get/get_pdf_cover/${fileId}`);
      url.searchParams.append('authToken', token);

      const response = await axios.get(url.toString(), {
        timeout: config.timeout,
        responseType: 'text',
        headers: {
          'Accept': 'text/html'
        }
      });

      return response.data;

    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        throw new PDFServiceError(
          error.response.data?.message || 'Failed to retrieve cover',
          error.response.status,
          error.response.data
        );
      }
      throw new PDFServiceError('Failed to retrieve cover', 500, error.message);
    }
  },


  async getSinglePDF(id) {
    try {
      const token = await getCookie('authToken')
      if (!token) {
        throw new PDFServiceError('Authentication token not found', 401)
      }
      const url = new URL(`${config.pdfServerUrl}-get/get_single_pdf/${id}`)
      url.searchParams.append('authToken', token)
      const response = await axios.get(url.toString(), { timeout: config.timeout })
      return response.data
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        throw new PDFServiceError(
          error.response.data?.message || 'Failed to retrieve PDF',
          error.response.status,
          error.response.data
        )
      }
      throw new PDFServiceError('Failed to retrieve PDF', 500, error.message)
    }
  },
  async getPDFPages(pdfId, page = 1) {
    try {
      const token = await getCookie('authToken')
      if (!token) {
        throw new PDFServiceError('Authentication token not found', 401)
      }

      const url = new URL(`${config.pdfServerUrl}-get/pdf_pages/${pdfId}`)
      url.searchParams.append('authToken', token)
      url.searchParams.append('page', page)

      const response = await axios.get(url.toString(), {
        timeout: config.timeout,
        headers: {
          'Accept': 'application/json'
        }
      })

      return response.data
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        throw new PDFServiceError(
          error.response.data?.message || 'Failed to retrieve PDF pages',
          error.response.status,
          error.response.data
        )
      }
      throw new PDFServiceError('Failed to retrieve PDF pages', 500, error.message)
    }
  }
}

// Export boot file
export default boot(({ app }) => {
  // Add PDF service to app instance
  app.config.globalProperties.$pdf_service = {
    ...pdfService,
  }
})

// Export service and types for Composition API
export {
  pdfService,
  PDFServiceError,
  config
}
