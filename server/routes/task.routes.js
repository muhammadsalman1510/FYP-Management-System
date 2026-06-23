import express from 'express';
import { authenticate, authorize } from '../middleware/auth.middleware.js';
import { upload } from '../middleware/upload.middleware.js';
import {
    createTask,
    getTasks,
    updateTask,
    deleteTask,
    submitTask,
    getSubmissions,
    getMySubmissions,
    reviewSubmission,
} from '../controllers/task.controller.js';

const router = express.Router();

// Static routes first — must appear before any /:id wildcard routes
router.get('/submissions/my', authenticate, authorize('student'), getMySubmissions);
router.get('/submissions', authenticate, authorize('coordinator', 'supervisor'), getSubmissions);
router.put(
    '/submissions/:id/review',
    authenticate,
    authorize('coordinator', 'supervisor'),
    reviewSubmission
);

router.post('/', authenticate, authorize('coordinator', 'supervisor'), createTask);
router.get('/', authenticate, getTasks);
router.post('/:id/submit', authenticate, authorize('student'), upload.single('file'), submitTask);
router.put('/:id', authenticate, authorize('coordinator', 'supervisor'), updateTask);
router.delete('/:id', authenticate, authorize('coordinator', 'supervisor'), deleteTask);

export default router;
