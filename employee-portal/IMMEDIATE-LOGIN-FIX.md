# 🔧 IMMEDIATE LOGIN FIX - 2 Minutes to Working Portal

## 🎯 The Issue
Your authentication is stuck because **both servers are not running**. The frontend can't connect to the backend.

## ✅ Quick Fix (Choose Method 1 OR 2)

### Method 1: Automated Script (Recommended)
Run these 3 commands in your terminal:

```bash
cd /Users/srihariharans/Documents/workitems/bhava2/employee-portal
chmod +x start-portal.sh
./start-portal.sh
```

**This will:**
- ✅ Kill any existing processes
- ✅ Start backend server with proper environment
- ✅ Start frontend server 
- ✅ Test authentication automatically
- ✅ Give you exact status of everything

### Method 2: Manual Start (If script fails)

**Terminal 1 - Backend:**
```bash
cd /Users/srihariharans/Documents/workitems/bhava2/employee-portal/backend
NODE_ENV=development PORT=3001 JWT_SECRET="employee-portal-super-secret-key-2024" node server.js
```

**Terminal 2 - Frontend:**
```bash
cd /Users/srihariharans/Documents/workitems/bhava2/employee-portal/frontend  
ng serve --port 4200
```

## 🔑 Fixed Credentials (All Use Same Password Now)

I've updated all demo credentials to use the same password for simplicity:

```
Employee ID: EMP001
Password:    password123
```

**Other valid accounts:**
- EMP002/password123
- EMP003/password123  
- EMP004/password123
- ADMIN/password123

**Email format also works:**
- demo@company.com/password123
- admin@company.com/password123

## ✅ What Should Happen After Fix

1. **Backend starts** → Shows "Server running on port 3001"
2. **Frontend starts** → Shows "Local: http://localhost:4200"
3. **Open browser** → Go to http://localhost:4200
4. **Login with EMP001/password123** → Should navigate to dashboard in 2 seconds

## 🔍 Quick Test

After starting servers, test authentication:
```bash
curl -X POST \
  -H "Content-Type: application/json" \
  -d '{"employeeId": "EMP001", "password": "password123"}' \
  http://localhost:3001/api/auth/login
```

Should return a JSON response with a token.

## 🚨 If Still Stuck

1. **Check if ports are free:**
   ```bash
   lsof -i :3001  # Should show node process
   lsof -i :4200  # Should show ng process
   ```

2. **Kill any blocking processes:**
   ```bash
   pkill -f "node server.js"
   pkill -f "ng serve"
   ```

3. **Check firewall/antivirus** - Make sure ports 3001 and 4200 are not blocked

## 🎯 Expected Result

- ✅ Click Login → Shows "Authenticating..." for ~2 seconds  
- ✅ Automatically redirects to Dashboard
- ✅ Shows employee profile (John Doe, EMP001)
- ✅ Dashboard displays attendance, profile cards, etc.

**Your login will work immediately after starting the servers!** 🚀
