import React, { useState, useEffect } from 'react';

const Documents = () => {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [selectedType, setSelectedType] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState(null);
  const [uploadSuccess, setUploadSuccess] = useState(false);

  useEffect(() => {
    const fetchDocuments = async () => {
      try {
        const token = sessionStorage.getItem('token');
        const res = await fetch('/api/documents', {
          headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        });
        const data = await res.json();
        if (!res.ok || !data.success) {
          throw new Error(data.message || 'Failed to load documents');
        }
        setDocuments(data.data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchDocuments();
  }, []);

  const handleUpload = async () => {
    if (!selectedFile) {
      setUploadError('Please select a file.');
      return;
    }
    if (!selectedType) {
      setUploadError('Please select a document type.');
      return;
    }

    setUploading(true);
    setUploadError(null);

    try {
      const token = sessionStorage.getItem('token');
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('type', selectedType);

      const res = await fetch('/api/documents', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData,
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Upload failed');
      }

      setDocuments((prev) => [data.data, ...prev]);
      setSelectedFile(null);
      setSelectedType('');
      setUploadSuccess(true);
      setTimeout(() => setUploadSuccess(false), 3000);
    } catch (err) {
      setUploadError(err.message);
    } finally {
      setUploading(false);
    }
  };

  const getFileExt = (name) => {
    if (!name) return 'FILE';
    const parts = name.split('.');
    return parts.length > 1 ? parts[parts.length - 1].toUpperCase() : 'FILE';
  };

  const formatUploadedAt = (dateStr) => {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleDateString('en-GB', {
      day: '2-digit', month: 'short', year: 'numeric',
    });
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center py-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return <div className="alert alert-danger border-0">{error}</div>;
  }

  return (
    <div className="d-flex flex-column gap-4">

      {/* Upload Document Card */}
      <div className="card shadow-sm">
        <div className="card-header bg-white border-bottom py-3 px-4">
          <h5 className="fw-semibold text-dark mb-0">Upload New Document</h5>
        </div>
        <div className="card-body p-4">

          {uploadSuccess && (
            <div className="alert alert-success border-0 mb-3">Document uploaded successfully!</div>
          )}
          {uploadError && (
            <div className="alert alert-danger border-0 mb-3">{uploadError}</div>
          )}

          {/* Document Type dropdown */}
          <div className="mb-3">
            <label className="form-label fw-medium text-dark">Document Type</label>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
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
              onChange={(e) => setSelectedFile(e.target.files[0] || null)}
              className="form-control"
            />
            {selectedFile && (
              <p className="text-muted small mt-1 mb-0">{selectedFile.name}</p>
            )}
          </div>

          {/* Upload button */}
          <button
            className="btn btn-primary w-100 py-2"
            onClick={handleUpload}
            disabled={uploading}
          >
            {uploading ? (
              <>
                <span className="spinner-border spinner-border-sm me-2" role="status" />
                Uploading...
              </>
            ) : (
              'Upload Document'
            )}
          </button>

        </div>
      </div>

      {/* Documents List Card */}
      <div className="card shadow-sm">
        <div className="card-header bg-white border-bottom py-3 px-4">
          <h5 className="fw-semibold text-dark mb-0">My Documents</h5>
        </div>
        <div className="card-body p-4">
          {documents.length === 0 ? (
            <div className="text-center py-4">
              <p className="text-muted mb-0">No documents uploaded yet.</p>
            </div>
          ) : (
            <div className="d-flex flex-column gap-3">
              {documents.map((doc) => (
                <div
                  key={doc._id}
                  className="d-flex align-items-center justify-content-between border rounded p-3 flex-wrap gap-3"
                >
                  {/* Left: icon + file info */}
                  <div className="d-flex align-items-center gap-3">
                    <div
                      className="d-flex align-items-center justify-content-center rounded bg-primary bg-opacity-10"
                      style={{ width: '42px', height: '42px', minWidth: '42px' }}
                    >
                      <span className="text-primary fw-bold small">{getFileExt(doc.name)}</span>
                    </div>
                    <div>
                      <p className="fw-medium text-dark mb-0 small">{doc.name}</p>
                      <p className="text-muted mb-0" style={{ fontSize: '0.75rem' }}>
                        {doc.type} &bull; {formatUploadedAt(doc.uploadedAt || doc.createdAt)} &bull; {doc.fileSize}
                      </p>
                    </div>
                  </div>

                  {/* Right: action buttons */}
                  <div className="d-flex align-items-center gap-3">
                    <span className="badge rounded-pill px-3 py-2 bg-primary" style={{ fontSize: '0.72rem' }}>
                      Uploaded
                    </span>
                    <button
                      className="btn btn-link btn-sm p-0 text-primary text-decoration-none"
                      onClick={() => window.open(doc.fileUrl, '_blank')}
                    >
                      Download
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

    </div>
  );
};

export default Documents;
