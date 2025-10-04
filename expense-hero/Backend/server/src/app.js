import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import { router as apiRouter } from './routes/index.js';

const app = express();
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(morgan('dev'));

app.use('/api', apiRouter);

app.get('/health', (req, res) => res.json({ status: 'ok' }));

export default app;
