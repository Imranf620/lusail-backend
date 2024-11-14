import express from 'express';
import dotenv from 'dotenv';

import userRoute from './Route/UserRoute.js';
import ConnectDB from './ConnectDb/connectDB.js';

dotenv.config();
const app = express();
const PORT = process.env.PORT || 8000;
app.use(express.json());

app.use('/api/v1', userRoute);

const server = app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  ConnectDB();
});
