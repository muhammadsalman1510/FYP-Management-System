import Document from '../models/document.model.js';
import Project from '../models/project.model.js';

const formatSize = (bytes) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
};

export const uploadDocument = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ success: false, message: 'A file is required' });
        }

        const { type } = req.body;
        if (!type) {
            return res.status(400).json({ success: false, message: 'Document type is required' });
        }

        const project = await Project.findOne({ students: req.user._id }).select('_id');
        if (!project) {
            return res.status(400).json({
                success: false,
                message: 'You are not assigned to any project',
            });
        }

        const document = await Document.create({
            projectId: project._id,
            uploadedBy: req.user._id,
            type,
            fileName: req.file.originalname,
            fileUrl: '/uploads/' + req.file.filename,
            size: formatSize(req.file.size),
        });

        return res.status(201).json({ success: true, data: document });
    } catch (err) {
        console.error('uploadDocument error:', err);
        return res.status(500).json({ success: false, message: err.message });
    }
};

export const getDocuments = async (req, res) => {
    try {
        let documents;

        if (req.user.role === 'coordinator') {
            documents = await Document.find()
                .populate('projectId', 'title')
                .populate('uploadedBy', 'name')
                .sort({ uploadedAt: -1 });
        } else if (req.user.role === 'supervisor') {
            const assignedProjects = await Project.find({
                supervisors: req.user._id,
            }).select('_id');
            const projectIds = assignedProjects.map((p) => p._id);

            documents = await Document.find({ projectId: { $in: projectIds } })
                .populate('projectId', 'title')
                .populate('uploadedBy', 'name')
                .sort({ uploadedAt: -1 });
        } else {
            const project = await Project.findOne({ students: req.user._id }).select('_id');
            if (!project) return res.status(200).json({ success: true, data: [] });

            documents = await Document.find({ projectId: project._id })
                .populate('uploadedBy', 'name')
                .sort({ uploadedAt: -1 });
        }

        return res.status(200).json({ success: true, data: documents });
    } catch (err) {
        console.error('getDocuments error:', err);
        return res.status(500).json({ success: false, message: err.message });
    }
};
