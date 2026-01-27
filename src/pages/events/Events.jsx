import React, { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";
import { fetchEvents, createEvent, updateEvent, deleteEvent, rsvpToEvent } from "../../services/eventService";
import { fetchKudos, postKudo, likeKudo, commentOnKudo } from "../../services/kudoService";
import { fetchEmployees } from "../../services/directoryService";
import { useScrollLock } from "../../hooks/useScrollLock";

// Mock events data - 2026 Holidays Calendar
// Badge options
const badges = [
  { emoji: "⭐", label: "Star Performer" },
  { emoji: "🤝", label: "Team Player" },
  { emoji: "🎤", label: "Great Communicator" },
  { emoji: "💡", label: "Innovator" },
  { emoji: "❤️", label: "Customer Hero" },
  { emoji: "🚀", label: "Go-Getter" },
];

// Event types
const eventTypes = [
  { id: "holiday", label: "Holiday/Celebration", icon: "🎉" },
  { id: "meeting", label: "Meeting", icon: "📅" },
  { id: "webinar", label: "Webinar/Training", icon: "💻" },
  { id: "team", label: "Team Building", icon: "👥" },
  { id: "company", label: "Company Event", icon: "🏢" },
];

export default function Events() {
  const { user } = useAuth();
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const [activeTab, setActiveTab] = useState("events");
  const [events, setEvents] = useState([]);
  const [kudos, setKudos] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showKudosModal, setShowKudosModal] = useState(false);
  const [showEventModal, setShowEventModal] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [kudosForm, setKudosForm] = useState({ to: "", message: "", badge: "" });
  const [eventForm, setEventForm] = useState({
    title: "",
    date: "",
    time: "",
    location: "",
    type: "meeting",
    description: "",
    rsvp: true,
  });
  const [rsvpStatus, setRsvpStatus] = useState({});
  const [commentInputs, setCommentInputs] = useState({});
  const [expandedComments, setExpandedComments] = useState({});

  const fetchData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [eventsData, kudosData] = await Promise.all([
        fetchEvents(),
        fetchKudos()
      ]);

      // Sort events by date (earliest first)
      const sortedEvents = (eventsData.events || []).sort((a, b) => new Date(a.date) - new Date(b.date));
      setEvents(sortedEvents);

      // Kudos from backend has 'kudos' array
      setKudos(kudosData.kudos || []);
    } catch (err) {
      console.error("Error fetching data:", err);
      setError("Failed to load data. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchEmployeesList = async () => {
    try {
      const data = await fetchEmployees();
      setEmployees(data.users || []);
    } catch (err) {
      console.error("Error fetching employees:", err);
    }
  };

  useEffect(() => {
    fetchData();
    fetchEmployeesList();
  }, []);

  // Lock scroll when any modal is open
  useScrollLock(showKudosModal || showEventModal);

  // Check if user can manage events (HR/Manager or Admin)
  const canManageEvents = user?.role === "hr_manager" || user?.role === "admin";
  const isAdmin = user?.role === "admin";

  const navyBlue = '#1e3a5f';
  const cardStyle = {
    backgroundColor: isDark ? '#1e293b' : '#ffffff',
    border: `1px solid ${isDark ? '#334155' : '#e2e8f0'}`,
    borderRadius: '16px',
  };
  const textPrimary = isDark ? '#f8fafc' : '#0f172a';
  const textSecondary = isDark ? '#94a3b8' : '#64748b';

  const getEventTypeStyle = (type) => {
    switch (type) {
      case "holiday": return { bg: "#dcfce7", color: "#16a34a", icon: "🎉" };
      case "meeting": return { bg: "#dbeafe", color: "#2563eb", icon: "📅" };
      case "webinar": return { bg: "#f3e8ff", color: "#7c3aed", icon: "💻" };
      case "team": return { bg: "#ffedd5", color: "#ea580c", icon: "👥" };
      case "company": return { bg: "#fef3c7", color: "#d97706", icon: "🏢" };
      default: return { bg: "#f1f5f9", color: "#64748b", icon: "📆" };
    }
  };

  const handleRSVP = async (eventId) => {
    try {
      const isAttending = !rsvpStatus[eventId];
      await rsvpToEvent(eventId, isAttending);
      setRsvpStatus({ ...rsvpStatus, [eventId]: isAttending });
      // Update local events state attending count
      setEvents(events.map(e =>
        e.id === eventId
          ? { ...e, attending: isAttending ? (e.attending + 1) : Math.max(0, e.attending - 1) }
          : e
      ));
    } catch (err) {
      console.error("Error RSVPing:", err);
      alert("Failed to RSVP. Please try again.");
    }
  };

  const handlePostKudos = async () => {
    try {
      await postKudo(kudosForm);
      setShowKudosModal(false);
      setKudosForm({ to: "", message: "", badge: "" });
      fetchData(); // Refresh feed
    } catch (err) {
      console.error("Error posting kudo:", err);
      // Backend error message might be 'You cannot give kudos to yourself'
      alert(err.response?.data?.message || "Failed to post kudo.");
    }
  };

  const handleLikeKudo = async (kudoId) => {
    try {
      const kudo = kudos.find(k => k.id === kudoId);
      if (!kudo) return;

      const newLikedStatus = !kudo.isLiked;
      await likeKudo(kudoId, newLikedStatus);

      // Optimistic update
      setKudos(prev => prev.map(k =>
        k.id === kudoId
          ? { ...k, isLiked: newLikedStatus, likes: newLikedStatus ? k.likes + 1 : Math.max(0, k.likes - 1) }
          : k
      ));
    } catch (err) {
      console.error("Error liking kudo:", err);
    }
  };

  const handleCommentKudo = async (kudoId) => {
    const comment = commentInputs[kudoId];
    if (!comment || !comment.trim()) return;

    try {
      await commentOnKudo(kudoId, comment.trim());
      setCommentInputs(prev => ({ ...prev, [kudoId]: "" }));
      fetchData(); // Refresh to get the new comment
    } catch (err) {
      console.error("Error commenting on kudo:", err);
      alert("Failed to add comment.");
    }
  };

  const openCreateEventModal = () => {
    setEditingEvent(null);
    setEventForm({
      title: "",
      date: "",
      time: "",
      location: "",
      type: "meeting",
      description: "",
      rsvp: true,
    });
    setShowEventModal(true);
  };

  const openEditEventModal = (event) => {
    setEditingEvent(event);
    setEventForm({
      title: event.title,
      date: event.date,
      time: event.time,
      location: event.location,
      type: event.type,
      description: event.description,
      rsvp: event.rsvp,
    });
    setShowEventModal(true);
  };

  const handleSaveEvent = async () => {
    try {
      if (editingEvent) {
        await updateEvent(editingEvent.id, eventForm);
      } else {
        await createEvent(eventForm);
      }
      setShowEventModal(false);
      setEditingEvent(null);
      fetchData(); // Refresh list
    } catch (err) {
      console.error("Error saving event:", err);
      alert("Failed to save event.");
    }
  };

  const handleDeleteEvent = async (eventId) => {
    if (window.confirm("Are you sure you want to delete this event?")) {
      try {
        await deleteEvent(eventId);
        setEvents(events.filter(e => e.id !== eventId));
      } catch (err) {
        console.error("Error deleting event:", err);
        alert("Failed to delete event.");
      }
    }
  };

  return (
    <>
      <div className="space-y-6" style={{ fontFamily: "'Outfit', sans-serif" }}>
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 animate-fade-in-down">
          <div>
            <h1 className="text-2xl font-bold" style={{ color: textPrimary }}>Events & Kudos</h1>
            <p style={{ color: textSecondary }}>Celebrating our team moments and milestones</p>
          </div>
          <div className="flex items-center gap-3">
            {canManageEvents && activeTab === 'events' && (
              <button
                onClick={openCreateEventModal}
                className="px-6 py-3 rounded-xl font-bold text-white flex items-center gap-2 transition-all hover:opacity-90 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                style={{ backgroundColor: '#16a34a', boxShadow: '0 4px 15px rgba(22, 163, 74, 0.4)' }}
              >
                📅 Create Event
              </button>
            )}
            <button
              onClick={() => setShowKudosModal(true)}
              className="px-6 py-3 rounded-xl font-bold text-white flex items-center gap-2 transition-all hover:opacity-90"
              style={{ backgroundColor: navyBlue, boxShadow: `0 4px 15px ${navyBlue}40` }}
            >
              ⭐ Give Kudos
            </button>
          </div>
        </div>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20" style={cardStyle}>
            <div className="w-12 h-12 border-4 border-t-transparent animate-spin rounded-full mb-4" style={{ borderColor: `${navyBlue}40`, borderTopColor: navyBlue }}></div>
            <p style={{ color: textSecondary }}>Loading data...</p>
          </div>
        ) : error ? (
          <div className="p-8 text-center" style={cardStyle}>
            <p style={{ color: "#dc2626" }} className="font-bold mb-2">⚠️ {error}</p>
            <button
              onClick={fetchData}
              className="px-4 py-2 rounded-lg text-white font-semibold text-sm transition-all hover:opacity-90"
              style={{ backgroundColor: navyBlue }}
            >
              Retry
            </button>
          </div>
        ) : (
          <>
            {/* Tabs */}
            <div className="flex space-x-1 p-1 rounded-xl w-full max-w-md bg-gray-100/50 dark:bg-gray-800/50">
              {['events', 'kudos'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`flex-1 py-2.5 text-sm font-bold rounded-lg transition-all capitalize ${activeTab === tab ? 'shadow-sm' : 'hover:bg-white/50 dark:hover:bg-gray-700/50'
                    }`}
                  style={{
                    backgroundColor: activeTab === tab ? (isDark ? '#334155' : '#ffffff') : 'transparent',
                    color: activeTab === tab ? (isDark ? '#e2e8f0' : '#0f172a') : (isDark ? '#94a3b8' : '#64748b'),
                  }}
                >
                  {tab === 'events' ? '📅 Events Calendar' : '⭐ Kudos Feed'}
                </button>
              ))}
            </div>

            {/* Events Tab */}
            {activeTab === "events" && (
              <div className="space-y-6 animate-fade-in-up">
                {/* Upcoming Events */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {events.length === 0 ? (
                    <div className="col-span-full p-12 text-center" style={cardStyle}>
                      <span className="text-5xl block mb-4">📅</span>
                      <p className="font-bold text-lg" style={{ color: textPrimary }}>No upcoming events</p>
                      <p style={{ color: textSecondary }}>Stay tuned for future updates!</p>
                    </div>
                  ) : (
                    events.map((event, i) => (
                      <div
                        key={event.id}
                        className="group relative overflow-hidden transition-all hover:scale-[1.02] hover:shadow-lg"
                        style={{ ...cardStyle, animationDelay: `${i * 0.1}s` }}
                      >
                        {/* Event Stripe */}
                        <div className="absolute top-0 left-0 w-1.5 h-full" style={{ backgroundColor: getEventTypeStyle(event.type).bg }}></div>

                        <div className="p-6 pl-8">
                          <div className="flex justify-between items-start mb-4">
                            <span
                              className="px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1.5 border"
                              style={{
                                backgroundColor: getEventTypeStyle(event.type).bg,
                                color: getEventTypeStyle(event.type).color,
                                borderColor: `${getEventTypeStyle(event.type).color}20`
                              }}
                            >
                              {getEventTypeStyle(event.type).icon} {event.type.charAt(0).toUpperCase() + event.type.slice(1)}
                            </span>
                            {canManageEvents && (
                              <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button
                                  onClick={() => openEditEventModal(event)}
                                  className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                                  title="Edit"
                                >
                                  ✏️
                                </button>
                                <button
                                  onClick={() => {
                                    if (window.confirm('Delete this event?')) deleteEvent(event.id).then(fetchData);
                                  }}
                                  className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-red-500 transition-colors"
                                  title="Delete"
                                >
                                  🗑️
                                </button>
                              </div>
                            )}
                          </div>

                          <h3 className="text-xl font-bold mb-2 line-clamp-1" style={{ color: textPrimary }}>{event.title}</h3>

                          <div className="space-y-2 mb-6">
                            <div className="flex items-center gap-2 text-sm" style={{ color: textSecondary }}>
                              <span>📅</span>
                              <span className="font-medium">{new Date(event.date).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm" style={{ color: textSecondary }}>
                              <span>⏰</span>
                              <span>{event.time}</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm" style={{ color: textSecondary }}>
                              <span>📍</span>
                              <span>{event.location}</span>
                            </div>
                          </div>

                          {event.description && (
                            <p className="text-sm mb-6 line-clamp-2" style={{ color: textSecondary }}>
                              {event.description}
                            </p>
                          )}

                          {/* RSVP Section */}
                          {event.rsvp && (
                            <div className="flex items-center justify-between pt-4 border-t" style={{ borderColor: isDark ? '#334155' : '#f1f5f9' }}>
                              <div className="flex -space-x-2">
                                {[...Array(Math.min(3, event.attending))].map((_, i) => (
                                  <div
                                    key={i}
                                    className="w-8 h-8 rounded-full border-2 flex items-center justify-center text-xs bg-gray-100"
                                    style={{ borderColor: isDark ? '#1e293b' : '#ffffff', color: navyBlue }}
                                  >
                                    👤
                                  </div>
                                ))}
                                {event.attending > 3 && (
                                  <div
                                    className="w-8 h-8 rounded-full border-2 flex items-center justify-center text-xs font-bold bg-gray-50"
                                    style={{ borderColor: isDark ? '#1e293b' : '#ffffff', color: textSecondary }}
                                  >
                                    +{event.attending - 3}
                                  </div>
                                )}
                              </div>
                              <button
                                onClick={() => handleRSVP(event.id)}
                                className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${rsvpStatus[event.id]
                                    ? 'bg-green-100 text-green-700 hover:bg-green-200'
                                    : 'bg-blue-50 text-blue-600 hover:bg-blue-100'
                                  }`}
                              >
                                {rsvpStatus[event.id] ? "✓ Going" : "Join Event"}
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            {/* Kudos Tab */}
            {activeTab === "kudos" && (
              <div className="space-y-4 animate-fade-in-up">
                {kudos.length === 0 ? (
                  <div className="p-12 text-center" style={cardStyle}>
                    <span className="text-5xl block mb-4">🌟</span>
                    <p className="font-bold text-lg" style={{ color: textPrimary }}>No kudos yet</p>
                    <p style={{ color: textSecondary }}>Be the first to recognize a colleague!</p>
                  </div>
                ) : (
                  kudos.map((kudo, i) => (
                    <div
                      key={kudo.id}
                      className="p-5 hover:scale-[1.005] transition-all"
                      style={{ ...cardStyle, animationDelay: `${i * 0.1}s` }}
                    >
                      <div className="flex items-start gap-4">
                        <div
                          className="w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold text-white flex-shrink-0"
                          style={{ background: `linear-gradient(135deg, ${navyBlue}, #2563eb)` }}
                        >
                          {(kudo.from?.name || "U").charAt(0)}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-bold" style={{ color: textPrimary }}>{kudo.from?.name}</span>
                            <span style={{ color: textSecondary }}>→</span>
                            <span className="font-bold" style={{ color: navyBlue }}>{kudo.to?.name}</span>
                            <span
                              className="px-2 py-0.5 rounded-full text-xs font-medium"
                              style={{ backgroundColor: `${navyBlue}15`, color: navyBlue }}
                            >
                              {kudo.badge}
                            </span>
                          </div>
                          <p className="mb-3" style={{ color: textPrimary }}>{kudo.message}</p>
                          <div className="flex items-center gap-4">
                            <button
                              onClick={() => handleLikeKudo(kudo.id)}
                              className="flex items-center gap-1 text-sm bg-transparent border-none cursor-pointer hover:opacity-70 transition-all font-medium"
                              style={{ color: kudo.isLiked ? "#dc2626" : textSecondary }}
                            >
                              {kudo.isLiked ? "❤️" : "🤍"} {kudo.likes}
                            </button>
                            <button
                              className="flex items-center gap-1 text-sm bg-transparent border-none cursor-pointer hover:opacity-70 transition-all"
                              style={{ color: textSecondary }}
                              onClick={() => setExpandedComments(prev => ({ ...prev, [kudo.id]: !prev[kudo.id] }))}
                            >
                              💬 {kudo.commentsCount || 0}
                            </button>
                            <span className="text-xs" style={{ color: textSecondary }}>{kudo.date}</span>
                          </div>

                          {/* Comments Section */}
                          {expandedComments[kudo.id] && (
                            <div className="mt-4 pt-4 space-y-3" style={{ borderTop: `1px solid ${isDark ? '#334155' : '#f1f5f9'}` }}>
                              {/* Comment List */}
                              {(kudo.comments || []).map((comment) => (
                                <div key={comment.id} className="text-sm">
                                  <span className="font-bold" style={{ color: textPrimary }}>{comment.userName}: </span>
                                  <span style={{ color: textPrimary }}>{comment.text}</span>
                                  <div className="text-[10px] mt-0.5" style={{ color: textSecondary }}>{comment.date}</div>
                                </div>
                              ))}

                              {/* Comment Input */}
                              <div className="flex gap-2 mt-3">
                                <input
                                  type="text"
                                  placeholder="Add a comment..."
                                  value={commentInputs[kudo.id] || ""}
                                  onChange={(e) => setCommentInputs(prev => ({ ...prev, [kudo.id]: e.target.value }))}
                                  onKeyPress={(e) => e.key === 'Enter' && handleCommentKudo(kudo.id)}
                                  className="flex-1 px-3 py-1.5 rounded-lg text-sm outline-none transition-all focus:ring-1 focus:ring-purple-400"
                                  style={{ backgroundColor: isDark ? '#334155' : '#f8fafc', border: `1px solid ${isDark ? '#475569' : '#e2e8f0'}`, color: textPrimary }}
                                />
                                <button
                                  onClick={() => handleCommentKudo(kudo.id)}
                                  disabled={!commentInputs[kudo.id]?.trim()}
                                  className="p-1.5 rounded-lg text-white disabled:opacity-50 transition-all"
                                  style={{ backgroundColor: navyBlue }}
                                >
                                  ✈️
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </>
        )}
      </div>

      {/* Create/Edit Event Modal */}
      {showEventModal && (
        <div
          className="fixed inset-0 flex items-center justify-center z-50 animate-fade-in p-4"
          style={{
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            backdropFilter: 'blur(8px)',
            WebkitBackdropFilter: 'blur(8px)'
          }}
        >
          <div
            className="w-full max-w-2xl animate-scale-in"
            style={{
              backgroundColor: isDark ? '#1e293b' : '#ffffff',
              borderRadius: '24px',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
              maxHeight: '85vh',
              overflow: 'hidden'
            }}
          >
            {/* Modal Header */}
            <div
              className="p-6"
              style={{
                background: `linear-gradient(135deg, ${navyBlue} 0%, #2563eb 100%)`,
              }}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center text-2xl">
                    {editingEvent ? "✏️" : "📅"}
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-white">
                      {editingEvent ? "Edit Event" : "Create New Event"}
                    </h2>
                    <p className="text-blue-200 text-sm">
                      {editingEvent ? "Update event details" : "Schedule a new company event"}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto" style={{ maxHeight: 'calc(85vh - 100px)' }}>

              <div className="space-y-4">
                {/* Event Title */}
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: textPrimary }}>Event Title *</label>
                  <input
                    type="text"
                    value={eventForm.title}
                    onChange={(e) => setEventForm({ ...eventForm, title: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl outline-none"
                    style={{ backgroundColor: isDark ? '#334155' : '#f8fafc', border: `1px solid ${isDark ? '#475569' : '#e2e8f0'}`, color: textPrimary }}
                    placeholder="e.g., Team Building Event"
                    required
                  />
                </div>

                {/* Event Type */}
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: textPrimary }}>Event Type *</label>
                  <div className="grid grid-cols-3 gap-2">
                    {eventTypes.map((type) => (
                      <button
                        key={type.id}
                        type="button"
                        onClick={() => setEventForm({ ...eventForm, type: type.id })}
                        className="p-3 rounded-xl text-center transition-all"
                        style={{
                          backgroundColor: eventForm.type === type.id ? `${navyBlue}15` : (isDark ? '#334155' : '#f8fafc'),
                          border: `2px solid ${eventForm.type === type.id ? navyBlue : 'transparent'}`,
                          color: textPrimary
                        }}
                      >
                        <span className="text-xl block mb-1">{type.icon}</span>
                        <span className="text-xs">{type.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Date and Time */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: textPrimary }}>Date *</label>
                    <input
                      type="date"
                      value={eventForm.date}
                      onChange={(e) => setEventForm({ ...eventForm, date: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl outline-none"
                      style={{ backgroundColor: isDark ? '#334155' : '#f8fafc', border: `1px solid ${isDark ? '#475569' : '#e2e8f0'}`, color: textPrimary }}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: textPrimary }}>Time *</label>
                    <input
                      type="time"
                      value={eventForm.time}
                      onChange={(e) => setEventForm({ ...eventForm, time: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl outline-none"
                      style={{ backgroundColor: isDark ? '#334155' : '#f8fafc', border: `1px solid ${isDark ? '#475569' : '#e2e8f0'}`, color: textPrimary }}
                      required
                    />
                  </div>
                </div>

                {/* Location */}
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: textPrimary }}>Location *</label>
                  <input
                    type="text"
                    value={eventForm.location}
                    onChange={(e) => setEventForm({ ...eventForm, location: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl outline-none"
                    style={{ backgroundColor: isDark ? '#334155' : '#f8fafc', border: `1px solid ${isDark ? '#475569' : '#e2e8f0'}`, color: textPrimary }}
                    placeholder="e.g., Conference Room A, Virtual (Teams)"
                    required
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: textPrimary }}>Description</label>
                  <textarea
                    value={eventForm.description}
                    onChange={(e) => setEventForm({ ...eventForm, description: e.target.value })}
                    rows={3}
                    className="w-full px-4 py-3 rounded-xl outline-none resize-none"
                    style={{ backgroundColor: isDark ? '#334155' : '#f8fafc', border: `1px solid ${isDark ? '#475569' : '#e2e8f0'}`, color: textPrimary }}
                    placeholder="Describe the event..."
                  />
                </div>

                {/* RSVP Toggle */}
                <div className="flex items-center gap-3">
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={eventForm.rsvp}
                      onChange={(e) => setEventForm({ ...eventForm, rsvp: e.target.checked })}
                      className="w-5 h-5 rounded"
                    />
                    <span className="ml-2 text-sm font-medium" style={{ color: textPrimary }}>
                      Enable RSVP for this event
                    </span>
                  </label>
                </div>

                {/* Actions */}
                <div className="flex gap-4 pt-6 mt-6" style={{ borderTop: `1px solid ${isDark ? '#334155' : '#e2e8f0'}` }}>
                  <button
                    onClick={() => setShowEventModal(false)}
                    className="flex-1 py-4 rounded-xl font-semibold transition-all hover:opacity-80"
                    style={{ backgroundColor: isDark ? '#334155' : '#f1f5f9', color: textPrimary }}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveEvent}
                    className="flex-1 py-4 rounded-xl font-bold text-white transition-all hover:opacity-90"
                    style={{
                      background: 'linear-gradient(135deg, #16a34a 0%, #22c55e 100%)',
                      boxShadow: '0 4px 15px rgba(22, 163, 74, 0.4)'
                    }}
                    disabled={!eventForm.title || !eventForm.date || !eventForm.time || !eventForm.location}
                  >
                    {editingEvent ? "💾 Save Changes" : "🎉 Create Event"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Give Kudos Modal */}
      {showKudosModal && (
        <div
          className="fixed inset-0 flex items-center justify-center z-50 animate-fade-in p-4"
          style={{
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            backdropFilter: 'blur(8px)',
            WebkitBackdropFilter: 'blur(8px)'
          }}
        >
          <div
            className="w-full max-w-xl animate-scale-in"
            style={{
              backgroundColor: isDark ? '#1e293b' : '#ffffff',
              borderRadius: '24px',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
              overflow: 'hidden'
            }}
          >
            {/* Modal Header */}
            <div
              className="p-6"
              style={{
                background: 'linear-gradient(135deg, #7c3aed 0%, #a855f7 100%)',
              }}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center text-2xl">
                    ⭐
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-white">Give Kudos</h2>
                    <p className="text-purple-200 text-sm">Recognize your colleague's achievements</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-5">
              <div>
                <label className="block text-sm font-semibold mb-2" style={{ color: textPrimary }}>🎯 Recognize</label>
                <select
                  value={kudosForm.to}
                  onChange={(e) => setKudosForm({ ...kudosForm, to: e.target.value })}
                  className="w-full px-4 py-4 rounded-xl outline-none transition-all focus:ring-2 focus:ring-purple-400"
                  style={{ backgroundColor: isDark ? '#334155' : '#f8fafc', border: `1px solid ${isDark ? '#475569' : '#e2e8f0'}`, color: textPrimary }}
                  required
                >
                  <option value="">Select a colleague...</option>
                  {employees.map(emp => (
                    <option key={emp._id} value={emp._id}>{emp.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold mb-3" style={{ color: textPrimary }}>🏆 Select Badge</label>
                <div className="grid grid-cols-3 gap-3">
                  {badges.map((badge) => (
                    <button
                      key={badge.label}
                      onClick={() => setKudosForm({ ...kudosForm, badge: badge.label })}
                      className="p-4 rounded-xl text-center transition-all hover:scale-105"
                      style={{
                        backgroundColor: kudosForm.badge === badge.label ? 'rgba(124, 58, 237, 0.15)' : (isDark ? '#334155' : '#f8fafc'),
                        border: `2px solid ${kudosForm.badge === badge.label ? '#7c3aed' : 'transparent'}`,
                        color: textPrimary,
                        boxShadow: kudosForm.badge === badge.label ? '0 4px 15px rgba(124, 58, 237, 0.3)' : 'none'
                      }}
                    >
                      <span className="text-3xl block mb-2">{badge.emoji}</span>
                      <span className="text-xs font-medium">{badge.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2" style={{ color: textPrimary }}>💬 Message</label>
                <textarea
                  value={kudosForm.message}
                  onChange={(e) => setKudosForm({ ...kudosForm, message: e.target.value })}
                  rows={4}
                  className="w-full px-4 py-4 rounded-xl outline-none resize-none transition-all focus:ring-2 focus:ring-purple-400"
                  style={{ backgroundColor: isDark ? '#334155' : '#f8fafc', border: `1px solid ${isDark ? '#475569' : '#e2e8f0'}`, color: textPrimary }}
                  placeholder="Write your appreciation message..."
                />
              </div>

              <div className="flex gap-4 pt-4" style={{ borderTop: `1px solid ${isDark ? '#334155' : '#e2e8f0'}` }}>
                <button
                  onClick={() => setShowKudosModal(false)}
                  className="flex-1 py-4 rounded-xl font-semibold transition-all hover:opacity-80"
                  style={{ backgroundColor: isDark ? '#334155' : '#f1f5f9', color: textPrimary }}
                >
                  Cancel
                </button>
                <button
                  onClick={handlePostKudos}
                  className="flex-1 py-4 rounded-xl font-bold text-white transition-all hover:opacity-90"
                  style={{
                    background: 'linear-gradient(135deg, #7c3aed 0%, #a855f7 100%)',
                    boxShadow: '0 4px 15px rgba(124, 58, 237, 0.4)'
                  }}
                >
                  🎉 Post Kudos
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
