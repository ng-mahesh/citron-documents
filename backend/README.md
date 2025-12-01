# Housing Society Backend API

NestJS-based backend application for managing share certificates and nomination submissions for housing societies.

## Features

- Share Certificate management
- Nomination management
- Admin authentication with JWT
- File upload to AWS S3
- Email notifications using Nodemailer
- Export data to Excel
- Status tracking for residents
- MongoDB database

## Tech Stack

- **Framework**: NestJS 10.x
- **Database**: MongoDB with Mongoose
- **Authentication**: JWT
- **File Storage**: AWS S3
- **Email**: Nodemailer with SMTP
- **Validation**: class-validator
- **Documentation**: TypeScript with comprehensive comments

## Prerequisites

- Node.js (v18 or higher)
- MongoDB (v6 or higher)
- AWS Account (for S3)
- SMTP Email Account

## Installation

```bash
# Install dependencies
npm install
```

## Configuration

Create a `.env` file in the backend directory:

```env
# Server Configuration
PORT=4000
NODE_ENV=development

# Frontend URL
FRONTEND_URL=http://localhost:3000

# MongoDB Configuration
MONGODB_URI=mongodb://localhost:27017/housing-society

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=24h

# AWS S3 Configuration
AWS_ACCESS_KEY_ID=your-aws-access-key-id
AWS_SECRET_ACCESS_KEY=your-aws-secret-access-key
AWS_REGION=us-east-1
AWS_S3_BUCKET_NAME=your-bucket-name

# SMTP Email Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
SMTP_FROM_EMAIL=noreply@housingsociety.com
```

## Running the Application

```bash
# Development mode
npm run start:dev

# Production mode
npm run build
npm run start:prod

# Watch mode
npm run start:debug
```

The API will be available at `http://localhost:4000/api`

## API Documentation

### Base URL
```
http://localhost:4000/api
```

---

## Public Endpoints (No Authentication Required)

### 1. Share Certificate Submission

**POST** `/share-certificate`

Submit a new share certificate application.

**Request Body:**
```json
{
  "fullName": "John Doe",
  "flatNumber": "101",
  "building": "Tower A",
  "wing": "East",
  "email": "john@example.com",
  "mobileNumber": "9876543210",
  "alternateMobileNumber": "9876543211",
  "carpetArea": 850,
  "builtUpArea": 1000,
  "membershipType": "Primary",
  "jointMemberName": "Jane Doe",
  "jointMemberEmail": "jane@example.com",
  "jointMemberMobile": "9876543212",
  "index2Document": {
    "fileName": "101_INDEX2_JOHNDOE_1234567890.pdf",
    "fileUrl": "https://bucket.s3.amazonaws.com/...",
    "fileSize": 1024000,
    "fileType": "application/pdf",
    "uploadedAt": "2024-01-01T00:00:00.000Z"
  },
  "possessionLetterDocument": { /* same structure */ },
  "aadhaarCardDocument": { /* same structure */ },
  "digitalSignature": "John Doe",
  "declarationAccepted": true
}
```

**Response:** (201 Created)
```json
{
  "success": true,
  "message": "Share certificate submitted successfully",
  "data": {
    "acknowledgementNumber": "SC-20240101-00001",
    "email": "john@example.com"
  }
}
```

---

### 2. Check Share Certificate Status

**GET** `/share-certificate/status/:acknowledgementNumber`

Check the status of a share certificate submission.

**Response:** (200 OK)
```json
{
  "success": true,
  "data": {
    "acknowledgementNumber": "SC-20240101-00001",
    "fullName": "John Doe",
    "flatNumber": "101",
    "status": "Pending",
    "submittedAt": "2024-01-01T00:00:00.000Z",
    "reviewedAt": null,
    "adminRemarks": null
  }
}
```

---

### 3. Nomination Submission

**POST** `/nomination`

Submit a new nomination application.

**Request Body:**
```json
{
  "primaryMemberName": "John Doe",
  "primaryMemberEmail": "john@example.com",
  "primaryMemberMobile": "9876543210",
  "flatNumber": "101",
  "building": "Tower A",
  "wing": "East",
  "jointMemberName": "Jane Doe",
  "jointMemberEmail": "jane@example.com",
  "jointMemberMobile": "9876543211",
  "nominees": [
    {
      "name": "Alice Doe",
      "relationship": "Daughter",
      "dateOfBirth": "2000-01-01",
      "aadhaarNumber": "123456789012",
      "sharePercentage": 50,
      "address": "Same as member"
    },
    {
      "name": "Bob Doe",
      "relationship": "Son",
      "dateOfBirth": "2002-01-01",
      "aadhaarNumber": "123456789013",
      "sharePercentage": 50,
      "address": "Same as member"
    }
  ],
  "index2Document": { /* UploadedDocument */ },
  "possessionLetterDocument": { /* UploadedDocument */ },
  "primaryMemberAadhaar": { /* UploadedDocument */ },
  "jointMemberAadhaar": { /* UploadedDocument */ },
  "nomineeAadhaars": [ /* Array of UploadedDocuments */ ],
  "witnesses": [
    {
      "name": "Witness One",
      "address": "Address 1",
      "signature": "Witness One"
    },
    {
      "name": "Witness Two",
      "address": "Address 2",
      "signature": "Witness Two"
    }
  ],
  "declarationAccepted": true,
  "memberSignature": "John Doe"
}
```

**Response:** (201 Created)
```json
{
  "success": true,
  "message": "Nomination submitted successfully",
  "data": {
    "acknowledgementNumber": "NOM-20240101-00001",
    "email": "john@example.com"
  }
}
```

---

### 4. Check Nomination Status

**GET** `/nomination/status/:acknowledgementNumber`

Similar to share certificate status check.

---

### 5. File Upload

**POST** `/upload`

Upload a single file to AWS S3.

**Request:**
- Content-Type: `multipart/form-data`
- Fields:
  - `file`: File (max 2MB, PDF or JPEG only)
  - `flatNumber`: string
  - `documentType`: string (e.g., "INDEX2", "POSSESSION_LETTER", "AADHAAR")
  - `fullName`: string

**Response:** (200 OK)
```json
{
  "success": true,
  "message": "File uploaded successfully",
  "data": {
    "fileName": "101_INDEX2_JOHNDOE_1234567890.pdf",
    "fileUrl": "https://bucket.s3.amazonaws.com/documents/...",
    "fileSize": 1024000,
    "fileType": "application/pdf",
    "uploadedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

---

## Admin Endpoints (Requires JWT Authentication)

### Authentication Header
All admin endpoints require:
```
Authorization: Bearer <jwt_token>
```

---

### 6. Admin Login

**POST** `/admin/login`

Authenticate admin user.

**Request Body:**
```json
{
  "username": "admin",
  "password": "password123"
}
```

**Response:** (200 OK)
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "admin": {
      "id": "65abc123...",
      "username": "admin",
      "email": "admin@housingsociety.com",
      "fullName": "Admin User"
    }
  }
}
```

---

### 7. Get Admin Profile

**GET** `/admin/profile`

Get current admin user profile.

**Response:** (200 OK)
```json
{
  "success": true,
  "data": {
    "username": "admin",
    "email": "admin@housingsociety.com",
    "fullName": "Admin User",
    "isActive": true,
    "lastLoginAt": "2024-01-01T00:00:00.000Z"
  }
}
```

---

### 8. Get Dashboard Statistics

**GET** `/admin/dashboard/stats`

Get statistics for both share certificates and nominations.

**Response:** (200 OK)
```json
{
  "success": true,
  "data": {
    "shareCertificates": {
      "total": 100,
      "pending": 20,
      "underReview": 15,
      "approved": 50,
      "rejected": 10,
      "documentRequired": 5
    },
    "nominations": {
      "total": 80,
      "pending": 15,
      "underReview": 10,
      "approved": 45,
      "rejected": 7,
      "documentRequired": 3
    },
    "totalSubmissions": 180
  }
}
```

---

### 9. Get All Share Certificates

**GET** `/share-certificate`

Get all share certificate submissions.

**Response:** (200 OK)
```json
{
  "success": true,
  "data": [
    {
      "_id": "65abc123...",
      "acknowledgementNumber": "SC-20240101-00001",
      "fullName": "John Doe",
      "flatNumber": "101",
      "email": "john@example.com",
      "status": "Pending",
      "createdAt": "2024-01-01T00:00:00.000Z",
      // ... other fields
    }
  ]
}
```

---

### 10. Get Share Certificate by ID

**GET** `/share-certificate/:id`

Get detailed information about a specific share certificate.

---

### 11. Update Share Certificate

**PUT** `/share-certificate/:id`

Update share certificate status and remarks.

**Request Body:**
```json
{
  "status": "Approved",
  "adminRemarks": "All documents verified",
  "reviewedBy": "Admin User"
}
```

**Response:** (200 OK)
```json
{
  "success": true,
  "message": "Share certificate updated successfully",
  "data": { /* Updated certificate data */ }
}
```

---

### 12. Delete Share Certificate

**DELETE** `/share-certificate/:id`

Delete a share certificate submission.

**Response:** (204 No Content)

---

### 13. Get All Nominations

**GET** `/nomination`

Similar to share certificates.

---

### 14. Update Nomination

**PUT** `/nomination/:id`

Similar to share certificate update.

---

### 15. Send Email Notification

**POST** `/admin/send-notification`

Send status update email to resident.

**Request Body:**
```json
{
  "type": "share-certificate",
  "acknowledgementNumber": "SC-20240101-00001"
}
```

**Response:** (200 OK)
```json
{
  "success": true,
  "message": "Notification sent successfully"
}
```

---

### 16. Export Share Certificates to Excel

**GET** `/admin/export/share-certificates`

Download all share certificates as Excel file.

**Response:** Excel file download

---

### 17. Export Nominations to Excel

**GET** `/admin/export/nominations`

Download all nominations as Excel file.

**Response:** Excel file download

---

## Status Values

- `Pending`: Initial status after submission
- `Under Review`: Admin is reviewing the submission
- `Approved`: Submission approved
- `Rejected`: Submission rejected
- `Document Required`: Additional documents needed

## File Upload Constraints

- **Maximum file size**: 2MB
- **Allowed file types**: PDF, JPEG/JPG
- **Naming convention**: `FLATNO_DOCUMENTTYPE_FULLNAME_TIMESTAMP.ext`

## Error Responses

All endpoints return errors in the following format:

```json
{
  "statusCode": 400,
  "message": "Error message here",
  "error": "Bad Request"
}
```

Common HTTP status codes:
- `200`: Success
- `201`: Created
- `204`: No Content
- `400`: Bad Request
- `401`: Unauthorized
- `403`: Forbidden
- `404`: Not Found
- `500`: Internal Server Error

## Testing

```bash
# Unit tests
npm run test

# E2E tests
npm run test:e2e

# Test coverage
npm run test:cov
```

## Creating First Admin User

Run this script once to create the initial admin user:

```typescript
import { AdminService } from './src/admin/admin.service';

// In your application bootstrap or migration script
await adminService.createAdmin(
  'admin',
  'SecurePassword123!',
  'admin@housingsociety.com',
  'Admin User'
);
```

## Project Structure

```
backend/
├── src/
│   ├── admin/              # Admin authentication & management
│   ├── share-certificate/  # Share certificate module
│   ├── nomination/         # Nomination module
│   ├── upload/             # File upload to S3
│   ├── email/              # Email service
│   ├── common/             # Shared enums & interfaces
│   ├── app.module.ts       # Root module
│   └── main.ts             # Application entry point
├── test/                   # Test files
├── .env                    # Environment variables
├── package.json
├── tsconfig.json
└── README.md
```

## Deployment

### Prerequisites for Production

1. Set up MongoDB database
2. Create AWS S3 bucket
3. Configure SMTP email service
4. Set environment variables

### Deployment Options

**Option 1: AWS Elastic Beanstalk**
```bash
npm run build
# Deploy dist folder to Elastic Beanstalk
```

**Option 2: AWS Lambda with Serverless**
```bash
npm install -g serverless
serverless deploy
```

**Option 3: Docker**
```bash
docker build -t housing-society-backend .
docker run -p 4000:4000 housing-society-backend
```

## Support

For issues and questions, please create an issue in the repository.

## License

MIT
