# 📘 API Reference

> GraphQL API documentation

---

## 🚀 Quick Start

**GraphQL Endpoint**: `http://localhost:12001/graphql`

**Playground**: Visit endpoint in browser for interactive UI

---

## 🔐 Authentication

### Login

```graphql
mutation Login {
  login(input: {
    email: "user@example.com"
    password: "password123"
  }) {
    accessToken
    refreshToken
    user {
      id
      email
      name
      role
    }
  }
}
```

### Register

```graphql
mutation Register {
  register(input: {
    email: "new@example.com"
    password: "password123"
    name: "John Doe"
  }) {
    accessToken
    user {
      id
      email
      name
    }
  }
}
```

### Get Current User

```graphql
query Me {
  me {
    id
    email
    name
    role
    createdAt
  }
}
```

**Headers**:
```
Authorization: Bearer <access_token>
```

---

## 🛒 E-commerce

### Products

```graphql
# List products
query Products {
  products(
    page: 1
    limit: 20
    orderBy: { field: "createdAt", direction: DESC }
  ) {
    data {
      id
      name
      slug
      price
      salePrice
      images
      category {
        id
        name
      }
    }
    meta {
      total
      page
      limit
    }
  }
}

# Get product
query Product($id: ID!) {
  product(id: $id) {
    id
    name
    description
    price
    salePrice
    stock
    images
    variants {
      id
      name
      price
    }
  }
}

# Create product
mutation CreateProduct {
  createProduct(input: {
    name: "Product Name"
    price: 99.99
    categoryId: "cat-id"
    description: "Description"
  }) {
    id
    name
    price
  }
}
```

### Cart

```graphql
# Get cart
query Cart {
  cart {
    id
    items {
      id
      product {
        id
        name
        price
      }
      quantity
      total
    }
    subtotal
    tax
    total
  }
}

# Add to cart
mutation AddToCart {
  addToCart(input: {
    productId: "prod-id"
    quantity: 1
  }) {
    id
    items {
      id
      quantity
    }
  }
}
```

### Orders

```graphql
# Create order
mutation CreateOrder {
  createOrder(input: {
    shippingAddress: {
      street: "123 Main St"
      city: "City"
      country: "Country"
    }
    paymentMethod: CREDIT_CARD
  }) {
    id
    orderNumber
    status
    total
  }
}

# List orders
query Orders {
  orders {
    id
    orderNumber
    status
    total
    createdAt
  }
}
```

---

## 📝 CMS

### Pages

```graphql
# Get page by slug
query Page($slug: String!) {
  pageBySlug(slug: $slug) {
    id
    title
    slug
    content
    seoTitle
    seoDescription
  }
}

# Create page
mutation CreatePage {
  createPage(input: {
    title: "Page Title"
    slug: "page-slug"
    content: "{blocks: []}"
    status: PUBLISHED
  }) {
    id
    title
    slug
  }
}
```

### Blog Posts

```graphql
# List posts
query Posts {
  posts(limit: 10) {
    id
    title
    slug
    excerpt
    featuredImage
    author {
      name
    }
    createdAt
  }
}

# Get post
query Post($slug: String!) {
  postBySlug(slug: $slug) {
    id
    title
    content
    author {
      name
      avatar
    }
  }
}
```

---

## 🎓 LMS

### Courses

```graphql
# List courses
query Courses {
  courses {
    id
    title
    description
    thumbnail
    price
    instructor {
      name
    }
    enrollmentCount
  }
}

# Get course
query Course($id: ID!) {
  course(id: $id) {
    id
    title
    description
    modules {
      id
      title
      lessons {
        id
        title
        duration
      }
    }
  }
}

# Enroll in course
mutation EnrollCourse {
  enrollCourse(courseId: "course-id") {
    id
    progress
  }
}
```

### Lessons

```graphql
# Get lesson
query Lesson($id: ID!) {
  lesson(id: $id) {
    id
    title
    content
    videoUrl
    duration
    quiz {
      id
      questions {
        id
        question
        options
      }
    }
  }
}

# Complete lesson
mutation CompleteLesson {
  completeLesson(lessonId: "lesson-id") {
    id
    completed
  }
}
```

---

## 📊 Project Management

### Projects

```graphql
# List projects
query Projects {
  projects {
    id
    name
    description
    owner {
      name
    }
    members {
      user {
        name
      }
      role
    }
  }
}

# Create project
mutation CreateProject {
  createProject(input: {
    name: "Project Name"
    description: "Description"
  }) {
    id
    name
  }
}
```

### Tasks

```graphql
# List tasks
query Tasks($projectId: ID!) {
  tasks(projectId: $projectId) {
    id
    title
    status
    priority
    assignee {
      name
    }
    dueDate
  }
}

# Create task
mutation CreateTask {
  createTask(input: {
    projectId: "proj-id"
    title: "Task Title"
    status: TODO
    priority: HIGH
  }) {
    id
    title
  }
}
```

---

## 🔔 Notifications

```graphql
# Get notifications
query Notifications {
  notifications {
    id
    title
    message
    type
    read
    createdAt
  }
}

# Mark as read
mutation MarkNotificationRead {
  markNotificationRead(id: "notif-id") {
    id
    read
  }
}
```

---

## 📁 File Manager

```graphql
# Upload file
mutation UploadFile($file: Upload!) {
  uploadFile(file: $file) {
    id
    filename
    url
    size
    mimeType
  }
}

# List files
query Files {
  files {
    id
    filename
    url
    size
    createdAt
  }
}
```

---

## 🚀 Release Hub

### Releases

```graphql
# List releases
query Releases {
  releases {
    id
    version
    title
    releaseType
    status
    publishedAt
  }
}

# Get release
query Release($id: ID!) {
  release(id: $id) {
    id
    version
    title
    description
    features
    improvements
    bugFixes
    downloadUrl
  }
}
```

### Support Tickets

```graphql
# Create ticket
mutation CreateTicket {
  createTechnicalSupportTicket(input: {
    subject: "Issue Title"
    description: "Details..."
    category: TECHNICAL_SUPPORT
    priority: HIGH
  }) {
    id
    ticketNumber
    status
  }
}

# List tickets
query Tickets {
  technicalSupportTickets {
    id
    ticketNumber
    subject
    status
    priority
    createdAt
  }
}
```

---

## 🔒 RBAC

### Roles & Permissions

```graphql
# List roles
query Roles {
  roles {
    id
    name
    permissions {
      name
      resource
      action
    }
  }
}

# Assign role
mutation AssignRole {
  assignRoleToUser(
    userId: "user-id"
    roleId: "role-id"
  ) {
    id
    roles {
      name
    }
  }
}
```

---

## ⚡ Real-time (Subscriptions)

```graphql
# Subscribe to notifications
subscription OnNotification {
  notificationReceived {
    id
    title
    message
  }
}

# Subscribe to chat messages
subscription OnMessage($conversationId: ID!) {
  messageReceived(conversationId: $conversationId) {
    id
    content
    sender {
      name
    }
  }
}
```

---

## 📊 Error Handling

### Error Response Format

```json
{
  "errors": [
    {
      "message": "Not authenticated",
      "extensions": {
        "code": "UNAUTHENTICATED"
      }
    }
  ]
}
```

### Common Error Codes

- `UNAUTHENTICATED` - Not logged in
- `FORBIDDEN` - No permission
- `BAD_USER_INPUT` - Invalid input
- `NOT_FOUND` - Resource not found
- `INTERNAL_SERVER_ERROR` - Server error

---

## 🧪 Testing

**Using curl**:
```bash
curl http://localhost:12001/graphql \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{"query": "{ me { id name } }"}'
```

**Using GraphQL Playground**:
Visit `http://localhost:12001/graphql` in browser

---

**Total Endpoints**: 100+ queries/mutations  
**Last Updated**: 2025-11-21  
**Version**: 1.0.0
