import bcrypt from 'bcryptjs'
import mongoose from 'mongoose'
import User from '../models/user.model.js'
import Group from '../models/group.model.js'
import Project from '../models/project.model.js'
import SupervisorProfile from '../models/supervisor-profile.model.js'
import StudentProfile from '../models/student-profile.model.js'

/**
 * POST /api/users
 * Coordinator only — creates a new user (student or supervisor)
 */
export const createUser = async (req, res) => {
    try {
        const { name, email, password, role, program, batch, semester, section, rollNumber, maxProjects, department, designation } = req.body;

        // 1. Basic validation
        if (!name || !email || !password || !role) {
            return res.status(400).json({
                message: 'name, email, password and role are required'
            })
        }

        const normalizedEmail = email.toLowerCase().trim()

        const allowedRoles = ['student', 'supervisor']
        if (!allowedRoles.includes(role)) {
            return res.status(400).json({ message: 'Invalid role. Must be student or supervisor' })
        }

        // 2. Role-specific field validation
        if (role === 'supervisor') {
            if (maxProjects === undefined) {
                return res.status(400).json({ message: 'maxProjects is required for supervisors' })
            }
            if (isNaN(Number(maxProjects)) || Number(maxProjects) < 0) {
                return res.status(400).json({ message: 'maxProjects must be a non-negative number' })
            }
            if (!department || !designation) {
                return res.status(400).json({ message: 'department and designation are required for supervisors' })
            }
        }

        if (role === 'student') {
            if (!rollNumber || !program || !batch || !semester || !section) {
                return res.status(400).json({
                    message: 'rollNumber, program, batch, semester and section are required for students'
                })
            }
            const semesterNum = Number(semester)
            if (isNaN(semesterNum) || semesterNum < 7 || semesterNum > 8) {
                return res.status(400).json({ message: 'semester must be a number either 7 or 8' })
            }
        }

        // 3. Check existing user
        const existing = await User.findOne({ email: normalizedEmail })
        if (existing) {
            return res.status(409).json({ message: 'A user with this email already exists' })
        }

        const hashedPassword = await bcrypt.hash(password, 10)

        // 4. Transaction
        const session = await mongoose.startSession()
        session.startTransaction()

        try {
            const user = await User.create([{
                name: name.trim(),
                email: normalizedEmail,
                password: hashedPassword,
                role
            }], { session })

            let profile = null;

            if (role === 'supervisor') {
                profile = await SupervisorProfile.create([{
                    userId: user[0]._id,
                    maxProjects: Number(maxProjects),
                    department: department.trim(),
                    designation: designation.trim(),
                }], { session })
            }

            if (role === 'student') {
                profile = await StudentProfile.create([{
                    userId: user[0]._id,
                    rollNumber: rollNumber.trim(),
                    program: program.trim(),
                    batch: batch.trim(),
                    semester: Number(semester),
                    section: section.trim(),
                }], { session })
            }

            await session.commitTransaction()
            session.endSession()

            return res.status(201).json({
                message: `${role.charAt(0).toUpperCase() + role.slice(1)} created successfully`,
                user: {
                    _id: user[0]._id,
                    name: user[0].name,
                    email: user[0].email,
                    role: user[0].role
                },
                profile: profile ? profile[0] : null,
            })

        } catch (err) {
            await session.abortTransaction()
            session.endSession()
            throw err
        }

    } catch (err) {
        console.error('createUser error:', err)
        return res.status(500).json({ message: 'Internal server error' })
    }
}

/**
 * GET /api/users
 * Coordinator only — list all users, optionally filter by ?role=student|supervisor
 */
export const getUsers = async (req, res) => {
    try {
        const filter = {}
        if (req.query.role) {
            const allowedRoles = ['student', 'supervisor']
            if (!allowedRoles.includes(req.query.role)) {
                return res.status(400).json({ message: 'Invalid role filter' })
            }
            filter.role = req.query.role
        }

        const users = await User.find(filter).select('-password').lean()
        const userIds = users.map(u => u._id)

        const [studentProfiles, supervisorProfiles] = await Promise.all([
            StudentProfile.find({ userId: { $in: userIds } })
                .populate({
                    path: 'supervisorId',         // SupervisorProfile doc
                    populate: {
                        path: 'userId',           // → User doc (to get name)
                        select: 'name'
                    }
                })
                .lean(),
            SupervisorProfile.find({ userId: { $in: userIds } }).lean(),
        ])

        // Map profiles by userId for O(1) lookup
        const studentMap = Object.fromEntries(
            studentProfiles.map(p => [p.userId.toString(), p])
        )
        const supervisorMap = Object.fromEntries(
            supervisorProfiles.map(p => [p.userId.toString(), p])
        )

        const result = users.map(user => {
            const id = user._id.toString()

            if (user.role === 'student') {
                const profile = studentMap[id]
                return {
                    _id: user._id,
                    name: user.name,
                    email: user.email,
                    role: user.role,
                    rollNumber: profile?.rollNumber ?? null,
                    program: profile?.program ?? null,
                    batch: profile?.batch ?? null,
                    semester: profile?.semester ?? null,
                    section: profile?.section ?? null,
                    supervisor: profile?.supervisorId?.userId?.name ?? null,
                }
            }

            if (user.role === 'supervisor') {
                const profile = supervisorMap[id]
                return {
                    _id: user._id,
                    name: user.name,
                    email: user.email,
                    role: user.role,
                    department: profile?.department ?? null,
                    designation: profile?.designation ?? null,
                    maxProjects: profile?.maxProjects ?? null,
                    currentProjects: profile?.currentProjects ?? null,
                }
            }
        })

        return res.status(200).json({ users: result })

    } catch (err) {
        console.error('getUsers error:', err)
        return res.status(500).json({ message: 'Internal server error' })
    }
}

/**
 * GET /api/users/:id
 * Coordinator only — get a single user
 */
export const getUserById = async (req, res) => {
    try {
        const user = await User.findById(req.params.id).select('-password').lean()
        if (!user) return res.status(404).json({ message: 'User not found' })

        let profile = {}

        if (user.role === 'student') {
            const studentProfile = await StudentProfile.findOne({ userId: user._id })
                .populate({
                    path: 'supervisorId',
                    populate: {
                        path: 'userId',
                        select: 'name'
                    }
                })
                .lean()

            profile = {
                rollNumber: studentProfile?.rollNumber ?? null,
                program: studentProfile?.program ?? null,
                batch: studentProfile?.batch ?? null,
                semester: studentProfile?.semester ?? null,
                section: studentProfile?.section ?? null,
                supervisor: studentProfile?.supervisorId?.userId?.name ?? null,
            }
        }

        if (user.role === 'supervisor') {
            const supervisorProfile = await SupervisorProfile.findOne({ userId: user._id }).lean()

            profile = {
                department: supervisorProfile?.department ?? null,
                designation: supervisorProfile?.designation ?? null,
                maxProjects: supervisorProfile?.maxProjects ?? null,
                currentProjects: supervisorProfile?.currentProjects ?? null,
            }
        }

        return res.status(200).json({
            user: {
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                ...profile,
            }
        })

    } catch (err) {
        console.error('getUserById error:', err)
        return res.status(500).json({ message: 'Internal server error' })
    }
}

/**
 * PUT /api/users/:id
 * Coordinator only — update a user's details
 */
export const updateUser = async (req, res) => {
    try {
        const { name, email, password, role, program, batch, semester, section, rollNumber, maxProjects, department, designation } = req.body;

        // 1. Fetch user FIRST
        const existingUser = await User.findById(req.params.id)
        if (!existingUser) {
            return res.status(404).json({ message: 'User not found' })
        }

        // 2. Validate role
        if (role === 'coordinator') {
            return res.status(403).json({ message: 'Cannot assign coordinator role' })
        }

        const updates = {}

        if (name) updates.name = name
        if (email) updates.email = email
        if (role) updates.role = role

        const cleanedPassword = typeof password === 'string' ? password.trim() : '';

        if (cleanedPassword) {
            updates.password = await bcrypt.hash(cleanedPassword, 10);
        }

        // 3. Start transaction (CRITICAL)
        const session = await mongoose.startSession()
        session.startTransaction()

        try {
            // 4. Handle role transitions
            if (role === 'supervisor' && existingUser.role !== 'supervisor') {
                await SupervisorProfile.create([{
                    userId: existingUser._id,
                    maxProjects: maxProjects || 1
                }], { session })
            }

            if (existingUser.role === 'supervisor' && role && role !== 'supervisor') {
                await SupervisorProfile.findOneAndDelete(
                    { userId: existingUser._id },
                    { session }
                )
            }

            // 5. Update user
            const updatedUser = await User.findByIdAndUpdate(
                req.params.id,
                updates,
                { new: true, runValidators: true, session }
            ).select('-password').lean()

            // 6. Update role-specific profile
            if (existingUser.role === 'student') {
                const profileUpdates = {}
                if (rollNumber) profileUpdates.rollNumber = rollNumber
                if (program) profileUpdates.program = program
                if (batch) profileUpdates.batch = batch
                if (semester) profileUpdates.semester = semester
                if (section) profileUpdates.section = section

                await StudentProfile.findOneAndUpdate(
                    { userId: existingUser._id },
                    profileUpdates,
                    { runValidators: true, context: 'query', session }
                )
            }

            if (existingUser.role === 'supervisor') {
                const profileUpdates = {}
                if (maxProjects !== undefined) profileUpdates.maxProjects = maxProjects
                if (department) profileUpdates.department = department.trim()
                if (designation) profileUpdates.designation = designation.trim()

                await SupervisorProfile.findOneAndUpdate(
                    { userId: existingUser._id },
                    profileUpdates,
                    { runValidators: true, context: 'query', session }
                )
            }

            await session.commitTransaction()
            session.endSession()

            // 7. Build response the same way as getUserById
            let profile = {}

            if (updatedUser.role === 'student') {
                const studentProfile = await StudentProfile.findOne({ userId: updatedUser._id })
                    .populate({
                        path: 'supervisorId',
                        populate: {
                            path: 'userId',
                            select: 'name'
                        }
                    })
                    .lean()

                profile = {
                    rollNumber: studentProfile?.rollNumber ?? null,
                    program: studentProfile?.program ?? null,
                    batch: studentProfile?.batch ?? null,
                    semester: studentProfile?.semester ?? null,
                    section: studentProfile?.section ?? null,
                    supervisor: studentProfile?.supervisorId?.userId?.name ?? null,
                }
            }

            if (updatedUser.role === 'supervisor') {
                const supervisorProfile = await SupervisorProfile.findOne({ userId: updatedUser._id }).lean()

                profile = {
                    department: supervisorProfile?.department ?? null,
                    designation: supervisorProfile?.designation ?? null,
                    maxProjects: supervisorProfile?.maxProjects ?? null,
                    currentProjects: supervisorProfile?.currentProjects ?? null,
                }
            }

            return res.status(200).json({
                message: 'User updated successfully',
                user: {
                    _id: updatedUser._id,
                    name: updatedUser.name,
                    email: updatedUser.email,
                    role: updatedUser.role,
                    ...profile,
                }
            })

        } catch (err) {
            await session.abortTransaction()
            session.endSession()
            throw err
        }

    } catch (err) {
        console.error('updateUser error:', err)
        return res.status(500).json({ message: 'Internal server error' })
    }
}

/**
 * DELETE /api/users/:id
 * Coordinator only — delete a user
 */
export const deleteUser = async (req, res) => {
    try {
        // 1. Fetch user FIRST
        const existingUser = await User.findById(req.params.id)
        if (!existingUser) return res.status(404).json({ message: 'User not found' })

        // 2. Start transaction
        const session = await mongoose.startSession()
        session.startTransaction()

        try {
            // 3. Delete role-specific profile
            if (existingUser.role === 'supervisor') {
                await SupervisorProfile.findOneAndDelete(
                    { userId: existingUser._id },
                    { session }
                )
                // Optionally: handle or flag orphaned Projects/Groups
            }

            if (existingUser.role === 'student') {
                await StudentProfile.findOneAndDelete(
                    { userId: existingUser._id },
                    { session }
                )
                await Group.updateMany(
                    { studentIds: existingUser._id },
                    { $pull: { studentIds: existingUser._id } },
                    { session }
                )
            }

            // 4. Delete user
            await User.findByIdAndDelete(req.params.id, { session })

            await session.commitTransaction()
            session.endSession()

            return res.status(200).json({ message: 'User deleted successfully' })

        } catch (err) {
            await session.abortTransaction()
            session.endSession()
            throw err
        }

    } catch (err) {
        console.error('deleteUser error:', err)
        return res.status(500).json({ message: 'Internal server error' })
    }
}