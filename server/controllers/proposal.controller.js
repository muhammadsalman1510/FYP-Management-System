import Proposal from '../models/proposal.model.js';
import Project from '../models/project.model.js';
import User from '../models/user.model.js';
import StudentProfile from '../models/student-profile.model.js';
import SupervisorProfile from '../models/supervisor-profile.model.js';

const DEFAULT_MILESTONES = [
    { id: 1, name: "Project Proposal",   description: "Proposal submitted and approved by coordinator.", completed: false, completedAt: null },
    { id: 2, name: "Project Defense",    description: "Initial defense presented to supervisor and coordinator.", completed: false, completedAt: null },
    { id: 3, name: "Implementation",     description: "Core development and implementation phase.", completed: false, completedAt: null },
    { id: 4, name: "Documentation",      description: "Full project documentation submitted.", completed: false, completedAt: null },
    { id: 5, name: "Final Presentation", description: "Final project presented and signed off.", completed: false, completedAt: null },
];

export const createProposal = async (req, res) => {
    try {
        const { title, description, problemStatement, techStack, groupMembers, supervisorName, supervisorEmail } = req.body;

        if (!title || !description || !problemStatement) {
            return res.status(400).json({
                success: false,
                message: 'title, description, and problemStatement are required',
            });
        }

        if (!supervisorEmail || !supervisorEmail.trim()) {
            return res.status(400).json({
                success: false,
                message: 'supervisorEmail is required',
            });
        }

        if (!groupMembers || groupMembers.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'At least one group member is required',
            });
        }

        // Validate each groupMember rollNumber exists in StudentProfile — fail fast on first missing
        for (const member of groupMembers) {
            if (!member.rollNumber || !member.rollNumber.trim()) {
                return res.status(400).json({
                    success: false,
                    message: 'Each group member must have a roll number',
                });
            }
            const profile = await StudentProfile.findOne({ rollNumber: member.rollNumber.trim() });
            if (!profile) {
                return res.status(400).json({
                    success: false,
                    message: `No student found with roll number '${member.rollNumber}'. Please check and try again.`,
                });
            }
        }

        // Validate supervisorEmail exists in User with role='supervisor'
        const supervisorUser = await User.findOne({
            email: supervisorEmail.trim().toLowerCase(),
            role:  'supervisor',
        });
        if (!supervisorUser) {
            return res.status(400).json({
                success: false,
                message: `No supervisor found with email '${supervisorEmail}'. Please check the email and try again.`,
            });
        }

        // Check for an existing pending or approved proposal by this student
        const existing = await Proposal.findOne({
            submittedBy: req.user._id,
            status: { $in: ['pending', 'approved'] },
        });
        if (existing) {
            return res.status(409).json({
                success: false,
                message: 'You already have a pending or approved proposal.',
            });
        }

        const proposal = await Proposal.create({
            title,
            description,
            problemStatement,
            techStack:       techStack || '',
            groupMembers:    groupMembers || [],
            supervisorName:  supervisorName || '',
            supervisorEmail: supervisorEmail.trim().toLowerCase(),
            submittedBy:     req.user._id,
            status:          'pending',
        });

        return res.status(201).json({ success: true, data: proposal });
    } catch (err) {
        console.error('createProposal error:', err);
        return res.status(500).json({ success: false, message: err.message });
    }
};

export const getMyProposal = async (req, res) => {
    try {
        const proposal = await Proposal.findOne({ submittedBy: req.user._id })
            .sort({ submittedAt: -1 });
        return res.status(200).json({ success: true, data: proposal || null });
    } catch (err) {
        console.error('getMyProposal error:', err);
        return res.status(500).json({ success: false, message: err.message });
    }
};

export const getProposals = async (req, res) => {
    try {
        let proposals;

        if (req.user.role === 'coordinator') {
            proposals = await Proposal.find()
                .populate('submittedBy', 'name email')
                .populate('projectId', 'title')
                .sort({ submittedAt: -1 });
        } else {
            // supervisor — only proposals that name them as the supervisor
            const supervisorEmail = (req.user.email || '').toLowerCase();
            proposals = await Proposal.find({ supervisorEmail })
                .populate('submittedBy', 'name email')
                .populate('projectId', 'title')
                .sort({ submittedAt: -1 });
        }

        return res.status(200).json({ success: true, data: proposals });
    } catch (err) {
        console.error('getProposals error:', err);
        return res.status(500).json({ success: false, message: err.message });
    }
};

export const reviewProposal = async (req, res) => {
    try {
        const { id } = req.params;
        const { status, coordinatorFeedback } = req.body;

        if (!['approved', 'rejected'].includes(status)) {
            return res.status(400).json({
                success: false,
                message: 'status must be "approved" or "rejected"',
            });
        }

        const proposal = await Proposal.findById(id);
        if (!proposal) {
            return res.status(404).json({ success: false, message: 'Proposal not found' });
        }
        if (proposal.status !== 'pending') {
            return res.status(409).json({
                success: false,
                message: `Proposal has already been ${proposal.status}`,
            });
        }

        if (status === 'rejected') {
            proposal.status = 'rejected';
            proposal.coordinatorFeedback = coordinatorFeedback || '';
            await proposal.save();
            return res.status(200).json({ success: true, data: proposal });
        }

        // ── APPROVAL PATH ──────────────────────────────────────────────

        if (!proposal.groupMembers || proposal.groupMembers.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Cannot approve a proposal with no group members.',
            });
        }

        // Resolve each groupMember rollNumber → User._id via StudentProfile
        const studentIds = [];
        for (const member of proposal.groupMembers) {
            const profile = await StudentProfile.findOne({ rollNumber: member.rollNumber });
            if (!profile) {
                return res.status(400).json({
                    success: false,
                    message: `No student found with roll number '${member.rollNumber}'.`,
                });
            }
            studentIds.push(profile.userId);
        }

        // Resolve supervisorEmail → User._id
        const supervisorUser = await User.findOne({
            email: proposal.supervisorEmail,
            role:  'supervisor',
        });
        if (!supervisorUser) {
            return res.status(400).json({
                success: false,
                message: `No supervisor found with email '${proposal.supervisorEmail}'.`,
            });
        }

        // Check supervisor capacity (best-effort — skip if no profile exists)
        const supervisorProfile = await SupervisorProfile.findOne({ userId: supervisorUser._id });
        if (supervisorProfile && !supervisorProfile.canAcceptProject()) {
            return res.status(400).json({
                success: false,
                message: `Supervisor has reached their maximum project capacity (${supervisorProfile.maxProjects}).`,
            });
        }

        // Build milestones with #1 marked completed
        const now = new Date();
        const milestones = DEFAULT_MILESTONES.map((m) =>
            m.id === 1 ? { ...m, completed: true, completedAt: now } : { ...m }
        );

        // Create the project
        const newProject = await Project.create({
            title:       proposal.title,
            description: proposal.description,
            maxStudents: proposal.groupMembers.length,
            students:    studentIds,
            supervisors: [supervisorUser._id],
            coordinator: req.user._id,
            milestones,
            progress:    20,
            status:      'active',
            proposalId:  proposal._id,
        });

        // Increment supervisor's currentProjects counter
        if (supervisorProfile) {
            supervisorProfile.currentProjects += 1;
            await supervisorProfile.save();
        }

        // Link proposal to the new project and mark approved
        proposal.projectId = newProject._id;
        proposal.status = 'approved';
        proposal.coordinatorFeedback = coordinatorFeedback || '';
        await proposal.save();

        return res.status(200).json({ success: true, data: newProject });
    } catch (err) {
        console.error('reviewProposal error:', err);
        return res.status(500).json({ success: false, message: err.message });
    }
};

export const submitSupervisorRecommendation = async (req, res) => {
    try {
        const { id } = req.params;
        const { recommendation, feedback } = req.body;

        if (!['approved', 'rejected'].includes(recommendation)) {
            return res.status(400).json({
                success: false,
                message: 'recommendation must be "approved" or "rejected"',
            });
        }

        const proposal = await Proposal.findById(id);
        if (!proposal) {
            return res.status(404).json({ success: false, message: 'Proposal not found' });
        }

        // Only the named supervisor on this proposal may submit a recommendation
        if ((req.user.email || '').toLowerCase() !== proposal.supervisorEmail) {
            return res.status(403).json({
                success: false,
                message: 'You are not the named supervisor for this proposal.',
            });
        }

        // Locked once the coordinator has made their final decision
        if (proposal.status !== 'pending') {
            return res.status(400).json({
                success: false,
                message: 'This proposal has already been finalized by the coordinator and can no longer be updated.',
            });
        }

        proposal.supervisorRecommendation = recommendation;
        proposal.supervisorFeedback       = feedback || '';
        proposal.supervisorReviewedAt     = new Date();
        await proposal.save();

        return res.status(200).json({ success: true, data: proposal });
    } catch (err) {
        console.error('submitSupervisorRecommendation error:', err);
        return res.status(500).json({ success: false, message: err.message });
    }
};
