import React, { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";

// Mock events data - 2026 Holidays Calendar
const initialEvents = [
  // 2026 Holidays
  { 
    id: 1, 
    title: "New Year's Day", 
    date: "2026-01-01", 
    time: "All Day", 
    location: "Office", 
    type: "holiday", 
    description: "New Year's Day will be observed as a holiday; however, all employees are required to log in for a 2-hour session for celebration and annual planning from 4:00 PM to 6:00 PM IST.", 
    rsvp: false, 
    attending: 0, 
    createdBy: "HR Team",
    isOptional: false,
    specialNote: "2-hour session required: 4:00 PM - 6:00 PM IST"
  },
  { 
    id: 2, 
    title: "Pongal", 
    date: "2026-01-14", 
    time: "All Day", 
    location: "Office", 
    type: "holiday", 
    description: "Pongal - Optional holiday", 
    rsvp: false, 
    attending: 0, 
    createdBy: "HR Team",
    isOptional: true
  },
  { 
    id: 3, 
    title: "Founders Day", 
    date: "2026-01-20", 
    time: "Half Day (Second Half)", 
    location: "Office", 
    type: "holiday", 
    description: "Founders Day will be a half-day holiday (second half). Employees must sign in and work during the first half of the day.", 
    rsvp: false, 
    attending: 0, 
    createdBy: "HR Team",
    isOptional: false,
    specialNote: "Half-day holiday - Work required in first half"
  },
  { 
    id: 4, 
    title: "Republic Day", 
    date: "2026-01-26", 
    time: "All Day", 
    location: "Office", 
    type: "holiday", 
    description: "Republic Day - National holiday", 
    rsvp: false, 
    attending: 0, 
    createdBy: "HR Team",
    isOptional: false
  },
  { 
    id: 5, 
    title: "Maha Shivaratri", 
    date: "2026-02-16", 
    time: "All Day", 
    location: "Office", 
    type: "holiday", 
    description: "Maha Shivaratri - Optional holiday", 
    rsvp: false, 
    attending: 0, 
    createdBy: "HR Team",
    isOptional: true
  },
  { 
    id: 6, 
    title: "Holi", 
    date: "2026-03-04", 
    time: "All Day", 
    location: "Office", 
    type: "holiday", 
    description: "Holi - Optional holiday", 
    rsvp: false, 
    attending: 0, 
    createdBy: "HR Team",
    isOptional: true
  },
  { 
    id: 7, 
    title: "Ramzan Id / Eid-ul-Fitr", 
    date: "2026-03-20", 
    time: "All Day", 
    location: "Office", 
    type: "holiday", 
    description: "Ramzan Id / Eid-ul-Fitr - Optional holiday", 
    rsvp: false, 
    attending: 0, 
    createdBy: "HR Team",
    isOptional: true
  },
  { 
    id: 8, 
    title: "Good Friday", 
    date: "2026-04-03", 
    time: "All Day", 
    location: "Office", 
    type: "holiday", 
    description: "Good Friday - Public holiday", 
    rsvp: false, 
    attending: 0, 
    createdBy: "HR Team",
    isOptional: false
  },
  { 
    id: 9, 
    title: "Buddha Purnima", 
    date: "2026-05-01", 
    time: "All Day", 
    location: "Office", 
    type: "holiday", 
    description: "Buddha Purnima - Public holiday", 
    rsvp: false, 
    attending: 0, 
    createdBy: "HR Team",
    isOptional: false
  },
  { 
    id: 10, 
    title: "Independence Day", 
    date: "2026-08-15", 
    time: "All Day", 
    location: "Office", 
    type: "holiday", 
    description: "Independence Day - National holiday", 
    rsvp: false, 
    attending: 0, 
    createdBy: "HR Team",
    isOptional: false
  },
  { 
    id: 11, 
    title: "Ganesh Chaturthi", 
    date: "2026-09-14", 
    time: "All Day", 
    location: "Office", 
    type: "holiday", 
    description: "Ganesh Chaturthi - Optional holiday", 
    rsvp: false, 
    attending: 0, 
    createdBy: "HR Team",
    isOptional: true
  },
  { 
    id: 12, 
    title: "Mahatma Gandhi Jayanti", 
    date: "2026-10-02", 
    time: "All Day", 
    location: "Office", 
    type: "holiday", 
    description: "Mahatma Gandhi Jayanti - National holiday", 
    rsvp: false, 
    attending: 0, 
    createdBy: "HR Team",
    isOptional: false
  },
  { 
    id: 13, 
    title: "Dussehra", 
    date: "2026-10-20", 
    time: "All Day", 
    location: "Office", 
    type: "holiday", 
    description: "Dussehra - Public holiday", 
    rsvp: false, 
    attending: 0, 
    createdBy: "HR Team",
    isOptional: false
  },
  { 
    id: 14, 
    title: "Diwali", 
    date: "2026-11-08", 
    time: "All Day", 
    location: "Office", 
    type: "holiday", 
    description: "Diwali - Festival of Lights", 
    rsvp: false, 
    attending: 0, 
    createdBy: "HR Team",
    isOptional: false
  },
  { 
    id: 15, 
    title: "Diwali", 
    date: "2026-11-09", 
    time: "All Day", 
    location: "Office", 
    type: "holiday", 
    description: "Diwali - Festival of Lights (Day 2)", 
    rsvp: false, 
    attending: 0, 
    createdBy: "HR Team",
    isOptional: false
  },
  { 
    id: 16, 
    title: "Christmas Day", 
    date: "2026-12-25", 
    time: "All Day", 
    location: "Office", 
    type: "holiday", 
    description: "Christmas Day - Optional holiday", 
    rsvp: false, 
    attending: 0, 
    createdBy: "HR Team",
    isOptional: true
  },
];

// Mock kudos feed
const mockKudos = [
  { id: 1, from: "Ravi Sharma", to: "Asha Kumar", message: "Great work on the dashboard project! Your attention to detail is impressive. 🌟", date: "2024-12-10", likes: 12, comments: 3, badge: "⭐ Star Performer" },
  { id: 2, from: "Priya Verma", to: "Rahul Singh", message: "Thank you for helping me with the code review. Learned a lot! 🙏", date: "2024-12-09", likes: 8, comments: 1, badge: "🤝 Team Player" },
  { id: 3, from: "Anita Patel", to: "Vikram Kumar", message: "Amazing presentation skills! You nailed the client demo. 💪", date: "2024-12-08", likes: 15, comments: 5, badge: "🎤 Great Communicator" },
  { id: 4, from: "Suresh Reddy", to: "Meena Sharma", message: "Your dedication to customer support is remarkable. Keep it up! 💯", date: "2024-12-07", likes: 20, comments: 4, badge: "❤️ Customer Hero" },
];

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
  // Sort events by date (earliest first)
  const sortedEvents = [...initialEvents].sort((a, b) => new Date(a.date) - new Date(b.date));
  const [events, setEvents] = useState(sortedEvents);
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

  const handleRSVP = (eventId) => {
    setRsvpStatus({ ...rsvpStatus, [eventId]: !rsvpStatus[eventId] });
  };

  const handlePostKudos = () => {
    setShowKudosModal(false);
    setKudosForm({ to: "", message: "", badge: "" });
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

  const handleSaveEvent = () => {
    if (editingEvent) {
      // Update existing event
      setEvents(events.map(e => 
        e.id === editingEvent.id 
          ? { ...e, ...eventForm }
          : e
      ));
    } else {
      // Create new event
      const newEvent = {
        id: Date.now(),
        ...eventForm,
        attending: 0,
        createdBy: isAdmin ? "Admin" : "HR Team",
      };
      setEvents([newEvent, ...events]);
    }
    setShowEventModal(false);
    setEditingEvent(null);
  };

  const handleDeleteEvent = (eventId) => {
    if (window.confirm("Are you sure you want to delete this event?")) {
      setEvents(events.filter(e => e.id !== eventId));
    }
  };

  return (
    <div className="space-y-6" style={{ fontFamily: "'Outfit', sans-serif" }}>
      {/* Header */}
      <div className="flex items-center justify-between animate-fade-in-down">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: textPrimary }}>Events & Kudos</h1>
          <p style={{ color: textSecondary }}>Stay updated with company events and recognize your colleagues</p>
        </div>
        <div className="flex gap-3">
          {/* Create Event Button - Only for HR/Manager and Admin */}
          {canManageEvents && (
            <button
              onClick={openCreateEventModal}
              className="px-6 py-3 rounded-xl font-bold text-white flex items-center gap-2 transition-all hover:opacity-90"
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

      {/* Stats for HR/Admin */}
      {canManageEvents && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 animate-fade-in-up">
          {[
            { label: "Total Events", value: events.length, color: "#2563eb", icon: "📅" },
            { label: "Upcoming", value: events.filter(e => new Date(e.date) >= new Date()).length, color: "#16a34a", icon: "🗓️" },
            { label: "Total RSVPs", value: events.reduce((acc, e) => acc + e.attending, 0), color: "#7c3aed", icon: "👥" },
            { label: "Kudos This Month", value: mockKudos.length, color: "#ea580c", icon: "⭐" },
          ].map((stat, i) => (
            <div key={i} className="p-5 hover-lift" style={cardStyle}>
              <div className="flex items-center justify-between">
                <div>
                  <p style={{ color: textSecondary }} className="text-sm font-medium">{stat.label}</p>
                  <p style={{ color: textPrimary }} className="text-3xl font-bold mt-1">{stat.value}</p>
                </div>
                <div className="w-12 h-12 rounded-xl flex items-center justify-center text-xl" style={{ backgroundColor: `${stat.color}20` }}>
                  {stat.icon}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-2 p-1 rounded-xl animate-fade-in-up" style={{ backgroundColor: isDark ? '#1e293b' : '#f1f5f9' }}>
        {[
          { id: "events", label: "Events Calendar", icon: "📅" },
          { id: "kudos", label: "Kudos Feed", icon: "⭐" },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className="flex-1 py-3 px-4 rounded-xl font-semibold transition-all flex items-center justify-center gap-2"
            style={{
              backgroundColor: activeTab === tab.id ? navyBlue : 'transparent',
              color: activeTab === tab.id ? '#ffffff' : textSecondary,
            }}
          >
            <span>{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </div>

      {/* Events Tab */}
      {activeTab === "events" && (
        <div className="space-y-4 animate-fade-in-up">
          {/* Upcoming Events */}
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold" style={{ color: textPrimary }}>Upcoming Events</h2>
            <span className="text-sm" style={{ color: textSecondary }}>{events.length} events</span>
          </div>
          
          {events.length === 0 ? (
            <div className="p-12 text-center" style={cardStyle}>
              <span className="text-5xl block mb-4">📅</span>
              <p className="font-bold text-lg" style={{ color: textPrimary }}>No events scheduled</p>
              <p style={{ color: textSecondary }}>
                {canManageEvents ? "Create your first event!" : "Check back later for upcoming events."}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {events.map((event, i) => {
                const typeStyle = getEventTypeStyle(event.type);
                const isRsvped = rsvpStatus[event.id];
                return (
                  <div 
                    key={event.id} 
                    className="p-5 hover:scale-[1.01] transition-all"
                    style={{ ...cardStyle, animationDelay: `${i * 0.1}s` }}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div 
                          className="w-12 h-12 rounded-xl flex items-center justify-center text-xl"
                          style={{ backgroundColor: typeStyle.bg }}
                        >
                          {typeStyle.icon}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-bold" style={{ color: textPrimary }}>{event.title}</h3>
                            {event.isOptional && (
                              <span 
                                className="px-2 py-0.5 rounded-full text-xs font-medium"
                                style={{ backgroundColor: '#fef3c7', color: '#d97706' }}
                              >
                                Optional
                              </span>
                            )}
                          </div>
                          <p className="text-sm" style={{ color: textSecondary }}>{event.date} • {event.time}</p>
                          {event.specialNote && (
                            <p className="text-xs mt-1 font-medium" style={{ color: '#dc2626' }}>
                              ⚠️ {event.specialNote}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span 
                          className="px-3 py-1 rounded-full text-xs font-medium capitalize"
                          style={{ backgroundColor: typeStyle.bg, color: typeStyle.color }}
                        >
                          {event.type}
                        </span>
                        {/* Edit/Delete buttons for HR/Admin */}
                        {canManageEvents && (
                          <div className="flex gap-1">
                            <button
                              onClick={() => openEditEventModal(event)}
                              className="w-8 h-8 rounded-lg flex items-center justify-center text-sm transition-all hover:opacity-80"
                              style={{ backgroundColor: isDark ? '#334155' : '#f1f5f9' }}
                              title="Edit Event"
                            >
                              ✏️
                            </button>
                            <button
                              onClick={() => handleDeleteEvent(event.id)}
                              className="w-8 h-8 rounded-lg flex items-center justify-center text-sm transition-all hover:opacity-80"
                              style={{ backgroundColor: '#fee2e2' }}
                              title="Delete Event"
                            >
                              🗑️
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <p className="text-sm mb-3" style={{ color: textSecondary }}>{event.description}</p>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-2 text-sm" style={{ color: textSecondary }}>
                          <span>📍 {event.location}</span>
                          <span>•</span>
                          <span>👥 {event.attending} attending</span>
                        </div>
                        <span className="text-xs" style={{ color: textSecondary }}>
                          Created by {event.createdBy}
                        </span>
                      </div>
                      {event.rsvp && (
                        <button
                          onClick={() => handleRSVP(event.id)}
                          className="px-4 py-2 rounded-xl text-sm font-semibold transition-all"
                          style={{
                            backgroundColor: isRsvped ? "#dcfce7" : (isDark ? '#334155' : '#f1f5f9'),
                            color: isRsvped ? "#16a34a" : textPrimary
                          }}
                        >
                          {isRsvped ? "✓ Going" : "RSVP"}
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Kudos Tab */}
      {activeTab === "kudos" && (
        <div className="space-y-4 animate-fade-in-up">
          {mockKudos.map((kudo, i) => (
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
                  {kudo.from.charAt(0)}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-bold" style={{ color: textPrimary }}>{kudo.from}</span>
                    <span style={{ color: textSecondary }}>→</span>
                    <span className="font-bold" style={{ color: navyBlue }}>{kudo.to}</span>
                    <span 
                      className="px-2 py-0.5 rounded-full text-xs font-medium"
                      style={{ backgroundColor: `${navyBlue}15`, color: navyBlue }}
                    >
                      {kudo.badge}
                    </span>
                  </div>
                  <p className="mb-3" style={{ color: textPrimary }}>{kudo.message}</p>
                  <div className="flex items-center gap-4">
                    <button className="flex items-center gap-1 text-sm" style={{ color: textSecondary }}>
                      ❤️ {kudo.likes}
                    </button>
                    <button className="flex items-center gap-1 text-sm" style={{ color: textSecondary }}>
                      💬 {kudo.comments}
                    </button>
                    <span className="text-xs" style={{ color: textSecondary }}>{kudo.date}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

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
                <input
                  type="text"
                  value={kudosForm.to}
                  onChange={(e) => setKudosForm({ ...kudosForm, to: e.target.value })}
                  className="w-full px-4 py-4 rounded-xl outline-none transition-all focus:ring-2 focus:ring-purple-400"
                  style={{ backgroundColor: isDark ? '#334155' : '#f8fafc', border: `1px solid ${isDark ? '#475569' : '#e2e8f0'}`, color: textPrimary }}
                  placeholder="Search colleague name..."
                />
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
    </div>
  );
}
