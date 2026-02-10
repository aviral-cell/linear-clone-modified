import mongoose from 'mongoose';

const dbName = process.env.NODE_ENV === 'test' ? 'WorkflowDB_Test' : 'WorkflowDB';

const connectionString =
  process.env.MONGODB_URI ||
  `mongodb://127.0.0.1:27017/${dbName}?directConnection=true&serverSelectionTimeoutMS=2000`;

const connectDatabase = async () => {
  try {
    await mongoose.connect(connectionString, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log(`Connected to MongoDB with Mongoose (Database: ${dbName})`);
    return mongoose.connection;
  } catch (error) {
    console.error('MongoDB connection error:', error);
    throw error;
  }
};

export default connectDatabase;
