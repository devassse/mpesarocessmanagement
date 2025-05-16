import axios from "axios";

async function getIframeCss() {

  try {
      const response = await axios.get('/iframeCss/iframe.css');
      return response.data;
  } catch (error) {
      console.error('Error fetching iframe.css:', error);
      throw error;
  }
}


export default getIframeCss
