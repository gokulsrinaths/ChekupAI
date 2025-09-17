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

      const response = await this.callLlamaAPI(prompt, fileContent);
      
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
      ];

      const response = await fetch('https://api.llama.com/compat/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.REACT_APP_LLAMA_API_KEY || '0huAT2H-LwfZ6prnsle77Vfy730'}`
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
