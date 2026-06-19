import express from 'express';
import { authenticate, authorize } from '../middleware/auth.middleware.js';
import { createMeeting, getMeetings, updateMeeting } from '../controllers/meeting.controller.js';

const router = express.Router();

router.post('/', authenticate, createMeeting);
router.get('/', authenticate, getMeetings);
router.put('/:id', authenticate, authorize('supervisor', 'coordinator'), updateMeeting);

export default router;
