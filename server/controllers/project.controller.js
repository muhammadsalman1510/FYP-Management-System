import Project from '../models/project.model.js'
import User from '../models/user.model.js'
import SupervisorProfile from '../models/supervisor-profile.model.js'

// ─── helpers ────────────────────────────────────────────────────────────────

/**
 * Verify that a userId exists and has role 'supervisor'.
 * Returns the User doc on success, or throws with a status-ready error.
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

// ─── controllers ────────────────────────────────────────────────────────────

/**
 * POST /api/projects
 * Coordinator only — create a project and assign a supervisor immediately.
 *
 * Body: { title, description?, supervisorId, maxStudents }
 */
export const createProject = async (req, res) => {
    try {
        const { title, description, maxStudents } = req.body

        if (!title || maxStudents == null) {
            return res.status(400).json({
                message: 'title and maxStudents are required',
            })
        }

        if (maxStudents < 1) {
            return res.status(400).json({
                message: 'maxStudents must be at least 1'
            })
        }

        // --- Create project ---
        const project = await Project.create({
            title: title.trim(),
            description,
            maxStudents,
            supervisorId: null,
            status: 'available',
        })

        return res.status(201).json({
            message: 'Project created successfully',
            project,
        })
    } catch (err) {
        if (err.status) {
            return res.status(err.status).json({ message: err.message })
        }
        console.error('createProject error:', err)
        return res.status(500).json({ message: 'Internal server error' })
    }
}

/**
 * GET /api/projects
 * Coordinator only — list all projects, optionally filter by status or supervisorId.
 *
 * Query: ?status=available|assigned|completed  &  ?supervisorId=<id>
 */
export const getProjects = async (req, res) => {
    try {
        const filter = {}
        if (req.query.status) filter.status = req.query.status
        if (req.query.supervisorId) filter.supervisorId = req.query.supervisorId

        const projects = await Project.find(filter).populate('supervisorId', 'name email')
        return res.status(200).json({ projects })
    } catch (err) {
        console.error('getProjects error:', err)
        return res.status(500).json({ message: 'Internal server error' })
    }
}

/**
 * GET /api/projects/:id
 * Coordinator only — get a single project with supervisor info.
 */
export const getProjectById = async (req, res) => {
    try {
        const project = await Project.findById(req.params.id)
            .populate(
                'supervisorId',
                'name email'
            )
            .populate('students', 'name email')

        if (!project) {
            return res.status(404).json({ message: 'Project not found' })
        }
        return res.status(200).json({ project })
    } catch (err) {
        console.error('getProjectById error:', err)
        return res.status(500).json({ message: 'Internal server error' })
    }
}

/**
 * PUT /api/projects/:id/supervisor
 * Coordinator only — reassign a project to a different supervisor.
 *
 * Body: { supervisorId }
 */
export const assignSupervisor = async (req, res) => {
    try {
        const { supervisorId } = req.body

        const project = await Project.findById(req.params.id)

        if (!project) {
            return res.status(404).json({
                message: 'Project not found',
            })
        }

        // --- Prevent no-op ---
        if (
            project.supervisorId?.toString() === supervisorId
        ) {
            return res.status(400).json({
                message: 'This supervisor is already assigned to the project',
            })
        }

        // --- Optional workflow guard ---
        // Prevent removing supervisor from assigned project
        if (
            supervisorId === null &&
            project.status === 'assigned'
        ) {
            return res.status(400).json({
                message:
                    'Cannot unassign supervisor from an assigned project',
            })
        }

        let newProfile = null

        // --- Validate new supervisor only if assigning ---
        if (supervisorId !== null) {
            await getSupervisorUser(supervisorId)
            newProfile = await checkSupervisorCapacity(supervisorId)
        }

        // --- Release old supervisor slot ---
        if (project.supervisorId) {
            const oldProfile = await SupervisorProfile.findOne({
                userId: project.supervisorId,
            })

            if (oldProfile && oldProfile.currentProjects > 0) {
                oldProfile.currentProjects -= 1
                await oldProfile.save()
            }
        }

        // --- Assign / unassign supervisor ---
        project.supervisorId = supervisorId
        await project.save()

        // --- Increment new supervisor count ---
        if (newProfile) {
            newProfile.currentProjects += 1
            await newProfile.save()
        }

        const updated = await Project.findById(project._id).populate(
            'supervisorId',
            'name email'
        )

        return res.status(200).json({
            message:
                supervisorId === null
                    ? 'Supervisor unassigned successfully'
                    : 'Supervisor assigned successfully',
            project: updated,
        })

    } catch (err) {
        if (err.status) {
            return res.status(err.status).json({
                message: err.message,
            })
        }

        console.error('assignSupervisor error:', err)

        return res.status(500).json({
            message: 'Internal server error',
        })
    }
}

/**
 * PUT /api/projects/:id/students
 * Coordinator only — assign a student to a project.
 *
 * Body: { studentId }
 */
export const assignStudent = async (req, res) => {
    try {
        const { studentId } = req.body

        if (!studentId) {
            return res.status(400).json({ message: 'studentId is required' })
        }

        // --- Validate student ---
        const user = await User.findById(studentId)
        if (!user) {
            return res.status(404).json({ message: 'User not found' })
        }
        if (user.role !== 'student') {
            return res.status(400).json({ message: 'Provided userId does not belong to a student' })
        }

        // --- Find project ---
        const project = await Project.findById(req.params.id)
        if (!project) {
            return res.status(404).json({ message: 'Project not found' })
        }

        // --- Check duplicate ---
        if (project.students.some(id => id.toString() === studentId)) {
            return res.status(409).json({ message: 'Student is already assigned to this project' })
        }

        // --- Check capacity ---
        if (project.students.length >= project.maxStudents) {
            return res.status(409).json({ message: `Project is full — max ${project.maxStudents} students allowed` })
        }

        // --- Assign student ---
        project.students.push(studentId)
        await project.save()

        const updated = await Project.findById(project._id)
            .populate('supervisorId', 'name email')
            .populate('students', 'name email')

        return res.status(200).json({
            message: 'Student assigned successfully',
            project: updated,
        })

    } catch (err) {
        console.error('assignStudent error:', err)
        return res.status(500).json({ message: 'Internal server error' })
    }
}

/**
 * PUT /api/projects/:id
 * Coordinator only — update a project's title, description, and maxStudents.
 *
 * Body: { title?, description?, maxStudents? }
 */
export const updateProject = async (req, res) => {
    try {
        const { title, description, maxStudents } = req.body

        const project = await Project.findById(req.params.id)
        if (!project) {
            return res.status(404).json({ message: 'Project not found' })
        }

        if (maxStudents !== undefined) {
            if (maxStudents < 1) {
                return res.status(400).json({ message: 'maxStudents must be at least 1' })
            }
            if (maxStudents < project.students.length) {
                return res.status(400).json({
                    message: `maxStudents cannot be less than current student count (${project.students.length})`
                })
            }
        }

        if (title) project.title = title.trim()
        if (description !== undefined) project.description = description
        if (maxStudents !== undefined) project.maxStudents = maxStudents

        await project.save()

        return res.status(200).json({
            message: 'Project updated successfully',
            project,
        })

    } catch (err) {
        console.error('updateProject error:', err)
        return res.status(500).json({ message: 'Internal server error' })
    }
}

/**
 * DELETE /api/projects/:id/students/:studentId
 * Coordinator only — remove a student from a project.
 */
export const removeStudent = async (req, res) => {
    try {
        const { studentId } = req.params

        // --- Find project ---
        const project = await Project.findById(req.params.id)
        if (!project) {
            return res.status(404).json({ message: 'Project not found' })
        }

        // --- Check student exists in project ---
        if (!project.students.some(id => id.toString() === studentId)) {
            return res.status(404).json({ message: 'Student is not assigned to this project' })
        }

        // --- Remove student ---
        project.students = project.students.filter(id => id.toString() !== studentId)
        await project.save()

        const updated = await Project.findById(project._id)
            .populate('supervisorId', 'name email')
            .populate('students', 'name email')

        return res.status(200).json({
            message: 'Student removed successfully',
            project: updated,
        })

    } catch (err) {
        console.error('removeStudent error:', err)
        return res.status(500).json({ message: 'Internal server error' })
    }
}

/**
 * DELETE /api/projects/:id
 * Coordinator only — delete a project and release supervisor's slot.
 */
export const deleteProject = async (req, res) => {
    try {
        const project = await Project.findById(req.params.id)
        if (!project) {
            return res.status(404).json({ message: 'Project not found' })
        }

        // --- Release supervisor slot ---
        if (project.supervisorId) {
            const profile = await SupervisorProfile.findOne({ userId: project.supervisorId })
            if (profile && profile.currentProjects > 0) {
                profile.currentProjects -= 1
                await profile.save()
            }
        }

        await project.deleteOne()

        return res.status(200).json({ message: 'Project deleted successfully' })
    } catch (err) {
        console.error('deleteProject error:', err)
        return res.status(500).json({ message: 'Internal server error' })
    }
}