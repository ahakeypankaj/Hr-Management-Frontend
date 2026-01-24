import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";
import {
    getAllAssets,
    getMyAssets,
    createAsset,
    updateAsset,
    deleteAsset
} from "../../services/assetService";
import { fetchEmployees } from "../../services/directoryService";
import { useScrollLock } from "../../hooks/useScrollLock";

const assetTypes = [
    "Laptop / Desktop",
    "Keyboard / Mouse / Headset",
    "Webcam / Power backup",
    "Printer & scanner",
    "Work desk / table",
    "Office chair",
    "Internet reimbursement / broadband allowance",
    "Electricity allowance",
    "others"
];

const assetStatuses = ["Available", "Assigned", "Repairing", "Retired"];
const assetConditions = ["New", "Good", "Fair", "Poor"];

export default function AssetManagement() {
    const { user } = useAuth();
    const { theme } = useTheme();
    const isDark = theme === "dark";
    const location = useLocation();
    const queryParams = new URLSearchParams(location.search);
    const isPersonalView = queryParams.get('view') === 'personal';

    const isHR = (user?.role === "hr_manager" || user?.role === "admin") && !isPersonalView;

    const [assets, setAssets] = useState([]);
    const [employees, setEmployees] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [editingAsset, setEditingAsset] = useState(null);

    const [form, setForm] = useState({
        assetName: "",
        assetType: "",
        serialNumber: "",
        description: "",
        assignedTo: "",
        status: "Available",
        condition: "Good",
        notes: ""
    });

    const navyBlue = '#1e3a5f';
    const cardStyle = {
        backgroundColor: isDark ? '#1e293b' : '#ffffff',
        border: `1px solid ${isDark ? '#334155' : '#e2e8f0'}`,
        borderRadius: '16px',
    };
    const textPrimary = isDark ? '#f8fafc' : '#0f172a';
    const textSecondary = isDark ? '#94a3b8' : '#64748b';

    const fetchData = async () => {
        setIsLoading(true);
        setError(null);
        try {
            if (isHR) {
                const [assetsData, employeesData] = await Promise.all([
                    getAllAssets(),
                    fetchEmployees()
                ]);
                setAssets(assetsData.assets || []);
                setEmployees(employeesData.users || []);
            } else {
                const data = await getMyAssets();
                setAssets(data.assets || []);
            }
        } catch (err) {
            console.error("Error fetching assets:", err);
            setError("Failed to load assets. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [isHR]);

    // Lock scroll when modal is open
    useScrollLock(showModal);

    const generateDefaultSerial = () => {
        const now = new Date();
        const dd = String(now.getDate()).padStart(2, '0');
        const mm = String(now.getMonth() + 1).padStart(2, '0');
        const yy = String(now.getFullYear()).slice(-2);
        return `${dd}-${mm}-${yy}-000`;
    };

    const handleOpenModal = (asset = null) => {
        if (asset) {
            setEditingAsset(asset);
            setForm({
                assetName: asset.assetName,
                assetType: asset.assetType,
                serialNumber: asset.serialNumber,
                description: asset.description || "",
                assignedTo: asset.assignedTo?._id || "",
                status: asset.status,
                condition: asset.condition,
                notes: asset.notes || ""
            });
        } else {
            setEditingAsset(null);
            setForm({
                assetName: "",
                assetType: "",
                serialNumber: generateDefaultSerial(),
                description: "",
                assignedTo: "",
                status: "Available",
                condition: "Good",
                notes: ""
            });
        }
        setShowModal(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const payload = {
                ...form,
                assignedTo: form.assignedTo || null
            };
            if (editingAsset) {
                await updateAsset(editingAsset._id, payload);
            } else {
                await createAsset(payload);
            }
            setShowModal(false);
            fetchData();
        } catch (err) {
            console.error("Error saving asset:", err);
            alert(err.response?.data?.message || "Failed to save asset.");
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm("Are you sure you want to delete this asset?")) {
            try {
                await deleteAsset(id);
                fetchData();
            } catch (err) {
                console.error("Error deleting asset:", err);
                alert("Failed to delete asset.");
            }
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case "Available": return "#16a34a";
            case "Assigned": return "#2563eb";
            case "Repairing": return "#ea580c";
            case "Retired": return "#64748b";
            default: return "#64748b";
        }
    };

    return (
        <>
            <div className="space-y-6" style={{ fontFamily: "'Outfit', sans-serif" }}>
                {/* Header */}
                <div className="flex items-center justify-between animate-fade-in-down">
                    <div>
                        <h1 className="text-2xl font-bold" style={{ color: textPrimary }}>{isHR ? "Asset Management" : "My Assets"}</h1>
                        <p style={{ color: textSecondary }}>{isHR ? "Track and manage company equipment" : "View equipment assigned to you"}</p>
                    </div>
                    {isHR && (
                        <button
                            onClick={() => handleOpenModal()}
                            className="px-6 py-3 rounded-xl font-bold text-white flex items-center gap-2 transition-all hover:opacity-90"
                            style={{ backgroundColor: navyBlue, boxShadow: `0 4px 15px ${navyBlue}40` }}
                        >
                            📦 Add New Asset
                        </button>
                    )}
                </div>

                {isLoading ? (
                    <div className="flex flex-col items-center justify-center py-20" style={cardStyle}>
                        <div className="w-12 h-12 border-4 border-t-transparent animate-spin rounded-full mb-4" style={{ borderColor: `${navyBlue}40`, borderTopColor: navyBlue }}></div>
                        <p style={{ color: textSecondary }}>Loading assets...</p>
                    </div>
                ) : error ? (
                    <div className="p-8 text-center" style={cardStyle}>
                        <p style={{ color: "#dc2626" }} className="font-bold mb-4">⚠️ {error}</p>
                        <button onClick={fetchData} className="px-4 py-2 rounded-lg text-white font-semibold style={{ backgroundColor: navyBlue }}">Retry</button>
                    </div>
                ) : assets.length === 0 ? (
                    <div className="p-20 text-center" style={cardStyle}>
                        <div className="text-6xl mb-4">📦</div>
                        <p className="text-lg font-bold" style={{ color: textPrimary }}>No assets found</p>
                        <p style={{ color: textSecondary }}>{isHR ? "Start by adding equipment to the system." : "You have no assets assigned at the moment."}</p>
                    </div>
                ) : (
                    <div className={isHR ? "overflow-x-auto rounded-2xl shadow-sm border overflow-hidden" : "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"} style={{ borderColor: isDark ? '#334155' : '#e2e8f0' }}>
                        {isHR ? (
                            /* HR Table View */
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr style={{ backgroundColor: isDark ? '#1e293b' : '#f8fafc' }}>
                                        <th className="px-6 py-4 text-sm font-bold" style={{ color: textSecondary }}>Asset Name</th>
                                        <th className="px-6 py-4 text-sm font-bold" style={{ color: textSecondary }}>Type</th>
                                        <th className="px-6 py-4 text-sm font-bold" style={{ color: textSecondary }}>Serial No.</th>
                                        <th className="px-6 py-4 text-sm font-bold" style={{ color: textSecondary }}>Assigned To</th>
                                        <th className="px-6 py-4 text-sm font-bold" style={{ color: textSecondary }}>Status</th>
                                        <th className="px-6 py-4 text-sm font-bold" style={{ color: textSecondary }}>Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200" style={{ backgroundColor: isDark ? '#111827' : '#ffffff', borderColor: isDark ? '#334155' : '#e2e8f0' }}>
                                    {assets.map((asset) => (
                                        <tr key={asset._id} className="hover:bg-gray-50/5 transition-colors">
                                            <td className="px-6 py-4">
                                                <p className="font-bold" style={{ color: textPrimary }}>{asset.assetName}</p>
                                            </td>
                                            <td className="px-6 py-4 text-sm" style={{ color: textSecondary }}>{asset.assetType}</td>
                                            <td className="px-6 py-4 text-sm font-mono" style={{ color: textSecondary }}>{asset.serialNumber}</td>
                                            <td className="px-6 py-4 text-sm">
                                                {asset.assignedTo ? (
                                                    <div>
                                                        <p className="font-medium" style={{ color: textPrimary }}>{asset.assignedTo.name}</p>
                                                        <p style={{ color: textSecondary }} className="text-xs">{asset.assignedTo.employeeId}</p>
                                                    </div>
                                                ) : (
                                                    <span className="text-xs italic" style={{ color: textSecondary }}>Unassigned</span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="px-3 py-1 rounded-full text-xs font-bold" style={{ backgroundColor: `${getStatusColor(asset.status)}20`, color: getStatusColor(asset.status) }}>
                                                    {asset.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex gap-2">
                                                    <button onClick={() => handleOpenModal(asset)} className="p-2 rounded-lg hover:bg-blue-100/10 transition-colors" title="Edit">✏️</button>
                                                    <button onClick={() => handleDelete(asset._id)} className="p-2 rounded-lg hover:bg-red-100/10 transition-colors" title="Delete">🗑️</button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        ) : (
                            /* Employee Card View */
                            assets.map((asset) => (
                                <div key={asset._id} className="p-6 transition-all hover-lift" style={cardStyle}>
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl" style={{ backgroundColor: `${navyBlue}10` }}>
                                            {asset.assetType.includes("Laptop") ? "💻" : asset.assetType.includes("Keyboard") ? "⌨️" : "📦"}
                                        </div>
                                        <span className="px-3 py-1 rounded-full text-xs font-bold" style={{ backgroundColor: `#16a34a20`, color: "#16a34a" }}>
                                            Assigned
                                        </span>
                                    </div>
                                    <h3 className="text-lg font-bold mb-1" style={{ color: textPrimary }}>{asset.assetName}</h3>
                                    <p className="text-sm mb-4" style={{ color: textSecondary }}>{asset.assetType}</p>
                                    <div className="space-y-2 pt-4 border-t" style={{ borderColor: isDark ? '#334155' : '#f1f5f9' }}>
                                        <div className="flex justify-between text-sm">
                                            <span style={{ color: textSecondary }}>Serial Number:</span>
                                            <span className="font-mono" style={{ color: textPrimary }}>{asset.serialNumber}</span>
                                        </div>
                                        <div className="flex justify-between text-sm">
                                            <span style={{ color: textSecondary }}>Condition:</span>
                                            <span style={{ color: textPrimary }}>{asset.condition}</span>
                                        </div>
                                        {asset.description && (
                                            <div className="pt-2">
                                                <p className="text-xs italic" style={{ color: textSecondary }}>{asset.description}</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                )}
            </div>

            {/* HR Modal */}
            {showModal && (
                <div style={{
                    backgroundColor: 'rgba(0, 0, 0, 0.5)',
                    backdropFilter: 'blur(8px)',
                    WebkitBackdropFilter: 'blur(8px)'
                }} className="fixed inset-0 flex items-center justify-center z-50 p-4 ">
                    <div className="w-full max-w-2xl bg-white rounded-2xl overflow-hidden shadow-2xl animate-scale-in" style={{ backgroundColor: isDark ? '#1e293b' : '#ffffff' }}>
                        <div className="p-6 border-b" style={{ borderColor: isDark ? '#334155' : '#e2e8f0' }}>
                            <h2 className="text-xl font-bold" style={{ color: textPrimary }}>{editingAsset ? "Edit Asset" : "Add New Asset"}</h2>
                        </div>
                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium mb-1" style={{ color: textSecondary }}>Asset Name *</label>
                                    <input
                                        required
                                        type="text"
                                        className="w-full p-3 rounded-xl outline-none"
                                        style={{ backgroundColor: isDark ? '#334155' : '#f8fafc', border: `1px solid ${isDark ? '#475569' : '#e2e8f0'}`, color: textPrimary }}
                                        value={form.assetName}
                                        onChange={(e) => setForm({ ...form, assetName: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1" style={{ color: textSecondary }}>Asset Type *</label>
                                    <select
                                        required
                                        className="w-full p-3 rounded-xl outline-none"
                                        style={{ backgroundColor: isDark ? '#334155' : '#f8fafc', border: `1px solid ${isDark ? '#475569' : '#e2e8f0'}`, color: textPrimary }}
                                        value={form.assetType}
                                        onChange={(e) => setForm({ ...form, assetType: e.target.value })}
                                    >
                                        <option value="">Select Type</option>
                                        {assetTypes.map(t => <option key={t} value={t}>{t}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1" style={{ color: textSecondary }}>Serial Number *</label>
                                    <input
                                        required
                                        type="text"
                                        className="w-full p-3 rounded-xl outline-none"
                                        style={{ backgroundColor: isDark ? '#334155' : '#f8fafc', border: `1px solid ${isDark ? '#475569' : '#e2e8f0'}`, color: textPrimary }}
                                        value={form.serialNumber}
                                        onChange={(e) => setForm({ ...form, serialNumber: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1" style={{ color: textSecondary }}>Assigned To</label>
                                    <select
                                        className="w-full p-3 rounded-xl outline-none"
                                        style={{ backgroundColor: isDark ? '#334155' : '#f8fafc', border: `1px solid ${isDark ? '#475569' : '#e2e8f0'}`, color: textPrimary }}
                                        value={form.assignedTo}
                                        onChange={(e) => setForm({ ...form, assignedTo: e.target.value })}
                                    >
                                        <option value="">None (Available)</option>
                                        {employees.map(emp => <option key={emp._id} value={emp._id}>{emp.name}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1" style={{ color: textSecondary }}>Status</label>
                                    <select
                                        className="w-full p-3 rounded-xl outline-none"
                                        style={{ backgroundColor: isDark ? '#334155' : '#f8fafc', border: `1px solid ${isDark ? '#475569' : '#e2e8f0'}`, color: textPrimary }}
                                        value={form.status}
                                        onChange={(e) => setForm({ ...form, status: e.target.value })}
                                    >
                                        {assetStatuses.map(s => <option key={s} value={s}>{s}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1" style={{ color: textSecondary }}>Condition</label>
                                    <select
                                        className="w-full p-3 rounded-xl outline-none"
                                        style={{ backgroundColor: isDark ? '#334155' : '#f8fafc', border: `1px solid ${isDark ? '#475569' : '#e2e8f0'}`, color: textPrimary }}
                                        value={form.condition}
                                        onChange={(e) => setForm({ ...form, condition: e.target.value })}
                                    >
                                        {assetConditions.map(c => <option key={c} value={c}>{c}</option>)}
                                    </select>
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1" style={{ color: textSecondary }}>Description (Optional)</label>
                                <textarea
                                    rows={2}
                                    className="w-full p-3 rounded-xl outline-none resize-none"
                                    style={{ backgroundColor: isDark ? '#334155' : '#f8fafc', border: `1px solid ${isDark ? '#475569' : '#e2e8f0'}`, color: textPrimary }}
                                    value={form.description}
                                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                                    placeholder="Additional details..."
                                />
                            </div>
                            <div className="flex gap-4 pt-4 border-t" style={{ borderColor: isDark ? '#334155' : '#e2e8f0' }}>
                                <button type="button" onClick={() => setShowModal(false)} className="flex-1 py-3 rounded-xl font-bold transition-all hover:bg-gray-100/5" style={{ color: textSecondary }}>Cancel</button>
                                <button type="submit" className="flex-1 py-3 rounded-xl font-bold text-white transition-all shadow-lg" style={{ backgroundColor: navyBlue }}>{editingAsset ? "Save Changes" : "Create Asset"}</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </>
    );
}
