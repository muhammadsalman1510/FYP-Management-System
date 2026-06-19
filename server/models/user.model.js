import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
    name: String,
    email: { type: String, unique: true },
    password: String,
    phone: { type: String, default: '' },
    photoUrl: { type: String, default: null },
    role: {
        type: String,
        enum: ['coordinator', 'supervisor', 'student'],
        default: 'student'
    }
});

export default mongoose.model('User', UserSchema);
