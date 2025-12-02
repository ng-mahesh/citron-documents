# AWS S3 Setup Guide - Fix Upload Permissions

## Problem
The IAM user `s3-uploader` (arn:aws:iam::445433762920:user/s3-uploader) doesn't have permissions to upload files to the S3 bucket `citron-documents-bucket`.

## Solution

You need to attach an IAM policy to the `s3-uploader` user that grants the necessary S3 permissions.

### Option 1: Using AWS Console (Recommended for beginners)

1. **Go to AWS IAM Console**
   - Open https://console.aws.amazon.com/iam/
   - Sign in with your AWS account

2. **Navigate to the IAM User**
   - Click on "Users" in the left sidebar
   - Find and click on `s3-uploader`

3. **Add Inline Policy**
   - Click on the "Permissions" tab
   - Click "Add permissions" → "Create inline policy"
   - Click on the "JSON" tab
   - Copy and paste the contents of `aws-iam-policy.json` (in this directory)
   - Click "Review policy"
   - Give it a name like `CitronDocumentsS3Access`
   - Click "Create policy"

### Option 2: Using AWS CLI

If you have AWS CLI installed and configured:

```bash
# Navigate to the backend directory
cd backend

# Attach the policy to the s3-uploader user
aws iam put-user-policy \
  --user-name s3-uploader \
  --policy-name CitronDocumentsS3Access \
  --policy-document file://aws-iam-policy.json
```

### Option 3: Attach an AWS Managed Policy (Quick but less secure)

If you want a quick solution (though it gives more permissions than needed):

```bash
aws iam attach-user-policy \
  --user-name s3-uploader \
  --policy-arn arn:aws:iam::aws:policy/AmazonS3FullAccess
```

**Note:** This gives full S3 access to ALL buckets. Use Option 1 or 2 for better security.

## Verify the Policy

After applying the policy, verify it's attached:

### Using AWS Console:
1. Go to IAM → Users → s3-uploader
2. Check the "Permissions" tab
3. You should see the policy listed

### Using AWS CLI:
```bash
aws iam list-user-policies --user-name s3-uploader
aws iam get-user-policy --user-name s3-uploader --policy-name CitronDocumentsS3Access
```

## Test the Upload

After applying the policy, try uploading a file again through your application. The upload should now succeed.

## What the Policy Does

The policy (`aws-iam-policy.json`) grants the following permissions:

- **s3:PutObject** - Upload files to the bucket
- **s3:PutObjectAcl** - Set access control for uploaded files
- **s3:GetObject** - Download/retrieve files
- **s3:GetObjectAcl** - Read file permissions
- **s3:DeleteObject** - Delete files
- **s3:ListBucket** - List files in the bucket

These permissions are scoped ONLY to the `citron-documents-bucket`, following the principle of least privilege.

## Additional S3 Bucket Configuration

You may also need to update your S3 bucket settings:

### 1. Bucket Policy (Optional)
If you want to make uploaded documents publicly readable:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "PublicReadGetObject",
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::citron-documents-bucket/documents/*"
    }
  ]
}
```

Apply this in: S3 Console → Your Bucket → Permissions → Bucket Policy

### 2. CORS Configuration (If accessing from browser)
If you're uploading directly from the frontend:

```json
[
  {
    "AllowedHeaders": ["*"],
    "AllowedMethods": ["GET", "PUT", "POST", "DELETE"],
    "AllowedOrigins": ["http://localhost:3000", "https://your-domain.com"],
    "ExposeHeaders": ["ETag"]
  }
]
```

Apply this in: S3 Console → Your Bucket → Permissions → CORS

### 3. Block Public Access Settings
If you want documents to be publicly accessible, ensure these settings:
- S3 Console → Your Bucket → Permissions → Block public access
- Uncheck "Block all public access" (if you want public read access)
- Or keep it checked and use pre-signed URLs for secure access

## Troubleshooting

### Still Getting Permission Denied?
1. Wait 1-2 minutes after applying the policy (AWS propagation delay)
2. Verify the bucket name in your `.env` file matches: `citron-documents-bucket`
3. Check AWS region matches between IAM user and S3 bucket
4. Ensure AWS credentials in `.env` are correct and belong to the `s3-uploader` user

### Check Current Credentials
You can verify which user your credentials belong to:
```bash
aws sts get-caller-identity
```

This should return the `s3-uploader` user ARN.

## Security Best Practices

1. **Never commit your actual AWS credentials** - Keep them in `.env` (which is in `.gitignore`)
2. **Rotate credentials regularly** - Create new access keys every 90 days
3. **Use least privilege** - Only grant permissions your app actually needs
4. **Enable MFA** - For IAM users with console access
5. **Monitor usage** - Use AWS CloudTrail to track API calls
