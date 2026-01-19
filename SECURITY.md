# 🔐 API Key Security Guide

## ⚠️ CRITICAL: Your API Key Was Leaked

Your Gemini API key has been reported as leaked and disabled by Google. This guide will help you secure your new API key.

## 🚨 Immediate Actions Required

### 1. Generate a New API Key
1. Visit [Google AI Studio](https://aistudio.google.com/app/apikey)
2. Sign in with your Google account
3. Click **"Create API Key"**
4. Copy the generated key immediately
5. Update your `.env` file with the new key

### 2. Update Your .env File
```env
GEMINI_API_KEY=YOUR_NEW_API_KEY_HERE
```

### 3. Restart Your Development Server
```bash
# Stop the current server (Ctrl+C)
npm run dev
```

## ✅ Security Measures Implemented

### 1. Updated .gitignore
The `.gitignore` file has been updated to prevent future leaks:
- ✅ `.env` files are now ignored
- ✅ Backup files (`.bak`, `.backup`) are ignored
- ✅ Test files with sensitive data are ignored

### 2. Removed .env from Git History
The `.env` file has been removed from Git tracking using:
```bash
git rm --cached .env
```

**IMPORTANT**: This only removes it from future commits. The old API key is still in your Git history.

## 🔒 Best Practices Going Forward

### DO:
- ✅ Keep `.env` files local only
- ✅ Use `.env.example` as a template (without real keys)
- ✅ Rotate API keys regularly
- ✅ Use different keys for development and production
- ✅ Monitor API usage in Google AI Studio

### DON'T:
- ❌ Never commit `.env` files to Git
- ❌ Never share API keys in screenshots or chat
- ❌ Never hardcode API keys in source code
- ❌ Never push to public repositories without checking

## 🧹 Clean Up Git History (Optional but Recommended)

If you've already pushed the leaked key to a remote repository:

### For Private Repositories:
```bash
# Create a new commit removing the .env file
git add .gitignore
git commit -m "chore: remove .env from version control and update .gitignore"
git push
```

### For Public Repositories:
You'll need to rewrite Git history to completely remove the leaked key:
```bash
# WARNING: This rewrites history. Coordinate with your team first!
git filter-branch --force --index-filter \
  "git rm --cached --ignore-unmatch .env" \
  --prune-empty --tag-name-filter cat -- --all

# Force push (use with caution!)
git push origin --force --all
```

## 📝 Verification Checklist

After implementing these changes:

- [ ] New API key generated
- [ ] `.env` file updated with new key
- [ ] Development server restarted
- [ ] AI features tested and working
- [ ] `.env` not showing in `git status`
- [ ] `.gitignore` includes `.env`
- [ ] Changes committed to Git

## 🆘 If You Need Help

If the AI features still don't work after following this guide:
1. Check the browser console for errors
2. Verify the API key is correct in `.env`
3. Ensure the key has proper permissions in Google AI Studio
4. Check if there are any usage limits or billing issues

## 📚 Additional Resources

- [Google AI Studio](https://aistudio.google.com/)
- [Gemini API Documentation](https://ai.google.dev/docs)
- [Git Security Best Practices](https://docs.github.com/en/authentication/keeping-your-account-and-data-secure)
