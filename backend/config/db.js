import mongoose from 'mongoose';

export const connectDB = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI || process.env.MONGO_URI;

    if (!mongoUri) {
      console.warn('Missing MongoDB connection string. Using in-memory collaboration store.');
      return { connected: false };
    }

    const conn = await mongoose.connect(mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log(`MongoDB Connected: ${conn.connection.host}`);
    return { connected: true, connection: conn };
  } catch (error) {
    console.warn(`MongoDB unavailable: ${error.message}`);
    console.warn('Using in-memory collaboration store. Data resets when the backend restarts.');
    return { connected: false, error };
  }
};
