import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your_super_secret_jwt_key_change_this_in_production';

// Generate tokens for test users
const token1 = jwt.sign(
  { userId: 1, username: 'user1', role: 'user' },
  JWT_SECRET,
  { expiresIn: '24h' }
);

const token2 = jwt.sign(
  { userId: 2, username: 'user2', role: 'user' },
  JWT_SECRET,
  { expiresIn: '24h' }
);

const tokenAdmin = jwt.sign(
  { userId: 3, username: 'admin', role: 'admin' },
  JWT_SECRET,
  { expiresIn: '24h' }
);

console.log('=== Test JWT Tokens ===\n');
console.log('User 1 (user) Token:');
console.log(token1);
console.log('\nUser 2 (user) Token:');
console.log(token2);
console.log('\nAdmin Token:');
console.log(tokenAdmin);
