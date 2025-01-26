import mongoose from "mongoose";

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(
      `${process.env.MONGODB_URL}/${process.env.DB_NAME}`
    );
    console.log(`MongoDB connected !! DB HOST: ${conn.connection.host}`);
  } catch (err) {
    console.error("MongoDB ERROR !!\n", err);
    process.exit(1);
  }
};

export default connectDB;
