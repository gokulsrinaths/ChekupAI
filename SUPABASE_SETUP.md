# Supabase Setup Guide for Chekup AI

## 1. Create Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Sign up/Login and create a new project
3. Choose a name: "chekup-ai"
4. Set a strong database password
5. Choose a region close to your users

## 2. Get Project Credentials

1. Go to your project dashboard
2. Navigate to Settings > API
3. Copy your:
   - Project URL
   - Anon public key

## 3. Set Environment Variables

Create a `.env` file in your project root:

```env
# Supabase Configuration
REACT_APP_SUPABASE_URL=your_supabase_project_url
REACT_APP_SUPABASE_ANON_KEY=your_supabase_anon_key

# Llama API Configuration
REACT_APP_LLAMA_API_URL=https://api.llama-api.com/analyze
REACT_APP_LLAMA_API_KEY=your_llama_api_key
```

## 4. Set Up Database Schema

1. Go to your Supabase project dashboard
2. Navigate to SQL Editor
3. Copy and paste the contents of `supabase-schema.sql`
4. Run the SQL script to create all tables and policies

## 5. Set Up Storage Buckets

1. Go to Storage in your Supabase dashboard
2. Create two buckets:
   - `medical-files` (private)
   - `profile-images` (private)

## 6. Configure Authentication

1. Go to Authentication > Settings
2. Enable email authentication
3. Configure your site URL (e.g., `http://localhost:3000` for development)
4. Add redirect URLs for your app

## 7. Update Supabase Config

Update `src/config/supabase.js` with your actual credentials:

```javascript
const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY;
```

## 8. Test the Integration

1. Start your React app: `npm start`
2. Try signing up with a new account
3. Upload a file to test storage
4. Check your Supabase dashboard to see the data

## 9. Production Deployment

1. Update environment variables with production URLs
2. Configure production redirect URLs in Supabase
3. Deploy your app to your hosting platform

## Database Tables Created

- `users` - User profiles and settings
- `medical_files` - Medical file metadata
- `family_members` - Family health data
- `audit_logs` - Activity tracking
- `ai_chats` - AI conversation history
- `healthcare_providers` - Provider connections

## Storage Buckets

- `medical-files` - Private medical file storage
- `profile-images` - User profile pictures

## Security Features

- Row Level Security (RLS) enabled on all tables
- Users can only access their own data
- Secure file upload with user-specific paths
- Audit logging for all actions
