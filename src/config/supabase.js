import { createClient } from '@supabase/supabase-js';

// Supabase configuration
const supabaseUrl = process.env.REACT_APP_SUPABASE_URL || 'https://xwzxdnsutgwzutipehof.supabase.co';
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh3enhkbnN1dGd3enV0aXBlaG9mIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgxNDIzMDAsImV4cCI6MjA3MzcxODMwMH0.-fuWiyuYXHrVqpqRkQw4F1qmUzb9brJnJxWfM4kQZOI';

// Create Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Database table names
export const TABLES = {
  USERS: 'users',
  FILES: 'medical_files',
  FAMILY_MEMBERS: 'family_members',
  AUDIT_LOGS: 'audit_logs',
  AI_CHATS: 'ai_chats'
};

// Storage bucket names
export const STORAGE_BUCKETS = {
  MEDICAL_FILES: 'medical-files',
  PROFILE_IMAGES: 'profile-images'
};

// Authentication helpers
export const auth = {
  // Sign up new user
  async signUp(email, password, userData = {}) {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: userData
        }
      });
      
      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Sign up error:', error);
      return { data: null, error };
    }
  },

  // Sign in user
  async signIn(email, password) {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      
      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Sign in error:', error);
      return { data: null, error };
    }
  },

  // Sign out user
  async signOut() {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      return { error: null };
    } catch (error) {
      console.error('Sign out error:', error);
      return { error };
    }
  },

  // Get current user
  async getCurrentUser() {
    try {
      const { data: { user }, error } = await supabase.auth.getUser();
      if (error) throw error;
      return { user, error: null };
    } catch (error) {
      console.error('Get user error:', error);
      return { user: null, error };
    }
  },

  // Listen to auth changes
  onAuthStateChange(callback) {
    return supabase.auth.onAuthStateChange(callback);
  }
};

// File storage helpers
export const storage = {
  // Upload file to Supabase storage
  async uploadFile(file, userId, filePath) {
    try {
      const { data, error } = await supabase.storage
        .from(STORAGE_BUCKETS.MEDICAL_FILES)
        .upload(`${userId}/${filePath}`, file);
      
      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Upload error:', error);
      return { data: null, error };
    }
  },

  // Get file URL
  async getFileUrl(filePath) {
    try {
      const { data, error } = await supabase.storage
        .from(STORAGE_BUCKETS.MEDICAL_FILES)
        .createSignedUrl(filePath, 3600); // 1 hour expiry
      
      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Get URL error:', error);
      return { data: null, error };
    }
  },

  // Delete file
  async deleteFile(filePath) {
    try {
      const { data, error } = await supabase.storage
        .from(STORAGE_BUCKETS.MEDICAL_FILES)
        .remove([filePath]);
      
      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Delete error:', error);
      return { data: null, error };
    }
  }
};

// Database helpers
export const database = {
  // Get user files
  async getUserFiles(userId) {
    try {
      const { data, error } = await supabase
        .from(TABLES.FILES)
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Get files error:', error);
      return { data: null, error };
    }
  },

  // Add new file record
  async addFile(fileData) {
    try {
      const { data, error } = await supabase
        .from(TABLES.FILES)
        .insert([fileData])
        .select();
      
      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Add file error:', error);
      return { data: null, error };
    }
  },

  // Update file
  async updateFile(fileId, updates) {
    try {
      const { data, error } = await supabase
        .from(TABLES.FILES)
        .update(updates)
        .eq('id', fileId)
        .select();
      
      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Update file error:', error);
      return { data: null, error };
    }
  },

  // Delete file
  async deleteFile(fileId) {
    try {
      const { data, error } = await supabase
        .from(TABLES.FILES)
        .delete()
        .eq('id', fileId);
      
      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Delete file error:', error);
      return { data: null, error };
    }
  },

  // Get family members
  async getFamilyMembers(userId) {
    try {
      const { data, error } = await supabase
        .from(TABLES.FAMILY_MEMBERS)
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Get family members error:', error);
      return { data: null, error };
    }
  },

  // Add family member
  async addFamilyMember(memberData) {
    try {
      const { data, error } = await supabase
        .from(TABLES.FAMILY_MEMBERS)
        .insert([memberData])
        .select();
      
      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Add family member error:', error);
      return { data: null, error };
    }
  },

  // Add audit log
  async addAuditLog(logData) {
    try {
      const { data, error } = await supabase
        .from(TABLES.AUDIT_LOGS)
        .insert([logData]);
      
      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Add audit log error:', error);
      return { data: null, error };
    }
  },

  // Get audit logs
  async getAuditLogs(userId) {
    try {
      const { data, error } = await supabase
        .from(TABLES.AUDIT_LOGS)
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Get audit logs error:', error);
      return { data: null, error };
    }
  },

  // Get user profile
  async getUserProfile(userId) {
    try {
      const { data, error } = await supabase
        .from(TABLES.USERS)
        .select('*')
        .eq('id', userId)
        .single();
      
      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Get user profile error:', error);
      return { data: null, error };
    }
  },

  // Update user profile
  async updateUserProfile(userId, updates) {
    try {
      const { data, error } = await supabase
        .from(TABLES.USERS)
        .update(updates)
        .eq('id', userId)
        .select();
      
      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Update user profile error:', error);
      return { data: null, error };
    }
  },

  // Add AI chat to database
  async addAIChat(chatData) {
    try {
      const { data, error } = await supabase
        .from(TABLES.AI_CHATS)
        .insert([chatData]);
      
      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Add AI chat error:', error);
      return { data: null, error };
    }
  }
};

// Real-time subscriptions
export const realtime = {
  // Subscribe to file changes
  subscribeToFiles(userId, callback) {
    return supabase
      .channel('files')
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: TABLES.FILES,
          filter: `user_id=eq.${userId}`
        }, 
        callback
      )
      .subscribe();
  },

  // Subscribe to family member changes
  subscribeToFamilyMembers(userId, callback) {
    return supabase
      .channel('family_members')
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: TABLES.FAMILY_MEMBERS,
          filter: `user_id=eq.${userId}`
        }, 
        callback
      )
      .subscribe();
  }
};
