# 🔒 Security Guidelines for DigiVault

## Environment Variables Protection

### ✅ What's Already Secured:

1. **`.env` file is in `.gitignore`**
   - Your MongoDB credentials will NEVER be committed to Git
   - The `.env` file stays only on your local machine

2. **Server validates environment variables**
   - Server will NOT start if `MONGODB_URI` is missing
   - Prevents accidental deployment without credentials

3. **`.env.example` has placeholders only**
   - Safe to commit to Git
   - Shows required environment variables without exposing secrets

### 📋 Setup Checklist:

- [x] `.env` is in `.gitignore`
- [x] `.env.example` contains only placeholder values
- [x] Server checks for required environment variables
- [ ] **YOU NEED TO:** Add your real MongoDB Atlas credentials to `.env`

### 🔧 How to Add Your Credentials:

1. Open the `.env` file in the project root
2. Replace the placeholders with your actual MongoDB Atlas credentials:

```env
MONGODB_URI=mongodb+srv://youruser:yourpassword@cluster0.abc123.mongodb.net/digivault?retryWrites=true&w=majority
PORT=5000
```

3. **NEVER** share or commit the `.env` file

### 🚨 Before Committing to Git:

Always verify your credentials are not exposed:

```bash
# Check if .env is in .gitignore
git check-ignore .env

# Should output: .env (this means it's ignored ✅)
```

```bash
# Check what files will be committed
git status

# .env should NOT appear in the list
```

### 🌐 MongoDB Atlas Security:

1. **Use strong passwords** for database users
2. **Whitelist only necessary IPs** in Network Access
3. **Enable audit logs** in production
4. **Rotate credentials** periodically
5. **Use separate credentials** for dev/staging/production

### 🔐 Additional Production Security:

When deploying to production, also implement:

- [ ] HTTPS/TLS encryption
- [ ] Authentication middleware (JWT tokens)
- [ ] Role-based access control (RBAC)
- [ ] Request rate limiting
- [ ] Input validation and sanitization
- [ ] API key authentication
- [ ] Logging and monitoring
- [ ] Regular security audits

### 📝 What's Safe to Commit:

✅ **Safe:**
- `.env.example` (with placeholders)
- Source code
- Configuration files
- Documentation

❌ **NEVER Commit:**
- `.env` (real credentials)
- `node_modules/`
- Database dumps with real data
- API keys or tokens
- Private keys

## Emergency: If You Accidentally Commit Credentials

If you accidentally commit the `.env` file:

1. **Immediately rotate your MongoDB credentials** in MongoDB Atlas
2. Remove the file from Git history:
   ```bash
   git filter-branch --force --index-filter "git rm --cached --ignore-unmatch .env" --prune-empty --tag-name-filter cat -- --all
   ```
3. Force push (⚠️ use with caution):
   ```bash
   git push origin --force --all
   ```
4. Inform your team to re-clone the repository

## Questions?

If you're unsure about any security aspect, it's always better to ask than to risk exposure!
