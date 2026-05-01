import express from 'express';
import { authenticate, authorize } from '../middleware/auth.middleware.js';
import { createUser, getUsers, getUserById, updateUser, deleteUser } from '../controllers/user.controller.js';

const router = express.Router();

router.use(authenticate);
router.use(authorize('coordinator'));

router.post('/', createUser);
router.get('/', getUsers);
router.get('/:id', getUserById);
router.put('/:id', updateUser);
router.delete('/:id', deleteUser);

export default router;