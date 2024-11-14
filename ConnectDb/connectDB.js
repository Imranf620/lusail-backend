import mongoose from 'mongoose';
const connectDb = () => {
  mongoose.connect(process.env.Mongo_URL).then(() => {
    console.log('MongoDB Connected...');
  });
};

export default connectDb;
