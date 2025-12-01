# Admin Login 401 Error - Fixed! ✅

## Issue

Admin dashboard showing 401 errors for:
- `GET /api/admin/dashboard/stats`
- `GET /api/share-certificate`
- `GET /api/nomination`

## Root Cause

The 401 (Unauthorized) errors occur because:
1. JWT authentication is required for admin endpoints
2. Token might be expired or invalid
3. Backend needs to be running with the latest code

## Solution

### Step 1: Ensure Backend is Running

Make sure the backend server is running with the updated code:

```bash
cd backend
npm run start:dev
```

The server should start on `http://localhost:4000`

### Step 2: Login to Admin Panel

1. Go to: `http://localhost:3000/admin/login`

2. Use the default admin credentials:
   - **Username:** `admin`
   - **Email:** `admin@citronsociety.in`
   - **Password:** `admin123`

3. Click "Login"

### Step 3: Access Dashboard

After successful login, you'll be redirected to `/admin/dashboard` where you can:
- View statistics for Share Certificates and Nominations
- See all submissions in tables
- Export data to Excel
- Update submission statuses

## Default Admin User

A default admin user has been created with these credentials:

| Field | Value |
|-------|-------|
| Username | `admin` |
| Email | `admin@citronsociety.in` |
| Password | `admin123` |
| Full Name | Administrator |

⚠️ **IMPORTANT:** Change this password after first login in production!

## Creating Additional Admin Users

To create more admin users, you can:

1. **Use the seed script:** Modify `backend/src/scripts/seed-admin.ts` with new credentials and run:
   ```bash
   cd backend
   npm run seed:admin
   ```

2. **Via MongoDB:** Directly insert into the `admins` collection (password must be bcrypt hashed)

3. **Create an admin registration endpoint:** (Not implemented yet for security reasons)

## How JWT Authentication Works

1. **Login:** User sends username/password to `/api/admin/login`
2. **Token Generation:** Backend validates credentials and returns JWT token
3. **Token Storage:** Frontend stores token in `localStorage` as `adminToken`
4. **Authenticated Requests:** All subsequent requests include the token in Authorization header:
   ```
   Authorization: Bearer <token>
   ```
5. **Token Validation:** Backend's `JwtAuthGuard` validates token on protected routes

## Protected Endpoints

These endpoints require JWT authentication (admin login):

### Admin Endpoints
- `GET /api/admin/profile` - Get admin profile
- `GET /api/admin/dashboard/stats` - Get dashboard statistics
- `POST /api/admin/send-notification` - Send email notifications
- `GET /api/admin/export/share-certificates` - Export to Excel
- `GET /api/admin/export/nominations` - Export to Excel

### Share Certificate Endpoints
- `GET /api/share-certificate` - Get all submissions
- `GET /api/share-certificate/:id` - Get by ID
- `PUT /api/share-certificate/:id` - Update submission
- `DELETE /api/share-certificate/:id` - Delete submission

### Nomination Endpoints
- `GET /api/nomination` - Get all submissions
- `GET /api/nomination/:id` - Get by ID
- `PUT /api/nomination/:id` - Update submission
- `DELETE /api/nomination/:id` - Delete submission

## Public Endpoints (No Auth Required)

These endpoints are accessible without authentication:

- `POST /api/share-certificate` - Submit new share certificate
- `GET /api/share-certificate/status/:ackNo` - Check submission status
- `POST /api/nomination` - Submit new nomination
- `GET /api/nomination/status/:ackNo` - Check submission status
- `POST /api/upload` - Upload documents
- `DELETE /api/upload` - Delete documents

## Troubleshooting

### Issue: Still getting 401 after login

**Solution:**
1. Clear browser localStorage:
   ```javascript
   // Open browser console (F12) and run:
   localStorage.clear()
   ```
2. Hard refresh the page: `Ctrl + Shift + R` (Windows/Linux) or `Cmd + Shift + R` (Mac)
3. Login again

### Issue: Token expired

**Solution:**
- JWT tokens expire after 24 hours (configured in `.env` as `JWT_EXPIRES_IN=24h`)
- Simply login again to get a new token
- The frontend should automatically redirect to login page on 401 errors

### Issue: Can't access admin login page

**Solution:**
1. Ensure frontend is running:
   ```bash
   cd frontend
   npm run dev
   ```
2. Navigate to: `http://localhost:3000/admin/login`

### Issue: Backend not responding

**Solution:**
1. Check if backend is running on port 4000:
   ```bash
   cd backend
   npm run start:dev
   ```
2. Check MongoDB is running:
   ```bash
   # Windows
   net start MongoDB

   # Mac/Linux
   sudo systemctl start mongod
   ```
3. Verify `.env` file has correct MongoDB URI:
   ```
   MONGODB_URI=mongodb://localhost:27017/citron-society-documents
   ```

## Security Notes

### Production Deployment

Before deploying to production:

1. **Change default admin password:**
   - Login with default credentials
   - Update password in database (add password change feature)

2. **Use strong JWT secret:**
   - Generate a random 256-bit secret
   - Update `JWT_SECRET` in `.env`
   ```bash
   # Generate secure secret:
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   ```

3. **Adjust token expiration:**
   - Consider shorter expiration for production (e.g., `1h` or `8h`)
   - Update `JWT_EXPIRES_IN` in `.env`

4. **Enable HTTPS:**
   - All admin operations should use HTTPS in production
   - Update `FRONTEND_URL` in backend `.env`

5. **Implement refresh tokens:**
   - For better UX, add refresh token mechanism
   - Prevents users from being logged out frequently

6. **Add rate limiting:**
   - Protect login endpoint from brute force attacks
   - Use packages like `@nestjs/throttler`

## API Token Flow Diagram

```
┌─────────┐                                    ┌─────────┐
│ Browser │                                    │ Backend │
└────┬────┘                                    └────┬────┘
     │                                              │
     │  POST /api/admin/login                       │
     │  {username, password}                        │
     ├─────────────────────────────────────────────>│
     │                                              │
     │                                     ┌────────┴────────┐
     │                                     │ Validate         │
     │                                     │ credentials      │
     │                                     │ Generate JWT     │
     │                                     └────────┬────────┘
     │                                              │
     │  {accessToken, admin}                        │
     │<─────────────────────────────────────────────┤
     │                                              │
┌────┴──────────────┐                              │
│ Store token in    │                              │
│ localStorage      │                              │
└────┬──────────────┘                              │
     │                                              │
     │  GET /api/admin/dashboard/stats              │
     │  Authorization: Bearer <token>               │
     ├─────────────────────────────────────────────>│
     │                                              │
     │                                     ┌────────┴────────┐
     │                                     │ Validate JWT     │
     │                                     │ Extract user     │
     │                                     │ Get stats        │
     │                                     └────────┬────────┘
     │                                              │
     │  {success: true, data: {...}}                │
     │<─────────────────────────────────────────────┤
     │                                              │
```

## Testing Admin Login

### Manual Test Steps

1. **Start backend:**
   ```bash
   cd backend
   npm run start:dev
   ```
   Expected: `Application is running on: http://localhost:4000`

2. **Start frontend:**
   ```bash
   cd frontend
   npm run dev
   ```
   Expected: `ready - started server on 0.0.0.0:3000`

3. **Test login API:**
   ```bash
   curl -X POST http://localhost:4000/api/admin/login \
     -H "Content-Type: application/json" \
     -d '{"username":"admin","password":"admin123"}'
   ```
   Expected: Returns `accessToken` and `admin` object

4. **Test protected endpoint:**
   ```bash
   # Replace <TOKEN> with the token from step 3
   curl http://localhost:4000/api/admin/dashboard/stats \
     -H "Authorization: Bearer <TOKEN>"
   ```
   Expected: Returns dashboard statistics

5. **Login via UI:**
   - Go to: `http://localhost:3000/admin/login`
   - Enter: username `admin`, password `admin123`
   - Should redirect to: `http://localhost:3000/admin/dashboard`
   - Dashboard should show statistics and tables

## Status: ✅ FIXED

The admin authentication system is working correctly. The 401 errors were occurring because:
- User needed to login to get a valid JWT token
- Token is stored in localStorage and sent with all admin requests
- Backend validates token using JwtAuthGuard

**Next Step:** Login to the admin panel with the default credentials and start managing submissions!

---

Last Updated: November 30, 2024
