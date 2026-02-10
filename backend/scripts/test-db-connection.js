import connectDatabase from '../config/database.js';

console.log('Testing MongoDB connection...');
console.log('Connection string:', process.env.MONGODB_BASE_URI?.replace(/\/\/.*:.*@/, '//***:***@'));

connectDatabase()
  .then(() => {
    console.log('✓ Successfully connected to MongoDB!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('✗ Failed to connect to MongoDB:', error.message);
    process.exit(1);
  });
