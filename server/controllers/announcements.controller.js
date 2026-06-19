import Announcements from '../models/announcements.js';

export const createAnnouncement = async (req, res) => {
    try {
        const { title, content } = req.body;

        if (!title || !content) {
            return res.status(400).json({
                success: false,
                message: 'title and content are required',
            });
        }

        const announcement = await Announcements.create({ title, content });
        return res.status(201).json({ success: true, data: announcement });
    } catch (err) {
        console.error('createAnnouncement error:', err);
        return res.status(500).json({ success: false, message: err.message });
    }
};

export const getAnnouncements = async (req, res) => {
    try {
        const announcements = await Announcements.find().sort({ createdAt: -1 });
        return res.status(200).json({ success: true, data: announcements });
    } catch (err) {
        console.error('getAnnouncements error:', err);
        return res.status(500).json({ success: false, message: err.message });
    }
};
