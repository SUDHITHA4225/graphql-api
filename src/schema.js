/**
 * GraphQL Type Definitions (Schema)
 */
export const typeDefs = `#graphql
  # User type
  type User {
    id: ID!
    username: String!
    email: String!
    role: String!
    createdAt: String!
    posts: [Post!]!
  }

  # Post type
  type Post {
    id: ID!
    title: String!
    content: String!
    author: User!
    published: Boolean!
    createdAt: String!
    updatedAt: String!
    comments(first: Int, after: String): CommentConnection!
  }

  # Comment type
  type Comment {
    id: ID!
    content: String!
    author: User!
    post: Post!
    createdAt: String!
  }

  # Pagination Types
  type UserEdge {
    cursor: String!
    node: User!
  }

  type UserConnection {
    edges: [UserEdge!]!
    pageInfo: PageInfo!
  }

  type PostEdge {
    cursor: String!
    node: Post!
  }

  type PostConnection {
    edges: [PostEdge!]!
    pageInfo: PageInfo!
  }

  type CommentEdge {
    cursor: String!
    node: Comment!
  }

  type CommentConnection {
    edges: [CommentEdge!]!
    pageInfo: PageInfo!
  }

  type PageInfo {
    hasNextPage: Boolean!
    endCursor: String
  }

  # Query root type
  type Query {
    # Get a single user by ID
    user(id: ID!): User

    # Get paginated list of users
    users(first: Int, after: String): UserConnection!

    # Get currently authenticated user
    me: User

    # Get a single post by ID
    post(id: ID!): Post

    # Get paginated list of posts
    posts(first: Int, after: String, published: Boolean): PostConnection!
  }

  # Mutation root type
  type Mutation {
    # Create a new post
    createPost(input: CreatePostInput!): Post!

    # Update a post
    updatePost(id: ID!, input: UpdatePostInput!): Post!

    # Delete a post
    deletePost(id: ID!): Boolean!

    # Create a comment on a post
    createComment(input: CreateCommentInput!): Comment!
  }

  # Subscription root type
  type Subscription {
    # Subscribe to new posts being created
    postCreated: Post!

    # Subscribe to new comments on a specific post
    commentAdded(postId: ID!): Comment!
  }

  # Input types
  input CreatePostInput {
    title: String!
    content: String!
    published: Boolean
  }

  input UpdatePostInput {
    title: String
    content: String
    published: Boolean
  }

  input CreateCommentInput {
    content: String!
    postId: ID!
  }
`;
