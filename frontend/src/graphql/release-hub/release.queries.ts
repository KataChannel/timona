import { gql } from '@apollo/client';

export const GET_SYSTEM_RELEASES = gql`
  query GetSystemReleases($where: SystemReleaseWhereInput, $take: Int, $skip: Int) {
    systemReleases(where: $where, take: $take, skip: $skip) {
      id
      version
      versionNumber
      releaseType
      status
      title
      description
      summary
      features
      improvements
      bugfixes
      breakingChanges
      releaseDate
      publishedAt
      slug
      thumbnailUrl
      viewCount
      downloadCount
      createdAt
    }
  }
`;

export const GET_SYSTEM_RELEASE = gql`
  query GetSystemRelease($id: String!) {
    systemRelease(id: $id) {
      id
      version
      versionNumber
      releaseType
      status
      title
      description
      summary
      features
      improvements
      bugfixes
      breakingChanges
      releaseNotes
      upgradeGuide
      deprecations
      deploymentDate
      releaseDate
      publishedAt
      thumbnailUrl
      videoUrl
      screenshotUrls
      slug
      metaTitle
      metaDescription
      keywords
      viewCount
      downloadCount
      createdAt
      updatedAt
    }
  }
`;

export const GET_SYSTEM_RELEASE_BY_SLUG = gql`
  query GetSystemReleaseBySlug($slug: String!) {
    systemReleaseBySlug(slug: $slug) {
      id
      version
      versionNumber
      releaseType
      status
      title
      description
      summary
      features
      improvements
      bugfixes
      breakingChanges
      releaseNotes
      upgradeGuide
      deprecations
      deploymentDate
      releaseDate
      publishedAt
      thumbnailUrl
      videoUrl
      screenshotUrls
      slug
      metaTitle
      metaDescription
      keywords
      viewCount
      downloadCount
      createdAt
      updatedAt
    }
  }
`;

export const GET_LATEST_SYSTEM_RELEASE = gql`
  query GetLatestSystemRelease {
    latestSystemRelease {
      id
      version
      versionNumber
      releaseType
      status
      title
      description
      summary
      features
      improvements
      bugfixes
      breakingChanges
      releaseNotes
      upgradeGuide
      releaseDate
      publishedAt
      slug
      thumbnailUrl
    }
  }
`;

export const CREATE_SYSTEM_RELEASE = gql`
  mutation CreateSystemRelease($input: CreateSystemReleaseInput!) {
    createSystemRelease(input: $input) {
      id
      version
      versionNumber
      releaseType
      status
      title
      slug
      createdAt
    }
  }
`;

export const UPDATE_SYSTEM_RELEASE = gql`
  mutation UpdateSystemRelease($id: String!, $input: UpdateSystemReleaseInput!) {
    updateSystemRelease(id: $id, input: $input) {
      id
      version
      status
      title
      updatedAt
    }
  }
`;

export const PUBLISH_SYSTEM_RELEASE = gql`
  mutation PublishSystemRelease($id: String!) {
    publishSystemRelease(id: $id) {
      id
      version
      status
      publishedAt
      releaseDate
    }
  }
`;

export const DELETE_SYSTEM_RELEASE = gql`
  mutation DeleteSystemRelease($id: String!) {
    deleteSystemRelease(id: $id)
  }
`;

export const INCREMENT_RELEASE_DOWNLOAD = gql`
  mutation IncrementReleaseDownload($id: String!) {
    incrementSystemReleaseDownloadCount(id: $id)
  }
`;
