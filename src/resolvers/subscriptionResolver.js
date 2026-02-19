import { PubSub } from 'graphql-subscriptions';

/**
 * Subscription Resolver
 */
export const subscriptionResolver = {
  Subscription: {
    /**
     * Subscribe to new posts being created
     */
    postCreated: {
      subscribe: (_, __, context) => {
        return context.pubsub.asyncIterator(['POST_CREATED']);
      },
    },

    /**
     * Subscribe to new comments on a specific post
     */
    commentAdded: {
      subscribe: (_, { postId }, context) => {
        return context.pubsub.asyncIterator([`COMMENT_ADDED_${postId}`]);
      },
    },
  },
};
