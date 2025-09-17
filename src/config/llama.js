// Llama API Configuration
export const LLAMA_CONFIG = {
  // Replace with your actual Llama API endpoint and key
  API_URL: 'https://api.llama-api.com/analyze',
  API_KEY: 'YOUR_LLAMA_API_KEY', // Replace with actual API key
  
  // Fallback for when API is not available
  FALLBACK_RESPONSES: {
    medical_document: 'I can help you understand this medical document. The content appears to contain health information that I can help interpret. What specific aspect would you like me to explain?',
    imaging: 'This appears to be a medical imaging file. I can help you understand the results and what they might indicate. What would you like to know about it?',
    lab_results: 'These look like laboratory test results. I can help you understand what these values mean and whether they are within normal ranges. What specific tests would you like me to explain?',
    notes: 'This appears to be medical notes or documentation. I can help you understand the medical terminology and what the information means for your health. What would you like me to clarify?'
  }
};

// Function to analyze medical files with Llama API
export const analyzeWithLlama = async (fileContent, fileType) => {
  try {
    const response = await fetch(LLAMA_CONFIG.API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${LLAMA_CONFIG.API_KEY}`
      },
      body: JSON.stringify({
        file_content: fileContent,
        file_type: fileType,
        analysis_type: 'medical_document',
        prompt: 'Analyze this medical document and provide helpful insights about the health information contained within. Focus on explaining medical terms in simple language and highlighting important findings.'
      })
    });
    
    if (!response.ok) {
      throw new Error(`API request failed: ${response.status}`);
    }
    
    const result = await response.json();
    return result.analysis || result.response || 'Analysis completed successfully.';
    
  } catch (error) {
    console.error('Llama API error:', error);
    
    // Return fallback response based on file type
    const fallbackKey = fileType.toLowerCase().replace(/\s+/g, '_');
    return LLAMA_CONFIG.FALLBACK_RESPONSES[fallbackKey] || LLAMA_CONFIG.FALLBACK_RESPONSES.medical_document;
  }
};

// Function to get health insights from Llama API
export const getHealthInsights = async (query, fileContext = null) => {
  try {
    const response = await fetch(LLAMA_CONFIG.API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${LLAMA_CONFIG.API_KEY}`
      },
      body: JSON.stringify({
        query: query,
        context: fileContext,
        analysis_type: 'health_consultation',
        prompt: 'Provide helpful health information and insights. Be informative but always recommend consulting with healthcare professionals for medical advice.'
      })
    });
    
    if (!response.ok) {
      throw new Error(`API request failed: ${response.status}`);
    }
    
    const result = await response.json();
    return result.response || result.analysis || 'I can help you with health-related questions. What would you like to know?';
    
  } catch (error) {
    console.error('Llama API error:', error);
    return 'I can help you with health-related questions. What would you like to know about your medical files?';
  }
};
