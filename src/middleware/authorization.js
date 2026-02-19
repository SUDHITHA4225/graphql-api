/**
 * Field-level authorization for the email field
 * A user can see their own email, admins can see any email, regular users
 * cannot see other users' emails
 */
export async function authorizeEmailField(email, user, targetUserId) {
  // If not authenticated, return null
  if (!user) {
    return null;
  }

  // User can always see their own email
  if (user.userId === targetUserId) {
    return email;
  }

  // Admin can see any email
  if (user.role === 'admin') {
    return email;
  }

  // Regular user cannot see other users' emails
  return null;
}

/**
 * Check if user can edit post (author or admin)
 */
export function canEditPost(user, post) {
  if (!user) {
    throw new Error('Not authenticated');
  }

  if (user.role === 'admin' || user.userId === post.authorId) {
    return true;
  }

  throw new Error('Not authorized to edit this post');
}

/**
 * Check if user can delete post (author or admin)
 */
export function canDeletePost(user, post) {
  if (!user) {
    throw new Error('Not authenticated');
  }

  if (user.role === 'admin' || user.userId === post.authorId) {
    return true;
  }

  throw new Error('Not authorized to delete this post');
}
