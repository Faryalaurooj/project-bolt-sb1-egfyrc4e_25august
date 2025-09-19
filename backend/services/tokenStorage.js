// Simple token storage using file system (for production, use a database)
import fs from 'fs';
import path from 'path';

class TokenStorage {
  constructor() {
    this.tokenFile = path.join(process.cwd(), 'goto_tokens.json');
  }

  // Store tokens to file
  storeTokens(tokens) {
    try {
      const tokenData = {
        ...tokens,
        stored_at: new Date().toISOString(),
        expires_at: new Date(Date.now() + (tokens.expires_in * 1000)).toISOString()
      };
      
      fs.writeFileSync(this.tokenFile, JSON.stringify(tokenData, null, 2));
      console.log('✅ Tokens stored successfully');
      return true;
    } catch (error) {
      console.error('❌ Failed to store tokens:', error.message);
      return false;
    }
  }

  // Load tokens from file
  loadTokens() {
    try {
      if (!fs.existsSync(this.tokenFile)) {
        return null;
      }
      
      const tokenData = JSON.parse(fs.readFileSync(this.tokenFile, 'utf8'));
      
      // Check if tokens are expired
      const expiresAt = new Date(tokenData.expires_at);
      const now = new Date();
      
      if (now >= expiresAt) {
        console.log('⚠️ Stored tokens have expired');
        return null;
      }
      
      console.log('✅ Valid tokens loaded from storage');
      return tokenData;
    } catch (error) {
      console.error('❌ Failed to load tokens:', error.message);
      return null;
    }
  }

  // Clear stored tokens
  clearTokens() {
    try {
      if (fs.existsSync(this.tokenFile)) {
        fs.unlinkSync(this.tokenFile);
        console.log('✅ Tokens cleared successfully');
      }
      return true;
    } catch (error) {
      console.error('❌ Failed to clear tokens:', error.message);
      return false;
    }
  }

  // Check if we have valid tokens
  hasValidTokens() {
    const tokens = this.loadTokens();
    return tokens !== null;
  }
}

export default new TokenStorage();