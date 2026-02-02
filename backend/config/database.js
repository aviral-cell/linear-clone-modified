import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

const dbName = process.env.NODE_ENV === 'test' ? 'WorkflowDB_Test' : 'WorkflowDB';

const connectionString =
  `${process.env.MONGODB_BASE_URI}/${dbName}?appName=Cluster0`;

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