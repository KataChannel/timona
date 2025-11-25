import { gql } from '@apollo/client';

// Fragment for File fields
export const FILE_FIELDS = gql`
  fragment FileFields on File {
    id
    filename
    originalName
    mimeType
    size
    fileType
    url
    bucket
    path
    folderId
    userId
    visibility
    title
    description
    alt
    tags
    metadata
    width
    height
    thumbnailUrl
    downloadCount
    viewCount
    createdAt
    updatedAt
  }
`;

// Fragment for Folder fields
export const FOLDER_FIELDS = gql`
  fragment FolderFields on FileFolder {
    id
    name
    description
    parentId
    path
    userId
    color
    icon
    isSystem
    createdAt
    updatedAt
  }
`;

// Get single file
export const GET_FILE = gql`
  ${FILE_FIELDS}
  query GetFile($id: ID!) {
    file(id: $id) {
      ...FileFields
      folder {
        id
        name
        path
      }
    }
  }
`;

// Get files with pagination and filters
export const GET_FILES = gql`
  ${FILE_FIELDS}
  query GetFiles($input: GetFilesInput) {
    files(input: $input) {
      items {
        ...FileFields
        folder {
          id
          name
          path
        }
      }
      total
      page
      limit
      totalPages
      hasNextPage
      hasPreviousPage
    }
  }
`;

// Get single folder
export const GET_FOLDER = gql`
  ${FOLDER_FIELDS}
  query GetFolder($id: ID!) {
    folder(id: $id) {
      ...FolderFields
      parent {
        id
        name
        path
      }
      children {
        id
        name
        path
      }
      files {
        id
        filename
        originalName
        url
        fileType
        size
      }
    }
  }
`;

// Get all folders
export const GET_FOLDERS = gql`
  ${FOLDER_FIELDS}
  query GetFolders {
    folders {
      ...FolderFields
      children {
        id
        name
        path
      }
    }
  }
`;

// Get storage statistics
export const GET_STORAGE_STATS = gql`
  query GetStorageStats {
    fileStorageStats {
      totalFiles
      totalSize
      totalFolders
      filesByType {
        type
        count
        totalSize
      }
      filesByVisibility {
        visibility
        count
      }
    }
  }
`;

// Update file mutation
export const UPDATE_FILE = gql`
  ${FILE_FIELDS}
  mutation UpdateFile($input: UpdateFileInput!) {
    updateFile(input: $input) {
      ...FileFields
    }
  }
`;

// Delete file mutation
export const DELETE_FILE = gql`
  mutation DeleteFile($id: ID!) {
    deleteFile(id: $id)
  }
`;

// Move files mutation
export const MOVE_FILES = gql`
  ${FILE_FIELDS}
  mutation MoveFiles($input: MoveFilesInput!) {
    moveFiles(input: $input) {
      ...FileFields
    }
  }
`;

// Bulk delete files mutation
export const BULK_DELETE_FILES = gql`
  mutation BulkDeleteFiles($input: BulkDeleteFilesInput!) {
    bulkDeleteFiles(input: $input)
  }
`;

// Bulk update files mutation
export const BULK_UPDATE_FILES = gql`
  ${FILE_FIELDS}
  mutation BulkUpdateFiles($input: BulkUpdateFilesInput!) {
    bulkUpdateFiles(input: $input) {
      ...FileFields
    }
  }
`;

// Create folder mutation
export const CREATE_FOLDER = gql`
  ${FOLDER_FIELDS}
  mutation CreateFolder($input: CreateFolderInput!) {
    createFolder(input: $input) {
      ...FolderFields
    }
  }
`;

// Update folder mutation
export const UPDATE_FOLDER = gql`
  ${FOLDER_FIELDS}
  mutation UpdateFolder($input: UpdateFolderInput!) {
    updateFolder(input: $input) {
      ...FolderFields
    }
  }
`;

// Delete folder mutation
export const DELETE_FOLDER = gql`
  mutation DeleteFolder($id: ID!) {
    deleteFolder(id: $id)
  }
`;

// Create file share mutation
export const CREATE_FILE_SHARE = gql`
  mutation CreateFileShare($input: CreateFileShareInput!) {
    createFileShare(input: $input) {
      id
      fileId
      token
      sharedBy
      sharedWith
      expiresAt
      canDownload
      canView
      createdAt
    }
  }
`;
