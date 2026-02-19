import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // Hash password for demo (password123)
  const hashedPassword = await bcrypt.hash('password123', 10);

  // Create users
  const user1 = await prisma.user.upsert({
    where: { email: 'user1@example.com' },
    update: {},
    create: {
      username: 'user1',
      email: 'user1@example.com',
      passwordHash: hashedPassword,
      role: 'user',
    },
  });

  const user2 = await prisma.user.upsert({
    where: { email: 'user2@example.com' },
    update: {},
    create: {
      username: 'user2',
      email: 'user2@example.com',
      passwordHash: hashedPassword,
      role: 'user',
    },
  });

  const admin = await prisma.user.upsert({
    where: { email: 'admin@example.com' },
    update: {},
    create: {
      username: 'admin',
      email: 'admin@example.com',
      passwordHash: hashedPassword,
      role: 'admin',
    },
  });

  console.log('Users created:', { user1, user2, admin });

  // Create posts
  const post1 = await prisma.post.upsert({
    where: { id: 1 },
    update: {},
    create: {
      id: 1,
      title: 'First Post',
      content: 'This is the first post by user1. It covers the basics of GraphQL.',
      authorId: user1.id,
      published: true,
    },
  });

  const post2 = await prisma.post.upsert({
    where: { id: 2 },
    update: {},
    create: {
      id: 2,
      title: 'Second Post',
      content: 'Another great post from user1 about DataLoader optimization.',
      authorId: user1.id,
      published: true,
    },
  });

  const post3 = await prisma.post.upsert({
    where: { id: 3 },
    update: {},
    create: {
      id: 3,
      title: 'User2 Post',
      content: 'A post from user2 about field-level authorization in GraphQL.',
      authorId: user2.id,
      published: true,
    },
  });

  const post4 = await prisma.post.upsert({
    where: { id: 4 },
    update: {},
    create: {
      id: 4,
      title: 'Admin Post',
      content: 'An unpublished post from the admin about subscriptions.',
      authorId: admin.id,
      published: false,
    },
  });

  console.log('Posts created:', { post1, post2, post3, post4 });

  // Create comments
  const comment1 = await prisma.comment.upsert({
    where: { id: 1 },
    update: {},
    create: {
      id: 1,
      content: 'Great post! Very informative.',
      authorId: user2.id,
      postId: post1.id,
    },
  });

  const comment2 = await prisma.comment.upsert({
    where: { id: 2 },
    update: {},
    create: {
      id: 2,
      content: 'Thanks for sharing this knowledge!',
      authorId: admin.id,
      postId: post1.id,
    },
  });

  const comment3 = await prisma.comment.upsert({
    where: { id: 3 },
    update: {},
    create: {
      id: 3,
      content: 'I completely agree with this approach.',
      authorId: user1.id,
      postId: post3.id,
    },
  });

  const comment4 = await prisma.comment.upsert({
    where: { id: 4 },
    update: {},
    create: {
      id: 4,
      content: 'Nice insights on optimization!',
      authorId: user2.id,
      postId: post2.id,
    },
  });

  console.log('Comments created:', { comment1, comment2, comment3, comment4 });

  console.log('Database seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
