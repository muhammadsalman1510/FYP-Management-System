import mongoose from "mongoose";

const announcementsSchema = new mongoose.Schema({
    title:{
        type: String,
        maxlength:50
    },
    content:{
        type:String,
        maxlength:2000
    }
},
{timestamps: true},
);

const Announcements = mongoose.model("Announcements",announcementsSchema);
export default Announcements;