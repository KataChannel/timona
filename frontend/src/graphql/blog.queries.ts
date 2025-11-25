import { gql } from '@apollo/client';

// ============================================================================
// QUERIES
// ============================================================================

export const GET_BLOGS = gql`
  query GetBlogs(
    $page: Int
    $limit: Int
    $search: String
    $categoryId: ID
    $sort: String
    $statusFilter: String
  ) {
    blogs(
      page: $page
      limit: $limit
      search: $search
      categoryId: $categoryId
      sort: $sort
      statusFilter: $statusFilter
    ) {
      items {
        id
        title
        slug
        shortDescription
        excerpt
        author {
          id
          username
          firstName
          lastName
          email
        }
        featuredImage
        thumbnailUrl
        status
        viewCount
        publishedAt
        createdAt
        category {
          id
          name
          slug
        }
        tags {
          id
          name
          slug
        }
        isFeatured
        isPublished
      }
      total
      page
      pageSize
      totalPages
      hasMore
    }
  }
`;

export const GET_BLOG_BY_SLUG = gql`
  query GetBlogBySlug($slug: String!) {
    blogBySlug(slug: $slug) {
      id
      title
      slug
      content
      shortDescription
      excerpt
      author {
        id
        username
        firstName
        lastName
      }
      thumbnailUrl
      bannerUrl
      viewCount
      publishedAt
      updatedAt
      category {
        id
        name
        slug
      }
      tags {
        id
        name
        slug
      }
      isFeatured
      isPublished
      metaTitle
      metaDescription
      metaKeywords
      createdAt
    }
  }
`;

export const GET_FEATURED_BLOGS = gql`
  query GetFeaturedBlogs($limit: Int) {
    featuredBlogs(limit: $limit) {
      id
      title
      slug
      shortDescription
      thumbnailUrl
      author {
        id
        username
        firstName
        lastName
      }
      publishedAt
      category {
        id
        name
        slug
      }
    }
  }
`;

export const GET_BLOGS_BY_CATEGORY = gql`
  query GetBlogsByCategory($categoryId: ID!, $limit: Int, $page: Int) {
    blogsByCategory(categoryId: $categoryId, limit: $limit, page: $page) {
      items {
        id
        title
        slug
        shortDescription
        excerpt
        author {
          id
          username
          firstName
          lastName
        }
        thumbnailUrl
        viewCount
        publishedAt
        category {
          id
          name
          slug
        }
        isFeatured
      }
      total
      page
      pageSize
      totalPages
      hasMore
    }
  }
`;

export const GET_RELATED_BLOGS = gql`
  query GetRelatedBlogs($categoryId: ID!, $excludeBlogId: ID!, $limit: Int) {
    relatedBlogs(categoryId: $categoryId, excludeBlogId: $excludeBlogId, limit: $limit) {
      id
      title
      slug
      shortDescription
      thumbnailUrl
      author {
        id
        username
        firstName
        lastName
      }
      publishedAt
      viewCount
      category {
        id
        name
        slug
      }
    }
  }
`;

export const GET_BLOG_CATEGORIES = gql`
  query GetBlogCategories {
    blogCategories {
      id
      name
      slug
      description
      thumbnail
    }
  }
`;

// ============================================================================
// TYPES
// ============================================================================

export interface BlogCategory {
  id: string;
  name: string;
  slug: string;
  description?: string;
  thumbnail?: string;
}

export interface BlogTag {
  id: string;
  name: string;
  slug: string;
}

export interface BlogAuthor {
  id: string;
  username: string;
  firstName: string;
  lastName: string;
}

export interface Blog {
  id: string;
  title: string;
  slug: string;
  content: string;
  shortDescription: string;
  excerpt?: string;
  author: BlogAuthor;
  thumbnailUrl: string;
  featuredImage?: string;
  bannerUrl?: string;
  viewCount: number;
  publishedAt: string;
  updatedAt: string;
  category: BlogCategory;
  tags: BlogTag[];
  isFeatured: boolean;
  isPublished: boolean;
  metaTitle?: string;
  metaDescription?: string;
  metaKeywords?: string[];
  createdAt: string;
}

export interface BlogsResponse {
  items: Blog[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
  hasMore: boolean;
}

export interface BlogBySlugResponse {
  blogBySlug: Blog;
}

export interface FeaturedBlogsResponse {
  featuredBlogs: Blog[];
}

export interface BlogsByCategoryResponse {
  blogsByCategory: BlogsResponse;
}

// ============================================================================
// MUTATIONS (Admin)
// ============================================================================

export const CREATE_BLOG = gql`
  mutation CreateBlog($input: CreateBlogInput!) {
    createBlog(input: $input) {
      id
      title
      slug
    }
  }
`;

export const UPDATE_BLOG = gql`
  mutation UpdateBlog($input: UpdateBlogInput!) {
    updateBlog(input: $input) {
      id
      title
      slug
    }
  }
`;

export const DELETE_BLOG = gql`
  mutation DeleteBlog($id: ID!) {
    deleteBlog(id: $id)
  }
`;

// ============================================================================
// BLOG CATEGORY MUTATIONS (Admin)
// ============================================================================

export const CREATE_BLOG_CATEGORY = gql`
  mutation CreateBlogCategory($input: CreateBlogCategoryInput!) {
    createBlogCategory(input: $input) {
      id
      name
      slug
      description
      thumbnail
      order
      isActive
    }
  }
`;

export const UPDATE_BLOG_CATEGORY = gql`
  mutation UpdateBlogCategory($id: ID!, $input: UpdateBlogCategoryInput!) {
    updateBlogCategory(id: $id, input: $input) {
      id
      name
      slug
      description
      thumbnail
      order
      isActive
    }
  }
`;

export const DELETE_BLOG_CATEGORY = gql`
  mutation DeleteBlogCategory($id: ID!) {
    deleteBlogCategory(id: $id)
  }
`;

export const GET_BLOG_CATEGORIES_WITH_COUNT = gql`
  query GetBlogCategoriesWithCount {
    blogCategories {
      id
      name
      slug
      description
      thumbnail
      order
      isActive
      postCount
      createdAt
      updatedAt
    }
  }
`;

export interface RelatedBlogsResponse {
  relatedBlogs: Blog[];
}

export interface BlogCategoriesResponse {
  blogCategories: BlogCategory[];
}

export interface CreateBlogCategoryInput {
  name: string;
  slug: string;
  description?: string;
  thumbnail?: string;
  order?: number;
  isActive?: boolean;
}

export interface UpdateBlogCategoryInput {
  name?: string;
  slug?: string;
  description?: string;
  thumbnail?: string;
  order?: number;
  isActive?: boolean;
}
