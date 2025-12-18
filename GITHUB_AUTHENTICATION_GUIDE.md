# GitHub Authentication Guide

## Quick Steps to Push Your Code

### Method 1: Personal Access Token (Easiest)

1. **Create a Personal Access Token:**
   - Go to: https://github.com/settings/tokens
   - Click **"Generate new token"** → **"Generate new token (classic)"**
   - Give it a name: `accounting-web-deploy`
   - Set expiration: 90 days (or your preference)
   - **Check these permissions:**
     - ✅ `repo` (Full control of private repositories)
   - Click **"Generate token"** at the bottom
   - **COPY THE TOKEN IMMEDIATELY** (you won't see it again!)

2. **Use the Token to Push:**
   ```powershell
   cd "c:\Users\Diana Mabilen\accounting-web"
   git push -u origin main
   ```
   - Username: `adelyneyana`
   - Password: **Paste your token** (not your GitHub password!)

### Method 2: GitHub Desktop (Visual)

1. Download and install: https://desktop.github.com/
2. Sign in with your GitHub account
3. Add your local repository
4. Click "Publish repository"

### Method 3: GitHub CLI

```powershell
# Install GitHub CLI (if not installed)
winget install --id GitHub.cli

# Authenticate
gh auth login

# Push
cd "c:\Users\Diana Mabilen\accounting-web"
git push -u origin main
```

## What Happens After Push

Once the code is on GitHub:
1. ✅ Your code will be safely backed up
2. ✅ You can deploy backend to Railway directly from GitHub
3. ✅ Easy to manage versions and updates
4. ✅ Collaborate with others if needed

## Troubleshooting

**"Authentication failed"**
- Make sure you're using the token as password, not your GitHub password
- Check the token has `repo` permissions

**"Repository not found"**
- Make sure the repository exists at: https://github.com/adelyneyana/accounting-web
- Create it on GitHub first if it doesn't exist

**"Permission denied"**
- Verify you're logged in as `adelyneyana`
- Check token permissions

## Next Steps After Successful Push

1. Deploy backend to Railway
2. Update frontend with Railway URL
3. Your app will be live!
