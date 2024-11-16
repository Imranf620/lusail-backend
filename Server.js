import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import cookieParser from 'cookie-parser';

import userRoute from './Route/UserRoute.js';
import productRoute from './Route/ProductRoute.js';
import orderRoute from './Route/OrderRoute.js';
import ConnectDB from './ConnectDb/connectDB.js';
import error from './Middleware/error.js';

process.on('uncaughtException', (err) => {
  console.error(`Uncaught exception: ${err.message}`);
  process.exit(1);
});

dotenv.config();
const app = express();
const PORT = process.env.PORT || 8000;
app.use(express.json());

app.use(
  cors({
    origin: 'http://localhost:3000',
    credentials: true,
  })
);

app.use(cookieParser());

app.use('/api/v1', userRoute);
app.use('/api/v1', productRoute);
app.use('/api/v1', orderRoute);

app.use(error);

const server = app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  ConnectDB();
});

process.on('unhandledRejection', (err) => {
  console.log(`Server rejected`);
  console.error(`Unhandled Rejection: ${err.message}`);
  server.close(() => {
    process.exit(1);
  });
});

// .env file DATA

// PORT = 5000

// Mongo_URL = mongodb+srv://thinkcodes57:mcV9eCK9QCDuQjwW@cluster0.dv2hu.mongodb.net/Lusail?retryWrites=true&w=majority&appName=Cluster0

// JWT_SECRET = yttrugshfqwjhg65454egqgcef1y23tut
// JWT_EXPIRE = 15d

// SMTP_HOST=smtp.gmail.com
// SMTP_PORT=587
// SMTP_USER=aqibmalik1586@gmail.com
// SMTP_PASS=qspmzybddnzdkjzr
// SMTP_SERVICE=gmail
