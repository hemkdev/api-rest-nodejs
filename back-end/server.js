import express from 'express';
import dotenv from 'dotenv';
import mongoose, { mongo } from 'mongoose';

dotenv.config();

const app = express()
const port = 3000

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB connected')
  } catch (error) {
    console.error('MongoDB connection error:', error);
  }
}

connectDB();

app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})