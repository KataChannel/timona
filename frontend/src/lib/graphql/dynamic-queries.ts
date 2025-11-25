import { gql } from '@apollo/client';
import { USER_FRAGMENT, POST_FRAGMENT, COMMENT_FRAGMENT } from '@/lib/graphql/shared-fragments';

// Dynamic GraphQL query generator
export class DynamicGraphQLGenerator {
  // Generate basic CRUD queries for any model with support for nested fields
  static generateCRUDQueries(modelName: string, fields: string[] = [], nestedFields: Record<string, string[]> = {}) {
    const modelNameLower = modelName.toLowerCase();
    const modelNameCamel = modelName.charAt(0).toLowerCase() + modelName.slice(1);
    const modelNamePlural = `${modelNameLower}s`;
    
    // Check if this is an ext_ model (uses JSON scalar type)
    const isExtModel = modelName.startsWith('ext_');
    
    // Default fields if none provided
    const defaultFields = fields.length > 0 ? fields : ['id', 'createdAt', 'updatedAt'];
    
    // Build fields string with nested fields support
    let fieldsStr = defaultFields.join('\n    ');
    
    // Add nested fields
    if (Object.keys(nestedFields).length > 0) {
      Object.entries(nestedFields).forEach(([nestedModel, nestedModelFields]) => {
        fieldsStr += `\n    ${nestedModel} {\n      ${nestedModelFields.join('\n      ')}\n    }`;
      });
    }

    // For ext_ models, use JSON type instead of specific FilterInput
    const filterType = isExtModel ? 'JSON' : `${modelName}FilterInput`;

    const queries = {
      // GET ALL
      [`GET_${modelName.toUpperCase()}S`]: isExtModel 
        ? gql`
          query Get${modelName}s($filters: ${filterType}) {
            get${modelName}s(filters: $filters)
          }
        `
        : gql`
          query Get${modelName}s($filters: ${filterType}) {
            get${modelName}s(filters: $filters) {
              ${fieldsStr}
            }
          }
        `,

      // GET ALL PAGINATED
      [`GET_${modelName.toUpperCase()}S_PAGINATED`]: isExtModel
        ? gql`
          query Get${modelName}sPaginated($filters: ${filterType}) {
            get${modelName}sPaginated(filters: $filters)
          }
        `
        : gql`
          query Get${modelName}sPaginated($filters: ${filterType}) {
            get${modelName}sPaginated(filters: $filters) {
              data {
                ${fieldsStr}
              }
              meta {
                total
                page
                limit
                totalPages
                hasNextPage
                hasPrevPage
              }
            }
          }
        `,

      // GET BY ID
      [`GET_${modelName.toUpperCase()}_BY_ID`]: isExtModel
        ? gql`
          query Get${modelName}ById($id: ID!, $options: JSON) {
            get${modelName}ById(id: $id, options: $options)
          }
        `
        : gql`
          query Get${modelName}ById($id: ID!, $options: JSON) {
            get${modelName}ById(id: $id, options: $options) {
              ${fieldsStr}
            }
          }
        `,

      // CREATE
      [`CREATE_${modelName.toUpperCase()}`]: isExtModel
        ? gql`
          mutation Create${modelName}($data: JSON!, $options: JSON) {
            create${modelName}(data: $data, options: $options)
          }
        `
        : gql`
          mutation Create${modelName}($data: JSON!, $options: JSON) {
            create${modelName}(data: $data, options: $options) {
              ${fieldsStr}
            }
          }
        `,

      // CREATE BULK
      [`CREATE_${modelName.toUpperCase()}S_BULK`]: isExtModel
        ? gql`
          mutation Create${modelName}sBulk($input: JSON!, $options: JSON) {
            create${modelName}sBulk(input: $input, options: $options)
          }
        `
        : gql`
          mutation Create${modelName}sBulk($input: JSON!, $options: JSON) {
            create${modelName}sBulk(input: $input, options: $options) {
              success
              count
              data {
                ${fieldsStr}
              }
              errors {
                index
                error
                data
              }
            }
          }
        `,

      // UPDATE
      [`UPDATE_${modelName.toUpperCase()}`]: isExtModel
        ? gql`
          mutation Update${modelName}($id: ID!, $data: JSON!, $options: JSON) {
            update${modelName}(id: $id, data: $data, options: $options)
          }
        `
        : gql`
          mutation Update${modelName}($id: ID!, $data: JSON!, $options: JSON) {
            update${modelName}(id: $id, data: $data, options: $options) {
              ${fieldsStr}
            }
          }
        `,

      // UPDATE BULK
      [`UPDATE_${modelName.toUpperCase()}S_BULK`]: isExtModel
        ? gql`
          mutation Update${modelName}sBulk($input: JSON!, $options: JSON) {
            update${modelName}sBulk(input: $input, options: $options)
          }
        `
        : gql`
          mutation Update${modelName}sBulk($input: JSON!, $options: JSON) {
            update${modelName}sBulk(input: $input, options: $options) {
              success
              count
              data {
                ${fieldsStr}
              }
              errors {
                index
                error
                data
              }
            }
          }
        `,

      // DELETE
      [`DELETE_${modelName.toUpperCase()}`]: isExtModel
        ? gql`
          mutation Delete${modelName}($id: ID!, $options: JSON) {
            delete${modelName}(id: $id, options: $options)
          }
        `
        : gql`
          mutation Delete${modelName}($id: ID!, $options: JSON) {
            delete${modelName}(id: $id, options: $options) {
              ${fieldsStr}
            }
          }
        `,

      // DELETE BULK
      [`DELETE_${modelName.toUpperCase()}S_BULK`]: isExtModel
        ? gql`
          mutation Delete${modelName}sBulk($input: JSON!, $options: JSON) {
            delete${modelName}sBulk(input: $input, options: $options)
          }
        `
        : gql`
          mutation Delete${modelName}sBulk($input: JSON!, $options: JSON) {
            delete${modelName}sBulk(input: $input, options: $options) {
              success
              count
              data {
                ${fieldsStr}
              }
              errors {
                index
                error
                data
              }
            }
          }
        `,

      // UPSERT
      [`UPSERT_${modelName.toUpperCase()}`]: isExtModel
        ? gql`
          mutation Upsert${modelName}($where: JSON!, $create: JSON!, $update: JSON!, $options: JSON) {
            upsert${modelName}(where: $where, create: $create, update: $update, options: $options)
          }
        `
        : gql`
          mutation Upsert${modelName}($where: JSON!, $create: JSON!, $update: JSON!, $options: JSON) {
            upsert${modelName}(where: $where, create: $create, update: $update, options: $options) {
              ${fieldsStr}
            }
          }
        `,

      // COUNT
      [`COUNT_${modelName.toUpperCase()}S`]: gql`
        query Count${modelName}s($where: JSON) {
          count${modelName}s(where: $where)
        }
      `,

      // EXISTS
      [`${modelName.toUpperCase()}_EXISTS`]: gql`
        query ${modelName}Exists($where: JSON!) {
          ${modelNameLower}Exists(where: $where)
        }
      `
    };

    return queries;
  }

  // Generate universal dynamic queries
  static generateUniversalQueries() {
    return {
      DYNAMIC_FIND_MANY: gql`
        query DynamicFindMany($modelName: String!, $filter: JSON) {
          dynamicFindMany(modelName: $modelName, filter: $filter)
        }
      `,

      DYNAMIC_FIND_BY_ID: gql`
        query DynamicFindById($modelName: String!, $id: ID!, $options: JSON) {
          dynamicFindById(modelName: $modelName, id: $id, options: $options)
        }
      `,

      DYNAMIC_CREATE: gql`
        mutation DynamicCreate($modelName: String!, $data: JSON!, $options: JSON) {
          dynamicCreate(modelName: $modelName, data: $data, options: $options)
        }
      `,

      DYNAMIC_UPDATE: gql`
        mutation DynamicUpdate($modelName: String!, $id: ID!, $data: JSON!, $options: JSON) {
          dynamicUpdate(modelName: $modelName, id: $id, data: $data, options: $options)
        }
      `,

      DYNAMIC_DELETE: gql`
        mutation DynamicDelete($modelName: String!, $id: ID!, $options: JSON) {
          dynamicDelete(modelName: $modelName, id: $id, options: $options)
        }
      `,

      DYNAMIC_CREATE_BULK: gql`
        mutation DynamicCreateBulk($modelName: String!, $input: JSON!, $options: JSON) {
          dynamicCreateBulk(modelName: $modelName, input: $input, options: $options) {
            success
            count
            data
            errors {
              index
              error
              data
            }
          }
        }
      `,

      DYNAMIC_UPDATE_BULK: gql`
        mutation DynamicUpdateBulk($modelName: String!, $input: JSON!, $options: JSON) {
          dynamicUpdateBulk(modelName: $modelName, input: $input, options: $options) {
            success
            count
            data
            errors {
              index
              error
              data
            }
          }
        }
      `,

      DYNAMIC_DELETE_BULK: gql`
        mutation DynamicDeleteBulk($modelName: String!, $input: JSON!, $options: JSON) {
          dynamicDeleteBulk(modelName: $modelName, input: $input, options: $options) {
            success
            count
            data
            errors {
              index
              error
              data
            }
          }
        }
      `
    };
  }

  // Generate queries with custom fragments
  static generateQueriesWithFragments(modelName: string, fragment: string) {
    const modelNameUpper = modelName.toUpperCase();
    
    return {
      [`GET_${modelNameUpper}S_WITH_FRAGMENT`]: gql`
        ${fragment}
        query Get${modelName}s($filter: JSON) {
          get${modelName}s(filter: $filter) {
            ...${modelName}Fragment
          }
        }
      `,

      [`CREATE_${modelNameUpper}_WITH_FRAGMENT`]: gql`
        ${fragment}
        mutation Create${modelName}($data: JSON!, $options: JSON) {
          create${modelName}(data: $data, options: $options) {
            ...${modelName}Fragment
          }
        }
      `,

      [`UPDATE_${modelNameUpper}_WITH_FRAGMENT`]: gql`
        ${fragment}
        mutation Update${modelName}($id: ID!, $data: JSON!, $options: JSON) {
          update${modelName}(id: $id, data: $data, options: $options) {
            ...${modelName}Fragment
          }
        }
      `
    };
  }
}

// Common field fragments for different models
// Note: USER_FRAGMENT, POST_FRAGMENT, COMMENT_FRAGMENT are imported from shared-fragments.ts
// to avoid duplication warnings from graphql-tag
export const CommonFragments = {
  USER: USER_FRAGMENT,

  POST: POST_FRAGMENT,

  TASK: gql`
    fragment DynamicTaskFragment on Task {
      id
      title
      description
      category
      priority
      status
      dueDate
      userId
      createdAt
      updatedAt
    }
  `,

  COMMENT: COMMENT_FRAGMENT
};

// Pre-generated queries for common models
export const UserQueries = DynamicGraphQLGenerator.generateCRUDQueries('User', [
  'id', 'email', 'username', 'firstName', 'lastName', 'avatar', 'role', 'isActive', 'createdAt', 'updatedAt'
]);

export const PostQueries = DynamicGraphQLGenerator.generateCRUDQueries('Post', [
  'id', 'title', 'content', 'excerpt', 'slug', 'status', 'publishedAt', 'authorId', 'createdAt', 'updatedAt'
]);

export const TaskQueries = DynamicGraphQLGenerator.generateCRUDQueries('Task', [
  'id', 'title', 'description', 'category', 'priority', 'status', 'dueDate', 'userId', 'createdAt', 'updatedAt'
]);

export const CommentQueries = DynamicGraphQLGenerator.generateCRUDQueries('Comment', [
  'id', 'content', 'postId', 'userId', 'parentId', 'createdAt', 'updatedAt'
]);

export const UniversalQueries = DynamicGraphQLGenerator.generateUniversalQueries();

// Model field configurations for query generation
export const ModelFieldConfigs = {
  User: ['id', 'email', 'username', 'firstName', 'lastName', 'avatar', 'role', 'isActive', 'createdAt', 'updatedAt'],
  Post: ['id', 'title', 'content', 'excerpt', 'slug', 'status', 'publishedAt', 'authorId', 'createdAt', 'updatedAt'],
  Task: ['id', 'title', 'description', 'category', 'priority', 'status', 'dueDate', 'userId', 'createdAt', 'updatedAt'],
  Comment: ['id', 'content', 'postId', 'userId', 'parentId', 'createdAt', 'updatedAt'],
  Tag: ['id', 'name', 'slug', 'description', 'color', 'createdAt', 'updatedAt'],
  Media: ['id', 'filename', 'fileUrl', 'fileSize', 'mimeType', 'uploadedById', 'createdAt'],
  TaskComment: ['id', 'content', 'taskId', 'authorId', 'parentId', 'createdAt', 'updatedAt'],
  TaskShare: ['id', 'taskId', 'userId', 'permission', 'shareToken', 'expiresAt', 'isActive', 'createdAt'],
  TaskMedia: ['id', 'filename', 'url', 'type', 'size', 'mimeType', 'taskId', 'uploadedBy', 'createdAt']
};

// Auto-generate queries for all configured models
export const AllModelQueries = Object.entries(ModelFieldConfigs).reduce((acc, [modelName, fields]) => {
  acc[modelName] = DynamicGraphQLGenerator.generateCRUDQueries(modelName, fields);
  return acc;
}, {} as Record<string, any>);

// Export all queries in a flat structure for easy importing
export const {
  GET_USERS,
  GET_USERS_PAGINATED,
  GET_USER_BY_ID,
  CREATE_USER,
  CREATE_USERS_BULK,
  UPDATE_USER,
  UPDATE_USERS_BULK,
  DELETE_USER,
  DELETE_USERS_BULK,
  UPSERT_USER,
  COUNT_USERS,
  USER_EXISTS
} = UserQueries;

export const {
  GET_POSTS,
  GET_POSTS_PAGINATED,
  GET_POST_BY_ID,
  CREATE_POST,
  CREATE_POSTS_BULK,
  UPDATE_POST,
  UPDATE_POSTS_BULK,
  DELETE_POST,
  DELETE_POSTS_BULK,
  UPSERT_POST,
  COUNT_POSTS,
  POST_EXISTS
} = PostQueries;

export const {
  GET_TASKS,
  GET_TASKS_PAGINATED,
  GET_TASK_BY_ID,
  CREATE_TASK,
  CREATE_TASKS_BULK,
  UPDATE_TASK,
  UPDATE_TASKS_BULK,
  DELETE_TASK,
  DELETE_TASKS_BULK,
  UPSERT_TASK,
  COUNT_TASKS,
  TASK_EXISTS
} = TaskQueries;

export const {
  GET_COMMENTS,
  GET_COMMENTS_PAGINATED,
  GET_COMMENT_BY_ID,
  CREATE_COMMENT,
  CREATE_COMMENTS_BULK,
  UPDATE_COMMENT,
  UPDATE_COMMENTS_BULK,
  DELETE_COMMENT,
  DELETE_COMMENTS_BULK,
  UPSERT_COMMENT,
  COUNT_COMMENTS,
  COMMENT_EXISTS
} = CommentQueries;

export const {
  DYNAMIC_FIND_MANY,
  DYNAMIC_FIND_BY_ID,
  DYNAMIC_CREATE,
  DYNAMIC_UPDATE,
  DYNAMIC_DELETE,
  DYNAMIC_CREATE_BULK,
  DYNAMIC_UPDATE_BULK,
  DYNAMIC_DELETE_BULK
} = UniversalQueries;
