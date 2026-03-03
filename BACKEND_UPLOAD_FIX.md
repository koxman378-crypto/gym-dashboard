# Backend Upload Configuration Fix

## Issue
The upload endpoint returns 404 because the UploadController isn't registered in your NestJS app.

## Files to Create/Update on Backend

### 1. Create `src/upload/upload.module.ts`

```typescript
import { Module } from '@nestjs/common';
import { UploadController } from './upload.controller';
import { S3Module } from '../s3/s3.module'; // Adjust path if needed

@Module({
  imports: [S3Module],
  controllers: [UploadController],
})
export class UploadModule {}
```

### 2. Update `src/app.module.ts`

Add the UploadModule to your imports:

```typescript
import { Module } from '@nestjs/common';
import { UploadModule } from './upload/upload.module';
// ... other imports

@Module({
  imports: [
    // ... other modules
    UploadModule,
    // ... rest of imports
  ],
  // ...
})
export class AppModule {}
```

### 3. Fix Profile Update DTO (src/users/dto/update-profile.dto.ts)

The "name must be a string" error suggests your DTO requires the name field. Make it optional:

```typescript
import { IsString, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateProfileDto {
  @ApiProperty({ required: false, example: 'Johnny' })
  @IsString()
  @IsOptional()
  nickname?: string;

  @ApiProperty({ required: false, example: 'https://...' })
  @IsString()
  @IsOptional()
  avatar?: string;
}
```

### 4. Verify Your Upload Controller

Make sure your `src/upload/upload.controller.ts` is exactly as you showed:

```typescript
import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiProperty,
} from '@nestjs/swagger';
import { IsString } from 'class-validator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { S3Service } from '../s3/s3.service';

export class PresignedUrlDto {
  @ApiProperty({ example: 'profile.jpg' })
  @IsString()
  fileName: string;

  @ApiProperty({ example: 'image/jpeg' })
  @IsString()
  contentType: string;
}

@ApiTags('Upload')
@Controller('upload')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class UploadController {
  constructor(private readonly s3Service: S3Service) {}

  @Post('profile-image')
  @ApiOperation({
    summary: 'Generate presigned URL for profile image upload',
    description:
      'Returns a presigned URL for direct upload to S3 and the final public URL.',
  })
  async generateProfileImageUploadUrl(
    @Body() presignedUrlDto: PresignedUrlDto,
    @CurrentUser() user: any,
  ) {
    const folder = `users/${user._id}/profile`;

    return this.s3Service.generatePresignedUploadUrl(
      folder,
      presignedUrlDto.fileName,
      presignedUrlDto.contentType,
      3600, // 1 hour
    );
  }
}
```

## Testing

After making these changes:

1. Restart your NestJS backend server
2. Try uploading a profile image from the frontend
3. The endpoint should now be accessible at `POST /api/upload/profile-image`

## Verification

Check your NestJS logs - you should see the route registered:
```
[Nest] INFO [RouterExplorer] Mapped {/api/upload/profile-image, POST} route
```
