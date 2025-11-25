import { gql } from '@apollo/client';

export const UPLOAD_COURSE_THUMBNAIL = gql`
  mutation UploadCourseThumbnail($file: Upload!, $courseId: String) {
    uploadCourseThumbnail(file: $file, courseId: $courseId) {
      id
      url
      filename
      mimetype
      size
      bucket
    }
  }
`;

export const UPLOAD_LESSON_VIDEO = gql`
  mutation UploadLessonVideo($file: Upload!, $courseId: String!) {
    uploadLessonVideo(file: $file, courseId: $courseId) {
      id
      url
      filename
      mimetype
      size
      bucket
    }
  }
`;

export const UPLOAD_COURSE_MATERIAL = gql`
  mutation UploadCourseMaterial($file: Upload!, $courseId: String!) {
    uploadCourseMaterial(file: $file, courseId: $courseId) {
      id
      url
      filename
      mimetype
      size
      bucket
    }
  }
`;

export const DELETE_FILE = gql`
  mutation DeleteFile($fileId: String!, $bucket: String!) {
    deleteFile(fileId: $fileId, bucket: $bucket)
  }
`;

export const GET_PRESIGNED_URL = gql`
  query GetPresignedUrl($fileId: String!, $bucket: String!, $expiresIn: Int) {
    getPresignedUrl(fileId: $fileId, bucket: $bucket, expiresIn: $expiresIn)
  }
`;
