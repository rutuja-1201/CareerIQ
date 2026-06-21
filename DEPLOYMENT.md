# CareerIQ Deployment Guide

## Prerequisites

- [ ] GitHub account
- [ ] Vercel account (sign up at vercel.com)
- [ ] Render account (sign up at render.com)
- [ ] MongoDB Atlas account (sign up at mongodb.com/cloud/atlas)
- [ ] Hugging Face token (get from huggingface.co/settings/tokens)

---

## Deployment Steps

### 1. MongoDB Atlas Setup (Database)

1. Go to [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
2. Click **Create a Free Cluster**
3. Choose **M0 Sandbox** (Free tier)
4. Select cloud provider and region (nearest to you)
5. Click **Create Cluster** (takes 3-5 minutes)

**Configure Access:**
1. Click **Database Access** → Add Database User
   - Username: `careeriq`
   - Password: Generate secure password (save it!)
   - Role: Read and write to any database

2. Click **Network Access** → Add IP Address
   - Click **Allow Access from Anywhere** (0.0.0.0/0)
   - Confirm

3. Click **Database** → Connect → **Drivers**
   - Select: Node.js, Version 5.5 or later
   - Copy connection string (looks like):
   ```
   mongodb+srv://careeriq:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```
   - Replace `<password>` with your database password
   - Add database name: `mongodb+srv://careeriq:password@cluster0.xxxxx.mongodb.net/careeriq?retryWrites=true&w=majority`

**Save this connection string!**

---

### 2. Backend Deployment (Render)

1. Go to [render.com](https://render.com) and sign in with GitHub
2. Click **New +** → **Web Service**
3. Connect your **CareerIQ** repository
4. Configure the service:
   - **Name**: `careeriq-backend`
   - **Region**: Select nearest region
   - **Root Directory**: `backend`
   - **Runtime**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Instance Type**: `Free`

5. **Add Environment Variables** (click "Advanced" → "Add Environment Variable"):

```
PORT=5001
MONGODB_URI=mongodb+srv://careeriq:YOUR_PASSWORD@cluster0.xxxxx.mongodb.net/careeriq?retryWrites=true&w=majority
JWT_SECRET=your-random-secret-here-change-this
JWT_REFRESH_SECRET=your-random-refresh-secret-change-this
JWT_EXPIRES_IN=24h
JWT_REFRESH_EXPIRES_IN=7d
HF_TOKEN=your-huggingface-token
HF_MODEL=meta-llama/Llama-3.2-1B-Instruct
FRONTEND_URL=https://your-app.vercel.app
```

**Generate JWT Secrets:**
Run in terminal:
```bash
# For JWT_SECRET
openssl rand -base64 32

# For JWT_REFRESH_SECRET
openssl rand -base64 32
```

**Get Hugging Face Token:**
- Go to [huggingface.co/settings/tokens](https://huggingface.co/settings/tokens)
- Click **New token**
- Name: `careeriq`
- Type: Read
- Copy the token

6. Click **Create Web Service**
7. Wait for deployment (5-10 minutes for first deploy)
8. **Copy your backend URL**: `https://careeriq-backend.onrender.com`

**Note**: Free tier on Render spins down after inactivity. First request may take 30-60 seconds.

---

### 3. Frontend Deployment (Vercel)

1. Go to [vercel.com](https://vercel.com) and sign in with GitHub
2. Click **Add New** → **Project**
3. Import your **CareerIQ** repository
4. Configure:
   - **Framework Preset**: Next.js (auto-detected)
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build` (auto-detected)
   - **Output Directory**: `.next` (auto-detected)
   - **Install Command**: `npm install` (auto-detected)

5. **Add Environment Variable**:
   - Click **Environment Variables**
   - Key: `NEXT_PUBLIC_API_URL`
   - Value: `https://careeriq-backend.onrender.com/api`
   - (Use your actual Render backend URL from Step 2)

6. Click **Deploy**
7. Wait 2-3 minutes for deployment
8. **Copy your frontend URL**: `https://careeriq-xyz.vercel.app`

---

### 4. Update Backend FRONTEND_URL

1. Go back to **Render Dashboard**
2. Select your **careeriq-backend** service
3. Click **Environment**
4. Update `FRONTEND_URL` to your Vercel URL: `https://careeriq-xyz.vercel.app`
5. Click **Save Changes** (will trigger redeploy)

---

## Testing Your Deployment

1. Visit your Vercel URL: `https://careeriq-xyz.vercel.app`
2. Try registering a new account
3. Test login
4. Try one of the features (e.g., Resume Analysis)

**First Load**: Backend may take 30-60 seconds to wake up (Render free tier limitation)

---

## Environment Variables Summary

### Backend (Render)
```
PORT=5001
MONGODB_URI=mongodb+srv://...
JWT_SECRET=<random-string>
JWT_REFRESH_SECRET=<random-string>
JWT_EXPIRES_IN=24h
JWT_REFRESH_EXPIRES_IN=7d
HF_TOKEN=hf_xxxxxxxxxxxxx
HF_MODEL=meta-llama/Llama-3.2-1B-Instruct
FRONTEND_URL=https://your-app.vercel.app
```

### Frontend (Vercel)
```
NEXT_PUBLIC_API_URL=https://careeriq-backend.onrender.com/api
```

---

## Troubleshooting

### Backend doesn't start
- Check Render logs for errors
- Verify MongoDB URI is correct
- Ensure all environment variables are set

### CORS errors in frontend
- Verify `FRONTEND_URL` in backend matches your Vercel URL exactly
- Check browser console for specific CORS error

### Database connection fails
- Verify MongoDB Atlas IP whitelist includes 0.0.0.0/0
- Check database user credentials
- Ensure connection string has correct password

### Frontend can't connect to backend
- Verify `NEXT_PUBLIC_API_URL` is correct
- Backend URL must include `/api` at the end
- Check if backend is running (visit backend URL in browser)

---

## Updating Your Deployment

### To update backend:
```bash
git add .
git commit -m "fix: update backend"
git push
```
Render auto-deploys on push to main branch.

### To update frontend:
```bash
git add .
git commit -m "fix: update frontend"
git push
```
Vercel auto-deploys on push to main branch.

---

## Cost

- **MongoDB Atlas M0**: Free (512MB storage)
- **Render Free Tier**: Free (750 hours/month, spins down after inactivity)
- **Vercel Hobby**: Free (unlimited bandwidth, 100GB/month)

**Total**: $0/month

---

## Production Recommendations

For production use, consider:
- Render **Starter** plan ($7/month) - no spin down
- MongoDB **M2/M5** cluster (starting $9/month) - better performance
- Custom domain setup
- Enable HTTPS (automatic on Vercel & Render)
- Set up monitoring (Render provides basic metrics)
