import express from 'express';
import { authenticate, authorize } from '../middleware/auth.middleware.js';
import { upload } from '../middleware/upload.middleware.js';
import {
    createUser,
    getUsers,
    getUserById,
    updateUser,
    deleteUser,
    getMe,
    updateMe,
    updatePassword,
    uploadPhoto,
} from '../controllers/user.controller.js';

const router = express.Router();

// ── Self-update routes — all roles, no coordinator restriction ────────────────
// MUST be declared before /:id to prevent Express treating 'me' as an id param
router.get('/me', authenticate, getMe);
router.put('/me/password', authenticate, updatePassword);
router.put('/me', authenticate, updateMe);
router.post('/me/photo', authenticate, upload.single('photo'), uploadPhoto);

// ── Coordinator-only routes ───────────────────────────────────────────────────
router.post('/', authenticate, authorize('coordinator'), createUser);
router.get('/', authenticate, authorize('coordinator'), getUsers);
router.get('/:id', authenticate, authorize('coordinator'), getUserById);
router.put('/:id', authenticate, authorize('coordinator'), updateUser);
router.delete('/:id', authenticate, authorize('coordinator'), deleteUser);

export default router;
