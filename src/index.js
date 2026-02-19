import 'dotenv/config';
import express from 'express';
import { createServer } from 'http';
import { WebSocketServer } from 'ws';
import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@apollo/server/express4';
import { makeExecutableSchema } from '@graphql-tools/schema';
import { useServer } from 'graphql-ws/lib/use/ws';
import { PubSub } from 'graphql-subscriptions';
import { PrismaClient } from '@prisma/client';
import { typeDefs } from './schema.js';
import { userResolver } from './resolvers/userResolver.js';
import { postResolver } from './resolvers/postResolver.js';
import { commentResolver } from './resolvers/commentResolver.js';
import { subscriptionResolver } from './resolvers/subscriptionResolver.js';
import { createDataLoaders } from './dataloaders/index.js';
import { extractToken, verifyToken } from './auth/jwt.js';

const PORT = process.env.PORT || 4000;
const prisma = new PrismaClient();
const pubsub = new PubSub();

// Merge all resolvers into a single object
const resolvers = {
  Query: {
    ...userResolver.Query,
    ...postResolver.Query,
  },
  Mutation: {
    ...postResolver.Mutation,
    ...commentResolver.Mutation,
  },
  Subscription: {
    ...subscriptionResolver.Subscription,
  },
  User: userResolver.User,
  Post: postResolver.Post,
  Comment: commentResolver.Comment,
};

// Create executable schema
const schema = makeExecutableSchema({
  typeDefs,
  resolvers,
});

// Create Express app
const app = express();
const httpServer = createServer(app);

// Create WebSocket server for subscriptions
const wsServer = new WebSocketServer(
  { server: httpServer, path: '/graphql' }
);

// Use graphql-ws for subscriptions
useServer({ schema }, wsServer);

// Create Apollo Server
const server = new ApolloServer({
  schema,
  plugins: [
    {
      async serverWillStart() {
        return {
          async drainServer() {
            await new Promise((resolve) => {
              // Drain the wsServer
              wsServer.close(resolve);
            });
          },
        };
      },
    },
  ],
  formatError(err) {
    console.error(err);
    return err;
  },
});

// Start Apollo Server
await server.start();

// Middleware to parse JSON
app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// GraphQL schema endpoint
app.get('/graphql/schema', (req, res) => {
  res.type('text/plain').send(typeDefs);
});

// GraphQL endpoint with authentication
app.use(
  '/graphql',
  expressMiddleware(server, {
    context: async ({ req }) => {
      // Extract and verify JWT token
      let user = null;
      const authHeader = req.headers.authorization;
      if (authHeader) {
        const token = extractToken(authHeader);
        if (token) {
          const decoded = verifyToken(token);
          if (decoded) {
            user = decoded;
          }
        }
      }

      // Create dataloaders for this request
      const loaders = createDataLoaders(prisma);

      return {
        prisma,
        user,
        loaders,
        pubsub,
        req,
      };
    },
  })
);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: 'Internal Server Error' });
});

// Start the server
httpServer.listen(PORT, () => {
  console.log(`🚀 Server is running at http://localhost:${PORT}/graphql`);
  console.log(`📊 GraphQL playground available at http://localhost:${PORT}/graphql`);
  console.log(`📌 Schema endpoint available at http://localhost:${PORT}/graphql/schema`);
  console.log(`🔄 WebSocket endpoint available at ws://localhost:${PORT}/graphql`);
});

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('Shutting down...');
  await server.stop();
  await prisma.$disconnect();
  process.exit(0);
});
