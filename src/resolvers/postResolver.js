import { requireAuth, requireAdmin } from '../auth/jwt.js';
import { canEditPost, canDeletePost } from '../middleware/authorization.js';

/**
 * Post Resolver
 */
export const postResolver = {
  Query: {
    /**
     * Get a single post by ID
     */
    post: async (_, { id }, context) => {
      return context.prisma.post.findUnique({
        where: { id: parseInt(id) },
      });
    },

    /**
     * Get paginated list of posts with optional published filter
     */
    posts: async (_, { first = 10, after, published }, context) => {
      const where = published !== null && published !== undefined
        ? { published }
        : {};

      const posts = await context.prisma.post.findMany({
        where,
        take: first + 1,
        skip: after ? 1 : 0,
        cursor: after ? { id: parseInt(after) } : undefined,
        orderBy: { id: 'asc' },
      });

      const hasNextPage = posts.length > first;
      const edges = posts.slice(0, first).map(post => ({
        cursor: post.id.toString(),
        node: post,
      }));

      return {
        edges,
        pageInfo: {
          hasNextPage,
          endCursor: edges.length > 0 ? edges[edges.length - 1].cursor : null,
        },
      };
    },
  },

  Mutation: {
    /**
     * Create a new post (requires authentication)
     */
    createPost: async (_, { input }, context) => {
      const user = requireAuth(context);

      const post = await context.prisma.post.create({
        data: {
          title: input.title,
          content: input.content,
          authorId: user.userId,
          published: input.published || false,
        },
      });

      // Publish subscription event
      context.pubsub.publish('POST_CREATED', { postCreated: post });

      return post;
    },

    /**
     * Update a post (requires authentication and author ownership or admin)
     */
    updatePost: async (_, { id, input }, context) => {
      const user = requireAuth(context);
      const post = await context.prisma.post.findUnique({
        where: { id: parseInt(id) },
      });

      if (!post) {
        throw new Error('Post not found');
      }

      canEditPost(user, post);

      const updatedPost = await context.prisma.post.update({
        where: { id: parseInt(id) },
        data: {
          title: input.title || post.title,
          content: input.content || post.content,
          published: input.published !== undefined ? input.published : post.published,
        },
      });

      return updatedPost;
    },

    /**
     * Delete a post (requires authentication and author ownership or admin)
     */
    deletePost: async (_, { id }, context) => {
      const user = requireAuth(context);
      const post = await context.prisma.post.findUnique({
        where: { id: parseInt(id) },
      });

      if (!post) {
        throw new Error('Post not found');
      }

      canDeletePost(user, post);

      await context.prisma.post.delete({
        where: { id: parseInt(id) },
      });

      return true;
    },
  },

  /**
   * Post type field resolvers
   */
  Post: {
    /**
     * Resolve author field using DataLoader to batch queries
     */
    author: async (post, _, context) => {
      return context.loaders.userLoader.load(post.authorId);
    },

    /**
     * Resolve comments field with pagination
     */
    comments: async (post, { first = 10, after }, context) => {
      // Get all comments for this post from the loader
      const allComments = await context.loaders.commentsLoader.load(post.id);

      // Apply pagination
      const startIndex = after ? parseInt(after) : 0;
      const comments = allComments.slice(startIndex, startIndex + first);

      const hasNextPage = startIndex + first < allComments.length;
      const edges = comments.map((comment, index) => ({
        cursor: (startIndex + index).toString(),
        node: comment,
      }));

      return {
        edges,
        pageInfo: {
          hasNextPage,
          endCursor: edges.length > 0 ? edges[edges.length - 1].cursor : null,
        },
      };
    },
  },
};
