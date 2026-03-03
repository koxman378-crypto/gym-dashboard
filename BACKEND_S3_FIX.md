# S3 Upload Issues - Backend Fix Required

## Problem
`publicUrl` is **undefined** in the backend response. Only `uploadUrl` is being returned.

## Backend S3Service Fix

Your `S3Service.generatePresignedUploadUrl()` method needs to return BOTH:
1. `uploadUrl` - Presigned URL for uploading
2. `publicUrl` - Public URL to access the uploaded file

### Fix the S3Service Method

```typescript
// src/s3/s3.service.ts

async generatePresignedUploadUrl(
  folder: string,
  fileName: string,
  contentType: string,
  expiresIn: number = 3600,
): Promise<{ uploadUrl: string; publicUrl: string }> {
  const key = `${folder}/${uuidv4()}.${fileName.split('.').pop()}`;

  // Generate presigned URL for upload
  const uploadUrl = await this.s3Client.getSignedUrlPromise('putObject', {
    Bucket: this.bucketName,
    Key: key,
    ContentType: contentType,
    Expires: expiresIn,
    ACL: 'public-read', // Make file publicly accessible
  });

  // Generate public URL (this is what was missing!)
  const publicUrl = `https://${this.bucketName}.s3.${this.region}.amazonaws.com/${key}`;

  return {
    uploadUrl,
    publicUrl, // ⚠️ THIS WAS MISSING
  };
}
```

### Alternative: Using AWS SDK v3

If you're using AWS SDK v3:

```typescript
import { S3Client } from '@aws-sdk/client-s3';
import { PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { v4 as uuidv4 } from 'uuid';

async generatePresignedUploadUrl(
  folder: string,
  fileName: string,
  contentType: string,
  expiresIn: number = 3600,
): Promise<{ uploadUrl: string; publicUrl: string }> {
  const key = `${folder}/${uuidv4()}.${fileName.split('.').pop()}`;

  const command = new PutObjectCommand({
    Bucket: this.bucketName,
    Key: key,
    ContentType: contentType,
    ACL: 'public-read',
  });

  // Generate presigned URL
  const uploadUrl = await getSignedUrl(this.s3Client, command, { 
    expiresIn 
  });

  // Generate public URL
  const publicUrl = `https://${this.bucketName}.s3.${this.region}.amazonaws.com/${key}`;

  return {
    uploadUrl,
    publicUrl,
  };
}
```

## Additional Issues

### 1. S3 Upload Returns 400 Bad Request

The error shows `x-amz-checksum-crc32=AAAAAA%3D%3D` in the URL. This might be causing issues.

**Solution:** Remove checksum-related parameters when generating presigned URL:

```typescript
const uploadUrl = await this.s3Client.getSignedUrlPromise('putObject', {
  Bucket: this.bucketName,
  Key: key,
  ContentType: contentType,
  Expires: expiresIn,
  ACL: 'public-read',
  // Don't include ChecksumAlgorithm or other checksum params
});
```

### 2. Verify S3 Bucket Policy

Ensure your bucket allows public-read ACL:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "PublicReadGetObject",
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::ambit-gym/*"
    }
  ]
}
```

### 3. Verify S3 Bucket Settings

In AWS Console:
1. Go to S3 → ambit-gym bucket
2. Permissions tab
3. **Block Public Access** - Ensure "Block all public access" is OFF
4. **Object Ownership** - Set to "ACLs enabled"

## Testing

After fixing the backend:

1. Restart your NestJS server
2. Try uploading an image
3. Check console logs - should see:
   ```
   ✅ Presigned URL received: {
     uploadUrl: "https://...",
     publicUrl: "https://ambit-gym.s3.ap-southeast-1.amazonaws.com/..."
   }
   ```

4. If upload succeeds, `publicUrl` should be a valid image URL you can open in browser

## Frontend Already Updated

The frontend now:
- ✅ Validates that `publicUrl` exists
- ✅ Shows clear error if backend doesn't return `publicUrl`
- ✅ Logs S3 response status and error details
- ✅ Handles errors gracefully

Focus on fixing the backend S3Service!
