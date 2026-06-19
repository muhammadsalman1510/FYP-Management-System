import express from 'express';
import { authenticate, authorize } from '../middleware/auth.middleware.js';
import { upload } from '../middleware/upload.middleware.js';
import {
    createTask,
    getTasks,
    submitTask,
    getSubmissions,
    reviewSubmission,
} from '../controllers/task.controller.js';

const router = express.Router();

// Fixed-path routes first to avoid /:id wildcard conflicts
router.get('/submissions', authenticate, authorize('coordinator', 'supervisor'), getSubmissions);
router.put(
    '/submissions/:id/review',
    authenticate,
    authorize('coordinator', 'supervisor'),
    reviewSubmission
);

// General task routes
router.post('/', authenticate, authorize('coordinator', 'supervisor'), createTask);
router.get('/', authenticate, getTasks);
router.post('/:id/submit', authenticate, authorize('student'), upload.single('file'), submitTask);

export default router;
