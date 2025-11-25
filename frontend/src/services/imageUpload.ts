import { gql } from '@apollo/client';
import { apolloClient } from '@/lib/apollo-client';

export interface ImageUploadResult {
  success: boolean;
  url: string;
  filename: string;
  bucket: string;
  size: number;
  width?: number;
  height?: number;
  format?: string;
}

export interface ImageEditOptions {
  resize?: {
    width?: number;
    height?: number;
    fit?: 'cover' | 'contain' | 'fill' | 'inside' | 'outside';
  };
  crop?: {
    left: number;
    top: number;
    width: number;
    height: number;
  };
  rotate?: number;
  flip?: boolean;
  flop?: boolean;
  blur?: number;
  sharpen?: boolean;
  greyscale?: boolean;
  quality?: number;
  format?: 'jpeg' | 'png' | 'webp' | 'avif';
}

export interface ImageMappingConfig {
  modelName: string;
  idField: string;
  imageField: string;
  recordId: string | number;
}

class ImageUploadService {
  /**
   * Upload single image
   */
  async uploadImage(
    file: File,
    bucket: string = 'images',
    editOptions?: ImageEditOptions
  ): Promise<ImageUploadResult> {
    const mutation = gql`
      mutation UploadImage(
        $file: Upload!
        $bucket: String
        $editOptions: JSON
      ) {
        uploadImage(file: $file, bucket: $bucket, editOptions: $editOptions) {
          success
          url
          filename
          bucket
          size
          width
          height
          format
        }
      }
    `;

    try {
      const { data } = await apolloClient.mutate({
        mutation,
        variables: {
          file,
          bucket,
          editOptions,
        },
        context: {
          hasUpload: true,
        },
      });

      return data.uploadImage;
    } catch (error: any) {
      console.error('Upload image error:', error);
      throw new Error(error.message || 'Failed to upload image');
    }
  }

  /**
   * Upload and map image to database record
   */
  async uploadAndMapImage(
    file: File,
    mappingConfig: ImageMappingConfig,
    editOptions?: ImageEditOptions
  ): Promise<{ uploadResult: ImageUploadResult; mappingResult: any }> {
    const mutation = gql`
      mutation UploadAndMapImage(
        $file: Upload!
        $mappingConfig: JSON!
        $editOptions: JSON
      ) {
        uploadAndMapImage(
          file: $file
          mappingConfig: $mappingConfig
          editOptions: $editOptions
        ) {
          uploadResult {
            success
            url
            filename
            bucket
            size
            width
            height
            format
          }
          mappingResult
        }
      }
    `;

    try {
      const { data } = await apolloClient.mutate({
        mutation,
        variables: {
          file,
          mappingConfig,
          editOptions,
        },
        context: {
          hasUpload: true,
        },
      });

      return data.uploadAndMapImage;
    } catch (error: any) {
      console.error('Upload and map image error:', error);
      throw new Error(error.message || 'Failed to upload and map image');
    }
  }

  /**
   * Upload multiple images
   */
  async uploadMultipleImages(
    files: File[],
    bucket: string = 'images',
    editOptions?: ImageEditOptions
  ): Promise<ImageUploadResult[]> {
    const mutation = gql`
      mutation UploadMultipleImages(
        $files: [Upload!]!
        $bucket: String
        $editOptions: JSON
      ) {
        uploadMultipleImages(
          files: $files
          bucket: $bucket
          editOptions: $editOptions
        ) {
          success
          url
          filename
          bucket
          size
          width
          height
          format
        }
      }
    `;

    try {
      const { data } = await apolloClient.mutate({
        mutation,
        variables: {
          files,
          bucket,
          editOptions,
        },
        context: {
          hasUpload: true,
        },
      });

      return data.uploadMultipleImages;
    } catch (error: any) {
      console.error('Upload multiple images error:', error);
      throw new Error(error.message || 'Failed to upload multiple images');
    }
  }

  /**
   * Copy image from URL
   */
  async copyImageFromUrl(
    imageUrl: string,
    filename: string,
    bucket: string = 'images',
    editOptions?: ImageEditOptions
  ): Promise<ImageUploadResult> {
    const mutation = gql`
      mutation CopyImageFromUrl(
        $imageUrl: String!
        $filename: String!
        $bucket: String
        $editOptions: JSON
      ) {
        copyImageFromUrl(
          imageUrl: $imageUrl
          filename: $filename
          bucket: $bucket
          editOptions: $editOptions
        ) {
          success
          url
          filename
          bucket
          size
          width
          height
          format
        }
      }
    `;

    try {
      const { data } = await apolloClient.mutate({
        mutation,
        variables: {
          imageUrl,
          filename,
          bucket,
          editOptions,
        },
      });

      return data.copyImageFromUrl;
    } catch (error: any) {
      console.error('Copy image from URL error:', error);
      throw new Error(error.message || 'Failed to copy image from URL');
    }
  }

  /**
   * Batch upload and map images
   */
  async batchUploadAndMap(
    items: Array<{
      file: File;
      mappingConfig: ImageMappingConfig;
      editOptions?: ImageEditOptions;
    }>
  ): Promise<
    Array<{
      uploadResult: ImageUploadResult;
      mappingResult: any;
      error?: string;
    }>
  > {
    const mutation = gql`
      mutation BatchUploadAndMap($items: JSON!) {
        batchUploadAndMap(items: $items) {
          uploadResult {
            success
            url
            filename
            bucket
            size
            width
            height
            format
          }
          mappingResult
          error
        }
      }
    `;

    try {
      const { data } = await apolloClient.mutate({
        mutation,
        variables: {
          items,
        },
        context: {
          hasUpload: true,
        },
      });

      return data.batchUploadAndMap;
    } catch (error: any) {
      console.error('Batch upload and map error:', error);
      throw new Error(error.message || 'Failed to batch upload and map');
    }
  }

  /**
   * Validate image file
   */
  validateImageFile(file: File): { valid: boolean; error?: string } {
    // Check file type
    if (!file.type.startsWith('image/')) {
      return { valid: false, error: 'File is not an image' };
    }

    // Check file size (10MB max)
    if (file.size > 10 * 1024 * 1024) {
      return { valid: false, error: 'File size exceeds 10MB' };
    }

    return { valid: true };
  }

  /**
   * Create image preview from File
   */
  createImagePreview(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target?.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  /**
   * Resize image on client side using canvas
   */
  async resizeImage(
    file: File,
    maxWidth: number,
    maxHeight: number,
    quality: number = 0.8
  ): Promise<File> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');

      img.onload = () => {
        let { width, height } = img;

        if (width > maxWidth || height > maxHeight) {
          const ratio = Math.min(maxWidth / width, maxHeight / height);
          width *= ratio;
          height *= ratio;
        }

        canvas.width = width;
        canvas.height = height;
        ctx?.drawImage(img, 0, 0, width, height);

        canvas.toBlob(
          (blob) => {
            if (blob) {
              const resizedFile = new File([blob], file.name, {
                type: file.type,
              });
              resolve(resizedFile);
            } else {
              reject(new Error('Failed to resize image'));
            }
          },
          file.type,
          quality
        );
      };

      img.onerror = reject;
      img.src = URL.createObjectURL(file);
    });
  }

  /**
   * Convert blob to File
   */
  blobToFile(blob: Blob, filename: string): File {
    return new File([blob], filename, { type: blob.type });
  }

  /**
   * Download image from URL as File
   */
  async downloadImageAsFile(url: string, filename: string): Promise<File> {
    const response = await fetch(url);
    const blob = await response.blob();
    return this.blobToFile(blob, filename);
  }
}

export default new ImageUploadService();
