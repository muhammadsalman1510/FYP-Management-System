import express from 'express';
import { authenticate, authorize } from '../middleware/auth.middleware.js';
import { createAnnouncement, getAnnouncements } from '../controllers/announcements.controller.js';

const router = express.Router();

router.post('/', authenticate, authorize('coordinator'), createAnnouncement);
router.get('/', authenticate, getAnnouncements);

export default router;
