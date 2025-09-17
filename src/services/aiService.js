// AI Service for file analysis and renaming
import { analyzeWithLlama, getHealthInsights } from '../config/llama';

export class AIService {
  // Analyze file content and suggest a better name
  static async suggestFileName(fileContent, originalName, fileType) {
    try {
      // Analyze the content to extract key information
      const analysis = this.analyzeDocumentContent(fileContent);
      const date = this.extractDate(fileContent) || new Date().toISOString().slice(0, 10);
      const originalExt = originalName.split('.').pop();
      
      // Generate intelligent filename based on content analysis
      let suggestedName = this.generateIntelligentFileName(analysis, fileType, date, originalExt);
      
      // If we have a good suggestion, use it; otherwise try AI
      if (suggestedName && suggestedName !== originalName) {
        return suggestedName;
      }
      
      // Fallback to AI suggestion
      const prompt = `Analyze this medical document and suggest a descriptive, professional filename. 
      
      Original filename: ${originalName}
      File type: ${fileType}
      Document content preview: ${fileContent.substring(0, 500)}...
      
      Please suggest a filename that:
      1. Describes the medical content accurately
      2. Includes relevant medical terms
      3. Is professional and clear
      4. Uses proper medical naming conventions
      5. Includes date if mentioned in the document
      
      Return only the suggested filename without any explanation.`;

        const response = await AIService.callLlamaAPI(prompt, fileContent);
      
      // Clean up the response to get just the filename
      let aiSuggestedName = response.trim();
      
      // Remove any quotes or extra text
      aiSuggestedName = aiSuggestedName.replace(/^["']|["']$/g, '');
      aiSuggestedName = aiSuggestedName.replace(/^Suggested filename:?/i, '');
      aiSuggestedName = aiSuggestedName.replace(/^Filename:?/i, '');
      aiSuggestedName = aiSuggestedName.trim();
      
      // Ensure it has a proper extension
      if (!aiSuggestedName.includes('.')) {
        aiSuggestedName += `.${originalExt}`;
      }
      
      return aiSuggestedName || suggestedName || originalName;
    } catch (error) {
      console.error('Error suggesting filename:', error);
      // Fallback to intelligent naming
      const analysis = this.analyzeDocumentContent(fileContent);
      const date = this.extractDate(fileContent) || new Date().toISOString().slice(0, 10);
      const originalExt = originalName.split('.').pop();
      return this.generateIntelligentFileName(analysis, fileType, date, originalExt) || originalName;
    }
  }

  // Generate intelligent filename based on content analysis
  static generateIntelligentFileName(analysis, fileType, date, extension) {
    const dateStr = date.replace(/[\/\-]/g, '_');
    
    // Blood work files
    if (analysis.hasBloodWork) {
      if (/glucose|diabetes|sugar/i.test(analysis.content || '')) {
        return `Glucose_Test_${dateStr}.${extension}`;
      }
      if (/cholesterol|lipid/i.test(analysis.content || '')) {
        return `Cholesterol_Panel_${dateStr}.${extension}`;
      }
      if (/complete blood count|cbc/i.test(analysis.content || '')) {
        return `Complete_Blood_Count_${dateStr}.${extension}`;
      }
      if (/metabolic|chemistry/i.test(analysis.content || '')) {
        return `Metabolic_Panel_${dateStr}.${extension}`;
      }
      return `Blood_Test_Results_${dateStr}.${extension}`;
    }
    
    // Imaging files
    if (analysis.hasImaging) {
      if (/mri/i.test(analysis.content || '')) {
        if (/brain|head/i.test(analysis.content || '')) {
          return `Brain_MRI_${dateStr}.${extension}`;
        }
        if (/spine|back/i.test(analysis.content || '')) {
          return `Spine_MRI_${dateStr}.${extension}`;
        }
        if (/knee/i.test(analysis.content || '')) {
          return `Knee_MRI_${dateStr}.${extension}`;
        }
        return `MRI_Report_${dateStr}.${extension}`;
      }
      if (/ct|cat scan/i.test(analysis.content || '')) {
        if (/chest/i.test(analysis.content || '')) {
          return `Chest_CT_${dateStr}.${extension}`;
        }
        if (/abdomen|abdominal/i.test(analysis.content || '')) {
          return `Abdominal_CT_${dateStr}.${extension}`;
        }
        return `CT_Scan_${dateStr}.${extension}`;
      }
      if (/x.ray|xray/i.test(analysis.content || '')) {
        if (/chest/i.test(analysis.content || '')) {
          return `Chest_XRay_${dateStr}.${extension}`;
        }
        if (/bone|fracture/i.test(analysis.content || '')) {
          return `Bone_XRay_${dateStr}.${extension}`;
        }
        return `XRay_Report_${dateStr}.${extension}`;
      }
      if (/ultrasound/i.test(analysis.content || '')) {
        if (/heart|cardiac/i.test(analysis.content || '')) {
          return `Echocardiogram_${dateStr}.${extension}`;
        }
        if (/abdomen/i.test(analysis.content || '')) {
          return `Abdominal_Ultrasound_${dateStr}.${extension}`;
        }
        return `Ultrasound_Report_${dateStr}.${extension}`;
      }
      return `Medical_Imaging_${dateStr}.${extension}`;
    }
    
    // Cardiac files
    if (analysis.hasCardio) {
      if (/ecg|ekg/i.test(analysis.content || '')) {
        return `ECG_Report_${dateStr}.${extension}`;
      }
      if (/echocardiogram|echo/i.test(analysis.content || '')) {
        return `Echocardiogram_${dateStr}.${extension}`;
      }
      if (/stress test/i.test(analysis.content || '')) {
        return `Stress_Test_${dateStr}.${extension}`;
      }
      return `Cardiology_Report_${dateStr}.${extension}`;
    }
    
    // Neurological files
    if (analysis.hasNeuro) {
      if (/eeg/i.test(analysis.content || '')) {
        return `EEG_Report_${dateStr}.${extension}`;
      }
      if (/brain|neurological/i.test(analysis.content || '')) {
        return `Neurological_Assessment_${dateStr}.${extension}`;
      }
      return `Neuro_Report_${dateStr}.${extension}`;
    }
    
    // Lab results
    if (analysis.hasLab) {
      if (/urine/i.test(analysis.content || '')) {
        return `Urinalysis_${dateStr}.${extension}`;
      }
      if (/stool|fecal/i.test(analysis.content || '')) {
        return `Stool_Analysis_${dateStr}.${extension}`;
      }
      return `Lab_Results_${dateStr}.${extension}`;
    }
    
    // Generic medical document
    return `Medical_Report_${dateStr}.${extension}`;
  }

  // Analyze document content to extract key information
  static analyzeDocumentContent(content) {
    const analysis = {
      type: 'unknown',
      hasBloodWork: false,
      hasImaging: false,
      hasCardio: false,
      hasNeuro: false,
      hasLab: false,
      content: content
    };

    if (!content) return analysis;

    // Detect document type
    if (/blood|hemoglobin|hgb|rbc|wbc|platelet|glucose|cholesterol|bun|creatinine/i.test(content)) {
      analysis.type = 'blood_work';
      analysis.hasBloodWork = true;
    } else if (/mri|ct|x.ray|xray|ultrasound|scan|radiology|imaging/i.test(content)) {
      analysis.type = 'imaging';
      analysis.hasImaging = true;
    } else if (/heart|cardiac|ecg|ekg|echocardiogram|blood pressure|bp/i.test(content)) {
      analysis.type = 'cardiac';
      analysis.hasCardio = true;
    } else if (/brain|neurological|eeg|seizure|cognitive|neurology/i.test(content)) {
      analysis.type = 'neurological';
      analysis.hasNeuro = true;
    } else if (/lab|laboratory|test|result|value|normal|abnormal/i.test(content)) {
      analysis.type = 'lab_results';
      analysis.hasLab = true;
    }

    return analysis;
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

        const response = await AIService.callLlamaAPI(prompt, fileContent);
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

      const response = await AIService.callLlamaAPI(prompt, fileContext);
      return response;
    } catch (error) {
      console.error('Error answering health question:', error);
      return 'I can help you with health-related questions. What would you like to know about your medical files?';
    }
  }

  // Call Llama API with the correct format
  static async callLlamaAPI(prompt, fileContent = null) {
    try {
      console.log('Calling Llama API with prompt:', prompt);
      console.log('File content length:', fileContent ? fileContent.length : 0);

      // Try multiple API endpoints
      const apiEndpoints = [
        {
          url: 'https://api.llama.com/compat/v1/chat/completions',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${process.env.REACT_APP_LLAMA_API_KEY || 'LLM|1954928278408982|01y8_4hGELtC1fW6gs6reX8DDSE'}`
          },
          body: {
            messages: [
              {
                role: "system",
                content: `You are Dr. AI, a specialized medical AI assistant with expertise in analyzing medical documents and providing intelligent health insights. Your role is to:

1. ANALYZE medical documents thoroughly and provide specific, actionable insights
2. EXPLAIN complex medical terminology in simple, understandable language
3. IDENTIFY key findings, values, and patterns in medical data
4. PROVIDE context about what medical results mean for patient health
5. HIGHLIGHT important findings that need attention
6. SUGGEST relevant questions patients should ask their doctors
7. ALWAYS maintain a professional, empathetic, and helpful tone

Guidelines:
- Be specific and detailed in your analysis
- Focus on the actual content of the document provided
- Explain medical terms and concepts clearly
- Point out normal vs abnormal values when applicable
- Provide context about what findings mean for health
- Suggest appropriate follow-up actions
- Always recommend consulting healthcare providers for medical decisions
- Be encouraging and supportive while being informative

Remember: You are analyzing real medical documents, so be thorough, accurate, and helpful.`
              },
              {
                role: "user",
                content: fileContent ? `${prompt}\n\nDocument content:\n${fileContent}` : prompt
              }
            ],
            model: "Llama-4-Maverick-17B-128E-Instruct-FP8",
            temperature: 0.6,
            max_tokens: 2048
          }
        },
        {
          url: 'https://api.openai.com/v1/chat/completions',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${process.env.REACT_APP_OPENAI_API_KEY || 'sk-test'}`
          },
          body: {
            messages: [
              {
                role: "system",
                content: `You are Dr. AI, a specialized medical AI assistant with expertise in analyzing medical documents and providing intelligent health insights. Your role is to:

1. ANALYZE medical documents thoroughly and provide specific, actionable insights
2. EXPLAIN complex medical terminology in simple, understandable language
3. IDENTIFY key findings, values, and patterns in medical data
4. PROVIDE context about what medical results mean for patient health
5. HIGHLIGHT important findings that need attention
6. SUGGEST relevant questions patients should ask their doctors
7. ALWAYS maintain a professional, empathetic, and helpful tone

Guidelines:
- Be specific and detailed in your analysis
- Focus on the actual content of the document provided
- Explain medical terms and concepts clearly
- Point out normal vs abnormal values when applicable
- Provide context about what findings mean for health
- Suggest appropriate follow-up actions
- Always recommend consulting healthcare providers for medical decisions
- Be encouraging and supportive while being informative

Remember: You are analyzing real medical documents, so be thorough, accurate, and helpful.`
              },
              {
                role: "user",
                content: fileContent ? `${prompt}\n\nDocument content:\n${fileContent}` : prompt
              }
            ],
            model: "gpt-3.5-turbo",
            temperature: 0.6,
            max_tokens: 2048
          }
        }
      ];

      // Try each endpoint
      for (const endpoint of apiEndpoints) {
        try {
          console.log(`Trying API endpoint: ${endpoint.url}`);
          console.log('Request headers:', endpoint.headers);
          console.log('Request body:', JSON.stringify(endpoint.body, null, 2));
          
          const response = await fetch(endpoint.url, {
            method: 'POST',
            headers: endpoint.headers,
            body: JSON.stringify(endpoint.body)
          });

          console.log(`API response status: ${response.status}`);
          console.log('Response headers:', Object.fromEntries(response.headers.entries()));

          if (response.ok) {
            const result = await response.json();
            console.log('API response:', result);
            
            // Handle different response formats
            let aiResponse = '';
            if (result.choices && result.choices[0] && result.choices[0].message) {
              aiResponse = result.choices[0].message.content;
            } else if (result.content && result.content[0] && result.content[0].text) {
              aiResponse = result.content[0].text;
            } else if (result.text) {
              aiResponse = result.text;
            } else {
              console.error('Unexpected response format:', result);
              continue;
            }
            
            console.log('AI Response:', aiResponse);
            return aiResponse;
          } else {
            const errorText = await response.text();
            console.error(`API error response: ${errorText}`);
            console.error(`Status: ${response.status}, StatusText: ${response.statusText}`);
          }
        } catch (error) {
          console.error(`API endpoint error:`, error);
          console.error('Error details:', error.message, error.stack);
          continue;
        }
      }

      // If all APIs fail, throw error
      throw new Error('All AI APIs failed');
    } catch (error) {
      console.error('AI API error:', error);
      
      // Return error message instead of mock response
      return 'Sorry, I am unable to process your request at the moment. Please try again later.';
    }
  }

  // Mock responses removed - only real Llama API responses now

  // Fallback responses when API is not available - REMOVED
  // All responses now come from real Llama API only

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
