import React, { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";

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
];

// Mock onboarding status
const mockOnboardingStatus = {
  status: "pending", // pending, approved, rejected
  employeeId: "EMP###",
  submittedOn: "2024-12-01",
  managerComment: "",
  steps: [
    { id: 1, name: "Personal Information", completed: true },
    { id: 2, name: "Job Details", completed: true },
    { id: 3, name: "Documents Upload", completed: true },
    { id: 4, name: "Manager Approval", completed: false, current: true },
    { id: 5, name: "HR Verification", completed: false },
    { id: 6, name: "IT Setup", completed: false },
    { id: 7, name: "Welcome Email", completed: false },
  ]
};

export default function OnboardingForm() {
  const { user } = useAuth();
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const isHRManager = user?.role === "hr_manager";
  
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [generatedId, setGeneratedId] = useState(null);
  
  const [formData, setFormData] = useState({
    // Personal Info
    firstName: "", lastName: "", email: "", 
    phoneCode: "+91", phone: "", 
    dob: "", gender: "",
    address: "", city: "", state: "", pincode: "", bloodGroup: "", 
    emergencyPhoneCode: "+91", emergencyContact: "",
    // Job Details
    department: "", designation: "", joiningDate: "", manager: "", workLocation: "", employmentType: "",
    // Documents
    aadhar: null, pan: null, photo: null, education: null, experience: null,
  });

  const navyBlue = '#1e3a5f';
  const cardStyle = {
    backgroundColor: isDark ? '#1e293b' : '#ffffff',
    border: `1px solid ${isDark ? '#334155' : '#e2e8f0'}`,
    borderRadius: '16px',
  };
  const textPrimary = isDark ? '#f8fafc' : '#0f172a';
  const textSecondary = isDark ? '#94a3b8' : '#64748b';

  const steps = [
    { id: 1, title: "Personal Information", icon: "👤" },
    { id: 2, title: "Job Details", icon: "💼" },
    { id: 3, title: "Documents", icon: "📁" },
    { id: 4, title: "Review & Submit", icon: "✅" },
  ];

  const handleInputChange = (field, value) => {
    setFormData({ ...formData, [field]: value });
  };

  const handleFileChange = (field, file) => {
    setFormData({ ...formData, [field]: file });
  };

  const handleNext = () => {
    if (currentStep < 4) setCurrentStep(currentStep + 1);
  };

  const handleBack = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };

  const handleSubmit = () => {
    const newId = `EMP${String(Math.floor(Math.random() * 900) + 100)}`;
    setGeneratedId(newId);
    setIsSubmitted(true);
  };

  const InputField = ({ label, field, type = "text", placeholder, options = [], required = true }) => (
    <div>
      <label className="block text-sm font-medium mb-2" style={{ color: textPrimary }}>
        {label} {required && <span style={{ color: '#dc2626' }}>*</span>}
      </label>
      {type === "select" ? (
        <select
          value={formData[field]}
          onChange={(e) => handleInputChange(field, e.target.value)}
          className="w-full px-4 py-3 rounded-xl outline-none"
          style={{ backgroundColor: isDark ? '#334155' : '#f8fafc', border: `1px solid ${isDark ? '#475569' : '#e2e8f0'}`, color: textPrimary }}
        >
          <option value="">Select {label}</option>
          {options.map((opt, i) => <option key={i} value={opt}>{opt}</option>)}
        </select>
      ) : (
        <input
          type={type}
          value={formData[field]}
          onChange={(e) => handleInputChange(field, e.target.value)}
          className="w-full px-4 py-3 rounded-xl outline-none"
          style={{ backgroundColor: isDark ? '#334155' : '#f8fafc', border: `1px solid ${isDark ? '#475569' : '#e2e8f0'}`, color: textPrimary }}
          placeholder={placeholder}
        />
      )}
    </div>
  );

  const PhoneInputField = ({ label, codeField, phoneField, required = true }) => (
    <div>
      <label className="block text-sm font-medium mb-2" style={{ color: textPrimary }}>
        {label} {required && <span style={{ color: '#dc2626' }}>*</span>}
      </label>
      <div className="flex gap-2">
        <select
          value={formData[codeField]}
          onChange={(e) => handleInputChange(codeField, e.target.value)}
          className="px-3 py-3 rounded-xl outline-none"
          style={{ backgroundColor: isDark ? '#334155' : '#f8fafc', border: `1px solid ${isDark ? '#475569' : '#e2e8f0'}`, color: textPrimary, minWidth: '100px' }}
        >
          {countryCodes.map((c) => (
            <option key={c.code} value={c.code}>{c.flag} {c.code}</option>
          ))}
        </select>
        <input
          type="tel"
          value={formData[phoneField]}
          onChange={(e) => handleInputChange(phoneField, e.target.value)}
          className="flex-1 px-4 py-3 rounded-xl outline-none"
          style={{ backgroundColor: isDark ? '#334155' : '#f8fafc', border: `1px solid ${isDark ? '#475569' : '#e2e8f0'}`, color: textPrimary }}
          placeholder="98765 43210"
        />
      </div>
    </div>
  );

  const FileUpload = ({ label, field }) => (
    <div>
      <label className="block text-sm font-medium mb-2" style={{ color: textPrimary }}>{label}</label>
      <label 
        className="flex items-center justify-center gap-2 p-4 rounded-xl cursor-pointer transition-all hover:opacity-80"
        style={{ 
          backgroundColor: formData[field] ? '#dcfce7' : (isDark ? '#334155' : '#f8fafc'), 
          border: `2px dashed ${formData[field] ? '#16a34a' : (isDark ? '#475569' : '#e2e8f0')}`,
          color: formData[field] ? '#16a34a' : textSecondary
        }}
      >
        {formData[field] ? (
          <>✓ {formData[field].name}</>
        ) : (
          <>📎 Click to upload</>
        )}
        <input type="file" className="hidden" onChange={(e) => handleFileChange(field, e.target.files[0])} />
      </label>
    </div>
  );

  // If already submitted, show status tracker
  if (isSubmitted || mockOnboardingStatus.status !== "new") {
    return (
      <div className="space-y-6" style={{ fontFamily: "'Outfit', sans-serif" }}>
        <div className="animate-fade-in-down">
          <h1 className="text-2xl font-bold" style={{ color: textPrimary }}>Onboarding Status</h1>
          <p style={{ color: textSecondary }}>Track your onboarding progress</p>
        </div>

        {/* Status Card */}
        <div className="p-6 animate-fade-in-up" style={{ ...cardStyle, background: isSubmitted ? `linear-gradient(135deg, ${navyBlue}, #2563eb)` : cardStyle.backgroundColor }}>
          {isSubmitted && (
            <div className="text-center text-white">
              <div className="text-6xl mb-4">🎉</div>
              <h2 className="text-2xl font-bold mb-2">Application Submitted!</h2>
              <p className="text-blue-100 mb-4">Your onboarding request has been submitted successfully.</p>
              <div className="inline-block px-6 py-3 rounded-xl bg-white/20 backdrop-blur">
                <p className="text-sm text-blue-100">Your Employee ID (Preview)</p>
                <p className="text-3xl font-bold">{generatedId}</p>
              </div>
            </div>
          )}
          {!isSubmitted && (
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold" style={{ color: textPrimary }}>Onboarding Request</h2>
                <p style={{ color: textSecondary }}>Submitted on {mockOnboardingStatus.submittedOn}</p>
              </div>
              <span 
                className="px-4 py-2 rounded-full font-medium"
                style={{ 
                  backgroundColor: mockOnboardingStatus.status === "approved" ? "#dcfce7" : mockOnboardingStatus.status === "rejected" ? "#fee2e2" : "#fef3c7",
                  color: mockOnboardingStatus.status === "approved" ? "#16a34a" : mockOnboardingStatus.status === "rejected" ? "#dc2626" : "#d97706"
                }}
              >
                {mockOnboardingStatus.status === "approved" ? "✓ Approved" : mockOnboardingStatus.status === "rejected" ? "✗ Rejected" : "⏳ Pending"}
              </span>
            </div>
          )}
        </div>

        {/* Onboarding Checklist */}
        <div className="p-6 animate-fade-in-up stagger-2" style={cardStyle}>
          <h3 className="text-lg font-bold mb-6" style={{ color: textPrimary }}>Onboarding Checklist</h3>
          <div className="space-y-4">
            {mockOnboardingStatus.steps.map((step, i) => (
              <div 
                key={step.id}
                className="flex items-center gap-4 p-4 rounded-xl transition-all"
                style={{ 
                  backgroundColor: step.completed ? '#dcfce7' : step.current ? `${navyBlue}10` : (isDark ? '#334155' : '#f8fafc'),
                  border: step.current ? `2px solid ${navyBlue}` : 'none'
                }}
              >
                <div 
                  className="w-10 h-10 rounded-full flex items-center justify-center font-bold"
                  style={{ 
                    backgroundColor: step.completed ? '#16a34a' : step.current ? navyBlue : (isDark ? '#475569' : '#e2e8f0'),
                    color: step.completed || step.current ? '#ffffff' : textSecondary
                  }}
                >
                  {step.completed ? '✓' : i + 1}
                </div>
                <div className="flex-1">
                  <p className="font-medium" style={{ color: step.completed ? '#16a34a' : textPrimary }}>{step.name}</p>
                  {step.current && <p className="text-sm" style={{ color: navyBlue }}>In Progress</p>}
                </div>
                {step.completed && <span className="text-green-500">✓</span>}
              </div>
            ))}
          </div>
        </div>

        {/* Manager Comment */}
        {mockOnboardingStatus.managerComment && (
          <div className="p-6 animate-fade-in-up stagger-3" style={cardStyle}>
            <h3 className="text-lg font-bold mb-3" style={{ color: textPrimary }}>Manager Comment</h3>
            <p className="p-4 rounded-xl" style={{ backgroundColor: isDark ? '#334155' : '#f8fafc', color: textPrimary }}>
              "{mockOnboardingStatus.managerComment}"
            </p>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6" style={{ fontFamily: "'Outfit', sans-serif" }}>
      {/* Header */}
      <div className="animate-fade-in-down">
        <h1 className="text-2xl font-bold" style={{ color: textPrimary }}>Employee Onboarding</h1>
        <p style={{ color: textSecondary }}>Complete your registration to join the team</p>
      </div>

      {/* Progress Steps */}
      <div className="flex items-center justify-between p-4 rounded-xl animate-fade-in-up" style={cardStyle}>
        {steps.map((step, i) => (
          <React.Fragment key={step.id}>
            <div className="flex flex-col items-center">
              <div 
                className="w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold transition-all"
                style={{ 
                  backgroundColor: currentStep >= step.id ? navyBlue : (isDark ? '#334155' : '#e2e8f0'),
                  color: currentStep >= step.id ? '#ffffff' : textSecondary
                }}
              >
                {currentStep > step.id ? '✓' : step.icon}
              </div>
              <p className="text-xs mt-2 text-center hidden sm:block" style={{ color: currentStep >= step.id ? navyBlue : textSecondary }}>
                {step.title}
              </p>
            </div>
            {i < steps.length - 1 && (
              <div 
                className="flex-1 h-1 mx-2 rounded-full"
                style={{ backgroundColor: currentStep > step.id ? navyBlue : (isDark ? '#334155' : '#e2e8f0') }}
              />
            )}
          </React.Fragment>
        ))}
      </div>

      {/* Form Content */}
      <div className="p-6 animate-fade-in-up" style={cardStyle}>
        <h2 className="text-xl font-bold mb-6" style={{ color: textPrimary }}>
          {steps[currentStep - 1].icon} {steps[currentStep - 1].title}
        </h2>

        {/* Step 1: Personal Information */}
        {currentStep === 1 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <InputField label="First Name" field="firstName" placeholder="John" />
            <InputField label="Last Name" field="lastName" placeholder="Doe" />
            <InputField label="Email" field="email" type="email" placeholder="john@company.com" />
            <PhoneInputField label="Phone Number" codeField="phoneCode" phoneField="phone" />
            <InputField label="Date of Birth" field="dob" type="date" />
            <InputField label="Gender" field="gender" type="select" options={["Male", "Female", "Other"]} />
            <InputField label="Blood Group" field="bloodGroup" type="select" options={["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"]} />
            <PhoneInputField label="Emergency Contact" codeField="emergencyPhoneCode" phoneField="emergencyContact" />
            <div className="md:col-span-2">
              <InputField label="Address" field="address" placeholder="123 Street Name" />
            </div>
            <InputField label="City" field="city" placeholder="Bangalore" />
            <InputField label="State" field="state" type="select" options={["Karnataka", "Tamil Nadu", "Maharashtra", "Delhi", "Other"]} />
            <InputField label="Pincode" field="pincode" placeholder="560001" />
          </div>
        )}

        {/* Step 2: Job Details */}
        {currentStep === 2 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <InputField label="Department" field="department" type="select" options={["Engineering", "Sales", "HR", "Finance", "Marketing", "Operations"]} />
            <InputField label="Designation" field="designation" type="select" options={["Software Engineer", "Senior Engineer", "Manager", "Analyst", "Executive"]} />
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: textPrimary }}>
                Joining Date <span style={{ color: '#dc2626' }}>*</span>
              </label>
              <input
                type="date"
                value={formData.joiningDate}
                onChange={(e) => handleInputChange('joiningDate', e.target.value)}
                className="w-full px-4 py-3 rounded-xl outline-none"
                style={{ backgroundColor: isDark ? '#334155' : '#f8fafc', border: `1px solid ${isDark ? '#475569' : '#e2e8f0'}`, color: textPrimary }}
              />
            </div>
            <InputField label="Reporting Manager" field="manager" type="select" options={["Ravi Sharma", "Priya Verma", "Suresh Reddy"]} />
            <InputField label="Work Location" field="workLocation" type="select" options={["Bangalore", "Mumbai", "Delhi", "Remote"]} />
            <InputField label="Employment Type" field="employmentType" type="select" options={["Full-time", "Part-time", "Contract", "Intern"]} />
          </div>
        )}

        {/* Step 3: Documents */}
        {currentStep === 3 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FileUpload label="Aadhar Card" field="aadhar" />
            <FileUpload label="PAN Card" field="pan" />
            <FileUpload label="Passport Photo" field="photo" />
            <FileUpload label="Educational Certificates" field="education" />
            <FileUpload label="Experience Letters (if any)" field="experience" />
          </div>
        )}

        {/* Step 4: Review */}
        {currentStep === 4 && (
          <div className="space-y-6">
            <div className="p-4 rounded-xl" style={{ backgroundColor: isDark ? '#334155' : '#f8fafc' }}>
              <h3 className="font-bold mb-3" style={{ color: textPrimary }}>Personal Details</h3>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <p style={{ color: textSecondary }}>Name: <span style={{ color: textPrimary }}>{formData.firstName} {formData.lastName}</span></p>
                <p style={{ color: textSecondary }}>Email: <span style={{ color: textPrimary }}>{formData.email}</span></p>
                <p style={{ color: textSecondary }}>Phone: <span style={{ color: textPrimary }}>{formData.phoneCode} {formData.phone}</span></p>
                <p style={{ color: textSecondary }}>DOB: <span style={{ color: textPrimary }}>{formData.dob}</span></p>
              </div>
            </div>
            <div className="p-4 rounded-xl" style={{ backgroundColor: isDark ? '#334155' : '#f8fafc' }}>
              <h3 className="font-bold mb-3" style={{ color: textPrimary }}>Job Details</h3>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <p style={{ color: textSecondary }}>Department: <span style={{ color: textPrimary }}>{formData.department}</span></p>
                <p style={{ color: textSecondary }}>Designation: <span style={{ color: textPrimary }}>{formData.designation}</span></p>
                <p style={{ color: textSecondary }}>Manager: <span style={{ color: textPrimary }}>{formData.manager}</span></p>
                <p style={{ color: textSecondary }}>Location: <span style={{ color: textPrimary }}>{formData.workLocation}</span></p>
                <p style={{ color: textSecondary }}>Joining Date: <span style={{ color: textPrimary }}>{formData.joiningDate}</span></p>
              </div>
            </div>
            <div className="p-4 rounded-xl" style={{ backgroundColor: isDark ? '#334155' : '#f8fafc' }}>
              <h3 className="font-bold mb-3" style={{ color: textPrimary }}>Documents Uploaded</h3>
              <div className="flex flex-wrap gap-2">
                {['aadhar', 'pan', 'photo', 'education', 'experience'].map(doc => formData[doc] && (
                  <span key={doc} className="px-3 py-1 rounded-full text-sm" style={{ backgroundColor: '#dcfce7', color: '#16a34a' }}>
                    ✓ {doc.charAt(0).toUpperCase() + doc.slice(1)}
                  </span>
                ))}
              </div>
            </div>
            <div className="p-4 rounded-xl border-2 border-dashed" style={{ borderColor: navyBlue, backgroundColor: `${navyBlue}05` }}>
              <p className="text-center" style={{ color: navyBlue }}>
                <span className="text-2xl block mb-2">🆔</span>
                Your Employee ID will be generated after approval
              </p>
            </div>
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="flex justify-between mt-8">
          <button
            onClick={handleBack}
            disabled={currentStep === 1}
            className="px-6 py-3 rounded-xl font-semibold transition-all disabled:opacity-50"
            style={{ backgroundColor: isDark ? '#334155' : '#f1f5f9', color: textPrimary }}
          >
            ← Back
          </button>
          {currentStep < 4 ? (
            <button
              onClick={handleNext}
              className="px-6 py-3 rounded-xl font-bold text-white transition-all hover:opacity-90"
              style={{ backgroundColor: navyBlue }}
            >
              Next →
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              className="px-8 py-3 rounded-xl font-bold text-white transition-all hover:opacity-90"
              style={{ backgroundColor: '#16a34a' }}
            >
              ✓ Submit Application
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
