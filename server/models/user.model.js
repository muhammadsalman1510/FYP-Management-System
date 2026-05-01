import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  password: String,
  role: {
    type: String,
    enum: ['admin', 'supervisor', 'student'],
    default: 'student'
  }
});

export default mongoose.model('User',studentSchema);