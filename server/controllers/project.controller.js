import Project from '../models/project.model.js'
import User from '../models/user.model.js'
import SupervisorProfile from '../models/supervisor-profile.model.js'

const DEFAULT_MILESTONES = [
    { id: 1, name: 'Project Proposal',   description: 'Proposal submitted and approved by coordinator.', completed: false, completedAt: null },
    { id: 2, name: 'Project Defense',    description: 'Initial defense presented to supervisor and coordinator.', completed: false, completedAt: null },
    { id: 3, name: 'Implementation',     description: 'Core development and implementation phase.', completed: false, completedAt: null },
    { id: 4, name: 'Documentation',      description: 'Full project documentation submitted.', completed: false, completedAt: null },
    { id: 5, name: 'Final Presentation', description: 'Final project presented and signed off.', completed: false, completedAt: null },
];

/**
 * Verify that a userId exists and has role 'supervisor'.
 */
const getSupervisorUser = async (supervisorId) => {
    const user = await User.findById(supervisorId)
    if (!user) {
        const err = new Error('Supervisor user not found')
        err.status = 404
        throw err
    }
    if (user.role !== 'supervisor') {
        const err = new Error('Provided userId does not belong to a supervisor')
        err.status = 400
        throw err
    }
    return user
}

/**
 * Check that the supervisor's profile still has capacity.
 */
const checkSupervisorCapacity = async (supervisorUserId) => {
    const profile = await SupervisorProfile.findOne({ userId: supervisorUserId })
    if (!profile) {
        const err = new Error('Supervisor profile not found')
        err.status = 404
        throw err
    }
    if (!profile.canAcceptProject()) {
        const err = new Error(
            `Supervisor has reached their project limit (${profile.maxProjects})`
        )
        err.status = 409
        throw err
    }
    return profile
}

const populateProject = (query) =>
    query
        .populate('supervisors', 'name email phone photoUrl')
        .populate('coordinator', 'name email phone photoUrl')
        .populate('students', 'name email photoUrl')

/**
 * POST /api/projects
 * Coordinator only — create a project.
 * Body: { title, description?, maxStudents }
 */
export const createProject = async (req, res) => {
    try {
        const { title, description, maxStudents } = req.body

        if (!title || maxStudents == null) {
            return res.status(400).json({
                success: false,
                message: 'title and maxStudents are required',
            })
        }

        if (maxStudents < 1) {
            return res.status(400).json({
                success: false,
                message: 'maxStudents must be at least 1',
            })
        }

        const project = await Project.create({
            title: title.trim(),
            description: description || '',
            maxStudents,
            supervisors: [],
            coordinator: req.user._id,
            milestones: DEFAULT_MILESTONES.map(m => ({ ...m })),
            status: 'pending_proposal',
            progress: 0,
        })

        return res.status(201).json({ success: true, data: project })
    } catch (err) {
        if (err.status) return res.status(err.status).json({ success: false, message: err.message })
        console.error('createProject error:', err)
        return res.status(500).json({ success: false, message: 'Internal server error' })
    }
}

/**
 * GET /api/projects
 * Coordinator only — list all projects, optionally filter by status.
 * Query: ?status=pending_proposal|active|completed
 */
export const getProjects = async (req, res) => {
    try {
        const filter = {}
        if (req.query.status) filter.status = req.query.status

        const projects = await populateProject(Project.find(filter).sort({ createdAt: -1 }))
        return res.status(200).json({ success: true, data: projects })
    } catch (err) {
        console.error('getProjects error:', err)
        return res.status(500).json({ success: false, message: 'Internal server error' })
    }
}

/**
 * GET /api/projects/:id
 * Coordinator only — get a single project with full population.
 */
export const getProjectById = async (req, res) => {
    try {
        const project = await populateProject(Project.findById(req.params.id))

        if (!project) {
            return res.status(404).json({ success: false, message: 'Project not found' })
        }
        return res.status(200).json({ success: true, data: project })
    } catch (err) {
        console.error('getProjectById error:', err)
        return res.status(500).json({ success: false, message: 'Internal server error' })
    }
}

/**
 * PUT /api/projects/:id/supervisor
 * Coordinator only — assign or replace the supervisor on a project.
 * Body: { supervisorId } — pass null to remove all supervisors.
 */
export const assignSupervisor = async (req, res) => {
    try {
        const { supervisorId } = req.body

        const project = await Project.findById(req.params.id)
        if (!project) {
            return res.status(404).json({ success: false, message: 'Project not found' })
        }

        // Release slots for all currently assigned supervisors
        if (project.supervisors && project.supervisors.length > 0) {
            await Promise.all(
                project.supervisors.map(async (supId) => {
                    const profile = await SupervisorProfile.findOne({ userId: supId })
                    if (profile && profile.currentProjects > 0) {
                        profile.currentProjects -= 1
                        await profile.save()
                    }
                })
            )
        }

        if (supervisorId) {
            await getSupervisorUser(supervisorId)
            const newProfile = await checkSupervisorCapacity(supervisorId)

            project.supervisors = [supervisorId]
            await project.save()

            newProfile.currentProjects += 1
            await newProfile.save()
        } else {
            project.supervisors = []
            await project.save()
        }

        const updated = await populateProject(Project.findById(project._id))

        return res.status(200).json({
            success: true,
            message: supervisorId ? 'Supervisor assigned successfully' : 'Supervisor unassigned successfully',
            data: updated,
        })
    } catch (err) {
        if (err.status) return res.status(err.status).json({ success: false, message: err.message })
        console.error('assignSupervisor error:', err)
        return res.status(500).json({ success: false, message: 'Internal server error' })
    }
}

/**
 * PUT /api/projects/:id/students
 * Coordinator only — assign a student to a project.
 * Body: { studentId }
 */
export const assignStudent = async (req, res) => {
    try {
        const { studentId } = req.body

        if (!studentId) {
            return res.status(400).json({ success: false, message: 'studentId is required' })
        }

        const user = await User.findById(studentId)
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' })
        }
        if (user.role !== 'student') {
            return res.status(400).json({ success: false, message: 'Provided userId does not belong to a student' })
        }

        const project = await Project.findById(req.params.id)
        if (!project) {
            return res.status(404).json({ success: false, message: 'Project not found' })
        }

        if (project.students.some(id => id.toString() === studentId)) {
            return res.status(409).json({ success: false, message: 'Student is already assigned to this project' })
        }

        if (project.students.length >= project.maxStudents) {
            return res.status(409).json({ success: false, message: `Project is full — max ${project.maxStudents} students allowed` })
        }

        project.students.push(studentId)
        await project.save()

        const updated = await populateProject(Project.findById(project._id))

        return res.status(200).json({ success: true, message: 'Student assigned successfully', data: updated })
    } catch (err) {
        console.error('assignStudent error:', err)
        return res.status(500).json({ success: false, message: 'Internal server error' })
    }
}

/**
 * PUT /api/projects/:id
 * Coordinator only — update a project's title, description, and maxStudents.
 * Body: { title?, description?, maxStudents? }
 */
export const updateProject = async (req, res) => {
    try {
        const { title, description, maxStudents } = req.body

        const project = await Project.findById(req.params.id)
        if (!project) {
            return res.status(404).json({ success: false, message: 'Project not found' })
        }

        if (maxStudents !== undefined) {
            if (maxStudents < 1) {
                return res.status(400).json({ success: false, message: 'maxStudents must be at least 1' })
            }
            if (maxStudents < project.students.length) {
                return res.status(400).json({
                    success: false,
                    message: `maxStudents cannot be less than current student count (${project.students.length})`
                })
            }
        }

        if (title) project.title = title.trim()
        if (description !== undefined) project.description = description
        if (maxStudents !== undefined) project.maxStudents = maxStudents

        await project.save()

        const updated = await populateProject(Project.findById(project._id))

        return res.status(200).json({ success: true, message: 'Project updated successfully', data: updated })
    } catch (err) {
        console.error('updateProject error:', err)
        return res.status(500).json({ success: false, message: 'Internal server error' })
    }
}

/**
 * DELETE /api/projects/:id/students/:studentId
 * Coordinator only — remove a student from a project.
 */
export const removeStudent = async (req, res) => {
    try {
        const { studentId } = req.params

        const project = await Project.findById(req.params.id)
        if (!project) {
            return res.status(404).json({ success: false, message: 'Project not found' })
        }

        if (!project.students.some(id => id.toString() === studentId)) {
            return res.status(404).json({ success: false, message: 'Student is not assigned to this project' })
        }

        project.students = project.students.filter(id => id.toString() !== studentId)
        await project.save()

        const updated = await populateProject(Project.findById(project._id))

        return res.status(200).json({ success: true, message: 'Student removed successfully', data: updated })
    } catch (err) {
        console.error('removeStudent error:', err)
        return res.status(500).json({ success: false, message: 'Internal server error' })
    }
}

/**
 * DELETE /api/projects/:id
 * Coordinator only — delete a project and release all supervisor slots.
 */
export const deleteProject = async (req, res) => {
    try {
        const project = await Project.findById(req.params.id)
        if (!project) {
            return res.status(404).json({ success: false, message: 'Project not found' })
        }

        // Release slots for all supervisors on this project
        if (project.supervisors && project.supervisors.length > 0) {
            await Promise.all(
                project.supervisors.map(async (supId) => {
                    const profile = await SupervisorProfile.findOne({ userId: supId })
                    if (profile && profile.currentProjects > 0) {
                        profile.currentProjects -= 1
                        await profile.save()
                    }
                })
            )
        }

        await project.deleteOne()

        return res.status(200).json({ success: true, message: 'Project deleted successfully' })
    } catch (err) {
        console.error('deleteProject error:', err)
        return res.status(500).json({ success: false, message: 'Internal server error' })
    }
}

/**
 * GET /api/projects/my
 * Student only — returns the project this student belongs to.
 */
export const getMyProject = async (req, res) => {
    try {
        const project = await Project.findOne({ students: req.user._id })
            .populate('supervisors', 'name email phone photoUrl')
            .populate('coordinator', 'name email phone photoUrl')
            .populate('students', 'name email photoUrl');

        if (!project) {
            return res.status(404).json({ success: false, message: 'No project assigned to you' });
        }

        return res.status(200).json({ success: true, data: project });
    } catch (err) {
        console.error('getMyProject error:', err);
        return res.status(500).json({ success: false, message: err.message });
    }
};

/**
 * GET /api/projects/assigned
 * Supervisor only — returns all projects assigned to this supervisor.
 */
export const getAssignedProjects = async (req, res) => {
    try {
        const projects = await Project.find({ supervisors: req.user._id })
            .populate('students', 'name email photoUrl')
            .populate('coordinator', 'name email photoUrl')
            .sort({ createdAt: -1 });

        return res.status(200).json({ success: true, data: projects });
    } catch (err) {
        console.error('getAssignedProjects error:', err);
        return res.status(500).json({ success: false, message: err.message });
    }
};

/**
 * PUT /api/projects/:id/milestones/:milestoneId
 * Coordinator only — mark a milestone complete/incomplete and recalculate progress.
 * Body: { completed: true|false }
 */
export const updateMilestone = async (req, res) => {
    try {
        const { completed } = req.body;
        const milestoneId = parseInt(req.params.milestoneId, 10);

        if (typeof completed !== 'boolean') {
            return res.status(400).json({
                success: false,
                message: 'completed must be a boolean',
            });
        }

        if (isNaN(milestoneId) || milestoneId < 1 || milestoneId > 5) {
            return res.status(400).json({
                success: false,
                message: 'milestoneId must be a number between 1 and 5',
            });
        }

        const project = await Project.findById(req.params.id);
        if (!project) {
            return res.status(404).json({ success: false, message: 'Project not found' });
        }

        const milestone = project.milestones.find((m) => m.id === milestoneId);
        if (!milestone) {
            return res.status(404).json({ success: false, message: 'Milestone not found' });
        }

        milestone.completed = completed;
        milestone.completedAt = completed ? new Date() : null;

        const completedCount = project.milestones.filter((m) => m.completed).length;
        project.progress = Math.round((completedCount / 5) * 100);

        if (milestoneId === 1 && completed) {
            project.status = 'active';
        }

        await project.save();

        return res.status(200).json({ success: true, data: project });
    } catch (err) {
        console.error('updateMilestone error:', err);
        return res.status(500).json({ success: false, message: err.message });
    }
};
