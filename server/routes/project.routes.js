import express from 'express';
import { authenticate, authorize } from '../middleware/auth.middleware.js';
import {
    createProject,
    getProjects,
    getProjectById,
    assignSupervisor,
    deleteProject,
    updateProject,
    assignStudent,
    removeStudent,
    getMyProject,
    getAssignedProjects,
    updateMilestone,
} from '../controllers/project.controller.js';

const router = express.Router();

// ── Fixed-path routes FIRST — must come before /:id ──────────────────────────
router.get('/my', authenticate, authorize('student'), getMyProject);
router.get('/assigned', authenticate, authorize('supervisor'), getAssignedProjects);

// ── Coordinator-only routes ───────────────────────────────────────────────────
router.post('/', authenticate, authorize('coordinator'), createProject);
router.get('/', authenticate, authorize('coordinator'), getProjects);
router.get('/:id', authenticate, authorize('coordinator'), getProjectById);

router.put('/:id/supervisor', authenticate, authorize('coordinator'), assignSupervisor);
router.put('/:id/students', authenticate, authorize('coordinator'), assignStudent);
router.put('/:id/milestones/:milestoneId', authenticate, authorize('coordinator'), updateMilestone);
router.put('/:id', authenticate, authorize('coordinator'), updateProject);

router.delete('/:id/students/:studentId', authenticate, authorize('coordinator'), removeStudent);
router.delete('/:id', authenticate, authorize('coordinator'), deleteProject);

export default router;
