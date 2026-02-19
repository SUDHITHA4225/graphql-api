import { requireAuth } from '../auth/jwt.js';

/**
 * Comment Resolver
 */
export const commentResolver = {
  Mutation: {
    /**
     * Create a comment on a post (requires authentication)
     */
    createComment: async (_, { input }, context) => {
      const user = requireAuth(context);

      const post = await context.prisma.post.findUnique({
        where: { id: parseInt(input.postId) },
      });

      if (!post) {
        throw new Error('Post not found');
      }

      const comment = await context.prisma.comment.create({
        data: {
          content: input.content,
          authorId: user.userId,
          postId: parseInt(input.postId),
        },
      });

      // Publish subscription event for this specific post
      context.pubsub.publish(`COMMENT_ADDED_${input.postId}`, {
        commentAdded: comment,
      });

      return comment;
    },
  },

  /**
   * Comment type field resolvers
   */
  Comment: {
    /**
     * Resolve author field using DataLoader
     */
    author: async (comment, _, context) => {
      return context.loaders.userLoader.load(comment.authorId);
    },

    /**
     * Resolve post field
     */
    post: async (comment, _, context) => {
      return context.prisma.post.findUnique({
        where: { id: comment.postId },
      });
    },
  },
};
