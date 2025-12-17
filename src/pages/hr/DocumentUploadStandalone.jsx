import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useTheme } from "../../context/ThemeContext";
import api from "../../services/api";

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

export default function DocumentUploadStandalone() {
  const { token, onboardingId } = useParams(); // Can accept either token or onboardingId
  const navigate = useNavigate();
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const [documents, setDocuments] = useState({});
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [candidateInfo, setCandidateInfo] = useState(null);
  const [isLoadingInfo, setIsLoadingInfo] = useState(false);
  const [error, setError] = useState(null);

  const navyBlue = '#1e3a5f';
  const cardStyle = {
    backgroundColor: isDark ? '#1e293b' : '#ffffff',
    border: `1px solid ${isDark ? '#334155' : '#e2e8f0'}`,
    borderRadius: '20px',
  };
  const textPrimary = isDark ? '#f8fafc' : '#0f172a';
  const textSecondary = isDark ? '#94a3b8' : '#64748b';
  const defaultBorderColor = isDark ? '#475569' : '#e2e8f0';

  // Map document IDs to API field names
  const documentFieldMap = {
    resume: 'resume',
    offerLetter: 'offerLetter',
    salaryBreakup: 'salaryBreakup',
    idProof: 'adhar',
    panCard: 'pan',
    addressProof: 'addressProof',
    educationCert: 'educationCert',
    experienceLetter: 'experienceLetter',
    relievingLetter: 'relievingLetter',
    payslips: 'payslips',
    bankDetails: 'bankDetails',
    photo: 'photo',
  };

  // Fetch candidate info using token or onboardingId verification
  useEffect(() => {
    const verifyTokenAndFetchInfo = async () => {
      if (token || onboardingId) {
        setIsLoadingInfo(true);
        setError(null);
        try {
          let response;
          
          if (token) {
            // Use token verification endpoint
            console.log("Verifying token:", token);
            response = await api.get(`/onboard/upload/verify/${token}`);
            console.log("Token verification response:", response.data);
          } else if (onboardingId) {
            // Use onboardingId - try using it as token first, or fetch onboarding details
            console.log("Verifying onboardingId:", onboardingId);
            try {
              // First, try using onboardingId as if it were a token
              response = await api.get(`/onboard/upload/verify/${onboardingId}`);
              console.log("OnboardingId verification response (as token):", response.data);
            } catch (err) {
              // If that fails, try fetching onboarding details directly from /onboard/all and find the matching one
              console.log("Trying to fetch onboarding details for ID:", onboardingId);
              try {
                const allResponse = await api.get(`/onboard/all`);
                if (allResponse.data && allResponse.data.onboardingList) {
                  const foundOnboarding = allResponse.data.onboardingList.find(
                    (onb) => onb._id === onboardingId || onb.id === onboardingId
                  );
                  if (foundOnboarding) {
                    response = {
                      data: {
                        message: "Token verified",
                        onboarding: foundOnboarding
                      }
                    };
                  } else {
                    throw new Error("Onboarding record not found");
                  }
                } else {
                  throw new Error("Failed to fetch onboarding list");
                }
              } catch (fetchErr) {
                console.error("Error fetching onboarding details:", fetchErr);
                throw fetchErr;
              }
            }
          }
          
          if (response && response.data && response.data.onboarding) {
            setCandidateInfo({
              candidateName: response.data.onboarding.candidateName,
              personalEmail: response.data.onboarding.personalEmail,
              jobDetails: response.data.onboarding.jobDetails,
              status: response.data.onboarding.status,
              onboardingId: response.data.onboarding.id || onboardingId,
            });
          } else if (response && response.data && response.data.message === "Token verified" && response.data.onboarding) {
            setCandidateInfo({
              candidateName: response.data.onboarding.candidateName,
              personalEmail: response.data.onboarding.personalEmail,
              jobDetails: response.data.onboarding.jobDetails,
              status: response.data.onboarding.status,
              onboardingId: response.data.onboarding.id || onboardingId,
            });
          }
        } catch (error) {
          console.error("Error verifying token/onboardingId:", error);
          const errorMessage = error.response?.data?.message || error.message || "Invalid or expired token/onboarding ID";
          setError(errorMessage);
          // Don't show alert immediately, let user see the error message on page
          // Still allow document upload even if verification fails (backend will validate)
        } finally {
          setIsLoadingInfo(false);
        }
      } else {
        // If no token or onboardingId, still show the form but with a warning
        setError("No token or onboarding ID provided. Please use the link provided by HR.");
        setIsLoadingInfo(false);
      }
    };

    verifyTokenAndFetchInfo();
  }, [token, onboardingId]);

  const handleDocumentUpload = (docId, file) => {
    if (file) {
      // Validate file size (max 10MB)
      const maxSize = 10 * 1024 * 1024; // 10MB
      if (file.size > maxSize) {
        setErrors({ ...errors, [docId]: "File size must be less than 10MB" });
        return;
      }

      // Validate file type
      const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'image/jpeg', 'image/jpg', 'image/png'];
      if (!allowedTypes.includes(file.type)) {
        setErrors({ ...errors, [docId]: "Invalid file type. Please upload PDF, DOC, DOCX, JPG, or PNG" });
        return;
      }

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
    if (errors[docId]) {
      setErrors({ ...errors, [docId]: null });
    }
  };

  const handleSubmit = async () => {
    const newErrors = {};
    documentTypes.filter(d => d.required).forEach(doc => {
      if (!documents[doc.id]) {
        newErrors[doc.id] = `${doc.label} is required`;
      }
    });

    setErrors(newErrors);
    
    if (Object.keys(newErrors).length === 0) {
      if (!token && !onboardingId) {
        alert("Error: Token or Onboarding ID is required. Please use the link provided by HR.");
        return;
      }

      setIsSubmitting(true);
      setError(null);
      setErrors({});
      try {
        const formData = new FormData();

        // Append all documents with mapped field names
        Object.keys(documents).forEach(docId => {
          const apiFieldName = documentFieldMap[docId] || docId;
          formData.append(apiFieldName, documents[docId]);
          console.log(`Appending document: ${docId} -> ${apiFieldName}:`, documents[docId].name);
        });

        console.log("=== Submitting Documents ===");
        console.log("Token:", token);
        console.log("OnboardingId:", onboardingId);
        console.log("Documents to upload:", Object.keys(documents).map(id => `${id} -> ${documentFieldMap[id] || id}`));

        // Call API to upload documents - use token if available, otherwise use onboardingId
        const identifier = token || onboardingId;
        const endpoint = `/onboard/upload/${identifier}`;
        console.log("Upload endpoint:", endpoint);
        
        const response = await api.post(endpoint, formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });

        console.log("Documents uploaded successfully:", response.data);
        setSubmitSuccess(true);
        setErrors({});
        
      } catch (error) {
        console.error("Error uploading documents:", error);
        console.error("Error response:", error.response);
        const errorMessage = error.response?.data?.message || error.message || "Failed to upload documents. Please try again.";
        setErrors({ submit: errorMessage });
        alert(`Error: ${errorMessage}`);
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  return (
    <div className="min-h-screen p-4 sm:p-6 md:p-8" style={{ 
      backgroundColor: isDark ? '#0f172a' : '#f1f5f9',
      fontFamily: "'Outfit', sans-serif" 
    }}>
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center animate-fade-in-down">
          <h1 className="text-2xl sm:text-3xl font-bold mb-2" style={{ color: textPrimary }}>Document Upload Portal</h1>
          <p className="text-sm sm:text-base" style={{ color: textSecondary }}>
            {candidateInfo 
              ? `Upload documents for ${candidateInfo.candidateName || 'candidate'}`
              : "Upload all required documents for onboarding"
            }
          </p>
          {(token || onboardingId) && (
            <p className="text-xs mt-2" style={{ color: textSecondary }}>
              {onboardingId ? `Onboarding ID: ${onboardingId}` : `Token: ${token?.substring(0, 8)}...`}
            </p>
          )}
        </div>

        {/* Loading Info Message */}
        {isLoadingInfo && (
          <div className="p-6 rounded-xl text-center animate-fade-in-up" style={cardStyle}>
            <span className="text-4xl block mb-2">⏳</span>
            <h2 className="text-xl font-bold mb-2" style={{ color: textPrimary }}>Verifying token...</h2>
            <p style={{ color: textSecondary }}>Please wait while we verify your access</p>
          </div>
        )}

        {/* Error Message */}
        {error && !isLoadingInfo && (
          <div className="p-6 rounded-xl text-center animate-fade-in-up" style={{ 
            backgroundColor: '#fee2e2', 
            border: '2px solid #dc2626' 
          }}>
            <span className="text-4xl block mb-2">❌</span>
            <h2 className="text-xl font-bold mb-2" style={{ color: '#dc2626' }}>Access Denied</h2>
            <p style={{ color: '#991b1b' }}>{error}</p>
            <p className="text-sm mt-2" style={{ color: '#991b1b' }}>Please use the link provided by HR.</p>
          </div>
        )}

        {/* Success Message */}
        {submitSuccess && (
          <div className="p-6 rounded-xl text-center animate-fade-in-up" style={{ 
            backgroundColor: '#dcfce7', 
            border: '2px solid #16a34a' 
          }}>
            <span className="text-4xl block mb-2">✅</span>
            <h2 className="text-xl font-bold mb-2" style={{ color: '#16a34a' }}>Documents Uploaded Successfully!</h2>
            <p style={{ color: '#15803d' }}>Your documents have been received and will be reviewed soon.</p>
            {candidateInfo && (
              <p className="text-sm mt-2" style={{ color: '#15803d' }}>
                Candidate: {candidateInfo.candidateName} ({candidateInfo.personalEmail})
              </p>
            )}
          </div>
        )}

        {/* Documents Section - Show even if there's an error (user can still try to upload) */}
        {!submitSuccess && !isLoadingInfo && (
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
                          <span className="text-xs font-medium text-green-600 truncate max-w-[120px]" title={documents[doc.id].name}>
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
                            <span className="text-xs font-medium text-green-600 truncate max-w-[120px]" title={documents[doc.id].name}>
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
                    {Object.keys(documents).filter(id => documentTypes.find(d => d.id === id)?.required).length} of {documentTypes.filter(d => d.required).length} required documents uploaded
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
                disabled={isSubmitting}
                className="px-8 py-4 rounded-xl font-bold text-white transition-all hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ 
                  background: `linear-gradient(135deg, ${navyBlue} 0%, #2563eb 100%)`,
                  boxShadow: '0 4px 15px rgba(30, 58, 95, 0.4)'
                }}
              >
                {isSubmitting ? (
                  <span className="flex items-center gap-2">
                    <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Uploading...
                  </span>
                ) : (
                  '✅ Submit Documents'
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
