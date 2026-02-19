import DataLoader from 'dataloader';

/**
 * Create a DataLoader for batching user queries by ID
 */
export function createUserLoader(prisma) {
  return new DataLoader(async (userIds) => {
    // Fetch all users in a single query using IN clause
    const users = await prisma.user.findMany({
      where: {
        id: {
          in: userIds,
        },
      },
    });

    // Create a map for quick lookup
    const userMap = new Map();
    users.forEach(user => {
      userMap.set(user.id, user);
    });

    // Return users in the same order as requested
    return userIds.map(userId => userMap.get(userId) || null);
  });
}

/**
 * Create a DataLoader for batching comment queries by post ID
 */
export function createCommentsLoader(prisma) {
  return new DataLoader(async (postIds) => {
    // Fetch all comments for these posts in a single query using IN clause
    const comments = await prisma.comment.findMany({
      where: {
        postId: {
          in: postIds,
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Group comments by post ID
    const commentsByPost = new Map();
    postIds.forEach(postId => {
      commentsByPost.set(postId, []);
    });

    comments.forEach(comment => {
      const postComments = commentsByPost.get(comment.postId);
      if (postComments) {
        postComments.push(comment);
      }
    });

    // Return comments grouped by post in the same order as requested
    return postIds.map(postId => commentsByPost.get(postId) || []);
  });
}

/**
 * Create all dataloaders and attach to context
 */
export function createDataLoaders(prisma) {
  return {
    userLoader: createUserLoader(prisma),
    commentsLoader: createCommentsLoader(prisma),
  };
}
