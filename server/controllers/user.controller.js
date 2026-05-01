import bcrypt from 'bcryptjs'
import User from '../models/user.model.js'

/**
 * POST /api/users
 * Coordinator only — creates a new user (student or supervisor)
 */
export const createUser = async (req, res) => {
    try {
        const { name, email, password, role } = req.body

        if (!name || !email || !password || !role) {
            return res.status(400).json({ message: 'name, email, password, and role are required' })
        }

        if (role === 'coordinator') {
            return res.status(403).json({ message: 'You cannot create a coordinator account' })
        }

        const existing = await User.findOne({ email })
        if (existing) {
            return res.status(409).json({ message: 'A user with this email already exists' })
        }

        const hashedPassword = await bcrypt.hash(password, 10)

        const user = await User.create({ name, email, password: hashedPassword, role })

        return res.status(201).json({
            message: `${role.charAt(0).toUpperCase() + role.slice(1)} created successfully`,
            user: { _id: user._id, name: user.name, email: user.email, role: user.role },
        })
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
        const { name, email, role } = req.body

        if (role === 'coordinator') {
            return res.status(403).json({ message: 'Cannot assign coordinator role' })
        }

        const user = await User.findByIdAndUpdate(
            req.params.id,
            { name, email, role },
            { new: true, runValidators: true }
        ).select('-password')

        if (!user) return res.status(404).json({ message: 'User not found' })
        return res.status(200).json({ message: 'User updated successfully', user })
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
        return res.status(200).json({ message: 'User deleted successfully' })
    } catch (err) {
        console.error('deleteUser error:', err)
        return res.status(500).json({ message: 'Internal server error' })
    }
}