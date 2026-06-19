import express from 'express';
import { authenticate, authorize } from '../middleware/auth.middleware.js';
import { upload } from '../middleware/upload.middleware.js';
import { uploadDocument, getDocuments } from '../controllers/document.controller.js';

const router = express.Router();

router.post('/', authenticate, authorize('student'), upload.single('file'), uploadDocument);
router.get('/', authenticate, getDocuments);

export default router;
