import { seed } from './seeders/index.js';

seed()
  .then(() => {
    process.exit(0);
  })
  .catch((error) => {
    console.error('Error in seed script:', error);
    process.exit(1);
  });
