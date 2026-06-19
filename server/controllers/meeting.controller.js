import Meeting from '../models/meeting.model.js';

export const createMeeting = async (req, res) => {
    try {
        const { requestedTo, projectId, proposedDate, proposedTime, topic } = req.body;

        if (!requestedTo || !proposedDate || !proposedTime || !topic) {
            return res.status(400).json({
                success: false,
                message: 'requestedTo, proposedDate, proposedTime, and topic are required',
            });
        }

        const meeting = await Meeting.create({
            requestedBy: req.user._id,
            requestedTo,
            projectId: projectId || null,
            proposedDate,
            proposedTime,
            topic,
        });

        return res.status(201).json({ success: true, data: meeting });
    } catch (err) {
        console.error('createMeeting error:', err);
        return res.status(500).json({ success: false, message: err.message });
    }
};

export const getMeetings = async (req, res) => {
    try {
        const meetings = await Meeting.find({
            $or: [{ requestedBy: req.user._id }, { requestedTo: req.user._id }],
        })
            .populate('requestedBy', 'name email role')
            .populate('requestedTo', 'name email role')
            .populate('projectId', 'title')
            .sort({ createdAt: -1 });

        return res.status(200).json({ success: true, data: meetings });
    } catch (err) {
        console.error('getMeetings error:', err);
        return res.status(500).json({ success: false, message: err.message });
    }
};

export const updateMeeting = async (req, res) => {
    try {
        const { status, notes } = req.body;

        if (!['approved', 'rejected'].includes(status)) {
            return res.status(400).json({
                success: false,
                message: 'status must be "approved" or "rejected"',
            });
        }

        const meeting = await Meeting.findById(req.params.id);
        if (!meeting) {
            return res.status(404).json({ success: false, message: 'Meeting not found' });
        }

        // Only the intended recipient may approve/reject
        if (meeting.requestedTo.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                success: false,
                message: 'You are not authorized to update this meeting',
            });
        }

        meeting.status = status;
        meeting.notes = notes || '';
        await meeting.save();

        return res.status(200).json({ success: true, data: meeting });
    } catch (err) {
        console.error('updateMeeting error:', err);
        return res.status(500).json({ success: false, message: err.message });
    }
};
