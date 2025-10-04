import { Router } from 'express';
import multer from 'multer';
import { auth } from '../middleware/auth.js';
import { config } from '../config/env.js';
import { parseReceipt } from '../services/ocr.js';

const upload = multer();
const router = Router();

router.post('/receipts', auth, upload.single('file'), async (req, res) => {
  if (!config.ocrEnabled) return res.status(400).json({ error: 'OCR disabled' });
  if (!req.file) return res.status(400).json({ error: 'Missing file' });
  const parsed = await parseReceipt(req.file.buffer);
  res.json(parsed);
});

export default router;
