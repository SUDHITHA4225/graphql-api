/**
 * User Resolver
 */
export const userResolver = {
  Query: {
    /**
     * Get a single user by ID
     */
    user: async (_, { id }, context) => {
      return context.prisma.user.findUnique({
        where: { id: parseInt(id) },
      });
    },

    /**
     * Get paginated list of users with cursor-based pagination
     */
    users: async (_, { first = 10, after }, context) => {
      const skip = after ? 1 : 0;
      const cursor = after ? { id: parseInt(after) } : undefined;

      const users = await context.prisma.user.findMany({
        take: first + 1,
        skip: after ? 1 : 0,
        cursor: after ? { id: parseInt(after) } : undefined,
        orderBy: { id: 'asc' },
      });

      const hasNextPage = users.length > first;
      const edges = users.slice(0, first).map(user => ({
        cursor: user.id.toString(),
        node: user,
      }));

      return {
        edges,
        pageInfo: {
          hasNextPage,
          endCursor: edges.length > 0 ? edges[edges.length - 1].cursor : null,
        },
      };
    },

    /**
     * Get currently authenticated user
     */
    me: async (_, __, context) => {
      if (!context.user) {
        return null;
      }
      return context.prisma.user.findUnique({
        where: { id: context.user.userId },
      });
    },
  },

  /**
   * User type field resolvers
   */
  User: {
    /**
     * Resolve email field with field-level authorization
     */
    email: (user, _, context) => {
      // Allow access if user is viewing own email
      if (context.user && context.user.userId === user.id) {
        return user.email;
      }

      // Allow access if user is admin
      if (context.user && context.user.role === 'admin') {
        return user.email;
      }

      // Deny access for regular users trying to view others' emails
      // Throw error which will be caught by Apollo and added to errors array
      throw new Error('Not authorized to view this user\'s email');
    },

    /**
     * Resolve posts for a user
     */
    posts: async (user, _, context) => {
      return context.prisma.post.findMany({
        where: { authorId: user.id },
        orderBy: { createdAt: 'desc' },
      });
    },
  },
};
