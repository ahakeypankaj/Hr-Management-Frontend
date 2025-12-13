import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTheme } from "../../context/ThemeContext";
import { createOnboarding } from "../../services/onboardingServices";

// Country codes for phone
const countryCodes = [
  { code: "+91", country: "India", flag: "🇮🇳" },
  { code: "+1", country: "USA", flag: "🇺🇸" },
  { code: "+44", country: "UK", flag: "🇬🇧" },
  { code: "+61", country: "Australia", flag: "🇦🇺" },
  { code: "+65", country: "Singapore", flag: "🇸🇬" },
  { code: "+971", country: "UAE", flag: "🇦🇪" },
  { code: "+49", country: "Germany", flag: "🇩🇪" },
  { code: "+33", country: "France", flag: "🇫🇷" },
  { code: "+81", country: "Japan", flag: "🇯🇵" },
  { code: "+86", country: "China", flag: "🇨🇳" },
];

const departments = ["Engineering", "HR", "DevOps", "QA", "Sales", "Product", "Finance", "Marketing", "Operations"];
const jobLevels = ["L1 - Entry", "L2 - Junior", "L3 - Mid", "L4 - Senior", "L5 - Lead", "L6 - Manager", "L7 - Director"];
const jobTypes = ["Full-time", "Part-time", "Contract", "Intern", "Consultant"];
const managers = [
  { id: "MGR001", name: "Ravi Sharma", dept: "HR" },
  { id: "MGR002", name: "Priya Verma", dept: "Engineering" },
  { id: "MGR003", name: "Suresh Reddy", dept: "Finance" },
  { id: "MGR004", name: "Anita Patel", dept: "Marketing" },
  { id: "MGR005", name: "Vikram Singh", dept: "DevOps" },
];

// Document types
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

export default function AddEmployee() {
  const navigate = useNavigate();
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    // Personal Information
    candidateName: "",
    personalEmail: "",
    phoneCode: "",
    phone: "",
    dateOfBirth: "",
    gender: "",
    bloodGroup: "",
    
    // Address
    currentAddress: "",
    permanentAddress: "",
    sameAsCurrentAddress: false,
    
    // Job Details
    jobTitle: "",
    department: "",
    designation: "",
    jobLevel: "L3 - Mid",
    jobType: "Full-time",
    proposedJoiningDate: "",
    workLocation: "",
    
    // Assignment
    managerId: "",
    role: "employee",
    
    // Emergency Contact
    emergencyContactName: "",
    emergencyContactRelation: "",
    emergencyContactPhone: "",
    emergencyPhoneCode: "",
  });

  const [documents, setDocuments] = useState({});
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const navyBlue = '#1e3a5f';
  const cardStyle = {
    backgroundColor: isDark ? '#1e293b' : '#ffffff',
    border: `1px solid ${isDark ? '#334155' : '#e2e8f0'}`,
    borderRadius: '20px',
  };
  const textPrimary = isDark ? '#f8fafc' : '#0f172a';
  const textSecondary = isDark ? '#94a3b8' : '#64748b';
  const defaultBorderColor = isDark ? '#475569' : '#e2e8f0';
  const inputStyle = {
    backgroundColor: isDark ? '#334155' : '#f8fafc',
    border: `1px solid ${defaultBorderColor}`,
    color: textPrimary
  };

  const steps = [
    { id: 1, title: "Personal Info", icon: "👤" },
    { id: 2, title: "Job Details", icon: "💼" },
    { id: 3, title: "Documents", icon: "📁" },
    { id: 4, title: "Review", icon: "✅" },
  ];

  // Validation helpers
  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePhone = (phone) => {
    // Remove spaces and special characters, keep only digits
    const cleanedPhone = phone.replace(/\D/g, '');
    return cleanedPhone.length === 10;
  };

  const validatePhoneCode = (code) => {
    return code && code.trim() !== '';
  };

  const handleInputChange = (field, value) => {
    setFormData({ ...formData, [field]: value });
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors({ ...errors, [field]: null });
    }
    
    // Real-time validation for specific fields
    if (field === 'personalEmail' && value) {
      if (!validateEmail(value)) {
        setErrors({ ...errors, personalEmail: 'Please enter a valid email address' });
      }
    }
    
    if (field === 'phone' && value) {
      if (!validatePhone(value)) {
        setErrors({ ...errors, phone: 'Phone number must be exactly 10 digits' });
      }
    }
    
    if (field === 'emergencyContactPhone' && value) {
      if (!validatePhone(value)) {
        setErrors({ ...errors, emergencyContactPhone: 'Phone number must be exactly 10 digits' });
      }
    }
  };

  const handleDocumentUpload = (docId, file) => {
    setDocuments({ ...documents, [docId]: file });
  };

  const removeDocument = (docId) => {
    const newDocs = { ...documents };
    delete newDocs[docId];
    setDocuments(newDocs);
  };

  const validateStep = (step) => {
    const newErrors = {};
    
    if (step === 1) {
      // Name validation
      if (!formData.candidateName || formData.candidateName.trim() === '') {
        newErrors.candidateName = "Full name is required";
      } else if (formData.candidateName.trim().length < 2) {
        newErrors.candidateName = "Name must be at least 2 characters";
      }
      
      // Email validation
      if (!formData.personalEmail || formData.personalEmail.trim() === '') {
        newErrors.personalEmail = "Email is required";
      } else if (!validateEmail(formData.personalEmail)) {
        newErrors.personalEmail = "Please enter a valid email address";
      }
      
      // Phone code validation
      if (!validatePhoneCode(formData.phoneCode)) {
        newErrors.phoneCode = "Please select a country code";
      }
      
      // Phone number validation
      if (!formData.phone || formData.phone.trim() === '') {
        newErrors.phone = "Phone number is required";
      } else if (!validatePhone(formData.phone)) {
        newErrors.phone = "Phone number must be exactly 10 digits";
      }
      
      // Date of birth validation (optional but if provided, should be valid)
      if (formData.dateOfBirth) {
        const dob = new Date(formData.dateOfBirth);
        const today = new Date();
        if (dob > today) {
          newErrors.dateOfBirth = "Date of birth cannot be in the future";
        }
        const age = today.getFullYear() - dob.getFullYear();
        if (age < 18 || age > 100) {
          newErrors.dateOfBirth = "Age must be between 18 and 100 years";
        }
      }
      
      // Address validation
      if (!formData.currentAddress || formData.currentAddress.trim() === '') {
        newErrors.currentAddress = "Current address is required";
      } else if (formData.currentAddress.trim().length < 10) {
        newErrors.currentAddress = "Please provide a complete address (at least 10 characters)";
      }
      
      if (!formData.sameAsCurrentAddress) {
        if (!formData.permanentAddress || formData.permanentAddress.trim() === '') {
          newErrors.permanentAddress = "Permanent address is required";
        } else if (formData.permanentAddress.trim().length < 10) {
          newErrors.permanentAddress = "Please provide a complete address (at least 10 characters)";
        }
      }
      
      // Emergency contact validation
      if (!formData.emergencyContactName || formData.emergencyContactName.trim() === '') {
        newErrors.emergencyContactName = "Emergency contact name is required";
      }
      
      if (!formData.emergencyContactRelation || formData.emergencyContactRelation.trim() === '') {
        newErrors.emergencyContactRelation = "Relationship is required";
      }
      
      if (!validatePhoneCode(formData.emergencyPhoneCode)) {
        newErrors.emergencyPhoneCode = "Please select a country code";
      }
      
      if (!formData.emergencyContactPhone || formData.emergencyContactPhone.trim() === '') {
        newErrors.emergencyContactPhone = "Emergency contact phone is required";
      } else if (!validatePhone(formData.emergencyContactPhone)) {
        newErrors.emergencyContactPhone = "Phone number must be exactly 10 digits";
      }
      
    } else if (step === 2) {
      // Job title validation
      if (!formData.jobTitle || formData.jobTitle.trim() === '') {
        newErrors.jobTitle = "Job title is required";
      } else if (formData.jobTitle.trim().length < 2) {
        newErrors.jobTitle = "Job title must be at least 2 characters";
      }
      
      // Department validation
      if (!formData.department || formData.department.trim() === '') {
        newErrors.department = "Department is required";
      }
      
      // Designation validation (optional but if provided should be valid)
      if (formData.designation && formData.designation.trim().length < 2) {
        newErrors.designation = "Designation must be at least 2 characters";
      }
      
      // Joining date validation
      if (!formData.proposedJoiningDate) {
        newErrors.proposedJoiningDate = "Joining date is required";
      } else {
        const joiningDate = new Date(formData.proposedJoiningDate);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        if (joiningDate < today) {
          newErrors.proposedJoiningDate = "Joining date cannot be in the past";
        }
      }
      
      // Manager validation
      if (!formData.managerId || formData.managerId.trim() === '') {
        newErrors.managerId = "Reporting manager is required";
      }
      
      // Work location validation (optional but if provided should be valid)
      if (formData.workLocation && formData.workLocation.trim().length < 2) {
        newErrors.workLocation = "Work location must be at least 2 characters";
      }
      
    } else if (step === 3) {
      // Document validation
      documentTypes.filter(d => d.required).forEach(doc => {
        if (!documents[doc.id]) {
          newErrors[doc.id] = `${doc.label} is required`;
        }
      });
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    setCurrentStep(currentStep - 1);
  };

  const handleSubmit = async () => {
    if (validateStep(currentStep)) {
      setIsSubmitting(true);
      try {
        // Split candidateName into firstName and lastName
        const nameParts = formData.candidateName.trim().split(' ');
        const firstName = nameParts[0] || '';
        const lastName = nameParts.slice(1).join(' ') || '';

        // Prepare API payload
        const onboardingPayload = {
          personalInfo: {
            firstName: firstName,
            lastName: lastName,
            email: formData.personalEmail,
            phone: `${formData.phoneCode}${formData.phone}`,
            department: formData.department,
            designation: formData.designation || formData.jobTitle,
            joiningDate: formData.proposedJoiningDate
          },
          bankDetails: {
            accountNumber: "", // Not in form, can be added later
            ifscCode: "" // Not in form, can be added later
          },
          documents: Object.keys(documents).map(docId => ({
            type: docId,
            name: documents[docId]?.name || docId
          })),
          emergencyContact: {
            name: formData.emergencyContactName,
            relationship: formData.emergencyContactRelation,
            phone: `${formData.emergencyPhoneCode}${formData.emergencyContactPhone}`
          }
        };

        // Call API
        const response = await createOnboarding(onboardingPayload);
        
        alert("Employee added successfully!");
        navigate("/hr/users");
      } catch (error) {
        console.error('Error submitting onboarding:', error);
        const errorMessage = error.response?.data?.message || error.message || 'Failed to add employee. Please try again.';
        alert(`Error: ${errorMessage}`);
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const getManagerName = (id) => managers.find(m => m.id === id)?.name || "";

  return (
    <div className="space-y-6" style={{ fontFamily: "'Outfit', sans-serif" }}>
      {/* Header */}
      <div className="animate-fade-in-down">
        <h1 className="text-xl sm:text-2xl font-bold mb-2" style={{ color: textPrimary }}>Add New Employee</h1>
        <p className="text-sm sm:text-base" style={{ color: textSecondary }}>Complete the form to onboard a new team member</p>
      </div>

      {/* Progress Steps */}
      <div className="p-4 sm:p-6 animate-fade-in-up" style={cardStyle}>
        <div className="flex items-center justify-between">
          {steps.map((step, index) => (
            <React.Fragment key={step.id}>
              <div className="flex flex-col items-center">
                <div
                  className="w-10 h-10 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl flex items-center justify-center text-lg sm:text-2xl font-bold transition-all"
                  style={{
                    backgroundColor: currentStep >= step.id ? navyBlue : (isDark ? '#334155' : '#f1f5f9'),
                    color: currentStep >= step.id ? '#ffffff' : textSecondary,
                    boxShadow: currentStep === step.id ? `0 4px 15px ${navyBlue}40` : 'none'
                  }}
                >
                  {currentStep > step.id ? "✓" : step.icon}
                </div>
                <p className="mt-1 sm:mt-2 text-[10px] sm:text-sm font-semibold text-center" style={{ color: currentStep >= step.id ? navyBlue : textSecondary }}>
                  {step.title}
                </p>
              </div>
              {index < steps.length - 1 && (
                <div 
                  className="flex-1 h-1 mx-1 sm:mx-4 rounded-full"
                  style={{ backgroundColor: currentStep > step.id ? navyBlue : (isDark ? '#334155' : '#e2e8f0') }}
                />
              )}
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* Form Content */}
      <div className="p-4 sm:p-8 animate-fade-in-up" style={cardStyle}>
        {/* Step 1: Personal Information */}
        {currentStep === 1 && (
          <div className="space-y-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center text-xl" style={{ backgroundColor: `${navyBlue}15` }}>
                👤
              </div>
              <div>
                <h2 className="text-xl font-bold" style={{ color: textPrimary }}>Personal Information</h2>
                <p className="text-sm" style={{ color: textSecondary }}>Basic details about the employee</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold mb-2" style={{ color: textPrimary }}>
                  Full Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.candidateName}
                  onChange={(e) => handleInputChange("candidateName", e.target.value)}
                  className="w-full px-4 py-4 rounded-xl outline-none transition-all focus:ring-2 focus:ring-blue-400"
                  style={inputStyle}
                  placeholder="Enter full name"
                />
                {errors.candidateName && <p className="text-red-500 text-xs mt-1">{errors.candidateName}</p>}
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2" style={{ color: textPrimary }}>
                  Personal Email <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  value={formData.personalEmail}
                  onChange={(e) => handleInputChange("personalEmail", e.target.value)}
                  className="w-full px-4 py-4 rounded-xl outline-none transition-all focus:ring-2 focus:ring-blue-400"
                  style={inputStyle}
                  placeholder="personal@email.com"
                />
                {errors.personalEmail && <p className="text-red-500 text-xs mt-1">{errors.personalEmail}</p>}
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2" style={{ color: textPrimary }}>
                  Phone Number <span className="text-red-500">*</span>
                </label>
                <div className="flex gap-2">
                  <select
                    value={formData.phoneCode}
                    onChange={(e) => handleInputChange("phoneCode", e.target.value)}
                    className="px-3 py-4 rounded-xl outline-none transition-all"
                    style={{
                      ...inputStyle,
                      borderColor: errors.phoneCode ? '#dc2626' : defaultBorderColor
                    }}
                  >
                    <option value="">Select Code</option>
                    {countryCodes.map((c) => (
                      <option key={c.code} value={c.code}>{c.flag} {c.code}</option>
                    ))}
                  </select>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => {
                      // Only allow digits and limit to 10 digits
                      const value = e.target.value.replace(/\D/g, '').slice(0, 10);
                      handleInputChange("phone", value);
                    }}
                    onKeyPress={(e) => {
                      // Only allow digits
                      if (!/[0-9]/.test(e.key) && e.key !== 'Backspace' && e.key !== 'Delete' && e.key !== 'Tab') {
                        e.preventDefault();
                      }
                    }}
                    maxLength={10}
                    pattern="[0-9]{10}"
                    inputMode="numeric"
                    className="flex-1 px-4 py-4 rounded-xl outline-none transition-all focus:ring-2 focus:ring-blue-400"
                    style={{
                      ...inputStyle,
                      borderColor: errors.phone ? '#dc2626' : inputStyle.border.split(' ')[2]
                    }}
                    placeholder="9876543210"
                  />
                </div>
                {errors.phoneCode && <p className="text-red-500 text-xs mt-1">{errors.phoneCode}</p>}
                {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
                {!errors.phone && formData.phone && (
                  <p className="text-xs mt-1" style={{ color: textSecondary }}>
                    {formData.phone.length}/10 digits
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2" style={{ color: textPrimary }}>Date of Birth</label>
                <input
                  type="date"
                  value={formData.dateOfBirth}
                  onChange={(e) => handleInputChange("dateOfBirth", e.target.value)}
                  className="w-full px-4 py-4 rounded-xl outline-none transition-all"
                  style={{
                    ...inputStyle,
                    borderColor: errors.dateOfBirth ? '#dc2626' : defaultBorderColor
                  }}
                />
                {errors.dateOfBirth && <p className="text-red-500 text-xs mt-1">{errors.dateOfBirth}</p>}
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2" style={{ color: textPrimary }}>Gender</label>
                <select
                  value={formData.gender}
                  onChange={(e) => handleInputChange("gender", e.target.value)}
                  className="w-full px-4 py-4 rounded-xl outline-none"
                  style={inputStyle}
                >
                  <option value="">Select Gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                  <option value="prefer_not">Prefer not to say</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2" style={{ color: textPrimary }}>Blood Group</label>
                <select
                  value={formData.bloodGroup}
                  onChange={(e) => handleInputChange("bloodGroup", e.target.value)}
                  className="w-full px-4 py-4 rounded-xl outline-none"
                  style={inputStyle}
                >
                  <option value="">Select Blood Group</option>
                  {["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"].map(bg => (
                    <option key={bg} value={bg}>{bg}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Address Section */}
            <div className="pt-6 mt-6" style={{ borderTop: `1px solid ${isDark ? '#334155' : '#e2e8f0'}` }}>
              <h3 className="text-lg font-bold mb-4" style={{ color: textPrimary }}>📍 Address Details</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold mb-2" style={{ color: textPrimary }}>
                    Current Address <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    value={formData.currentAddress}
                    onChange={(e) => handleInputChange("currentAddress", e.target.value)}
                    rows={3}
                    className="w-full px-4 py-4 rounded-xl outline-none resize-none transition-all focus:ring-2 focus:ring-blue-400"
                    style={{
                      ...inputStyle,
                      borderColor: errors.currentAddress ? '#dc2626' : defaultBorderColor
                    }}
                    placeholder="Enter current address..."
                  />
                  {errors.currentAddress && <p className="text-red-500 text-xs mt-1">{errors.currentAddress}</p>}
                </div>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.sameAsCurrentAddress}
                    onChange={(e) => handleInputChange("sameAsCurrentAddress", e.target.checked)}
                    className="w-5 h-5 rounded"
                  />
                  <span className="text-sm" style={{ color: textPrimary }}>Permanent address same as current address</span>
                </label>

                {!formData.sameAsCurrentAddress && (
                  <div>
                    <label className="block text-sm font-semibold mb-2" style={{ color: textPrimary }}>
                      Permanent Address <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      value={formData.permanentAddress}
                      onChange={(e) => handleInputChange("permanentAddress", e.target.value)}
                      rows={3}
                      className="w-full px-4 py-4 rounded-xl outline-none resize-none transition-all focus:ring-2 focus:ring-blue-400"
                      style={{
                        ...inputStyle,
                        borderColor: errors.permanentAddress ? '#dc2626' : defaultBorderColor
                      }}
                      placeholder="Enter permanent address..."
                    />
                    {errors.permanentAddress && <p className="text-red-500 text-xs mt-1">{errors.permanentAddress}</p>}
                  </div>
                )}
              </div>
            </div>

            {/* Emergency Contact */}
            <div className="pt-6 mt-6" style={{ borderTop: `1px solid ${isDark ? '#334155' : '#e2e8f0'}` }}>
              <h3 className="text-lg font-bold mb-4" style={{ color: textPrimary }}>🚨 Emergency Contact</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-semibold mb-2" style={{ color: textPrimary }}>
                    Contact Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.emergencyContactName}
                    onChange={(e) => handleInputChange("emergencyContactName", e.target.value)}
                    className="w-full px-4 py-4 rounded-xl outline-none transition-all focus:ring-2 focus:ring-blue-400"
                    style={{
                      ...inputStyle,
                      borderColor: errors.emergencyContactName ? '#dc2626' : defaultBorderColor
                    }}
                    placeholder="Full name"
                  />
                  {errors.emergencyContactName && <p className="text-red-500 text-xs mt-1">{errors.emergencyContactName}</p>}
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2" style={{ color: textPrimary }}>
                    Relationship <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.emergencyContactRelation}
                    onChange={(e) => handleInputChange("emergencyContactRelation", e.target.value)}
                    className="w-full px-4 py-4 rounded-xl outline-none transition-all"
                    style={{
                      ...inputStyle,
                      borderColor: errors.emergencyContactRelation ? '#dc2626' : defaultBorderColor
                    }}
                  >
                    <option value="">Select Relation</option>
                    {["Spouse", "Parent", "Sibling", "Friend", "Other"].map(r => (
                      <option key={r} value={r}>{r}</option>
                    ))}
                  </select>
                  {errors.emergencyContactRelation && <p className="text-red-500 text-xs mt-1">{errors.emergencyContactRelation}</p>}
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2" style={{ color: textPrimary }}>
                    Phone Number <span className="text-red-500">*</span>
                  </label>
                  <div className="flex gap-2">
                    <select
                      value={formData.emergencyPhoneCode}
                      onChange={(e) => handleInputChange("emergencyPhoneCode", e.target.value)}
                      className="px-2 py-4 rounded-xl outline-none text-sm transition-all"
                      style={{
                        ...inputStyle,
                        borderColor: errors.emergencyPhoneCode ? '#dc2626' : inputStyle.border.split(' ')[2]
                      }}
                    >
                      <option value="">Code</option>
                      {countryCodes.map((c) => (
                        <option key={c.code} value={c.code}>{c.flag} {c.code}</option>
                      ))}
                    </select>
                    <input
                      type="tel"
                      value={formData.emergencyContactPhone}
                      onChange={(e) => {
                        // Only allow digits and limit to 10 digits
                        const value = e.target.value.replace(/\D/g, '').slice(0, 10);
                        handleInputChange("emergencyContactPhone", value);
                      }}
                      onKeyPress={(e) => {
                        // Only allow digits
                        if (!/[0-9]/.test(e.key) && e.key !== 'Backspace' && e.key !== 'Delete' && e.key !== 'Tab') {
                          e.preventDefault();
                        }
                      }}
                      maxLength={10}
                      pattern="[0-9]{10}"
                      inputMode="numeric"
                      className="flex-1 px-4 py-4 rounded-xl outline-none transition-all focus:ring-2 focus:ring-blue-400"
                      style={{
                        ...inputStyle,
                        borderColor: errors.emergencyContactPhone ? '#dc2626' : defaultBorderColor
                      }}
                      placeholder="9876543210"
                    />
                  </div>
                  {errors.emergencyPhoneCode && <p className="text-red-500 text-xs mt-1">{errors.emergencyPhoneCode}</p>}
                  {errors.emergencyContactPhone && <p className="text-red-500 text-xs mt-1">{errors.emergencyContactPhone}</p>}
                  {!errors.emergencyContactPhone && formData.emergencyContactPhone && (
                    <p className="text-xs mt-1" style={{ color: textSecondary }}>
                      {formData.emergencyContactPhone.length}/10 digits
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Job Details */}
        {currentStep === 2 && (
          <div className="space-y-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center text-xl" style={{ backgroundColor: `${navyBlue}15` }}>
                💼
              </div>
              <div>
                <h2 className="text-xl font-bold" style={{ color: textPrimary }}>Job Details</h2>
                <p className="text-sm" style={{ color: textSecondary }}>Position and employment information</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold mb-2" style={{ color: textPrimary }}>
                  Job Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.jobTitle}
                  onChange={(e) => handleInputChange("jobTitle", e.target.value)}
                  className="w-full px-4 py-4 rounded-xl outline-none transition-all focus:ring-2 focus:ring-blue-400"
                  style={{
                    ...inputStyle,
                    borderColor: errors.jobTitle ? '#dc2626' : defaultBorderColor
                  }}
                  placeholder="e.g., Software Engineer"
                />
                {errors.jobTitle && <p className="text-red-500 text-xs mt-1">{errors.jobTitle}</p>}
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2" style={{ color: textPrimary }}>
                  Department <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.department}
                  onChange={(e) => handleInputChange("department", e.target.value)}
                  className="w-full px-4 py-4 rounded-xl outline-none transition-all"
                  style={{
                    ...inputStyle,
                    borderColor: errors.department ? '#dc2626' : defaultBorderColor
                  }}
                >
                  <option value="">Select Department</option>
                  {departments.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
                {errors.department && <p className="text-red-500 text-xs mt-1">{errors.department}</p>}
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2" style={{ color: textPrimary }}>Designation</label>
                <input
                  type="text"
                  value={formData.designation}
                  onChange={(e) => handleInputChange("designation", e.target.value)}
                  className="w-full px-4 py-4 rounded-xl outline-none transition-all focus:ring-2 focus:ring-blue-400"
                  style={{
                    ...inputStyle,
                    borderColor: errors.designation ? '#dc2626' : defaultBorderColor
                  }}
                  placeholder="e.g., Senior Developer"
                />
                {errors.designation && <p className="text-red-500 text-xs mt-1">{errors.designation}</p>}
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2" style={{ color: textPrimary }}>Job Level</label>
                <select
                  value={formData.jobLevel}
                  onChange={(e) => handleInputChange("jobLevel", e.target.value)}
                  className="w-full px-4 py-4 rounded-xl outline-none"
                  style={inputStyle}
                >
                  {jobLevels.map(l => <option key={l} value={l}>{l}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2" style={{ color: textPrimary }}>Job Type</label>
                <select
                  value={formData.jobType}
                  onChange={(e) => handleInputChange("jobType", e.target.value)}
                  className="w-full px-4 py-4 rounded-xl outline-none"
                  style={inputStyle}
                >
                  {jobTypes.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2" style={{ color: textPrimary }}>
                  Proposed Joining Date <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  value={formData.proposedJoiningDate}
                  onChange={(e) => handleInputChange("proposedJoiningDate", e.target.value)}
                  className="w-full px-4 py-4 rounded-xl outline-none transition-all"
                  style={{
                    ...inputStyle,
                    borderColor: errors.proposedJoiningDate ? '#dc2626' : defaultBorderColor
                  }}
                />
                {errors.proposedJoiningDate && <p className="text-red-500 text-xs mt-1">{errors.proposedJoiningDate}</p>}
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2" style={{ color: textPrimary }}>Work Location</label>
                <input
                  type="text"
                  value={formData.workLocation}
                  onChange={(e) => handleInputChange("workLocation", e.target.value)}
                  className="w-full px-4 py-4 rounded-xl outline-none transition-all focus:ring-2 focus:ring-blue-400"
                  style={{
                    ...inputStyle,
                    borderColor: errors.workLocation ? '#dc2626' : defaultBorderColor
                  }}
                  placeholder="e.g., Bangalore Office"
                />
                {errors.workLocation && <p className="text-red-500 text-xs mt-1">{errors.workLocation}</p>}
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2" style={{ color: textPrimary }}>
                  Reporting Manager <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.managerId}
                  onChange={(e) => handleInputChange("managerId", e.target.value)}
                  className="w-full px-4 py-4 rounded-xl outline-none transition-all"
                  style={{
                    ...inputStyle,
                    borderColor: errors.managerId ? '#dc2626' : defaultBorderColor
                  }}
                >
                  <option value="">Select Manager</option>
                  {managers.map(m => <option key={m.id} value={m.id}>{m.name} ({m.dept})</option>)}
                </select>
                {errors.managerId && <p className="text-red-500 text-xs mt-1">{errors.managerId}</p>}
              </div>
            </div>

            {/* Role Selection */}
            <div className="pt-6 mt-6" style={{ borderTop: `1px solid ${isDark ? '#334155' : '#e2e8f0'}` }}>
              <h3 className="text-lg font-bold mb-4" style={{ color: textPrimary }}>🔐 System Role</h3>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { id: "employee", label: "Employee", desc: "Standard employee access", icon: "👤" },
                  { id: "hr_manager", label: "HR/Manager", desc: "HR and team management access", icon: "👔" },
                ].map(role => (
                  <div
                    key={role.id}
                    onClick={() => handleInputChange("role", role.id)}
                    className="p-5 rounded-xl cursor-pointer transition-all hover:scale-[1.02]"
                    style={{
                      backgroundColor: formData.role === role.id ? `${navyBlue}15` : (isDark ? '#334155' : '#f8fafc'),
                      border: `2px solid ${formData.role === role.id ? navyBlue : 'transparent'}`,
                    }}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-3xl">{role.icon}</span>
                      <div>
                        <p className="font-bold" style={{ color: textPrimary }}>{role.label}</p>
                        <p className="text-sm" style={{ color: textSecondary }}>{role.desc}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Documents */}
        {currentStep === 3 && (
          <div className="space-y-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center text-xl" style={{ backgroundColor: `${navyBlue}15` }}>
                📁
              </div>
              <div>
                <h2 className="text-xl font-bold" style={{ color: textPrimary }}>Documents Upload</h2>
                <p className="text-sm" style={{ color: textSecondary }}>Upload required documents for onboarding</p>
              </div>
            </div>

            {/* Required Documents */}
            <div>
              <h3 className="text-sm font-bold uppercase mb-4" style={{ color: navyBlue }}>📌 Required Documents</h3>
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
            </div>

            {/* Optional Documents */}
            <div className="pt-6 mt-6" style={{ borderTop: `1px solid ${isDark ? '#334155' : '#e2e8f0'}` }}>
              <h3 className="text-sm font-bold uppercase mb-4" style={{ color: textSecondary }}>📎 Optional Documents</h3>
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
            <div className="p-4 rounded-xl" style={{ backgroundColor: isDark ? '#334155' : '#f8fafc' }}>
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
          </div>
        )}

        {/* Step 4: Review */}
        {currentStep === 4 && (
          <div className="space-y-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center text-xl" style={{ backgroundColor: `${navyBlue}15` }}>
                ✅
              </div>
              <div>
                <h2 className="text-xl font-bold" style={{ color: textPrimary }}>Review & Submit</h2>
                <p className="text-sm" style={{ color: textSecondary }}>Review all information before submitting</p>
              </div>
            </div>

            {/* Personal Info Summary */}
            <div className="p-6 rounded-xl" style={{ backgroundColor: isDark ? '#334155' : '#f8fafc' }}>
              <h3 className="text-sm font-bold uppercase mb-4 flex items-center gap-2" style={{ color: navyBlue }}>
                👤 Personal Information
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                <div>
                  <p style={{ color: textSecondary }}>Full Name</p>
                  <p className="font-semibold" style={{ color: textPrimary }}>{formData.candidateName || "-"}</p>
                </div>
                <div>
                  <p style={{ color: textSecondary }}>Email</p>
                  <p className="font-semibold" style={{ color: textPrimary }}>{formData.personalEmail || "-"}</p>
                </div>
                <div>
                  <p style={{ color: textSecondary }}>Phone</p>
                  <p className="font-semibold" style={{ color: textPrimary }}>{formData.phoneCode} {formData.phone || "-"}</p>
                </div>
                <div>
                  <p style={{ color: textSecondary }}>Date of Birth</p>
                  <p className="font-semibold" style={{ color: textPrimary }}>{formData.dateOfBirth || "-"}</p>
                </div>
                <div>
                  <p style={{ color: textSecondary }}>Gender</p>
                  <p className="font-semibold capitalize" style={{ color: textPrimary }}>{formData.gender || "-"}</p>
                </div>
                <div>
                  <p style={{ color: textSecondary }}>Blood Group</p>
                  <p className="font-semibold" style={{ color: textPrimary }}>{formData.bloodGroup || "-"}</p>
                </div>
              </div>
            </div>

            {/* Job Details Summary */}
            <div className="p-6 rounded-xl" style={{ backgroundColor: isDark ? '#334155' : '#f8fafc' }}>
              <h3 className="text-sm font-bold uppercase mb-4 flex items-center gap-2" style={{ color: navyBlue }}>
                💼 Job Details
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                <div>
                  <p style={{ color: textSecondary }}>Job Title</p>
                  <p className="font-semibold" style={{ color: textPrimary }}>{formData.jobTitle || "-"}</p>
                </div>
                <div>
                  <p style={{ color: textSecondary }}>Department</p>
                  <p className="font-semibold" style={{ color: textPrimary }}>{formData.department || "-"}</p>
                </div>
                <div>
                  <p style={{ color: textSecondary }}>Designation</p>
                  <p className="font-semibold" style={{ color: textPrimary }}>{formData.designation || "-"}</p>
                </div>
                <div>
                  <p style={{ color: textSecondary }}>Job Level</p>
                  <p className="font-semibold" style={{ color: textPrimary }}>{formData.jobLevel}</p>
                </div>
                <div>
                  <p style={{ color: textSecondary }}>Job Type</p>
                  <p className="font-semibold" style={{ color: textPrimary }}>{formData.jobType}</p>
                </div>
                <div>
                  <p style={{ color: textSecondary }}>Joining Date</p>
                  <p className="font-semibold" style={{ color: textPrimary }}>{formData.proposedJoiningDate || "-"}</p>
                </div>
                <div>
                  <p style={{ color: textSecondary }}>Manager</p>
                  <p className="font-semibold" style={{ color: textPrimary }}>{getManagerName(formData.managerId) || "-"}</p>
                </div>
                <div>
                  <p style={{ color: textSecondary }}>System Role</p>
                  <p className="font-semibold capitalize" style={{ color: textPrimary }}>{formData.role.replace("_", " ")}</p>
                </div>
              </div>
            </div>

            {/* Documents Summary */}
            <div className="p-6 rounded-xl" style={{ backgroundColor: isDark ? '#334155' : '#f8fafc' }}>
              <h3 className="text-sm font-bold uppercase mb-4 flex items-center gap-2" style={{ color: navyBlue }}>
                📁 Documents ({Object.keys(documents).length} uploaded)
              </h3>
              <div className="flex flex-wrap gap-2">
                {Object.keys(documents).map(docId => {
                  const doc = documentTypes.find(d => d.id === docId);
                  return (
                    <span
                      key={docId}
                      className="px-3 py-2 rounded-lg text-sm font-medium flex items-center gap-2"
                      style={{ backgroundColor: '#dcfce7', color: '#16a34a' }}
                    >
                      {doc?.icon} {doc?.label} ✓
                    </span>
                  );
                })}
                {Object.keys(documents).length === 0 && (
                  <p style={{ color: textSecondary }}>No documents uploaded</p>
                )}
              </div>
            </div>

            {/* Confirmation */}
            <div className="p-5 rounded-xl flex items-center gap-4" style={{ backgroundColor: '#dbeafe', border: '1px solid #93c5fd' }}>
              <span className="text-3xl">ℹ️</span>
              <div>
                <p className="font-semibold" style={{ color: '#1e40af' }}>Ready to Submit</p>
                <p className="text-sm" style={{ color: '#3b82f6' }}>
                  Please review all information carefully. Once submitted, the employee will be added to the system.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="flex gap-4 pt-8 mt-8" style={{ borderTop: `1px solid ${isDark ? '#334155' : '#e2e8f0'}` }}>
          {currentStep > 1 && (
            <button
              onClick={handlePrevious}
              className="px-8 py-4 rounded-xl font-semibold transition-all hover:opacity-80"
              style={{ backgroundColor: isDark ? '#334155' : '#f1f5f9', color: textPrimary }}
            >
              ← Previous
            </button>
          )}
          <div className="flex-1" />
          {currentStep < 4 ? (
            <button
              onClick={handleNext}
              className="px-8 py-4 rounded-xl font-bold text-white transition-all hover:opacity-90"
              style={{ 
                background: `linear-gradient(135deg, ${navyBlue} 0%, #2563eb 100%)`,
                boxShadow: '0 4px 15px rgba(30, 58, 95, 0.4)'
              }}
            >
              Next Step →
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="px-8 py-4 rounded-xl font-bold text-white transition-all hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ 
                background: 'linear-gradient(135deg, #16a34a 0%, #22c55e 100%)',
                boxShadow: '0 4px 15px rgba(22, 163, 74, 0.4)'
              }}
            >
              {isSubmitting ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Submitting...
                </span>
              ) : (
                '✅ Submit & Add Employee'
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
