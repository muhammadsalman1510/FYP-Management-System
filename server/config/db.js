import mongoose from 'mongoose';

//establishing the connection of mongodb database
const connectDB = async () => {
    try {
        //getting mongodb connection from env file
        const conn = await mongoose.connect(process.env.MONGO_URI)
        console.log("Database connection establised successfully");
    } catch (error) {
        console.error('something went wrong!')
    }
}


//exporting this file so we can use it anywhere in project
export default connectDB;