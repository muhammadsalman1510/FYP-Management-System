import Meeting from '../models/meeting.model.js';
import Project from '../models/project.model.js';
import User from '../models/user.model.js';

export const createMeeting = async (req, res) => {
    try {
        const {
            requestedTo, projectId, proposedDate, proposedTime,
            topic, location, meetWith, meetingType,
        } = req.body;

        if (!proposedDate || !proposedTime || !topic) {
            return res.status(400).json({
                success: false,
                message: 'proposedDate, proposedTime, and topic are required',
            });
        }

        // Determine meetingType and status based on role + body
        let type = 'requested';
        let status = 'pending';
        if (req.user.role === 'coordinator' || req.user.role === 'supervisor') {
            if (meetingType === 'requested') {
                type = 'requested';
                status = 'pending';
            } else {
                type = 'scheduled';
                status = 'approved';
            }
        }

        // ── Coordinator scheduling for an entire project ─────────────────────
        if (meetWith === 'project') {
            if (!projectId) {
                return res.status(400).json({ success: false, message: 'projectId is required for project meetings' });
            }
            const project = await Project.findById(projectId).select('students title');
            if (!project) {
                return res.status(404).json({ success: false, message: 'Project not found' });
            }
            if (!project.students || project.students.length === 0) {
                return res.status(400).json({ success: false, message: 'This project has no students assigned.' });
            }

            const meetingDocs = project.students.map((studentId) => ({
                requestedBy: req.user._id,
                requestedTo: studentId,
                projectId,
                proposedDate,
                proposedTime,
                topic,
                location: location || '',
                meetingType: type,
                status,
            }));

            const meetings = await Meeting.insertMany(meetingDocs);
            return res.status(201).json({ success: true, data: meetings });
        }

        // ── Single meeting ────────────────────────────────────────────────────
        if (!requestedTo) {
            return res.status(400).json({ success: false, message: 'requestedTo is required' });
        }

        const meeting = await Meeting.create({
            requestedBy: req.user._id,
            requestedTo,
            projectId: projectId || null,
            proposedDate,
            proposedTime,
            topic,
            location: location || '',
            meetingType: type,
            status,
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
        const { status, notes, studentReply } = req.body;

        if (status === undefined && studentReply === undefined) {
            return res.status(400).json({ success: false, message: 'Provide status or studentReply to update' });
        }

        const meeting = await Meeting.findById(req.params.id);
        if (!meeting) {
            return res.status(404).json({ success: false, message: 'Meeting not found' });
        }

        const isRequestedTo = meeting.requestedTo.toString() === req.user._id.toString();
        const isRequestedBy = meeting.requestedBy.toString() === req.user._id.toString();

        if (!isRequestedTo && !isRequestedBy) {
            return res.status(403).json({ success: false, message: 'You are not authorized to update this meeting' });
        }

        // Status update — only the recipient, only coordinator/supervisor
        if (status !== undefined) {
            if (!isRequestedTo) {
                return res.status(403).json({ success: false, message: 'Only the meeting recipient can approve or reject' });
            }
            if (req.user.role === 'student') {
                return res.status(403).json({ success: false, message: 'Students cannot approve or reject meetings' });
            }
            if (!['approved', 'rejected'].includes(status)) {
                return res.status(400).json({ success: false, message: 'status must be "approved" or "rejected"' });
            }
            meeting.status = status;
            meeting.notes = notes !== undefined ? notes : (meeting.notes || '');
        }

        // Student reply — any party to the meeting
        if (studentReply !== undefined) {
            meeting.studentReply = studentReply;
        }

        await meeting.save();
        return res.status(200).json({ success: true, data: meeting });
    } catch (err) {
        console.error('updateMeeting error:', err);
        return res.status(500).json({ success: false, message: err.message });
    }
};

export const deleteMeeting = async (req, res) => {
    try {
        const meeting = await Meeting.findById(req.params.id).populate('requestedTo', 'role');
        if (!meeting) {
            return res.status(404).json({ success: false, message: 'Meeting not found' });
        }

        if (req.user.role === 'coordinator') {
            // Can delete any meeting they created
            if (meeting.requestedBy.toString() !== req.user._id.toString()) {
                return res.status(403).json({ success: false, message: 'You can only cancel meetings you created.' });
            }
        } else if (req.user.role === 'supervisor') {
            // Must have created it
            if (meeting.requestedBy.toString() !== req.user._id.toString()) {
                return res.status(403).json({ success: false, message: 'You can only cancel meetings you created.' });
            }
            // Recipient must be a student
            const recipientRole = meeting.requestedTo?.role;
            if (recipientRole !== 'student') {
                return res.status(403).json({ success: false, message: 'You can only cancel meetings with students.' });
            }
        } else {
            return res.status(403).json({ success: false, message: 'Not authorized to cancel meetings.' });
        }

        await Meeting.findByIdAndDelete(req.params.id);
        return res.status(200).json({ success: true, data: { message: 'Meeting cancelled.' } });
    } catch (err) {
        console.error('deleteMeeting error:', err);
        return res.status(500).json({ success: false, message: err.message });
    }
};
