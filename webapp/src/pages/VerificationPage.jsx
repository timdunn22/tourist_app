import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import useStore from '../store/useStore';
import {
  getVerificationStatus,
  getDocumentRequirements,
  uploadVerificationDocument,
  deleteVerificationDocument
} from '../services/api';

const DOCUMENT_TYPE_LABELS = {
  PASSPORT: 'Passport',
  GOVERNMENT_ID: 'Government ID',
  DRIVERS_LICENSE: "Driver's License",
  CITIZENSHIP: 'Citizenship Document',
  PROFESSIONAL_CERTIFICATE: 'Professional Certificate',
  BUSINESS_REGISTRATION: 'Business Registration',
  PAN_CARD: 'PAN Card',
};

const VERIFICATION_LEVEL_LABELS = {
  NONE: 'Not Verified',
  EMAIL_VERIFIED: 'Email Verified',
  ID_VERIFIED: 'ID Verified',
  FULLY_VERIFIED: 'Fully Verified',
};

const STATUS_COLORS = {
  PENDING: 'bg-yellow-100 text-yellow-800',
  UNDER_REVIEW: 'bg-blue-100 text-blue-800',
  APPROVED: 'bg-green-100 text-green-800',
  REJECTED: 'bg-red-100 text-red-800',
  EXPIRED: 'bg-gray-100 text-gray-800',
};

function VerificationPage() {
  const navigate = useNavigate();
  const { user } = useStore();
  const fileInputRef = useRef(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [verificationData, setVerificationData] = useState({
    verificationLevel: 'NONE',
    documents: [],
    approvedTypes: [],
    pendingTypes: [],
    canUploadMore: true,
  });

  const [requirements, setRequirements] = useState({
    documentTypes: [],
    maxFileSize: 10 * 1024 * 1024,
    maxFileSizeMB: 10,
  });

  const [selectedType, setSelectedType] = useState('');
  const [documentNumber, setDocumentNumber] = useState('');
  const [expiresAt, setExpiresAt] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [statusRes, reqRes] = await Promise.all([
        getVerificationStatus(),
        getDocumentRequirements(),
      ]);

      setVerificationData(statusRes.data);
      setRequirements(reqRes.data);

      // Default to first available document type
      if (reqRes.data.documentTypes?.length > 0) {
        setSelectedType(reqRes.data.documentTypes[0]);
      }
    } catch (err) {
      setError('Failed to load verification status');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file size
    if (file.size > requirements.maxFileSize) {
      setError(`File size must be under ${requirements.maxFileSizeMB}MB`);
      return;
    }

    // Validate file type
    const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];
    if (!validTypes.includes(file.type)) {
      setError('Please upload a JPG, PNG, WebP, or PDF file');
      return;
    }

    if (!selectedType) {
      setError('Please select a document type');
      return;
    }

    setUploading(true);
    setError('');
    setSuccess('');

    try {
      const formData = new FormData();
      formData.append('document', file);
      formData.append('type', selectedType);
      if (documentNumber) formData.append('documentNumber', documentNumber);
      if (expiresAt) formData.append('expiresAt', expiresAt);

      await uploadVerificationDocument(formData);
      setSuccess('Document uploaded successfully! It will be reviewed shortly.');

      // Reset form
      setDocumentNumber('');
      setExpiresAt('');
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }

      // Refresh data
      await fetchData();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to upload document');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (documentId) => {
    if (!confirm('Are you sure you want to delete this document?')) return;

    try {
      await deleteVerificationDocument(documentId);
      setSuccess('Document deleted successfully');
      await fetchData();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to delete document');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-600">Loading...</div>
      </div>
    );
  }

  const levelLabel = VERIFICATION_LEVEL_LABELS[verificationData.verificationLevel] || 'Unknown';
  const isVerified = ['ID_VERIFIED', 'FULLY_VERIFIED'].includes(verificationData.verificationLevel);

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate(-1)}
            className="text-gray-600 hover:text-gray-800 mb-4 flex items-center gap-2"
          >
            Back
          </button>
          <h1 className="text-3xl font-bold text-gray-900">Identity Verification</h1>
          <p className="text-gray-600 mt-2">
            Verify your identity to unlock features and build trust with other users.
          </p>
        </div>

        {/* Current Status Card */}
        <div className={`rounded-2xl p-6 mb-8 ${isVerified ? 'bg-green-50 border border-green-200' : 'bg-white shadow'}`}>
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Verification Status</h2>
              <p className={`text-xl font-bold mt-1 ${isVerified ? 'text-green-600' : 'text-gray-700'}`}>
                {levelLabel}
              </p>
            </div>
            {isVerified && (
              <div className="text-4xl">Verified</div>
            )}
          </div>

          {isVerified && (
            <p className="text-green-700 mt-4">
              Your identity has been verified. You now have access to all features!
            </p>
          )}
        </div>

        {/* Messages */}
        {error && (
          <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-6">
            {error}
          </div>
        )}
        {success && (
          <div className="bg-green-50 text-green-600 p-4 rounded-lg mb-6">
            {success}
          </div>
        )}

        {/* Upload Section */}
        {verificationData.canUploadMore && !isVerified && (
          <div className="bg-white rounded-2xl shadow p-6 mb-8">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Upload Document</h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Document Type
                </label>
                <select
                  value={selectedType}
                  onChange={(e) => setSelectedType(e.target.value)}
                  className="input"
                >
                  {requirements.documentTypes?.map((type) => (
                    <option key={type} value={type}>
                      {DOCUMENT_TYPE_LABELS[type] || type}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Document Number (Optional)
                </label>
                <input
                  type="text"
                  value={documentNumber}
                  onChange={(e) => setDocumentNumber(e.target.value)}
                  className="input"
                  placeholder="ABC123456"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Expiry Date (Optional)
                </label>
                <input
                  type="date"
                  value={expiresAt}
                  onChange={(e) => setExpiresAt(e.target.value)}
                  className="input"
                  min={new Date().toISOString().split('T')[0]}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Upload Document
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                  <input
                    ref={fileInputRef}
                    type="file"
                    onChange={handleFileSelect}
                    accept="image/jpeg,image/png,image/webp,application/pdf"
                    className="hidden"
                    id="document-upload"
                    disabled={uploading}
                  />
                  <label
                    htmlFor="document-upload"
                    className={`cursor-pointer ${uploading ? 'opacity-50' : ''}`}
                  >
                    <div className="text-4xl mb-2">Upload</div>
                    <p className="text-gray-600">
                      {uploading ? 'Uploading...' : 'Click to upload or drag and drop'}
                    </p>
                    <p className="text-gray-400 text-sm mt-1">
                      JPG, PNG, WebP or PDF (max {requirements.maxFileSizeMB}MB)
                    </p>
                  </label>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Uploaded Documents */}
        {verificationData.documents?.length > 0 && (
          <div className="bg-white rounded-2xl shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Your Documents</h2>

            <div className="space-y-4">
              {verificationData.documents.map((doc) => (
                <div
                  key={doc.id}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div className="flex items-center gap-4">
                    <div className="text-2xl">Document</div>
                    <div>
                      <p className="font-medium text-gray-900">
                        {DOCUMENT_TYPE_LABELS[doc.type] || doc.type}
                      </p>
                      <p className="text-sm text-gray-500">
                        {doc.originalName}
                      </p>
                      {doc.rejectionReason && (
                        <p className="text-sm text-red-600 mt-1">
                          Reason: {doc.rejectionReason}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${STATUS_COLORS[doc.status]}`}>
                      {doc.status.replace('_', ' ')}
                    </span>

                    {doc.status === 'PENDING' && (
                      <button
                        onClick={() => handleDelete(doc.id)}
                        className="text-red-600 hover:text-red-800 text-sm"
                      >
                        Delete
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Benefits of Verification */}
        <div className="bg-white rounded-2xl shadow p-6 mt-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Benefits of Verification</h2>
          <ul className="space-y-3">
            <li className="flex items-center gap-3">
              <span className="text-green-500">Check</span>
              <span>Build trust with other users</span>
            </li>
            <li className="flex items-center gap-3">
              <span className="text-green-500">Check</span>
              <span>Get a verified badge on your profile</span>
            </li>
            <li className="flex items-center gap-3">
              <span className="text-green-500">Check</span>
              <span>Access verified-only activities</span>
            </li>
            <li className="flex items-center gap-3">
              <span className="text-green-500">Check</span>
              <span>Higher visibility in matching</span>
            </li>
            <li className="flex items-center gap-3">
              <span className="text-green-500">Check</span>
              <span>Required for hosting paid experiences</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}

export default VerificationPage;
