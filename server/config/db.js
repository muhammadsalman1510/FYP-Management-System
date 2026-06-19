import mongoose from 'mongoose';

const connectDB = async () => {
    console.log('MONGO_URI value:', JSON.stringify(process.env.MONGO_URI));
    try {
        const conn = await mongoose.connect(process.env.MONGO_URI)
        console.log("Database connection established successfully");
        console.log("Connected host:", conn.connection.host);
    } catch (error) {
        console.error('Database connection failed:', error.message);
        console.error(error);
        process.exit(1);
    }
}

export default connectDB;