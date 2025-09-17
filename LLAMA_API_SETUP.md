# Llama API Setup Instructions

## Setting up Llama API for Document Analysis

To enable AI-powered document analysis and chat functionality, you need to set up the Llama API key.

### 1. Get your Llama API Key
- Visit [Llama API](https://api.llama.com)
- Sign up for an account
- Get your API key from the dashboard

### 2. Set Environment Variable
Create a `.env` file in the root directory and add:

```bash
REACT_APP_LLAMA_API_KEY=your_actual_api_key_here
```

### 3. Features Enabled with Llama API
- **Smart File Renaming**: AI analyzes document content and suggests better filenames
- **Document Analysis**: Get AI insights about your medical documents
- **Document Chat**: Ask questions about specific uploaded documents
- **Health Q&A**: Get AI responses about your health data

### 4. How it Works
1. Upload a medical document
2. AI analyzes the content and suggests a better filename
3. Click on any uploaded file to view details
4. Use the "Ask AI about this file" feature to chat with the document
5. Ask questions like:
   - "What are the key findings in this report?"
   - "What do these lab values mean?"
   - "Are there any concerning results?"
   - "What should I discuss with my doctor?"

### 5. API Model Used
- **Model**: Llama-4-Maverick-17B-128E-Instruct-FP8
- **Temperature**: 0.6 (balanced creativity and accuracy)
- **Max Tokens**: 2048
- **Top P**: 0.9
- **Frequency Penalty**: 1

### 6. Fallback Behavior
If the API key is not set or there's an error, the app will use intelligent fallback responses based on document content analysis.

### 7. Privacy & Security
- All API calls are made directly from your browser
- Document content is only sent to Llama API for analysis
- No data is stored on external servers except Supabase (your own database)
