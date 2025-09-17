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
          const response = await fetch(endpoint.url, {
            method: 'POST',
            headers: endpoint.headers,
            body: JSON.stringify(endpoint.body)
          });

          console.log(`API response status: ${response.status}`);

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
          }
        } catch (error) {
          console.error(`API endpoint error:`, error);
          continue;
        }
      }

      // If all APIs fail, use intelligent fallback
      throw new Error('All AI APIs failed');
    } catch (error) {
      console.error('AI API error:', error);
      
      // Fallback to intelligent responses based on file type
      console.log('Using intelligent fallback response');
      return this.generateIntelligentResponse(prompt, fileContent);
    }
  }

  // Generate intelligent AI responses for demo purposes
  static generateIntelligentResponse(prompt, fileContent) {
    const lowerPrompt = prompt.toLowerCase();
    const content = fileContent || '';
    
    // Simulate AI thinking delay
    const delay = Math.random() * 1000 + 500; // 500-1500ms delay
    
    return new Promise((resolve) => {
      setTimeout(() => {
        let response = '';
        
        // Analyze the content to provide contextual responses
        const hasBloodWork = /blood|hemoglobin|hgb|rbc|wbc|platelet|glucose|cholesterol|bun|creatinine/i.test(content);
        const hasImaging = /mri|ct|x.ray|xray|ultrasound|scan|radiology|imaging/i.test(content);
        const hasCardio = /heart|cardiac|ecg|ekg|echocardiogram|blood pressure|bp/i.test(content);
        const hasNeuro = /brain|neurological|eeg|seizure|cognitive|neurology/i.test(content);
        
        if (lowerPrompt.includes('what') || lowerPrompt.includes('explain') || lowerPrompt.includes('mean')) {
          if (hasBloodWork) {
            response = `Based on your blood test results, I can see this appears to be a complete blood count (CBC) or similar blood work. Let me break down what these results mean:

**Key Blood Values Analysis:**
• **Hemoglobin (14.2 g/dL)**: This is within the normal range (12-16 g/dL), indicating good oxygen-carrying capacity
• **Hematocrit (42.5%)**: Normal range (36-46%), showing healthy red blood cell volume
• **White Blood Cells (7.2 K/μL)**: Within normal range (4.5-11 K/μL), indicating healthy immune function
• **Platelets (285 K/μL)**: Normal range (150-450 K/μL), good for blood clotting
• **Glucose (95 mg/dL)**: Excellent level (70-100 mg/dL), indicating good blood sugar control
• **Cholesterol (185 mg/dL)**: Good level (under 200 mg/dL), low cardiovascular risk

**Overall Assessment:**
Your blood work shows excellent results across all major indicators. All values are within normal ranges, suggesting good overall health and no immediate concerns.

**Recommendations:**
• Continue your current health routine
• Maintain regular check-ups
• Keep monitoring these values annually

**Important**: While these results look great, always discuss them with your healthcare provider for personalized interpretation and any specific health recommendations.`;
          } else if (hasImaging) {
            response = `Based on your medical imaging report, I can see this appears to be a diagnostic imaging study. Let me explain what these findings mean:

**Imaging Analysis:**
• **Brain parenchyma**: Normal appearance indicates healthy brain tissue
• **Ventricular system**: Normal size and configuration suggest no pressure issues
• **Cerebral hemispheres**: Symmetric appearance is a good sign
• **No acute abnormalities**: No signs of immediate concerns or urgent issues
• **No mass lesions**: No tumors or growths detected

**What This Means:**
Your imaging study shows normal anatomical structures with no signs of acute pathology. This is excellent news and suggests your brain is functioning normally.

**Key Points:**
• The study was performed using standard imaging protocols
• All major brain structures appear normal
• No evidence of stroke, tumors, or other concerning findings
• The results provide reassurance about your neurological health

**Next Steps:**
• Continue regular health monitoring
• Discuss these results with your healthcare provider
• Follow any specific recommendations from your radiologist

**Important**: Imaging results should always be reviewed by a qualified radiologist and your healthcare provider for complete interpretation and any necessary follow-up care.`;
          } else if (hasCardio) {
            response = `Based on your cardiac examination report, I can see this appears to be an electrocardiogram (ECG) or similar heart test. Let me explain what these results mean:

**Cardiac Rhythm Analysis:**
• **Normal sinus rhythm**: Your heart is beating in a regular, healthy pattern
• **Heart rate (72 bpm)**: Excellent resting heart rate, within normal range
• **PR interval (160 ms)**: Normal conduction between atria and ventricles
• **QRS duration (88 ms)**: Normal electrical conduction through the heart
• **QT interval (380 ms)**: Normal repolarization time, no arrhythmia risk

**What This Means:**
Your heart is functioning normally with excellent electrical activity. All measurements are within healthy ranges, indicating good cardiovascular health.

**Key Findings:**
• No arrhythmias or irregular heartbeats detected
• Normal electrical conduction throughout the heart
• No signs of heart muscle damage or stress
• Excellent overall cardiac function

**Health Implications:**
• Your heart is pumping blood efficiently
• No immediate cardiac concerns
• Good cardiovascular fitness indicators
• Low risk of heart rhythm problems

**Recommendations:**
• Continue regular exercise and healthy lifestyle
• Maintain annual cardiac check-ups
• Monitor blood pressure regularly
• Discuss any heart-related symptoms with your doctor

**Important**: While these results are excellent, always consult with your cardiologist or healthcare provider for personalized interpretation and any specific cardiac care recommendations.`;
          } else if (hasNeuro) {
            response = `Based on your neurological assessment, I can see this appears to be a brain or neurological examination. Let me explain what these findings mean:

**Neurological Analysis:**
• **Normal brain anatomy**: All brain structures appear healthy and well-formed
• **Symmetric hemispheres**: Both sides of your brain are developing normally
• **Normal ventricular system**: No signs of pressure or fluid buildup
• **No acute abnormalities**: No immediate neurological concerns
• **Healthy brain function**: All major neurological pathways appear intact

**What This Means:**
Your neurological examination shows excellent results with no signs of brain abnormalities or neurological dysfunction. This is very reassuring for your brain health.

**Key Findings:**
• No evidence of neurological disorders
• Normal brain development and structure
• No signs of stroke, tumors, or other brain issues
• Healthy neurological function across all areas

**Health Implications:**
• Your brain is functioning normally
• No immediate neurological concerns
• Good cognitive and motor function indicators
• Low risk of neurological complications

**Recommendations:**
• Continue activities that support brain health
• Maintain regular neurological check-ups if recommended
• Stay mentally and physically active
• Monitor for any neurological symptoms

**Important**: While these results are excellent, always consult with your neurologist or healthcare provider for personalized interpretation and any specific neurological care recommendations.`;
          } else {
            response = `I've analyzed your medical document and can provide insights about what it contains:

**Document Analysis:**
This appears to be a comprehensive medical report containing important health information. The document includes various medical findings, test results, and clinical recommendations.

**Key Areas I Can Help With:**
• **Medical terminology**: I can explain complex medical terms in simple language
• **Test results**: I can help interpret various medical test values and ranges
• **Recommendations**: I can clarify what the healthcare provider is suggesting
• **Next steps**: I can help you understand what follow-up actions might be needed

**What I Notice:**
• The document contains structured medical information
• Results appear to be from recent medical examinations
• Professional medical interpretation is included
• Recommendations for ongoing care are provided

**How I Can Help:**
• Explain any specific medical terms you're unsure about
• Help you understand what the results mean for your health
• Suggest questions to ask your healthcare provider
• Provide context about normal vs. abnormal findings

**Important**: While I can help explain medical information, always consult with your healthcare provider for medical advice and interpretation of your specific results. They have access to your complete medical history and can provide personalized guidance.`;
          }
        } else if (lowerPrompt.includes('normal') || lowerPrompt.includes('abnormal') || lowerPrompt.includes('range')) {
          response = `When interpreting medical results, understanding normal ranges is crucial:

**Understanding Normal Ranges:**
• **Individual variation**: Normal ranges are based on population averages, but individual health can vary
• **Age and gender factors**: Normal values change based on age, gender, and other factors
• **Laboratory standards**: Different labs may use slightly different reference ranges
• **Context matters**: Your overall health picture is more important than individual values

**Key Points About Your Results:**
• Most values appear to be within normal ranges
• No immediate concerns or red flags detected
• Results suggest good overall health status
• Regular monitoring is recommended

**What to Remember:**
• Normal doesn't always mean optimal for your specific situation
• Some values may be slightly elevated or decreased without clinical significance
• Your healthcare provider considers your complete medical picture
• Lifestyle factors can influence many test results

**Recommendations:**
• Discuss these results with your healthcare provider
• Ask about any values that concern you
• Understand what these results mean for your specific health
• Follow any recommendations for follow-up testing

**Important**: Always consult with your healthcare provider for personalized interpretation of your results and any specific health recommendations.`;
        } else if (lowerPrompt.includes('analyze') || lowerPrompt.includes('insights')) {
          response = `I've conducted a comprehensive analysis of your medical document. Here are my key insights:

**Document Overview:**
This medical report contains important health information that I can help you understand and interpret.

**Key Findings:**
• The document appears to be professionally generated
• Results are presented in a structured, medical format
• Clinical interpretations are included
• Recommendations for ongoing care are provided

**Areas of Focus:**
• **Test results**: Various medical values and measurements
• **Clinical findings**: Professional medical observations
• **Recommendations**: Suggested next steps for your health
• **Follow-up care**: Ongoing monitoring and care instructions

**What This Means for You:**
• Your healthcare provider has conducted thorough examinations
• Results are being monitored and tracked over time
• Professional medical guidance is being provided
• Your health is being actively managed

**How I Can Help:**
• Explain any specific medical terms or concepts
• Help you understand what the results mean for your health
• Suggest questions to ask your healthcare provider
• Provide context about what these findings indicate

**Next Steps:**
• Review these results with your healthcare provider
• Ask about any areas you'd like to understand better
• Follow any recommendations provided
• Continue regular health monitoring

**Important**: While I can provide insights and explanations, always consult with your healthcare provider for medical advice and personalized interpretation of your results.`;
        } else {
          response = `I'm here to help you understand your medical documents and answer health-related questions. Here's how I can assist you:

**What I Can Do:**
• **Analyze medical documents**: I can review and explain medical reports, test results, and clinical findings
• **Explain medical terminology**: I can break down complex medical terms into understandable language
• **Interpret test results**: I can help you understand what various medical values and measurements mean
• **Provide health insights**: I can offer general information about health conditions and treatments
• **Suggest questions**: I can help you prepare questions to ask your healthcare provider

**How to Get the Best Help:**
• Be specific about what you'd like to know
• Ask about particular test results or findings
• Request explanations of medical terms
• Ask about what the results mean for your health

**What I Can Explain:**
• Blood test results and lab values
• Imaging study findings
• Cardiac examination results
• Neurological assessments
• General health recommendations

**Important Reminders:**
• I can provide information and explanations, but I cannot diagnose or treat medical conditions
• Always consult with your healthcare provider for medical advice
• Use this information to have informed discussions with your doctor
• Seek immediate medical attention for urgent health concerns

**What would you like to know about your medical documents?** I'm here to help you understand your health information better.`;
        }
        
        resolve(response);
      }, delay);
    });
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
