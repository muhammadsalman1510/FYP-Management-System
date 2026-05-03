import bcrypt from 'bcryptjs'
import mongoose from 'mongoose'
import User from '../models/user.model.js'
import SupervisorProfile from '../models/supervisor-profile.model.js'
import Group from '../models/group.model.js'
import Project from '../models/project.model.js'

/**
 * POST /api/users
 * Coordinator only — creates a new user (student or supervisor)
 */
export const createUser = async (req, res) => {
    try {
        const { name, email, password, role, maxProjects } = req.body

        // 1. Basic validation
        if (!name || !email || !password || !role) {
            return res.status(400).json({
                message: 'name, email, password, and role are required'
            })
        }

        const normalizedEmail = email.toLowerCase().trim()

        const allowedRoles = ['student', 'supervisor']
        if (!allowedRoles.includes(role)) {
            return res.status(400).json({ message: 'Invalid role' })
        }

        if (role === 'supervisor' && maxProjects === undefined) {
            return res.status(400).json({
                message: 'maxProjects is required for supervisors'
            })
        }

        // 2. Check existing user
        const existing = await User.findOne({ email: normalizedEmail })
        if (existing) {
            return res.status(409).json({
                message: 'A user with this email already exists'
            })
        }

        const hashedPassword = await bcrypt.hash(password, 10)

        // 3. Transaction (IMPORTANT)
        const session = await mongoose.startSession()
        session.startTransaction()

        try {
            // 4. Create user
            const user = await User.create([{
                name: name.trim(),
                email: normalizedEmail,
                password: hashedPassword,
                role
            }], { session })

            // 5. Create supervisor profile if needed
            if (role === 'supervisor') {
                await SupervisorProfile.create([{
                    userId: user[0]._id,
                    maxProjects,
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
                }
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
        if (req.query.role) filter.role = req.query.role

        const users = await User.find(filter).select('-password')
        return res.status(200).json({ users })
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
        const user = await User.findById(req.params.id).select('-password')
        if (!user) return res.status(404).json({ message: 'User not found' })
        return res.status(200).json({ user })
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
        const { name, email, role, password, maxProjects } = req.body

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

        if (password) {
            updates.password = await bcrypt.hash(password, 10)
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
            ).select('-password')

            await session.commitTransaction()
            session.endSession()

            return res.status(200).json({
                message: 'User updated successfully',
                user: updatedUser
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
        const user = await User.findByIdAndDelete(req.params.id)
        if (!user) return res.status(404).json({ message: 'User not found' })

        if (user.role === 'supervisor') {
            await SupervisorProfile.findOneAndDelete({ userId: user._id })
            // Optionally: handle or flag orphaned Projects/Groups
        }

        if (user.role === 'student') {
            await Group.updateMany(
                { studentIds: user._id },
                { $pull: { studentIds: user._id } }
            )
        }

        return res.status(200).json({ message: 'User deleted successfully' })
    } catch (err) {
        console.error('deleteUser error:', err)
        return res.status(500).json({ message: 'Internal server error' })
    }
}