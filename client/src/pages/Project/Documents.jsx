import React, { useState } from 'react';

const Documents = () => {
  const [documents, setDocuments] = useState([
    { id: 1, name: 'Project Proposal.pdf',    type: 'Proposal',          uploadedDate: '2024-01-15', size: '2.4 MB', status: 'approved'     },
    { id: 2, name: 'Literature Review.docx',  type: 'Literature Review', uploadedDate: '2024-01-20', size: '1.8 MB', status: 'under_review'  },
    { id: 3, name: 'Project Timeline.xlsx',   type: 'Timeline',          uploadedDate: '2024-01-25', size: '0.8 MB', status: 'approved'      },
  ]);

  const [newDocument, setNewDocument] = useState({ name: '', type: '', file: null });

  const handleFileUpload = (e) => {
    e.preventDefault();
    if (newDocument.file) {
      const newDoc = {
        id: documents.length + 1,
        name: newDocument.file.name,
        type: newDocument.type || 'Other',
        uploadedDate: new Date().toISOString().split('T')[0],
        size: `${(newDocument.file.size / (1024 * 1024)).toFixed(1)} MB`,
        status: 'submitted',
      };
      setDocuments((prev) => [...prev, newDoc]);
      setNewDocument({ name: '', type: '', file: null });
      alert('Document uploaded successfully!');
    }
  };

  /* Returns Bootstrap badge class per status */
  const getStatusBadge = (status) => {
    switch (status) {
      case 'approved':     return 'bg-success';
      case 'under_review': return 'bg-warning text-dark';
      case 'rejected':     return 'bg-danger';
      case 'submitted':    return 'bg-primary';
      default:             return 'bg-secondary';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'approved':     return 'Approved';
      case 'under_review': return 'Under Review';
      case 'rejected':     return 'Rejected';
      case 'submitted':    return 'Submitted';
      default:             return 'Unknown';
    }
  };

  return (
    <div className="d-flex flex-column gap-4">

      {/* ===== Upload Document Card ===== */}
      <div className="card shadow-sm">
        <div className="card-header bg-white border-bottom py-3 px-4">
          <h5 className="fw-semibold text-dark mb-0">Upload New Document</h5>
        </div>
        <div className="card-body p-4">
          <form onSubmit={handleFileUpload}>

            {/* Document Type dropdown */}
            <div className="mb-3">
              <label className="form-label fw-medium text-dark">
                Document Type
              </label>
              <select
                value={newDocument.type}
                onChange={(e) => setNewDocument((prev) => ({ ...prev, type: e.target.value }))}
                className="form-select"
              >
                <option value="">Select Document Type</option>
                <option value="Proposal">Proposal</option>
                <option value="Literature Review">Literature Review</option>
                <option value="Progress Report">Progress Report</option>
                <option value="Final Report">Final Report</option>
                <option value="Presentation">Presentation</option>
                <option value="Other">Other</option>
              </select>
            </div>

            {/* File picker */}
            <div className="mb-4">
              <label className="form-label fw-medium text-dark">
                Select File <span className="text-danger">*</span>
              </label>
              <input
                type="file"
                onChange={(e) => setNewDocument((prev) => ({ ...prev, file: e.target.files[0] }))}
                className="form-control"
                required
              />
            </div>

            {/* Upload button */}
            <button type="submit" className="btn btn-primary w-100 py-2">
              Upload Document
            </button>

          </form>
        </div>
      </div>
      {/* ===== End Upload Card ===== */}

      {/* ===== Documents List Card ===== */}
      <div className="card shadow-sm">
        <div className="card-header bg-white border-bottom py-3 px-4">
          <h5 className="fw-semibold text-dark mb-0">My Documents</h5>
        </div>
        <div className="card-body p-4">
          <div className="d-flex flex-column gap-3">

            {documents.map((doc) => (
              <div
                key={doc.id}
                className="d-flex align-items-center justify-content-between border rounded p-3 flex-wrap gap-3"
              >
                {/* Left: icon + file info */}
                <div className="d-flex align-items-center gap-3">

                  {/* File type icon box */}
                  <div
                    className="d-flex align-items-center justify-content-center rounded bg-primary bg-opacity-10"
                    style={{ width: '42px', height: '42px', minWidth: '42px' }}
                  >
                    <span className="text-primary fw-bold small">PDF</span>
                  </div>

                  {/* File name and meta */}
                  <div>
                    <p className="fw-medium text-dark mb-0 small">{doc.name}</p>
                    <p className="text-muted mb-0" style={{ fontSize: '0.75rem' }}>
                      {doc.type} &bull; {doc.uploadedDate} &bull; {doc.size}
                    </p>
                  </div>
                </div>

                {/* Right: status badge + action buttons */}
                <div className="d-flex align-items-center gap-3">
                  <span className={`badge rounded-pill px-3 py-2 ${getStatusBadge(doc.status)}`}>
                    {getStatusText(doc.status)}
                  </span>
                  <button className="btn btn-link btn-sm p-0 text-primary text-decoration-none">
                    Download
                  </button>
                  <button className="btn btn-link btn-sm p-0 text-danger text-decoration-none">
                    Delete
                  </button>
                </div>
              </div>
            ))}

          </div>
        </div>
      </div>
      {/* ===== End Documents List ===== */}

    </div>
  );
};

export default Documents;