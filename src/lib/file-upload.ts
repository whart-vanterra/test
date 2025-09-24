import { createAdminClient } from './supabase-server';
import { sanitizeFilename, getFileExtension } from './utils';

export interface FileUploadResult {
  url: string;
  path: string;
}

export async function uploadFile(file: File, bucket: string): Promise<FileUploadResult> {
  const supabase = createAdminClient();

  // Validate file size (2MB max)
  const maxSize = 2 * 1024 * 1024; // 2MB
  if (file.size > maxSize) {
    throw new Error('File size must be less than 2MB');
  }

  // Validate file type for images
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'];
  if (!allowedTypes.includes(file.type)) {
    throw new Error('Only image files are allowed');
  }

  // Generate unique filename
  const timestamp = Date.now();
  const extension = getFileExtension(file.name);
  const sanitizedFilename = sanitizeFilename(file.name.replace(`.${extension}`, ''));
  const filename = `${sanitizedFilename}-${timestamp}.${extension}`;

  // Convert File to ArrayBuffer
  const arrayBuffer = await file.arrayBuffer();

  // Upload to Supabase Storage
  const { data, error } = await supabase.storage
    .from(bucket)
    .upload(filename, arrayBuffer, {
      contentType: file.type,
      upsert: false,
    });

  if (error) {
    throw new Error(`Failed to upload file: ${error.message}`);
  }

  // Get public URL
  const { data: urlData } = supabase.storage
    .from(bucket)
    .getPublicUrl(filename);

  return {
    url: urlData.publicUrl,
    path: data.path,
  };
}

export async function deleteFile(path: string, bucket: string): Promise<void> {
  const supabase = createAdminClient();

  const { error } = await supabase.storage
    .from(bucket)
    .remove([path]);

  if (error) {
    throw new Error(`Failed to delete file: ${error.message}`);
  }
}
