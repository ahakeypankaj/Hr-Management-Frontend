import React, { useState } from "react";
import { useTheme } from "../../context/ThemeContext";

const documentTypes = [
  { id: "resume", label: "Resume / CV", icon: "📄", required: true, description: "Latest resume in PDF/DOC format" },
  { id: "offerLetter", label: "Offer Letter", icon: "📋", required: true, description: "Signed offer letter" },
  { id: "salaryBreakup", label: "Salary Breakup", icon: "💰", required: true, description: "CTC and salary structure" },
  { id: "idProof", label: "ID Proof (Aadhar/Passport)", icon: "🪪", required: true, description: "Government issued ID" },
  { id: "panCard", label: "PAN Card", icon: "💳", required: true, description: "PAN card copy" },
  { id: "addressProof", label: "Address Proof", icon: "🏠", required: false, description: "Utility bill or bank statement" },
  { id: "educationCert", label: "Education Certificates", icon: "🎓", required: true, description: "Degree/diploma certificates" },
  { id: "experienceLetter", label: "Experience Letters", icon: "📜", required: false, description: "Previous employment letters" },
  { id: "relievingLetter", label: "Relieving Letter", icon: "📃", required: false, description: "From previous employer" },
  { id: "payslips", label: "Last 3 Payslips", icon: "🧾", required: false, description: "Recent salary slips" },
  { id: "bankDetails", label: "Bank Account Details", icon: "🏦", required: false, description: "Cancelled cheque or passbook" },
  { id: "photo", label: "Passport Photo", icon: "📷", required: true, description: "Recent passport size photo" },
];

export default function DocumentUpload() {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const [documents, setDocuments] = useState({});
  const [errors, setErrors] = useState({});

  const navyBlue = '#1e3a5f';
  const cardStyle = {
    backgroundColor: isDark ? '#1e293b' : '#ffffff',
    border: `1px solid ${isDark ? '#334155' : '#e2e8f0'}`,
    borderRadius: '20px',
  };
  const textPrimary = isDark ? '#f8fafc' : '#0f172a';
  const textSecondary = isDark ? '#94a3b8' : '#64748b';
  const defaultBorderColor = isDark ? '#475569' : '#e2e8f0';

  const handleDocumentUpload = (docId, file) => {
    if (file) {
      setDocuments({ ...documents, [docId]: file });
      if (errors[docId]) {
        setErrors({ ...errors, [docId]: null });
      }
    }
  };

  const removeDocument = (docId) => {
    const newDocs = { ...documents };
    delete newDocs[docId];
    setDocuments(newDocs);
  };

  const handleSubmit = () => {
    const newErrors = {};
    documentTypes.filter(d => d.required).forEach(doc => {
      if (!documents[doc.id]) {
        newErrors[doc.id] = `${doc.label} is required`;
      }
    });

    setErrors(newErrors);
    
    if (Object.keys(newErrors).length === 0) {
      // Handle submission - you can integrate with API here
      alert("Documents uploaded successfully!");
    }
  };

  return (
    <div className="space-y-6" style={{ fontFamily: "'Outfit', sans-serif" }}>
      {/* Header */}
      <div className="animate-fade-in-down">
        <h1 className="text-xl sm:text-2xl font-bold mb-2" style={{ color: textPrimary }}>Document Upload</h1>
        <p className="text-sm sm:text-base" style={{ color: textSecondary }}>Upload all required documents for onboarding</p>
      </div>

      {/* Documents Section */}
      <div className="p-6 rounded-xl border-2 animate-fade-in-up" style={{ 
        backgroundColor: isDark ? '#1e293b' : '#ffffff',
        borderColor: isDark ? '#334155' : '#e2e8f0'
      }}>
        <h3 className="text-lg font-bold mb-6 flex items-center gap-2" style={{ color: textPrimary }}>
          <span>📌</span> Required Documents
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {documentTypes.filter(d => d.required).map(doc => (
            <div
              key={doc.id}
              className="p-4 rounded-xl transition-all"
              style={{
                backgroundColor: documents[doc.id] ? '#dcfce7' : (isDark ? '#334155' : '#f8fafc'),
                border: `2px ${documents[doc.id] ? 'solid' : 'dashed'} ${documents[doc.id] ? '#16a34a' : (errors[doc.id] ? '#dc2626' : (isDark ? '#475569' : '#e2e8f0'))}`,
              }}
            >
              <div className="flex items-start gap-3">
                <span className="text-2xl">{doc.icon}</span>
                <div className="flex-1">
                  <p className="font-semibold text-sm" style={{ color: documents[doc.id] ? '#16a34a' : textPrimary }}>
                    {doc.label} <span className="text-red-500">*</span>
                  </p>
                  <p className="text-xs mb-3" style={{ color: textSecondary }}>{doc.description}</p>
                  
                  {documents[doc.id] ? (
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-medium text-green-600 truncate max-w-[120px]">
                        ✓ {documents[doc.id].name}
                      </span>
                      <button
                        onClick={() => removeDocument(doc.id)}
                        className="text-xs text-red-500 hover:underline"
                      >
                        Remove
                      </button>
                    </div>
                  ) : (
                    <label className="flex items-center justify-center gap-2 py-2 px-3 rounded-lg cursor-pointer transition-all hover:opacity-80"
                      style={{ backgroundColor: navyBlue, color: '#ffffff' }}
                    >
                      <span className="text-xs font-semibold">📤 Upload</span>
                      <input
                        type="file"
                        className="hidden"
                        accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                        onChange={(e) => handleDocumentUpload(doc.id, e.target.files[0])}
                      />
                    </label>
                  )}
                </div>
              </div>
              {errors[doc.id] && <p className="text-red-500 text-xs mt-2">{errors[doc.id]}</p>}
            </div>
          ))}
        </div>

        {/* Optional Documents */}
        <div className="mt-8 pt-8" style={{ borderTop: `1px solid ${isDark ? '#334155' : '#e2e8f0'}` }}>
          <h3 className="text-lg font-bold mb-6 flex items-center gap-2" style={{ color: textPrimary }}>
            <span>📎</span> Optional Documents
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {documentTypes.filter(d => !d.required).map(doc => (
              <div
                key={doc.id}
                className="p-4 rounded-xl transition-all"
                style={{
                  backgroundColor: documents[doc.id] ? '#dcfce7' : (isDark ? '#334155' : '#f8fafc'),
                  border: `2px ${documents[doc.id] ? 'solid' : 'dashed'} ${documents[doc.id] ? '#16a34a' : (isDark ? '#475569' : '#e2e8f0')}`,
                }}
              >
                <div className="flex items-start gap-3">
                  <span className="text-2xl">{doc.icon}</span>
                  <div className="flex-1">
                    <p className="font-semibold text-sm" style={{ color: documents[doc.id] ? '#16a34a' : textPrimary }}>
                      {doc.label}
                    </p>
                    <p className="text-xs mb-3" style={{ color: textSecondary }}>{doc.description}</p>
                    
                    {documents[doc.id] ? (
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-medium text-green-600 truncate max-w-[120px]">
                          ✓ {documents[doc.id].name}
                        </span>
                        <button
                          onClick={() => removeDocument(doc.id)}
                          className="text-xs text-red-500 hover:underline"
                        >
                          Remove
                        </button>
                      </div>
                    ) : (
                      <label className="flex items-center justify-center gap-2 py-2 px-3 rounded-lg cursor-pointer transition-all hover:opacity-80"
                        style={{ backgroundColor: isDark ? '#1e293b' : '#e2e8f0', color: textPrimary }}
                      >
                        <span className="text-xs font-semibold">📤 Upload</span>
                        <input
                          type="file"
                          className="hidden"
                          accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                          onChange={(e) => handleDocumentUpload(doc.id, e.target.files[0])}
                        />
                      </label>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Upload Summary */}
        <div className="p-4 rounded-xl mt-8" style={{ backgroundColor: isDark ? '#334155' : '#f8fafc' }}>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-semibold" style={{ color: textPrimary }}>Upload Progress</p>
              <p className="text-sm" style={{ color: textSecondary }}>
                {Object.keys(documents).length} of {documentTypes.filter(d => d.required).length} required documents uploaded
              </p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold" style={{ color: navyBlue }}>
                {Math.round((Object.keys(documents).filter(id => documentTypes.find(d => d.id === id)?.required).length / documentTypes.filter(d => d.required).length) * 100)}%
              </p>
            </div>
          </div>
          <div className="mt-3 h-2 rounded-full" style={{ backgroundColor: isDark ? '#1e293b' : '#e2e8f0' }}>
            <div
              className="h-2 rounded-full transition-all"
              style={{
                width: `${(Object.keys(documents).filter(id => documentTypes.find(d => d.id === id)?.required).length / documentTypes.filter(d => d.required).length) * 100}%`,
                backgroundColor: navyBlue
              }}
            />
          </div>
        </div>

        {/* Submit Button */}
        <div className="mt-8 flex justify-end">
          <button
            onClick={handleSubmit}
            className="px-8 py-4 rounded-xl font-bold text-white transition-all hover:opacity-90"
            style={{ 
              background: `linear-gradient(135deg, ${navyBlue} 0%, #2563eb 100%)`,
              boxShadow: '0 4px 15px rgba(30, 58, 95, 0.4)'
            }}
          >
            ✅ Submit Documents
          </button>
        </div>
      </div>
    </div>
  );
}
