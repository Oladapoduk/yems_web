# Frontend Blank Page Fix

## The Problem
Your frontend is showing a blank page. This is likely due to one of these issues:
1. Frontend dev server not started properly
2. TailwindCSS not configured
3. JavaScript errors in the browser
4. Missing dependencies

## Step-by-Step Fix

### STEP 1: Check if Frontend is Running

1. **Open Command Prompt**
2. Navigate to frontend:
   ```bash
   cd C:\Users\Dapo\Downloads\Olayemi_website\frontend
   ```

3. **Stop any running frontend** (if running):
   - Press `Ctrl + C` in the terminal

4. **Start frontend fresh**:
   ```bash
   npm run dev
   ```

5. **You should see**:
   ```
   VITE v7.x.x  ready in xxx ms
   ➜  Local:   http://localhost:5173/
   ```

### STEP 2: Open Browser with Developer Tools

1. **Open Google Chrome or Microsoft Edge**
2. **Go to**: http://localhost:5173
3. **Press F12** to open Developer Tools
4. **Click the "Console" tab**
5. **Look for RED error messages**

### STEP 3: Common Errors and Solutions

#### Error: "Failed to fetch" or "Network Error"
**Cause:** Backend is not running
**Solution:**
```bash
# Open NEW Command Prompt
cd C:\Users\Dapo\Downloads\Olayemi_website\backend
npm run dev
```

#### Error: "Cannot find module" or "Module not found"
**Cause:** Missing dependencies
**Solution:**
```bash
cd C:\Users\Dapo\Downloads\Olayemi_website\frontend
npm install
```

#### Error: TailwindCSS errors
**Cause:** TailwindCSS not configured
**Solution:** Already configured, skip this

#### Completely Blank with NO errors
**Cause:** Might be a React/routing issue
**Solution:** Continue to Step 4

### STEP 4: Verify Backend is Working

1. **Open a new browser tab**
2. **Go to**: http://localhost:3000/health
3. **You should see**:
   ```json
   {"status":"ok","message":"E-commerce API is running"}
   ```

If you DON'T see this:
```bash
# Backend is not running - start it:
cd C:\Users\Dapo\Downloads\Olayemi_website\backend
npm run dev
```

### STEP 5: Test the Frontend Manually

Let's check if the frontend files are correct:

1. **In Command Prompt (frontend folder)**:
   ```bash
   cd C:\Users\Dapo\Downloads\Olayemi_website\frontend
   ```

2. **Check if files exist**:
   ```bash
   dir src
   ```

You should see:
- `App.tsx`
- `main.tsx`
- `index.css`

3. **Restart frontend**:
   ```bash
   npm run dev
   ```

### STEP 6: Clear Browser Cache

Sometimes the browser caches old files:

1. **Press Ctrl + Shift + Delete** (in browser)
2. **Select "Cached images and files"**
3. **Click "Clear data"**
4. **Refresh** http://localhost:5173 (Ctrl + F5)

### STEP 7: What to Tell Me

If it's still blank, please tell me:

1. **What do you see in the Console tab** (F12 → Console)?
   - Copy any RED error messages

2. **What happens in Command Prompt** when you run `npm run dev`?
   - Copy the output

3. **What do you see** when you go to http://localhost:3000/health?
   - Copy the response

## Quick Checklist

- [ ] Backend is running: http://localhost:3000/health shows OK
- [ ] Frontend is running: `npm run dev` shows "ready"
- [ ] No errors in browser Console (F12)
- [ ] Tried Ctrl + F5 to refresh
- [ ] Tried clearing browser cache

## Most Likely Solutions

### Solution 1: Just Restart Everything

```bash
# Terminal 1 - Backend
cd C:\Users\Dapo\Downloads\Olayemi_website\backend
npm run dev

# Terminal 2 - Frontend
cd C:\Users\Dapo\Downloads\Olayemi_website\frontend
npm run dev
```

Then open: http://localhost:5173

### Solution 2: Reinstall Dependencies

```bash
# Frontend
cd C:\Users\Dapo\Downloads\Olayemi_website\frontend
rmdir /s /q node_modules
npm install
npm run dev

# Backend (if needed)
cd C:\Users\Dapo\Downloads\Olayemi_website\backend
rmdir /s /q node_modules
npm install
npm run dev
```

### Solution 3: Check .env Files

**Frontend .env should have**:
```
VITE_API_URL=http://localhost:3000/api
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_temp
```

**Backend .env should have your Supabase URL** (which you already have).

---

After trying these steps, if it's still blank, **open Browser Console (F12)** and tell me what errors you see!
