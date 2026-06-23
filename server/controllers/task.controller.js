import Task from '../models/task.model.js';
import TaskSubmission from '../models/tasksubmission.model.js';
import Project from '../models/project.model.js';

// ─── POST /api/tasks ──────────────────────────────────────────────────────────
export const createTask = async (req, res) => {
    try {
        const { title, instructions, openDate, dueDate, projectId, targetScope, attachmentUrl } =
            req.body;

        if (!title || !openDate || !dueDate) {
            return res.status(400).json({
                success: false,
                message: 'title, openDate, and dueDate are required',
            });
        }

        if (isNaN(new Date(dueDate).getTime())) {
            return res.status(400).json({ success: false, message: 'Invalid due date provided.' });
        }

        const scope = targetScope || 'project';
        const creatorRole = req.user.role;

        // ── targetScope = 'all' ──────────────────────────────────────────────
        if (scope === 'all') {
            if (creatorRole === 'coordinator') {
                const task = await Task.create({
                    title,
                    instructions: instructions || '',
                    openDate,
                    dueDate,
                    projectId: null,
                    createdBy: req.user._id,
                    creatorRole,
                    attachmentUrl: attachmentUrl || null,
                    targetScope: 'all',
                });
                return res.status(201).json({ success: true, data: task });
            }

            // Supervisor: one task per assigned project
            const assignedProjects = await Project.find({
                supervisors: req.user._id,
            }).select('_id');

            if (assignedProjects.length === 0) {
                return res.status(400).json({
                    success: false,
                    message: 'You have no assigned projects to create tasks for',
                });
            }

            const tasks = await Task.insertMany(
                assignedProjects.map((p) => ({
                    title,
                    instructions: instructions || '',
                    openDate,
                    dueDate,
                    projectId: p._id,
                    createdBy: req.user._id,
                    creatorRole,
                    attachmentUrl: attachmentUrl || null,
                    targetScope: 'all',
                }))
            );
            return res.status(201).json({ success: true, data: tasks });
        }

        // ── targetScope = 'project' ──────────────────────────────────────────
        if (!projectId) {
            return res.status(400).json({
                success: false,
                message: 'projectId is required when targetScope is "project"',
            });
        }

        const project = await Project.findById(projectId);
        if (!project) {
            return res.status(404).json({ success: false, message: 'Project not found' });
        }

        if (creatorRole === 'supervisor') {
            const isAssigned = project.supervisors.some(
                (s) => s.toString() === req.user._id.toString()
            );
            if (!isAssigned) {
                return res.status(403).json({
                    success: false,
                    message: 'You are not assigned to this project',
                });
            }
        }

        const task = await Task.create({
            title,
            instructions: instructions || '',
            openDate,
            dueDate,
            projectId,
            createdBy: req.user._id,
            creatorRole,
            attachmentUrl: attachmentUrl || null,
            targetScope: 'project',
        });

        return res.status(201).json({ success: true, data: task });
    } catch (err) {
        console.error('createTask error:', err);
        return res.status(500).json({ success: false, message: err.message });
    }
};

// ─── GET /api/tasks ───────────────────────────────────────────────────────────
export const getTasks = async (req, res) => {
    try {
        let tasks;

        if (req.user.role === 'coordinator') {
            tasks = await Task.find()
                .populate('projectId', 'title')
                .populate('createdBy', 'name')
                .sort({ dueDate: 1 });
        } else if (req.user.role === 'supervisor') {
            tasks = await Task.find({ createdBy: req.user._id })
                .populate('projectId', 'title')
                .populate('createdBy', 'name')
                .sort({ dueDate: 1 });
        } else {
            const project = await Project.findOne({
                students: req.user._id,
            }).select('_id');

            if (!project) {
                return res.status(200).json({ success: true, data: [] });
            }

            tasks = await Task.find({
                $or: [
                    { projectId: project._id },
                    { projectId: null, targetScope: 'all' },
                ],
            })
                .populate('projectId', 'title')
                .populate('createdBy', 'name')
                .sort({ dueDate: 1 });
        }

        return res.status(200).json({ success: true, data: tasks });
    } catch (err) {
        console.error('getTasks error:', err);
        return res.status(500).json({ success: false, message: err.message });
    }
};

// ─── PUT /api/tasks/:id ───────────────────────────────────────────────────────
export const updateTask = async (req, res) => {
    try {
        const { title, instructions, openDate, dueDate } = req.body;

        const task = await Task.findById(req.params.id);
        if (!task) {
            return res.status(404).json({ success: false, message: 'Task not found' });
        }

        if (task.createdBy.toString() !== req.user._id.toString()) {
            return res.status(403).json({ success: false, message: 'You can only edit tasks you created' });
        }

        if (dueDate && isNaN(new Date(dueDate).getTime())) {
            return res.status(400).json({ success: false, message: 'Invalid due date provided.' });
        }

        if (title) task.title = title.trim();
        if (instructions !== undefined) task.instructions = instructions;
        if (openDate) task.openDate = openDate;
        if (dueDate) task.dueDate = dueDate;

        await task.save();

        const updated = await Task.findById(task._id)
            .populate('projectId', 'title')
            .populate('createdBy', 'name');

        return res.status(200).json({ success: true, data: updated });
    } catch (err) {
        console.error('updateTask error:', err);
        return res.status(500).json({ success: false, message: err.message });
    }
};

// ─── DELETE /api/tasks/:id ────────────────────────────────────────────────────
export const deleteTask = async (req, res) => {
    try {
        const task = await Task.findById(req.params.id);
        if (!task) {
            return res.status(404).json({ success: false, message: 'Task not found' });
        }

        if (task.createdBy.toString() !== req.user._id.toString()) {
            return res.status(403).json({ success: false, message: 'You can only delete tasks you created' });
        }

        await Task.findByIdAndDelete(req.params.id);
        return res.status(200).json({ success: true, data: { message: 'Task deleted.' } });
    } catch (err) {
        console.error('deleteTask error:', err);
        return res.status(500).json({ success: false, message: err.message });
    }
};

// ─── POST /api/tasks/:id/submit ───────────────────────────────────────────────
export const submitTask = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ success: false, message: 'A file is required' });
        }

        const task = await Task.findById(req.params.id);
        if (!task) {
            return res.status(404).json({ success: false, message: 'Task not found' });
        }

        const project = await Project.findOne({ students: req.user._id }).select('_id');
        if (!project) {
            return res.status(400).json({
                success: false,
                message: 'You are not assigned to any project',
            });
        }

        const isForProject =
            task.projectId && task.projectId.toString() === project._id.toString();
        const isGlobal = !task.projectId && task.targetScope === 'all';

        if (!isForProject && !isGlobal) {
            return res.status(403).json({
                success: false,
                message: 'This task is not assigned to your project',
            });
        }

        // If submission already exists, update it (re-upload)
        const existing = await TaskSubmission.findOne({
            taskId: task._id,
            submittedBy: req.user._id,
        });

        if (existing) {
            existing.fileUrl = '/uploads/' + req.file.filename;
            existing.fileName = req.file.originalname;
            existing.status = 'pending';
            existing.feedback = '';
            existing.submittedAt = new Date();
            await existing.save();
            return res.status(200).json({ success: true, data: existing });
        }

        const submission = await TaskSubmission.create({
            taskId: task._id,
            submittedBy: req.user._id,
            projectId: project._id,
            fileUrl: '/uploads/' + req.file.filename,
            fileName: req.file.originalname,
            status: 'pending',
        });

        return res.status(201).json({ success: true, data: submission });
    } catch (err) {
        console.error('submitTask error:', err);
        return res.status(500).json({ success: false, message: err.message });
    }
};

// ─── GET /api/tasks/submissions ───────────────────────────────────────────────
export const getSubmissions = async (req, res) => {
    try {
        let submissions;

        if (req.user.role === 'coordinator') {
            submissions = await TaskSubmission.find()
                .populate('taskId', 'title dueDate')
                .populate('submittedBy', 'name email')
                .populate('projectId', 'title')
                .sort({ submittedAt: -1 });
        } else {
            const theirTasks = await Task.find({ createdBy: req.user._id }).select('_id');
            const taskIds = theirTasks.map((t) => t._id);

            submissions = await TaskSubmission.find({ taskId: { $in: taskIds } })
                .populate('taskId', 'title dueDate')
                .populate('submittedBy', 'name email')
                .populate('projectId', 'title')
                .sort({ submittedAt: -1 });
        }

        return res.status(200).json({ success: true, data: submissions });
    } catch (err) {
        console.error('getSubmissions error:', err);
        return res.status(500).json({ success: false, message: err.message });
    }
};

// ─── GET /api/tasks/submissions/my ───────────────────────────────────────────
export const getMySubmissions = async (req, res) => {
    try {
        const submissions = await TaskSubmission.find({ submittedBy: req.user._id })
            .populate({
                path: 'taskId',
                select: 'title dueDate instructions createdBy targetScope projectId',
                populate: [
                    { path: 'createdBy', select: 'name' },
                    { path: 'projectId', select: 'title' },
                ],
            })
            .sort({ submittedAt: -1 });

        return res.status(200).json({ success: true, data: submissions });
    } catch (err) {
        console.error('getMySubmissions error:', err);
        return res.status(500).json({ success: false, message: err.message });
    }
};

// ─── PUT /api/tasks/submissions/:id/review ────────────────────────────────────
export const reviewSubmission = async (req, res) => {
    try {
        const { status, feedback } = req.body;

        if (!['approved', 'rejected'].includes(status)) {
            return res.status(400).json({
                success: false,
                message: 'status must be "approved" or "rejected"',
            });
        }

        const submission = await TaskSubmission.findById(req.params.id).populate('taskId');
        if (!submission) {
            return res.status(404).json({ success: false, message: 'Submission not found' });
        }

        if (req.user.role === 'supervisor') {
            const taskCreator = submission.taskId.createdBy.toString();
            if (taskCreator !== req.user._id.toString()) {
                return res.status(403).json({
                    success: false,
                    message: 'You can only review submissions for tasks you created',
                });
            }
        }

        submission.status = status;
        submission.feedback = feedback || '';
        await submission.save();

        return res.status(200).json({ success: true, data: submission });
    } catch (err) {
        console.error('reviewSubmission error:', err);
        return res.status(500).json({ success: false, message: err.message });
    }
};
