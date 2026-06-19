import express from 'express';
import { authenticate, authorize } from '../middleware/auth.middleware.js';
import {
    createProposal,
    getProposals,
    getMyProposal,
    reviewProposal,
    submitSupervisorRecommendation,
} from '../controllers/proposal.controller.js';

const router = express.Router();

router.post('/',    authenticate, authorize('student'),                  createProposal);
router.get('/my',   authenticate, authorize('student'),                  getMyProposal);
router.get('/',     authenticate, authorize('coordinator', 'supervisor'), getProposals);
router.put('/:id/review',           authenticate, authorize('coordinator'), reviewProposal);
router.put('/:id/supervisor-review', authenticate, authorize('supervisor'), submitSupervisorRecommendation);

export default router;
