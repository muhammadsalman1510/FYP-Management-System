// seed.js
import mongoose from 'mongoose'
import bcrypt from 'bcryptjs'
import User from './models/user.model.js'
import dotenv from 'dotenv'

dotenv.config()

await mongoose.connect(process.env.MONGO_URI)

const existing = await User.findOne({ email: 'coordinator@example.com' })
if (existing) {
    console.log('Coordinator already exists, skipping.')
} else {
    const hashedPassword = await bcrypt.hash(process.env.ADMIN_PASSWORD, 10)
    await User.create({
        name: 'Asadullah Ehsan',
        email: 'yitisof898@lohinja.com',
        password: hashedPassword,
        role: 'coordinator'
    })
    console.log('Coordinator seeded successfully.')
}

await mongoose.disconnect()