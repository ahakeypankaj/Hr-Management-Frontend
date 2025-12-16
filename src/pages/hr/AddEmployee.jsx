import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTheme } from "../../context/ThemeContext";
import { createOnboardingEmployee } from "../../services/onboardingServices";

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

const departments = ["Engineering", "HR", "DevOps", "QA", "Sales", "Product", "Finance", "Marketing", "Operations", "IT"];
const jobLevels = ["Junior", "Mid", "Senior", "Lead", "Manager", "Director"];
const jobTypes = ["Full-Time", "Part-Time", "Contract", "Intern", "Consultant"];

const states = [
  "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh",
  "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand",
  "Karnataka", "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur",
  "Meghalaya", "Mizoram", "Nagaland", "Odisha", "Punjab",
  "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana", "Tripura",
  "Uttar Pradesh", "Uttarakhand", "West Bengal", "Delhi", "Puducherry"
];
const managers = [
  { id: "MGR001", name: "Ravi Sharma", dept: "HR" },
  { id: "MGR002", name: "Priya Verma", dept: "Engineering" },
  { id: "MGR003", name: "Suresh Reddy", dept: "Finance" },
  { id: "MGR004", name: "Anita Patel", dept: "Marketing" },
  { id: "MGR005", name: "Vikram Singh", dept: "DevOps" },
];

// Document types

export default function AddEmployee() {
  const navigate = useNavigate();
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    // Personal Information (Top level)
    candidateName: "",
    personalEmail: "",
    phone: "",
    
    // Address Info (simplified)
    currentAddressLine1: "",
    currentCity: "",
    currentState: "",
    currentPincode: "",
    isPermanentSameAsCurrent: true,
    
    // Job Details
    jobTitle: "",
    department: "",
    designation: "",
    jobLevel: "Junior",
    jobType: "Full-Time",
    proposedJoiningDate: "",
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
    { id: 1, title: "Personal & Address", icon: "👤" },
    { id: 2, title: "Job Details", icon: "💼" },
    { id: 3, title: "Review", icon: "✅" },
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
      
      // Phone number validation
      if (!formData.phone || formData.phone.trim() === '') {
        newErrors.phone = "Phone number is required";
      } else if (!validatePhone(formData.phone)) {
        newErrors.phone = "Phone number must be exactly 10 digits";
      }
      
      // Current Address validation (simplified)
      if (!formData.currentAddressLine1 || formData.currentAddressLine1.trim() === '') {
        newErrors.currentAddressLine1 = "Address is required";
      }
      if (!formData.currentCity || formData.currentCity.trim() === '') {
        newErrors.currentCity = "City is required";
      }
      if (!formData.currentState || formData.currentState.trim() === '') {
        newErrors.currentState = "State is required";
      }
      if (!formData.currentPincode || formData.currentPincode.trim() === '') {
        newErrors.currentPincode = "Pincode is required";
      } else if (!/^\d{6}$/.test(formData.currentPincode.trim())) {
        newErrors.currentPincode = "Pincode must be 6 digits";
      }
      
    } else if (step === 2) {
      // Job Details validation
      if (!formData.jobTitle || formData.jobTitle.trim() === '') {
        newErrors.jobTitle = "Job title is required";
      }
      if (!formData.department || formData.department.trim() === '') {
        newErrors.department = "Department is required";
      }
      if (!formData.designation || formData.designation.trim() === '') {
        newErrors.designation = "Designation is required";
      }
      if (!formData.proposedJoiningDate || formData.proposedJoiningDate.trim() === '') {
        newErrors.proposedJoiningDate = "Proposed joining date is required";
      }
      // Resume validation in job details
      if (!documents.resume) {
        newErrors.resume = "Resume is required";
      }
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
        // Prepare FormData for file uploads
        const formDataToSend = new FormData();
        
        // Basic fields
        formDataToSend.append('candidateName', formData.candidateName.trim());
        formDataToSend.append('personalEmail', formData.personalEmail.trim());
        formDataToSend.append('phone', formData.phone.trim());

        // Job Details as JSON string
        const jobDetailsObj = {
          jobTitle: formData.jobTitle.trim(),
          department: formData.department.trim(),
          designation: formData.designation.trim(),
          jobLevel: formData.jobLevel,
          jobType: formData.jobType,
          proposedJoiningDate: formData.proposedJoiningDate
        };
        formDataToSend.append('jobDetails', JSON.stringify(jobDetailsObj));

        // Address Info as JSON string
        const addressInfoObj = {
          currentAddress: {
            addressLine1: formData.currentAddressLine1.trim(),
            city: formData.currentCity.trim(),
            state: formData.currentState.trim(),
            pincode: formData.currentPincode.trim()
          },
          isPermanentSameAsCurrent: formData.isPermanentSameAsCurrent
        };
        formDataToSend.append('addressInfo', JSON.stringify(addressInfoObj));

        // Resume file
        if (documents.resume) {
          formDataToSend.append('resume', documents.resume);
        }

        // Log FormData contents for debugging
        console.log("=== FormData Contents ===");
        console.log("candidateName:", formData.candidateName);
        console.log("personalEmail:", formData.personalEmail);
        console.log("phone:", formData.phone);
        console.log("jobDetails:", JSON.stringify(jobDetailsObj));
        console.log("addressInfo:", JSON.stringify(addressInfoObj));
        console.log("resume:", documents.resume ? documents.resume.name : "No resume");
        
        // Log all FormData entries
        console.log("=== FormData Entries ===");
        for (let pair of formDataToSend.entries()) {
          if (pair[1] instanceof File) {
            console.log(pair[0] + ":", `File - ${pair[1].name} (${pair[1].size} bytes)`);
          } else {
            console.log(pair[0] + ":", pair[1]);
          }
        }
        
        // Call API using service
        console.log("=== Calling API ===");
        await createOnboardingEmployee(formDataToSend);
        console.log("=== API Call Successful ===");
        
        alert("Employee added successfully!");
        navigate("/hr/users");
      } catch (error) {
        console.error('=== Error in handleSubmit ===');
        console.error('Full error object:', error);
        console.error('Error response:', error.response);
        console.error('Error response data:', error.response?.data);
        console.error('Error response status:', error.response?.status);
        console.error('Error message:', error.message);
        
        const errorMessage = error.response?.data?.message || error.response?.data?.error || error.message || 'Failed to add employee. Please try again.';
        alert(`Error: ${errorMessage}`);
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  return (
    <div className="space-y-6" style={{ fontFamily: "'Outfit', sans-serif" }}>
      {/* Header */}
      <div className="animate-fade-in-down">
        <h1 className="text-xl sm:text-2xl font-bold mb-2" style={{ color: textPrimary }}>Add Onboarding Employee</h1>
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
        <>
        {/* Step 1: Personal Information */}
        {currentStep === 1 && (
          <div className="space-y-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center text-xl" style={{ backgroundColor: `${navyBlue}15` }}>
                👤
              </div>
              <div>
                <h2 className="text-xl font-bold" style={{ color: textPrimary }}>Personal Information</h2>
                <p className="text-sm" style={{ color: textSecondary }}>Basic details about the employee</p>
              </div>
            </div>

            {/* Personal Details Section */}
            <div className="p-6 rounded-xl border-2" style={{ 
              backgroundColor: isDark ? '#1e293b' : '#ffffff',
              borderColor: isDark ? '#334155' : '#e2e8f0'
            }}>
              <h3 className="text-lg font-bold mb-6 flex items-center gap-2" style={{ color: textPrimary }}>
                <span>👤</span> Personal Details
              </h3>
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
                  className="w-full px-4 py-4 rounded-xl outline-none transition-all focus:ring-2 focus:ring-blue-400"
                  style={{
                    ...inputStyle,
                    borderColor: errors.phone ? '#dc2626' : defaultBorderColor
                  }}
                  placeholder="9876543210"
                />
                {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
                {!errors.phone && formData.phone && (
                  <p className="text-xs mt-1" style={{ color: textSecondary }}>
                    {formData.phone.length}/10 digits
                  </p>
                )}
              </div>
              </div>
            </div>

            {/* Address Section */}
            <div className="p-6 rounded-xl border-2" style={{ 
              backgroundColor: isDark ? '#1e293b' : '#ffffff',
              borderColor: isDark ? '#334155' : '#e2e8f0'
            }}>
              <h3 className="text-lg font-bold mb-6 flex items-center gap-2" style={{ color: textPrimary }}>
                <span>📍</span> Current Address
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold mb-2" style={{ color: textPrimary }}>
                    Address <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.currentAddressLine1}
                    onChange={(e) => handleInputChange("currentAddressLine1", e.target.value)}
                    className="w-full px-4 py-4 rounded-xl outline-none transition-all focus:ring-2 focus:ring-blue-400"
                    style={{
                      ...inputStyle,
                      borderColor: errors.currentAddressLine1 ? '#dc2626' : defaultBorderColor
                    }}
                    placeholder="Street, Building, Apartment"
                  />
                  {errors.currentAddressLine1 && <p className="text-red-500 text-xs mt-1">{errors.currentAddressLine1}</p>}
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2" style={{ color: textPrimary }}>
                    City <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.currentCity}
                    onChange={(e) => handleInputChange("currentCity", e.target.value)}
                    className="w-full px-4 py-4 rounded-xl outline-none transition-all focus:ring-2 focus:ring-blue-400"
                    style={{
                      ...inputStyle,
                      borderColor: errors.currentCity ? '#dc2626' : defaultBorderColor
                    }}
                    placeholder="City"
                  />
                  {errors.currentCity && <p className="text-red-500 text-xs mt-1">{errors.currentCity}</p>}
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2" style={{ color: textPrimary }}>
                    State <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.currentState}
                    onChange={(e) => handleInputChange("currentState", e.target.value)}
                    className="w-full px-4 py-4 rounded-xl outline-none transition-all"
                    style={{
                      ...inputStyle,
                      borderColor: errors.currentState ? '#dc2626' : defaultBorderColor
                    }}
                  >
                    <option value="">Select State</option>
                    {states.map(state => (
                      <option key={state} value={state}>{state}</option>
                    ))}
                  </select>
                  {errors.currentState && <p className="text-red-500 text-xs mt-1">{errors.currentState}</p>}
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2" style={{ color: textPrimary }}>
                    Pincode <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.currentPincode}
                    onChange={(e) => {
                      const value = e.target.value.replace(/\D/g, '').slice(0, 6);
                      handleInputChange("currentPincode", value);
                    }}
                    maxLength={6}
                    className="w-full px-4 py-4 rounded-xl outline-none transition-all focus:ring-2 focus:ring-blue-400"
                    style={{
                      ...inputStyle,
                      borderColor: errors.currentPincode ? '#dc2626' : defaultBorderColor
                    }}
                    placeholder="123456"
                  />
                  {errors.currentPincode && <p className="text-red-500 text-xs mt-1">{errors.currentPincode}</p>}
                </div>

                <div className="md:col-span-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.isPermanentSameAsCurrent}
                      onChange={(e) => handleInputChange("isPermanentSameAsCurrent", e.target.checked)}
                      className="w-5 h-5 rounded"
                    />
                    <span className="text-sm font-semibold" style={{ color: textPrimary }}>Permanent address same as current address</span>
                  </label>
                </div>
              </div>

            </div>

          </div>
        )}

        {/* Step 2: Job Details */}
        {currentStep === 2 && (
          <div className="space-y-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center text-xl" style={{ backgroundColor: `${navyBlue}15` }}>
                💼
              </div>
              <div>
                <h2 className="text-xl font-bold" style={{ color: textPrimary }}>Job Details</h2>
                <p className="text-sm" style={{ color: textSecondary }}>Position and employment information</p>
              </div>
            </div>

            {/* Job Details Section */}
            <div className="p-6 rounded-xl border-2" style={{ 
              backgroundColor: isDark ? '#1e293b' : '#ffffff',
              borderColor: isDark ? '#334155' : '#e2e8f0'
            }}>
              <h3 className="text-lg font-bold mb-6 flex items-center gap-2" style={{ color: textPrimary }}>
                <span>💼</span> Employment Details
              </h3>
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
                <label className="block text-sm font-semibold mb-2" style={{ color: textPrimary }}>
                  Resume Upload <span className="text-red-500">*</span>
                </label>
                <label className="flex flex-col items-center justify-center gap-2 p-6 rounded-xl cursor-pointer transition-all hover:opacity-80 border-2 border-dashed"
                  style={{
                    backgroundColor: documents.resume ? (isDark ? '#1e293b' : '#dcfce7') : (isDark ? '#334155' : '#f8fafc'),
                    borderColor: documents.resume ? '#16a34a' : (errors.resume ? '#dc2626' : defaultBorderColor),
                    color: textPrimary
                  }}
                >
                  {documents.resume ? (
                    <div className="flex items-center gap-2">
                      <span className="text-green-600">✓</span>
                      <span className="font-medium text-sm">{documents.resume.name}</span>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          removeDocument('resume');
                        }}
                        className="text-red-500 hover:text-red-700 text-xs"
                      >
                        ✕
                      </button>
                    </div>
                  ) : (
                    <>
                      <span className="text-3xl">📄</span>
                      <span className="font-medium text-sm">Click to upload Resume</span>
                      <span className="text-xs" style={{ color: textSecondary }}>PDF, DOC, DOCX (Max 5MB)</span>
                    </>
                  )}
                  <input
                    type="file"
                    className="hidden"
                    accept=".pdf,.doc,.docx"
                    onChange={(e) => handleDocumentUpload('resume', e.target.files[0])}
                  />
                </label>
                {errors.resume && <p className="text-red-500 text-xs mt-1">{errors.resume}</p>}
              </div>

            
              </div>
            </div>

          </div>
        )}

        {/* Step 3: Review */}
        {currentStep === 3 && (
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
                  <p className="font-semibold" style={{ color: textPrimary }}>{formData.phone || "-"}</p>
                </div>
              </div>
            </div>

            {/* Address Summary */}
            <div className="p-6 rounded-xl" style={{ backgroundColor: isDark ? '#334155' : '#f8fafc' }}>
              <h3 className="text-sm font-bold uppercase mb-4 flex items-center gap-2" style={{ color: navyBlue }}>
                📍 Address Details
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Current Address */}
                <div>
                  <h4 className="text-sm font-semibold mb-2" style={{ color: textPrimary }}>Current Address</h4>
                  <div className="space-y-1 text-sm" style={{ color: textSecondary }}>
                    <p className="font-medium" style={{ color: textPrimary }}>{formData.currentAddressLine1}</p>
                    <p>
                      {formData.currentCity}, {formData.currentState} - {formData.currentPincode}
                    </p>
                    {formData.isPermanentSameAsCurrent && (
                      <p className="text-xs italic mt-2" style={{ color: '#16a34a' }}>✓ Permanent address same as current</p>
                    )}
                  </div>
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
              </div>
            </div>

            {/* Resume Summary */}
            <div className="p-6 rounded-xl" style={{ backgroundColor: isDark ? '#334155' : '#f8fafc' }}>
              <h3 className="text-sm font-bold uppercase mb-4 flex items-center gap-2" style={{ color: navyBlue }}>
                📄 Resume
              </h3>
              <div className="flex items-center gap-3">
                {documents.resume ? (
                  <span className="px-3 py-2 rounded-lg text-sm font-medium flex items-center gap-2" style={{ backgroundColor: '#dcfce7', color: '#16a34a' }}>
                    📄 {documents.resume.name} ✓
                  </span>
                ) : (
                  <p style={{ color: textSecondary }}>No resume uploaded</p>
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
          {currentStep < 3 ? (
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
                '✅ Add Employee'
              )}
            </button>
          )}
        </div>
        </>
      </div>
    </div>
  );
}
