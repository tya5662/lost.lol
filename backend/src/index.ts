import express from 'express';
import cors from 'cors';
import passport from 'passport';
import path from 'path';
import userRoutes from './routes/userRoutes';
import linkRoutes from "./routes/linkRoutes"
import authRoutes from './routes/authRoutes';
import './config/passport';
import { mongoDB } from './config/database';

const app = express();

app.use(cors({
  origin: process.env.FRONTEND_URL,
  credentials: true
}));
app.use(express.json());
app.use(passport.initialize());

app.use((_req, _res, next) => {
  void mongoDB().then(() => next()).catch(next);
});

app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Routes
app.use('/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/links', linkRoutes);

app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something broke!' });
});
app.get('/' , (req,res)=> {
  res.json({status: 'ok'})
})

if (!process.env.VERCEL) {
  void mongoDB().then(() => {
    const port = Number(process.env.PORT) || 3000;
    app.listen(port, () => {
      console.log(`Server is running on port ${port}`);
    });
  }).catch((error: unknown) => {
    console.error('Unable to connect to MongoDB', error);
  });
}

export default app;