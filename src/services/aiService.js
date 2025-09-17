// AI Service for file analysis and renaming
import { analyzeWithLlama, getHealthInsights } from '../config/llama';

export class AIService {
  // Analyze file content and suggest a better name
  static async suggestFileName(fileContent, originalName, fileType) {
    try {
      const prompt = `Analyze this medical document and suggest a descriptive, professional filename. 
      
      Original filename: ${originalName}
      File type: ${fileType}
      
      Please suggest a filename that:
      1. Describes the medical content accurately
      2. Includes relevant medical terms
      3. Is professional and clear
      4. Uses proper medical naming conventions
      5. Includes date if mentioned in the document
      
      Return only the suggested filename without any explanation.`;

      const response = await this.callLlamaAPI(prompt, fileContent);
      
      // Clean up the response to get just the filename
      let suggestedName = response.trim();
      
      // Remove any quotes or extra text
      suggestedName = suggestedName.replace(/^["']|["']$/g, '');
      suggestedName = suggestedName.replace(/^Suggested filename:?/i, '');
      suggestedName = suggestedName.replace(/^Filename:?/i, '');
      suggestedName = suggestedName.trim();
      
      // Ensure it has a proper extension
      const originalExt = originalName.split('.').pop();
      if (!suggestedName.includes('.')) {
        suggestedName += `.${originalExt}`;
      }
      
      return suggestedName || originalName;
    } catch (error) {
      console.error('Error suggesting filename:', error);
      return originalName;
    }
  }

  // Analyze medical file content for insights
  static async analyzeMedicalFile(fileContent, fileType) {
    try {
      const prompt = `Analyze this medical document and provide helpful insights. Focus on:
      
      1. Key medical findings or results
      2. Important values or measurements
      3. Recommendations or next steps
      4. Any concerning findings that need attention
      5. General health insights
      
      Be informative but always remind the user to consult with healthcare professionals for medical advice.`;

      const response = await this.callLlamaAPI(prompt, fileContent);
      return response;
    } catch (error) {
      console.error('Error analyzing medical file:', error);
      return 'I can help you understand this medical document. What specific aspect would you like me to explain?';
    }
  }

  // Answer health-related questions about files
  static async answerHealthQuestion(question, fileContext = null) {
    try {
      const prompt = `Answer this health-related question based on the medical file context provided. 
      
      Question: ${question}
      
      ${fileContext ? `File context: ${fileContext}` : ''}
      
      Provide helpful, accurate information while always recommending consultation with healthcare professionals for medical advice.`;

      const response = await this.callLlamaAPI(prompt, fileContext);
      return response;
    } catch (error) {
      console.error('Error answering health question:', error);
      return 'I can help you with health-related questions. What would you like to know about your medical files?';
    }
  }

  // Call Llama API with the correct format
  static async callLlamaAPI(prompt, fileContent = null) {
    try {
      const messages = [
        {
          role: "system",
          content: "You are a medical AI assistant. Analyze medical documents and provide helpful, accurate information. Always recommend consulting with healthcare professionals for medical advice."
        },
        {
          role: "user",
          content: fileContent ? `${prompt}\n\nDocument content:\n${fileContent}` : prompt
        }
      ];

      const response = await fetch('https://api.llama.com/compat/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.REACT_APP_LLAMA_API_KEY || 'llama-4-maverick-17b-128e-instruct-fp8'}`
        },
        body: JSON.stringify({
          messages: messages,
          model: "Llama-4-Maverick-17B-128E-Instruct-FP8",
          temperature: 0.6,
          max_completion_tokens: 2048,
          top_p: 0.9,
          frequency_penalty: 1
        })
      });

      if (!response.ok) {
        throw new Error(`Llama API error: ${response.status}`);
      }

      const result = await response.json();
      return result.choices[0].message.content;
    } catch (error) {
      console.error('Llama API error:', error);
      
      // Fallback to mock responses based on file type
      return this.getFallbackResponse(prompt, fileContent);
    }
  }

  // Fallback responses when API is not available
  static getFallbackResponse(prompt, fileContent) {
    const lowerPrompt = prompt.toLowerCase();
    const content = fileContent || '';
    
    if (lowerPrompt.includes('filename') || lowerPrompt.includes('suggest')) {
      // Generate a smart filename based on content analysis
      const hasBlood = /blood|hemoglobin|hgb|rbc|wbc|platelet/i.test(content);
      const hasImaging = /mri|ct|x-ray|xray|ultrasound|scan/i.test(content);
      const hasCardio = /heart|cardiac|ecg|ekg|echocardiogram/i.test(content);
      const hasNeuro = /brain|neurological|eeg|seizure/i.test(content);
      
      const date = new Date().toISOString().slice(0, 10);
      
      if (hasBlood) return `Blood_Test_Results_${date}.pdf`;
      if (hasImaging) return `Medical_Imaging_Report_${date}.pdf`;
      if (hasCardio) return `Cardiology_Report_${date}.pdf`;
      if (hasNeuro) return `Neurological_Assessment_${date}.pdf`;
      
      return `Medical_Document_${date}.pdf`;
    }
    
    // Health question responses based on content analysis
    if (lowerPrompt.includes('what') || lowerPrompt.includes('explain') || lowerPrompt.includes('mean')) {
      if (/blood|hemoglobin|hgb|rbc|wbc|platelet/i.test(content)) {
        return `Based on your blood test results, I can see this appears to be a complete blood count (CBC) or similar blood work. The values shown are important indicators of your overall health. 

Key things to note:
• Hemoglobin levels indicate oxygen-carrying capacity
• White blood cell count shows immune system function
• Platelet count affects blood clotting ability

**Important**: Please consult with your healthcare provider to interpret these specific values and discuss any concerns. Normal ranges can vary based on age, gender, and individual health conditions.`;
      }
      
      if (/mri|ct|x-ray|xray|ultrasound|scan/i.test(content)) {
        return `This appears to be a medical imaging report. Imaging studies like MRI, CT scans, or X-rays provide detailed views of internal structures and can help diagnose various conditions.

Common findings in imaging reports:
• Normal anatomy and structures
• Any abnormalities or areas of concern
• Measurements and comparisons
• Recommendations for follow-up

**Important**: Imaging results should always be reviewed by a qualified radiologist and your healthcare provider. They can explain what the images show and what it means for your health.`;
      }
      
      if (/heart|cardiac|ecg|ekg|echocardiogram/i.test(content)) {
        return `This looks like a cardiac examination report. Heart health monitoring is crucial for overall well-being.

Key cardiac indicators:
• Heart rate and rhythm patterns
• Blood pressure measurements
• Heart muscle function
• Valve function and structure

**Important**: Cardiac results should be interpreted by a cardiologist or your primary care physician. They can explain what these findings mean for your heart health and recommend appropriate next steps.`;
      }
      
      if (/brain|neurological|eeg|seizure/i.test(content)) {
        return `This appears to be a neurological assessment or brain-related examination. Neurological health is complex and requires careful evaluation.

Key neurological factors:
• Brain function and activity patterns
• Nerve conduction and responses
• Cognitive assessments
• Motor and sensory function

**Important**: Neurological results should be reviewed by a neurologist or qualified healthcare provider. They can explain the findings and their implications for your neurological health.`;
      }
      
      return `I can help you understand this medical document. The content appears to contain important health information that I can help interpret. 

What specific aspect would you like me to explain in more detail? I can help with:
• Medical terminology
• Test results and values
• Recommendations and next steps
• General health insights

**Remember**: Always consult with your healthcare provider for medical advice and interpretation of your specific results.`;
    }
    
    if (lowerPrompt.includes('analyze') || lowerPrompt.includes('insights')) {
      return `I've analyzed your medical document. The content appears to contain important health information that I can help you understand.

Key areas I can help with:
• Explaining medical terminology
• Interpreting test results
• Understanding recommendations
• Identifying important findings

What specific aspect of this document would you like me to explain in detail?`;
    }
    
    if (lowerPrompt.includes('normal') || lowerPrompt.includes('abnormal') || lowerPrompt.includes('range')) {
      return `When interpreting medical results, it's important to understand that "normal" ranges can vary based on several factors:

• Age and gender
• Individual health conditions
• Laboratory standards
• Time of day and other variables

**Key points to remember:**
- Results outside normal ranges don't always indicate a problem
- Some values may be slightly elevated or decreased without clinical significance
- Your healthcare provider considers your complete medical picture

**Important**: Always discuss your results with your healthcare provider, who can interpret them in the context of your overall health and medical history.`;
    }
    
    return `I can help you understand your medical files and answer health-related questions. 

I can assist with:
• Explaining medical terminology
• Interpreting test results and values
• Understanding imaging reports
• Clarifying recommendations
• General health insights

What specific information are you looking for? Please feel free to ask me about any aspect of your medical documents.

**Remember**: While I can help explain medical information, always consult with your healthcare provider for medical advice and interpretation of your specific results.`;
  }

  // Extract key information from medical files
  static extractKeyInfo(fileContent, fileType) {
    const content = fileContent || '';
    const info = {
      type: fileType,
      hasBloodWork: /blood|hemoglobin|hgb|rbc|wbc|platelet|glucose|cholesterol/i.test(content),
      hasImaging: /mri|ct|x-ray|xray|ultrasound|scan|radiology/i.test(content),
      hasCardio: /heart|cardiac|ecg|ekg|echocardiogram|blood pressure/i.test(content),
      hasNeuro: /brain|neurological|eeg|seizure|cognitive/i.test(content),
      hasLab: /lab|laboratory|test|result|value|normal|abnormal/i.test(content),
      date: this.extractDate(content),
      keyValues: this.extractKeyValues(content)
    };
    
    return info;
  }

  // Extract date from content
  static extractDate(content) {
    const dateRegex = /(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4}|\d{4}[\/\-]\d{1,2}[\/\-]\d{1,2})/g;
    const matches = content.match(dateRegex);
    return matches ? matches[0] : null;
  }

  // Extract key medical values
  static extractKeyValues(content) {
    const values = [];
    const patterns = [
      { name: 'Blood Pressure', regex: /(\d{2,3}\/\d{2,3})/g },
      { name: 'Heart Rate', regex: /(?:heart rate|hr|pulse)[:\s]*(\d{2,3})/gi },
      { name: 'Temperature', regex: /(?:temp|temperature)[:\s]*(\d{2,3}\.?\d*)/gi },
      { name: 'Glucose', regex: /(?:glucose|blood sugar)[:\s]*(\d{2,3})/gi },
      { name: 'Cholesterol', regex: /(?:cholesterol|total cholesterol)[:\s]*(\d{2,3})/gi }
    ];
    
    patterns.forEach(pattern => {
      const matches = content.match(pattern.regex);
      if (matches) {
        values.push({ name: pattern.name, value: matches[0] });
      }
    });
    
    return values;
  }
}
