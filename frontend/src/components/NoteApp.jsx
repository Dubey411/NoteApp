import React, { useState, useEffect, useRef } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Swal from "sweetalert2";
import api from "../api/client";

import {
  Search,
  Plus,
  Edit3,
  Trash2,
  Save,
  X,
  Star,
  Archive,
  Tag,
  Filter,
  Moon,
  Sun,
  Grid,
  List,
  Sparkles,
  Zap,
  Heart,
  Coffee,
  Lightbulb,
  Music,
  Camera,
  Palette,
  Rocket,
  Crown,
  Flame,
  Menu,
  LogOut,
  Mic,
  MicOff,
  Share2,
  Pin,
  Wand2,
  RotateCcw,
  Copy,
  Check,
  CheckSquare,
} from "lucide-react";

const App = () => {
  const [notes, setNotes] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [editingNote, setEditingNote] = useState(null);
  const [isCreating, setIsCreating] = useState(false);
  const [newNote, setNewNote] = useState({
    title: "",
    content: "",
    color: "blue",
    tags: [],
    starred: false,
  });
  // Initialize dark mode from localStorage or default to false
   const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem('darkMode');
    return saved ? JSON.parse(saved) : false;
  });
  const [viewMode, setViewMode] = useState("grid");
  const [filterTag, setFilterTag] = useState("");
  const [showArchived, setShowArchived] = useState(false);
  const [showTrash, setShowTrash] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isAILoading, setIsAILoading] = useState(false);
  const [draggedNote, setDraggedNote] = useState(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isTyping, setIsTyping] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [activeNoteAnimation, setActiveNoteAnimation] = useState(null);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [wordCount, setWordCount] = useState(0);
  const [charCount, setCharCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [showEditor, setShowEditor] = useState(false);
  const fileInputRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const colors = [
    {
      name: "blue",
      bg: "from-blue-400 via-blue-500 to-blue-600",
      light: "bg-blue-50 border-blue-200",
      shadow: "shadow-blue-500/30",
      glow: "shadow-blue-500/50",
    },
    {
      name: "purple",
      bg: "from-purple-400 via-purple-500 to-purple-600",
      light: "bg-purple-50 border-purple-200",
      shadow: "shadow-purple-500/30",
      glow: "shadow-purple-500/50",
    },
    {
      name: "pink",
      bg: "from-pink-400 via-pink-500 to-pink-600",
      light: "bg-pink-50 border-pink-200",
      shadow: "shadow-pink-500/30",
      glow: "shadow-pink-500/50",
    },
    {
      name: "green",
      bg: "from-green-400 via-green-500 to-green-600",
      light: "bg-green-50 border-green-200",
      shadow: "shadow-green-500/30",
      glow: "shadow-green-500/50",
    },
    {
      name: "orange",
      bg: "from-orange-400 via-orange-500 to-orange-600",
      light: "bg-orange-50 border-orange-200",
      shadow: "shadow-orange-500/30",
      glow: "shadow-orange-500/50",
    },
    {
      name: "teal",
      bg: "from-teal-400 via-teal-500 to-teal-600",
      light: "bg-teal-50 border-teal-200",
      shadow: "shadow-teal-500/30",
      glow: "shadow-teal-500/50",
    },
    {
      name: "red",
      bg: "from-red-400 via-red-500 to-red-600",
      light: "bg-red-50 border-red-200",
      shadow: "shadow-red-500/30",
      glow: "shadow-red-500/50",
    },
    {
      name: "indigo",
      bg: "from-indigo-400 via-indigo-500 to-indigo-600",
      light: "bg-indigo-50 border-indigo-200",
      shadow: "shadow-indigo-500/30",
      glow: "shadow-indigo-500/50",
    },
  ];

  const icons = [
    Sparkles,
    Zap,
    Heart,
    Coffee,
    Lightbulb,
    Music,
    Camera,
    Palette,
    Rocket,
    Crown,
    Flame,
  ];

  // Save dark mode to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem("darkMode", JSON.stringify(darkMode));
  }, [darkMode]);

 

  // Mouse tracking for dynamic effects
  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  // Current time updates
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const fetchNotes = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          setError("No token found. Please login.");
          setLoading(false);
          return;
        }

        setLoading(true);
        const endpoint = showTrash ? "/api/notes/trash" : "/api/notes";
        const res = await api.get(endpoint);

        if (Array.isArray(res.data)) {
          setNotes(res.data);
          setError("");
        } else {
          setError("Unexpected response from server");
        }
      } catch (err) {
        console.error(
          "Failed to fetch notes:",
          err.response?.data || err.message
        );
        setError(err.response?.data?.msg || "Failed to fetch notes");
      } finally {
        setLoading(false);
      }
    };

    fetchNotes();
  }, [showTrash]);

  // Typing indicator logic
  useEffect(() => {
    if (isCreating || editingNote) {
      setIsTyping(true);
      clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = setTimeout(() => {
        setIsTyping(false);
      }, 2000);
    }
  }, [newNote.content, editingNote?.content]);

  // Word and character count
  useEffect(() => {
    const content = isCreating ? newNote.content : editingNote?.content || "";
    setWordCount(
      content
        .trim()
        .split(/\s+/)
        .filter((word) => word.length > 0).length
    );
    setCharCount(content.length);
  }, [newNote.content, editingNote?.content, isCreating]);

  // Auto-hide mobile editor on desktop
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1280) {
        setShowEditor(false);
      }
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Get all unique tags
  const allTags = [...new Set(notes.flatMap((note) => note.tags))];

  // Filter notes
  const filteredNotes = notes.filter((note) => {
    const matchesSearch =
      note.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      note.content.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesTag = !filterTag || note.tags.includes(filterTag);
    if (showTrash) return matchesSearch && matchesTag;
    const matchesArchived = showArchived ? note.archived : !note.archived;
    return matchesSearch && matchesTag && matchesArchived;
  });

  // Sort notes (pinned first, then starred, then by updated date)
  const sortedNotes = filteredNotes.sort((a, b) => {
    if (a.pinned && !b.pinned) return -1;
    if (!a.pinned && b.pinned) return 1;
    if (a.starred && !b.starred) return -1;
    if (!a.starred && b.starred) return 1;
    return new Date(b.updatedAt || b.createdAt) - new Date(a.updatedAt || a.createdAt);
  });

  const getColorClasses = (colorName) => {
    return colors.find((c) => c.name === colorName) || colors[0];
  };

  const getRandomIcon = () => {
    return icons[Math.floor(Math.random() * icons.length)];
  };

  const triggerConfetti = () => {
    setShowConfetti(true);
    setTimeout(() => setShowConfetti(false), 3000);
  };

  // Updated toggle function that saves to localStorage
  const toggleDarkMode = () => {
    setDarkMode((prevMode) => !prevMode);
  };

  // const handleLogout = () => {
  //   // Clear localStorage
  //   localStorage.removeItem("token");
  //   // Show success message
  //   toast.success("👋 Logged out successfully!");
  //   // Redirect to login page after a short delay
  //   setTimeout(() => {
  //     window.location.href = "/login"; // or use React Router navigation
  //   }, 1500);
  // };

  const handleLogout = () => {
  // Clear localStorage
  localStorage.removeItem("token");
  localStorage.removeItem("user");

  // Show nice popup
  Swal.fire({
    icon: "success",
    title: "Logged out 👋",
    text: "You have been logged out successfully!",
    showConfirmButton: false,
    timer: 1500,
      backdrop: `rgba(0,0,0,0.4)`, // keeps dim background
  customClass: {
    popup: 'transparent-swal'
  }
  });

  // Redirect to login after popup
  setTimeout(() => {
    window.location.href = "/login"; // or use navigate("/login") if using React Router
  }, 1600);
};

  const handleCreateNote = async () => {
    if (!newNote.title.trim() && !newNote.content.trim()) return;

    try {
      setIsLoading(true);

      const res = await api.post("/api/notes", {
        title: newNote.title.trim() || "Untitled Masterpiece",
        content: newNote.content.trim(),
        color: newNote.color,
        tags: newNote.tags,
        starred: newNote.starred,
        pinned: newNote.pinned || false,
        archived: false,
        icon: getRandomIcon().name,
      });

      setNotes([res.data, ...notes]);
      setNewNote({
        title: "",
        content: "",
        color: "blue",
        tags: [],
        starred: false,
        pinned: false,
      });
      setIsCreating(false);
      setShowEditor(false);
      toast.success("✅ Note created!");
      triggerConfetti();
    } catch (err) {
      toast.error(err.response?.data?.msg || "❌ Failed to create note");
    } finally {
      setIsLoading(false);
    }
  };

  // ✅ Move note to trash (Soft delete)
  const handleDeleteNote = async (id) => {
    try {
      if (showTrash) {
        // In trash view, deleting means permanent delete
        await handlePermanentDelete(id);
        return;
      }

      await api.put(`/api/notes/${id}/trash`, { isTrash: true });
      setNotes(notes.filter((note) => note._id !== id));
      if (editingNote && editingNote._id === id) {
        setEditingNote(null);
        setShowEditor(false);
      }
      toast.info("🗑️ Note moved to Trash");
    } catch (err) {
      toast.error(err.response?.data?.msg || "❌ Failed to move to trash");
    }
  };

  // ✅ Restore note from trash
  const handleRestoreNote = async (id) => {
    try {
      await api.put(`/api/notes/${id}/trash`, { isTrash: false });
      setNotes(notes.filter((note) => note._id !== id));
      toast.success("♻️ Note restored to active notes!");
      triggerConfetti();
    } catch (err) {
      toast.error("Failed to restore note");
    }
  };

  // ✅ Permanent Delete
  const handlePermanentDelete = async (id) => {
    const result = await Swal.fire({
      title: "Delete permanently?",
      text: "This cannot be undone!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ef4444",
      confirmButtonText: "Yes, delete forever",
    });

    if (result.isConfirmed) {
      try {
        await api.delete(`/api/notes/${id}/permanent`);
        setNotes(notes.filter((note) => note._id !== id));
        if (editingNote && editingNote._id === id) {
          setEditingNote(null);
          setShowEditor(false);
        }
        toast.success("💥 Note permanently deleted");
      } catch (err) {
        toast.error("Failed to delete permanently");
      }
    }
  };

  const handleEditNote = (note) => {
    setEditingNote({ ...note });
    setIsCreating(false);
    setShowEditor(true);
  };

  // ✅ Update note (PUT to backend)
  const handleSaveNote = async () => {
    if (editingNote.title.trim() || editingNote.content.trim()) {
      try {
        setIsLoading(true);

        const res = await api.put(
          `/api/notes/${editingNote._id}`,
          editingNote
        );

        setNotes(
          notes.map((note) => (note._id === editingNote._id ? res.data : note))
        );
        setEditingNote(null);
        setShowEditor(false);
        toast.success("💾 Note saved!");
        triggerConfetti();
      } catch (err) {
        toast.error(err.response?.data?.msg || "❌ Failed to update note");
      } finally {
        setIsLoading(false);
      }
    }
  };

  // ✅ Toggle Pin (sticks note to top)
  const togglePin = async (id) => {
    try {
      const res = await api.put(`/api/notes/${id}/pin`);
      setNotes(notes.map((n) => (n._id === id ? res.data : n)));
      if (res.data.pinned) {
        toast.success("📌 Note pinned to top!");
        triggerConfetti();
      } else {
        toast.info("Note unpinned");
      }
    } catch (err) {
      toast.error("Failed to toggle pin");
    }
  };

  // ✅ Public Share Link
  const handleShareNote = async (note) => {
    try {
      const res = await api.put(`/api/notes/${note._id}/share`);
      const updated = res.data.note;
      setNotes(notes.map((n) => (n._id === note._id ? updated : n)));

      if (updated.isPublic && updated.shareId) {
        const publicUrl = `${window.location.origin}/share/${updated.shareId}`;
        await navigator.clipboard.writeText(publicUrl);
        await Swal.fire({
          icon: "success",
          title: "🔗 Public Link Generated!",
          html: `<p style="font-size: 14px; margin-bottom: 8px;">Anyone with this link can view this note without logging in.</p><input class="swal2-input" value="${publicUrl}" readonly style="font-size: 13px;" />`,
          confirmButtonText: "Link Copied! 👍",
        });
      } else {
        toast.info("Note is now private");
      }
    } catch (err) {
      toast.error("Failed to update sharing");
    }
  };

  // ✅ Toggle star/archived
  const toggleStar = async (id) => {
    try {
      const note = notes.find((n) => n._id === id);
      const res = await api.put(`/api/notes/${id}`, {
        ...note,
        starred: !note.starred,
      });

      setNotes(notes.map((n) => (n._id === id ? res.data : n)));
      if (!note.starred) triggerConfetti();
    } catch (err) {
      toast.error("❌ Failed to update star status");
    }
  };

  const toggleArchive = async (id) => {
    try {
      const note = notes.find((n) => n._id === id);
      const res = await api.put(`/api/notes/${id}`, {
        ...note,
        archived: !note.archived,
      });

      setNotes(notes.map((n) => (n._id === id ? res.data : n)));
    } catch (err) {
      toast.error("❌ Failed to update archive status");
    }
  };

  // 🎙️ Voice Dictation (Native Web Speech API)
  const handleVoiceDictate = () => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      toast.warn("Speech recognition isn't supported in this browser. Please try Chrome or Edge!");
      return;
    }

    if (isListening) {
      setIsListening(false);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = "en-US";

      recognition.onstart = () => {
        setIsListening(true);
        toast.info("🎙️ Listening... Speak your thoughts clearly!");
      };

      recognition.onend = () => setIsListening(false);
      recognition.onerror = (e) => {
        console.warn("Speech recognition error:", e);
        setIsListening(false);
      };

      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        if (isCreating) {
          setNewNote((prev) => ({
            ...prev,
            content: prev.content ? `${prev.content} ${transcript}` : transcript,
          }));
        } else if (editingNote) {
          setEditingNote((prev) => ({
            ...prev,
            content: prev.content ? `${prev.content} ${transcript}` : transcript,
          }));
        }
        toast.success("🎙️ Voice transcription added!");
      };

      recognition.start();
    } catch (err) {
      console.error("Speech recognition start failed:", err);
      setIsListening(false);
    }
  };

  // ✨ AI Note Assistant Handlers
  const handleAIPolish = async () => {
    const content = isCreating ? newNote.content : editingNote?.content;
    const title = isCreating ? newNote.title : editingNote?.title;
    if (!content?.trim()) {
      toast.warn("Write some notes first so AI can polish them!");
      return;
    }

    try {
      setIsAILoading(true);
      const res = await api.post("/api/ai/polish", { title, content });
      if (isCreating) {
        setNewNote((prev) => ({ ...prev, content: res.data.result }));
      } else {
        setEditingNote((prev) => ({ ...prev, content: res.data.result }));
      }
      toast.success("✨ Note polished with AI!");
      triggerConfetti();
    } catch (err) {
      toast.error("AI Polish failed");
    } finally {
      setIsAILoading(false);
    }
  };

  const handleAISummarize = async () => {
    const content = isCreating ? newNote.content : editingNote?.content;
    const title = isCreating ? newNote.title : editingNote?.title;
    if (!content?.trim()) {
      toast.warn("Note needs content to summarize!");
      return;
    }

    try {
      setIsAILoading(true);
      const res = await api.post("/api/ai/summarize", { title, content });
      const summaryText = `> 💡 **AI Summary**: ${res.data.summary}\n\n`;
      if (isCreating) {
        setNewNote((prev) => ({
          ...prev,
          content: `${summaryText}${prev.content}`,
        }));
      } else {
        setEditingNote((prev) => ({
          ...prev,
          aiSummary: res.data.summary,
          content: `${summaryText}${prev.content}`,
        }));
      }
      toast.success("📝 AI Summary generated!");
      triggerConfetti();
    } catch (err) {
      toast.error("AI Summarize failed");
    } finally {
      setIsAILoading(false);
    }
  };

  const handleAIExtractTasks = async () => {
    const content = isCreating ? newNote.content : editingNote?.content;
    if (!content?.trim()) {
      toast.warn("Write something first so AI can find action items!");
      return;
    }

    try {
      setIsAILoading(true);
      const res = await api.post("/api/ai/extract-tasks", { content });
      const taskBlock = `\n\n### ✅ Action Items:\n${res.data.tasks}`;
      if (isCreating) {
        setNewNote((prev) => ({ ...prev, content: prev.content + taskBlock }));
      } else {
        setEditingNote((prev) => ({ ...prev, content: prev.content + taskBlock }));
      }
      toast.success("✅ Action items extracted!");
      triggerConfetti();
    } catch (err) {
      toast.error("AI Task extraction failed");
    } finally {
      setIsAILoading(false);
    }
  };

  const addTag = (tag) => {
    if (editingNote) {
      setEditingNote({
        ...editingNote,
        tags: [...editingNote.tags, tag],
      });
    } else if (isCreating) {
      setNewNote({
        ...newNote,
        tags: [...newNote.tags, tag],
      });
    }
  };

  const removeTag = (tagToRemove) => {
    if (editingNote) {
      setEditingNote({
        ...editingNote,
        tags: editingNote.tags.filter((tag) => tag !== tagToRemove),
      });
    } else if (isCreating) {
      setNewNote({
        ...newNote,
        tags: newNote.tags.filter((tag) => tag !== tagToRemove),
      });
    }
  };

  const handleDragStart = (e, note) => {
    setDraggedNote(note);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const handleDrop = (e, targetNote) => {
    e.preventDefault();
    if (draggedNote && draggedNote.id !== targetNote.id) {
      const draggedIndex = notes.findIndex(
        (note) => note.id === draggedNote.id
      );
      const targetIndex = notes.findIndex((note) => note.id === targetNote.id);

      const newNotes = [...notes];
      newNotes.splice(draggedIndex, 1);
      newNotes.splice(targetIndex, 0, draggedNote);

      setNotes(newNotes);
    }
    setDraggedNote(null);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getGreeting = () => {
    const hour = currentTime.getHours();
    if (hour < 12) return "🌅 Good Morning";
    if (hour < 17) return "☀️ Good Afternoon";
    if (hour < 21) return "🌆 Good Evening";
    return "🌙 Good Night";
  };

  const themeClasses = darkMode
    ? "bg-gray-900 text-white"
    : "bg-gradient-to-br from-indigo-50 via-white to-cyan-50";

  return (
    <div
      className={`min-h-screen transition-all duration-1000 ${themeClasses} relative overflow-hidden`}
    >
      {/* Enhanced animated background elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <ToastContainer position="top-right" />

        {[...Array(window.innerWidth < 768 ? 10 : 20)].map((_, i) => (
          <div
            key={i}
            className={`absolute w-2 h-2 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full opacity-20 animate-bounce`}
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${3 + Math.random() * 4}s`,
            }}
          />
        ))}

        {/* Dynamic gradient orbs - simplified for mobile */}
        <div
          className="absolute w-64 sm:w-96 h-64 sm:h-96 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"
          style={{
            left: `${
              20 +
              (mousePosition.x /
                (typeof window !== "undefined" ? window.innerWidth : 1000)) *
                20
            }%`,
            top: `${
              10 +
              (mousePosition.y /
                (typeof window !== "undefined" ? window.innerHeight : 1000)) *
                20
            }%`,
          }}
        />
        <div
          className="absolute w-64 sm:w-96 h-64 sm:h-96 bg-gradient-to-r from-cyan-400 to-blue-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"
          style={{
            right: `${
              20 +
              (mousePosition.x /
                (typeof window !== "undefined" ? window.innerWidth : 1000)) *
                20
            }%`,
            bottom: `${
              10 +
              (mousePosition.y /
                (typeof window !== "undefined" ? window.innerHeight : 1000)) *
                20
            }%`,
            animationDelay: "2s",
          }}
        />
      </div>

      {/* Confetti Effect */}
      {showConfetti && (
        <div className="fixed inset-0 pointer-events-none z-50">
          {[...Array(30)].map((_, i) => (
            <div
              key={i}
              className={`absolute w-3 h-3 bg-gradient-to-r ${
                colors[Math.floor(Math.random() * colors.length)].bg
              } rounded-full animate-ping`}
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 2}s`,
                animationDuration: "2s",
              }}
            />
          ))}
        </div>
      )}

      <div className="relative z-10 container mx-auto px-3 sm:px-4 py-4 sm:py-8">
        {/* Mobile Header - Compact */}
        <div className="text-center mb-4 sm:mb-8 relative">
         
          {/* LogOut Button */}
          <div className="flex-1 flex justify-end">
            <button
              onClick={handleLogout}
              className={`group relative flex items-center gap-2 px-4 sm:px-6 py-3 sm:py-4 bg-gradient-to-r from-red-500 via-pink-500 to-red-600 text-white rounded-xl sm:rounded-2xl transition-all duration-500 transform hover:scale-110 hover:rotate-1 shadow-2xl font-bold text-sm sm:text-base animate-pulse backdrop-blur-sm overflow-hidden`}
            >
              {/* Animated background glow */}
              <div className="absolute -inset-1 bg-gradient-to-r from-red-500 via-pink-500 to-red-600 rounded-xl sm:rounded-2xl blur opacity-50 group-hover:opacity-75 animate-pulse transition-all duration-500"></div>

              {/* Main content */}
              <div className="relative flex items-center gap-2">
                <LogOut className="w-4 sm:w-5 h-4 sm:h-5 group-hover:animate-spin transition-transform duration-500" />
                <span className="hidden sm:inline">Logout</span>

                {/* Sparkle effect */}
                <div className="absolute -top-1 -right-1 w-2 h-2 bg-white rounded-full animate-ping opacity-60"></div>
                <div className="absolute top-1 right-1 w-1 h-1 bg-yellow-300 rounded-full animate-pulse"></div>
              </div>

              {/* Hover shimmer effect */}
              <div className="absolute inset-0 -skew-x-12 translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent group-hover:translate-x-[-200%] transition-transform duration-1000 ease-in-out"></div>
            </button>
          </div>

          {/* Centered content */}
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 sm:gap-4 mb-2 sm:mb-4">
              <div className="relative">
                <div className="relative rounded-xl sm:rounded-2xl overflow-hidden">
                  {/* Main glowing box */}
                  <div className="w-10 sm:w-16 h-10 sm:h-16 bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center shadow-2xl animate-pulse">
                    <Sparkles
                      className="w-4 sm:w-8 h-4 sm:h-8 text-white animate-spin"
                      style={{ animationDuration: "3s" }}
                    />
                  </div>
                  {/* Glow layer */}
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-pink-500 blur opacity-20 animate-pulse"></div>
                </div>
              </div>

              <div>
                <h1
                  className={`text-3xl sm:text-6xl font-black bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600 bg-clip-text text-transparent animate-pulse`}
                >
                  Ultra Notes
                </h1>
                <div
                  className={`text-sm sm:text-lg ${
                    darkMode ? "text-gray-300" : "text-gray-600"
                  } mt-1 sm:mt-2 flex items-center justify-center gap-2`}
                >
                  <span className="hidden sm:inline">{getGreeting()} • </span>
                  {currentTime.toLocaleTimeString()}
                </div>
              </div>
            </div>
          </div>

          <p
            className={`text-base sm:text-xl ${
              darkMode ? "text-gray-300" : "text-gray-600"
            } mb-2 sm:mb-4`}
          >
            Your thoughts, dynamically supercharged ⚡
          </p>

          {/* Stats - Mobile friendly */}
          <div className="flex justify-center gap-4 sm:gap-6 text-xs sm:text-sm">
            <div className={`${darkMode ? "text-gray-400" : "text-gray-500"}`}>
              📝 {notes.length}
            </div>
            <div className={`${darkMode ? "text-gray-400" : "text-gray-500"}`}>
              ⭐ {notes.filter((n) => n.starred).length}
            </div>
            <div className={`${darkMode ? "text-gray-400" : "text-gray-500"}`}>
              🏷️ {allTags.length}
            </div>
          </div>
        </div>

        {/* Enhanced Controls - Mobile First */}
        <div
          className={`backdrop-blur-xl ${
            darkMode ? "bg-gray-800/40" : "bg-white/40"
          } rounded-2xl sm:rounded-3xl border ${
            darkMode ? "border-gray-700/50" : "border-white/50"
          } p-4 sm:p-8 mb-4 sm:mb-8 shadow-2xl transition-all duration-500`}
        >
          {/* Search and main controls */}
          <div className="flex flex-col gap-4 mb-4 sm:mb-6">
            <div className="relative flex-1">
              <Search
                className={`absolute left-3 sm:left-5 top-1/2 transform -translate-y-1/2 ${
                  darkMode ? "text-gray-400" : "text-gray-500"
                } w-5 sm:w-6 h-5 sm:h-6`}
              />
              <input
                type="text"
                placeholder="Search your brilliant thoughts..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={`w-full pl-10 sm:pl-14 pr-4 sm:pr-6 py-3 sm:py-5 ${
                  darkMode
                    ? "bg-gray-700/50 border-gray-600/50 text-white placeholder-gray-400"
                    : "bg-white/60 border-gray-200/50"
                } border rounded-xl sm:rounded-2xl focus:ring-4 focus:ring-purple-500/30 focus:border-purple-500 outline-none transition-all duration-500 backdrop-blur-sm text-base sm:text-lg`}
              />
            </div>

            <div className="flex gap-2 sm:gap-4 justify-center">
              <button
                onClick={toggleDarkMode}
                className={`px-3 sm:px-6 py-3 sm:py-5 ${
                  darkMode
                    ? "bg-gradient-to-r from-yellow-500 to-orange-500"
                    : "bg-gradient-to-r from-gray-700 to-gray-800"
                } text-white rounded-xl sm:rounded-2xl transition-all duration-500 transform hover:scale-110 shadow-lg`}
              >
                {darkMode ? (
                  <Sun className="w-4 sm:w-6 h-4 sm:h-6" />
                ) : (
                  <Moon className="w-4 sm:w-6 h-4 sm:h-6" />
                )}
              </button>

              <button
                onClick={() =>
                  setViewMode(viewMode === "grid" ? "list" : "grid")
                }
                className={`px-3 sm:px-6 py-3 sm:py-5 ${
                  darkMode
                    ? "bg-gray-700/60 border-gray-600"
                    : "bg-white/60 border-gray-200/50"
                } rounded-xl sm:rounded-2xl transition-all duration-500 transform hover:scale-110 border shadow-lg`}
              >
                {viewMode === "grid" ? (
                  <List className="w-4 sm:w-6 h-4 sm:h-6" />
                ) : (
                  <Grid className="w-4 sm:w-6 h-4 sm:h-6" />
                )}
              </button>

              <button
                onClick={() => {
                  setIsCreating(true);
                  setShowEditor(true);
                }}
                className="flex-1 sm:flex-none px-4 sm:px-8 py-3 sm:py-5 bg-gradient-to-r from-purple-500 via-pink-500 to-purple-600 text-white rounded-xl sm:rounded-2xl transition-all duration-500 flex items-center justify-center gap-2 sm:gap-3 font-bold transform hover:scale-105 shadow-2xl text-sm sm:text-lg animate-pulse"
              >
                <Plus className="w-4 sm:w-6 h-4 sm:h-6" />
                <span className="hidden sm:inline">Create Magic</span>
                <span className="sm:hidden">Create</span>
              </button>
            </div>
          </div>

          {/* Enhanced Filters - Mobile scrollable */}
          <div className="flex gap-2 sm:gap-4 overflow-x-auto pb-2 sm:pb-0">
            <div className="flex gap-2 sm:gap-4 min-w-max">
              <button
                onClick={() => {
                  setShowArchived(!showArchived);
                  if (!showArchived) setShowTrash(false);
                }}
                className={`px-3 sm:px-5 py-2 sm:py-3 rounded-lg sm:rounded-xl transition-all duration-500 shadow-lg whitespace-nowrap text-sm sm:text-base ${
                  showArchived
                    ? "bg-gradient-to-r from-orange-500 to-red-500 text-white"
                    : `${
                        darkMode
                          ? "bg-gray-700/60 text-gray-300"
                          : "bg-gray-100/80 text-gray-700"
                      }`
                }`}
              >
                <Archive className="w-3 sm:w-5 h-3 sm:h-5 inline mr-1 sm:mr-2" />
                {showArchived ? "Hide Archived" : "Show Archived"}
              </button>

              <button
                onClick={() => {
                  setShowTrash(!showTrash);
                  if (!showTrash) setShowArchived(false);
                }}
                className={`px-3 sm:px-5 py-2 sm:py-3 rounded-lg sm:rounded-xl transition-all duration-500 shadow-lg whitespace-nowrap text-sm sm:text-base ${
                  showTrash
                    ? "bg-gradient-to-r from-red-500 to-rose-600 text-white shadow-red-500/30"
                    : `${
                        darkMode
                          ? "bg-gray-700/60 text-gray-300 hover:text-red-400"
                          : "bg-gray-100/80 text-gray-700 hover:text-red-500"
                      }`
                }`}
              >
                <Trash2 className="w-3 sm:w-5 h-3 sm:h-5 inline mr-1 sm:mr-2" />
                {showTrash ? "Exit Trash" : "Trash"}
              </button>

              {allTags.map((tag) => (
                <button
                  key={tag}
                  onClick={() => setFilterTag(filterTag === tag ? "" : tag)}
                  className={`px-3 sm:px-4 py-2 sm:py-3 rounded-lg sm:rounded-xl transition-all duration-500 shadow-lg whitespace-nowrap text-sm sm:text-base ${
                    filterTag === tag
                      ? "bg-gradient-to-r from-blue-500 to-purple-500 text-white"
                      : `${
                          darkMode
                            ? "bg-gray-700/60 text-gray-300"
                            : "bg-gray-100/80 text-gray-700"
                        }`
                  }`}
                >
                  <Tag className="w-3 sm:w-4 h-3 sm:h-4 inline mr-1 sm:mr-2" />
                  {tag}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Mobile Layout Toggle */}
        <div className="xl:hidden mb-4">
          <div className="flex gap-2">
            <button
              onClick={() => setShowEditor(false)}
              className={`flex-1 px-4 py-3 rounded-xl transition-all duration-500 ${
                !showEditor
                  ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white"
                  : `${
                      darkMode
                        ? "bg-gray-700/60 text-gray-300"
                        : "bg-gray-100/80 text-gray-700"
                    }`
              }`}
            >
              <List className="w-5 h-5 inline mr-2" />
              Notes ({sortedNotes.length})
            </button>
            {(isCreating || editingNote) && (
              <button
                onClick={() => setShowEditor(true)}
                className={`flex-1 px-4 py-3 rounded-xl transition-all duration-500 ${
                  showEditor
                    ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white"
                    : `${
                        darkMode
                          ? "bg-gray-700/60 text-gray-300"
                          : "bg-gray-100/80 text-gray-700"
                      }`
                }`}
              >
                <Edit3 className="w-5 h-5 inline mr-2" />
                {isCreating ? "Create" : "Edit"}
              </button>
            )}
          </div>
        </div>

        {/* Main Content */}
        <div className="grid xl:grid-cols-3 gap-6">
          {/* Notes List */}
          <div
            className={`xl:col-span-1 ${
              showEditor ? "hidden xl:block" : "block"
            }`}
          >
            <div
              className={`backdrop-blur-xl ${
                darkMode ? "bg-gray-800/40" : "bg-white/40"
              } rounded-2xl sm:rounded-3xl border ${
                darkMode ? "border-gray-700/50" : "border-white/50"
              } p-4 sm:p-8 shadow-2xl transition-all duration-500`}
            >
              <div className="flex items-center justify-between mb-4 sm:mb-8">
                <h2
                  className={`text-xl sm:text-3xl font-bold ${
                    darkMode ? "text-white" : "text-gray-800"
                  } flex items-center gap-2 sm:gap-3`}
                >
                  <div className="w-2 sm:w-3 h-2 sm:h-3 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full animate-pulse"></div>
                  <span className="hidden sm:inline">
                    Notes ({sortedNotes.length})
                  </span>
                  <span className="sm:hidden">{sortedNotes.length}</span>
                </h2>
                {isTyping && (
                  <div className="flex items-center gap-1 sm:gap-2">
                    <div className="w-1.5 sm:w-2 h-1.5 sm:h-2 bg-blue-500 rounded-full animate-bounce"></div>
                    <div
                      className="w-1.5 sm:w-2 h-1.5 sm:h-2 bg-blue-500 rounded-full animate-bounce"
                      style={{ animationDelay: "0.1s" }}
                    ></div>
                    <div
                      className="w-1.5 sm:w-2 h-1.5 sm:h-2 bg-blue-500 rounded-full animate-bounce"
                      style={{ animationDelay: "0.2s" }}
                    ></div>
                    <span
                      className={`text-xs sm:text-sm ${
                        darkMode ? "text-gray-400" : "text-gray-500"
                      } ml-1 sm:ml-2 hidden sm:inline`}
                    >
                      Typing...
                    </span>
                  </div>
                )}
              </div>

              <div
                className={`space-y-3 sm:space-y-6 max-h-[60vh] sm:max-h-[700px] overflow-y-auto ${
                  viewMode === "grid" && "sm:grid sm:grid-cols-1 sm:gap-6"
                }`}
              >
                {sortedNotes.length === 0 ? (
                  <div className="text-center py-8 sm:py-16">
                    <div className="w-12 sm:w-20 h-12 sm:h-20 bg-gradient-to-r from-gray-400 to-gray-500 rounded-2xl sm:rounded-3xl flex items-center justify-center mx-auto mb-4 sm:mb-6 opacity-50 animate-bounce">
                      <Edit3 className="w-6 sm:w-10 h-6 sm:h-10 text-white" />
                    </div>
                    <p
                      className={`${
                        darkMode ? "text-gray-400" : "text-gray-500"
                      } text-sm sm:text-lg`}
                    >
                      {searchTerm || filterTag
                        ? "No notes found matching your criteria."
                        : "No notes yet. Create your first masterpiece!"}
                    </p>
                  </div>
                ) : (
                  sortedNotes.map((note, index) => {
                    const colorClass = getColorClasses(note.color);
                    const IconComponent =
                      icons.find((icon) => icon.name === note.icon) || Edit3;
                    return (
                      <div
                        key={note.id}
                        draggable
                        onDragStart={(e) => handleDragStart(e, note)}
                        onDragOver={handleDragOver}
                        onDrop={(e) => handleDrop(e, note)}
                        className={`group relative p-4 sm:p-6 rounded-xl sm:rounded-2xl cursor-pointer transition-all duration-500 transform hover:scale-105 hover:rotate-1 ${
                          activeNoteAnimation === note.id
                            ? "animate-bounce scale-90 opacity-50"
                            : ""
                        } ${
                          editingNote && editingNote.id === note.id
                            ? `${colorClass.light} ring-2 sm:ring-4 ring-purple-500/50 shadow-2xl ${colorClass.glow}`
                            : `${
                                darkMode
                                  ? "bg-gray-700/60 hover:bg-gray-700/80"
                                  : "bg-white/60 hover:bg-white/80"
                              } border ${
                                darkMode
                                  ? "border-gray-600/50"
                                  : "border-gray-200/50"
                              } hover:shadow-2xl`
                        }`}
                        style={{
                          animationDelay: `${index * 0.1}s`,
                          animationFillMode: "both",
                        }}
                        onClick={() => handleEditNote(note)}
                      >
                        {/* Enhanced color indicator */}
                        <div
                          className={`absolute top-0 left-0 w-1 sm:w-2 h-full bg-gradient-to-b ${colorClass.bg} rounded-l-xl sm:rounded-l-2xl shadow-lg`}
                        ></div>

                        {/* Icon */}
                        <div className="absolute top-3 sm:top-4 left-3 sm:left-4">
                          <div
                            className={`w-8 sm:w-10 h-8 sm:h-10 bg-gradient-to-r ${colorClass.bg} rounded-lg sm:rounded-xl flex items-center justify-center shadow-lg group-hover:animate-spin`}
                            style={{ animationDuration: "2s" }}
                          >
                            <IconComponent className="w-4 sm:w-5 h-4 sm:h-5 text-white" />
                          </div>
                        </div>

                        <div className="flex justify-between items-start mb-3 sm:mb-4 ml-12 sm:ml-16">
                          <h3
                            className={`font-bold truncate flex-1 text-base sm:text-lg flex items-center gap-1.5 ${
                              darkMode ? "text-white" : "text-gray-800"
                            }`}
                          >
                            {note.pinned && (
                              <Pin className="w-4 h-4 text-indigo-400 fill-current flex-shrink-0" />
                            )}
                            {note.starred && (
                              <Star className="w-4 h-4 text-yellow-500 fill-current flex-shrink-0 animate-pulse" />
                            )}
                            {note.isPublic && (
                              <span className="px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 text-[10px] font-medium border border-emerald-500/30 flex-shrink-0">
                                Public
                              </span>
                            )}
                            <span className="truncate">{note.title}</span>
                          </h3>

                          <div className="flex gap-1 sm:gap-1.5 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-all duration-300">
                            {showTrash ? (
                              <>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleRestoreNote(note._id);
                                  }}
                                  title="Restore Note"
                                  className="p-1.5 sm:p-2 rounded-lg sm:rounded-xl text-emerald-400 hover:bg-emerald-500/20 transition-all transform hover:scale-125"
                                >
                                  <RotateCcw className="w-3.5 sm:w-4 h-3.5 sm:h-4" />
                                </button>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handlePermanentDelete(note._id);
                                  }}
                                  title="Delete Forever"
                                  className="p-1.5 sm:p-2 rounded-lg sm:rounded-xl text-rose-400 hover:bg-rose-500/20 transition-all transform hover:scale-125"
                                >
                                  <Trash2 className="w-3.5 sm:w-4 h-3.5 sm:h-4" />
                                </button>
                              </>
                            ) : (
                              <>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    togglePin(note._id);
                                  }}
                                  title={note.pinned ? "Unpin note" : "Pin note to top"}
                                  className={`p-1.5 sm:p-2 rounded-lg sm:rounded-xl transition-all duration-300 transform hover:scale-125 ${
                                    note.pinned
                                      ? "text-indigo-400 bg-indigo-500/20"
                                      : `${
                                          darkMode
                                            ? "text-gray-400 hover:text-indigo-400 hover:bg-indigo-400/20"
                                            : "text-gray-500 hover:text-indigo-500 hover:bg-indigo-500/20"
                                        }`
                                  }`}
                                >
                                  <Pin className="w-3 sm:w-4 h-3 sm:h-4" />
                                </button>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleShareNote(note);
                                  }}
                                  title={note.isPublic ? "Copy public link" : "Share public link"}
                                  className={`p-1.5 sm:p-2 rounded-lg sm:rounded-xl transition-all duration-300 transform hover:scale-125 ${
                                    note.isPublic
                                      ? "text-emerald-400 bg-emerald-500/20"
                                      : `${
                                          darkMode
                                            ? "text-gray-400 hover:text-emerald-400 hover:bg-emerald-400/20"
                                            : "text-gray-500 hover:text-emerald-500 hover:bg-emerald-500/20"
                                        }`
                                  }`}
                                >
                                  <Share2 className="w-3 sm:w-4 h-3 sm:h-4" />
                                </button>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    toggleStar(note._id);
                                  }}
                                  title="Star note"
                                  className={`p-1.5 sm:p-2 rounded-lg sm:rounded-xl transition-all duration-300 transform hover:scale-125 ${
                                    note.starred
                                      ? "text-yellow-500 bg-yellow-500/20"
                                      : `${
                                          darkMode
                                            ? "text-gray-400 hover:text-yellow-400 hover:bg-yellow-400/20"
                                            : "text-gray-500 hover:text-yellow-500 hover:bg-yellow-500/20"
                                        }`
                                  }`}
                                >
                                  <Star className="w-3 sm:w-4 h-3 sm:h-4" />
                                </button>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    toggleArchive(note._id);
                                  }}
                                  title="Archive note"
                                  className={`p-1.5 sm:p-2 rounded-lg sm:rounded-xl transition-all duration-300 transform hover:scale-125 ${
                                    note.archived
                                      ? "text-orange-500 bg-orange-500/20"
                                      : `${
                                          darkMode
                                            ? "text-gray-400 hover:text-orange-400 hover:bg-orange-400/20"
                                            : "text-gray-500 hover:text-orange-500 hover:bg-orange-500/20"
                                        }`
                                  }`}
                                >
                                  <Archive className="w-3 sm:w-4 h-3 sm:h-4" />
                                </button>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleDeleteNote(note._id);
                                  }}
                                  title="Move to trash"
                                  className={`p-1.5 sm:p-2 rounded-lg sm:rounded-xl transition-all duration-300 transform hover:scale-125 ${
                                    darkMode
                                      ? "text-gray-400 hover:text-red-400 hover:bg-red-400/20"
                                      : "text-gray-500 hover:text-red-500 hover:bg-red-500/20"
                                  }`}
                                >
                                  <Trash2 className="w-3 sm:w-4 h-3 sm:h-4" />
                                </button>
                              </>
                            )}
                          </div>
                        </div>

                        <div
                          className={`text-xs sm:text-sm mb-3 sm:mb-4 line-clamp-3 ml-12 sm:ml-16 ${
                            darkMode ? "text-gray-300" : "text-gray-600"
                          } leading-relaxed prose prose-sm dark:prose-invert max-w-none`}
                        >
                          <ReactMarkdown remarkPlugins={[remarkGfm]}>
                            {note.content || "No content"}
                          </ReactMarkdown>
                        </div>

                        {note.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1 sm:gap-2 mb-2 sm:mb-3 ml-12 sm:ml-16">
                            {note.tags.slice(0, 3).map((tag) => (
                              <span
                                key={tag}
                                className={`px-2 sm:px-3 py-0.5 sm:py-1 text-xs rounded-md sm:rounded-lg ${
                                  darkMode
                                    ? "bg-gray-600/60 text-gray-300"
                                    : "bg-gray-100/80 text-gray-600"
                                } backdrop-blur-sm transition-all duration-300 hover:scale-105`}
                              >
                                #{tag}
                              </span>
                            ))}
                            {note.tags.length > 3 && (
                              <span
                                className={`px-2 sm:px-3 py-0.5 sm:py-1 text-xs rounded-md sm:rounded-lg ${
                                  darkMode
                                    ? "bg-gray-600/60 text-gray-300"
                                    : "bg-gray-100/80 text-gray-600"
                                }`}
                              >
                                +{note.tags.length - 3}
                              </span>
                            )}
                          </div>
                        )}

                        <div className="flex justify-between items-center ml-12 sm:ml-16">
                          <p
                            className={`text-xs ${
                              darkMode ? "text-gray-400" : "text-gray-500"
                            }`}
                          >
                            <span className="hidden sm:inline">
                              {formatDate(note.updatedAt)}
                            </span>
                            <span className="sm:hidden">
                              {new Date(note.updatedAt).toLocaleDateString()}
                            </span>
                          </p>
                          <div className="flex items-center gap-1 sm:gap-2">
                            <div
                              className={`w-1.5 sm:w-2 h-1.5 sm:h-2 rounded-full ${
                                colorClass.bg.includes("blue")
                                  ? "bg-blue-500"
                                  : colorClass.bg.includes("purple")
                                  ? "bg-purple-500"
                                  : colorClass.bg.includes("pink")
                                  ? "bg-pink-500"
                                  : colorClass.bg.includes("green")
                                  ? "bg-green-500"
                                  : colorClass.bg.includes("orange")
                                  ? "bg-orange-500"
                                  : "bg-teal-500"
                              } animate-pulse`}
                            ></div>
                            <span
                              className={`text-xs ${
                                darkMode ? "text-gray-400" : "text-gray-500"
                              }`}
                            >
                              {note.content.split(" ").length}w
                            </span>
                          </div>
                        </div>

                        {/* Hover glow effect */}
                        <div
                          className={`absolute -inset-1 bg-gradient-to-r ${colorClass.bg} rounded-xl sm:rounded-2xl blur opacity-0 group-hover:opacity-20 transition-all duration-500 -z-10`}
                        ></div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>

          {/* Enhanced Editor */}
          <div
            className={`xl:col-span-2 ${
              !showEditor ? "hidden xl:block" : "block"
            }`}
          >
            <div
              className={`backdrop-blur-xl ${
                darkMode ? "bg-gray-800/40" : "bg-white/40"
              } rounded-2xl sm:rounded-3xl border ${
                darkMode ? "border-gray-700/50" : "border-white/50"
              } p-4 sm:p-10 shadow-2xl transition-all duration-500 relative overflow-hidden`}
            >
              {/* Loading overlay */}
              {isLoading && (
                <div className="absolute inset-0 bg-black/20 backdrop-blur-sm rounded-2xl sm:rounded-3xl flex items-center justify-center z-50">
                  <div className="flex items-center gap-4">
                    <div className="w-6 sm:w-8 h-6 sm:h-8 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
                    <span
                      className={`text-base sm:text-lg font-medium ${
                        darkMode ? "text-white" : "text-gray-800"
                      }`}
                    >
                      {isCreating
                        ? "Creating magic..."
                        : "Saving brilliance..."}
                    </span>
                  </div>
                </div>
              )}

              {isCreating || editingNote ? (
                <div className="space-y-4 sm:space-y-8">
                  {/* Enhanced Editor Header */}
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                      <h2
                        className={`text-xl sm:text-3xl font-bold ${
                          darkMode ? "text-white" : "text-gray-800"
                        } flex items-center gap-2 sm:gap-3`}
                      >
                        <div className="w-3 sm:w-4 h-3 sm:h-4 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full animate-pulse"></div>
                        <span>
                          {isCreating
                            ? "Create New Masterpiece"
                            : "Edit Your Creation"}
                        </span>
                        <button
                          onClick={() => {
                            setEditingNote(null);
                            setIsCreating(false);
                            setShowEditor(false);
                            setNewNote({
                              title: "",
                              content: "",
                              color: "blue",
                              tags: [],
                              starred: false,
                            });
                          }}
                          className="xl:hidden p-2 rounded-lg hover:bg-gray-200/20 transition-colors"
                        >
                          <X className="w-5 h-5" />
                        </button>
                      </h2>
                      <div className="flex items-center gap-2 sm:gap-4 mt-1 sm:mt-2 text-xs sm:text-sm">
                        <span
                          className={`${
                            darkMode ? "text-gray-400" : "text-gray-500"
                          }`}
                        >
                          📝 {wordCount} words • ✍️ {charCount} characters
                        </span>
                        {isTyping && (
                          <div className="flex items-center gap-1 sm:gap-2">
                            <div className="w-1.5 sm:w-2 h-1.5 sm:h-2 bg-blue-500 rounded-full animate-bounce"></div>
                            <span className="text-blue-500 text-xs sm:text-sm">
                              Writing...
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2 sm:gap-4 w-full sm:w-auto">
                      <button
                        onClick={isCreating ? handleCreateNote : handleSaveNote}
                        disabled={isLoading}
                        className="flex-1 sm:flex-none px-4 sm:px-8 py-3 sm:py-4 bg-gradient-to-r from-green-500 via-emerald-500 to-green-600 text-white rounded-xl sm:rounded-2xl hover:from-green-600 hover:via-emerald-600 hover:to-green-700 transition-all duration-500 flex items-center justify-center gap-2 sm:gap-3 transform hover:scale-105 shadow-2xl font-bold text-sm sm:text-lg disabled:opacity-50"
                      >
                        <Save className="w-4 sm:w-6 h-4 sm:h-6 animate-pulse" />
                        {isLoading ? "..." : "Save Magic"}
                      </button>
                      <button
                        onClick={() => {
                          setEditingNote(null);
                          setIsCreating(false);
                          setShowEditor(false);
                          setNewNote({
                            title: "",
                            content: "",
                            color: "blue",
                            tags: [],
                            starred: false,
                          });
                        }}
                        className={`hidden sm:flex px-8 py-4 ${
                          darkMode
                            ? "bg-gray-700/60 hover:bg-gray-600/60"
                            : "bg-gray-500/60 hover:bg-gray-600/60"
                        } text-white rounded-2xl transition-all duration-500 items-center gap-3 transform hover:scale-105 font-bold`}
                      >
                        <X className="w-6 h-6" />
                        Cancel
                      </button>
                    </div>
                  </div>

                  {/* Enhanced Color Picker - Mobile optimized */}
                  <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
                    <span
                      className={`text-base sm:text-lg font-bold ${
                        darkMode ? "text-gray-300" : "text-gray-700"
                      } flex items-center gap-2`}
                    >
                      <Palette className="w-4 sm:w-5 h-4 sm:h-5" />
                      Choose Your Vibe:
                    </span>
                    <div className="flex gap-2 sm:gap-3 overflow-x-auto pb-2 sm:pb-0">
                      {colors.map((color) => (
                        <button
                          key={color.name}
                          onClick={() => {
                            if (isCreating) {
                              setNewNote({ ...newNote, color: color.name });
                            } else {
                              setEditingNote({
                                ...editingNote,
                                color: color.name,
                              });
                            }
                          }}
                          className={`w-8 sm:w-12 h-8 sm:h-12 rounded-xl sm:rounded-2xl bg-gradient-to-r ${
                            color.bg
                          } transition-all duration-500 transform hover:scale-125 hover:rotate-12 shadow-lg flex-shrink-0 ${
                            (isCreating
                              ? newNote.color
                              : editingNote?.color) === color.name
                              ? "ring-2 sm:ring-4 ring-offset-2 sm:ring-offset-4 ring-gray-400 scale-110"
                              : ""
                          }`}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Enhanced Title Input */}
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="✨ Your brilliant title goes here..."
                      value={
                        isCreating ? newNote.title : editingNote?.title || ""
                      }
                      onChange={(e) => {
                        if (isCreating) {
                          setNewNote({ ...newNote, title: e.target.value });
                        } else {
                          setEditingNote({
                            ...editingNote,
                            title: e.target.value,
                          });
                        }
                      }}
                      className={`w-full p-4 sm:p-6 ${
                        darkMode
                          ? "bg-gray-700/60 border-gray-600/50 text-white placeholder-gray-400"
                          : "bg-white/60 border-gray-200/50"
                      } border rounded-xl sm:rounded-2xl focus:ring-4 focus:ring-purple-500/30 focus:border-purple-500 outline-none transition-all duration-500 text-lg sm:text-2xl font-bold backdrop-blur-sm hover:shadow-lg`}
                    />
                    <div className="absolute right-4 sm:right-6 top-1/2 transform -translate-y-1/2">
                      <div className="w-2 sm:w-3 h-2 sm:h-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full animate-pulse opacity-50"></div>
                    </div>
                  </div>

                  {/* Enhanced Tags - Mobile optimized */}
                  <div className="space-y-3 sm:space-y-4">
                    <div className="flex flex-wrap gap-2 sm:gap-3">
                      {(isCreating
                        ? newNote.tags
                        : editingNote?.tags || []
                      ).map((tag) => (
                        <span
                          key={tag}
                          className={`px-3 sm:px-4 py-1.5 sm:py-2 ${
                            darkMode
                              ? "bg-gray-700/60 text-gray-300"
                              : "bg-gray-100/80 text-gray-700"
                          } rounded-lg sm:rounded-xl text-xs sm:text-sm flex items-center gap-2 sm:gap-3 transition-all duration-300 hover:scale-105 backdrop-blur-sm shadow-lg`}
                        >
                          <Tag className="w-3 sm:w-4 h-3 sm:h-4" />#{tag}
                          <button
                            onClick={() => removeTag(tag)}
                            className={`${
                              darkMode
                                ? "text-gray-400 hover:text-red-400"
                                : "text-gray-500 hover:text-red-500"
                            } transition-colors duration-300 hover:scale-125`}
                          >
                            <X className="w-3 sm:w-4 h-3 sm:h-4" />
                          </button>
                        </span>
                      ))}
                    </div>
                    <div className="relative">
                      <input
                        type="text"
                        placeholder="🏷️ Add magical tags (press Enter)"
                        onKeyPress={(e) => {
                          if (e.key === "Enter" && e.target.value.trim()) {
                            addTag(e.target.value.trim());
                            e.target.value = "";
                          }
                        }}
                        className={`w-full p-3 sm:p-4 ${
                          darkMode
                            ? "bg-gray-700/60 border-gray-600/50 text-white placeholder-gray-400"
                            : "bg-white/60 border-gray-200/50"
                        } border rounded-xl sm:rounded-2xl focus:ring-4 focus:ring-purple-500/30 focus:border-purple-500 outline-none transition-all duration-500 backdrop-blur-sm hover:shadow-lg text-sm sm:text-base`}
                      />
                    </div>
                  </div>

                  {/* AI & Voice Toolbar */}
                  <div className="flex flex-wrap items-center justify-between gap-2 p-2.5 rounded-xl bg-gradient-to-r from-purple-500/10 via-indigo-500/10 to-pink-500/10 border border-purple-500/20 backdrop-blur-md">
                    <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                      <span className="text-xs font-bold text-purple-400 flex items-center gap-1 mr-1">
                        <Sparkles className="w-3.5 h-3.5" /> AI Tools:
                      </span>

                      <button
                        type="button"
                        onClick={handleAIPolish}
                        disabled={isAILoading}
                        className="px-2.5 py-1.5 rounded-lg bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 text-xs font-medium border border-purple-500/30 flex items-center gap-1.5 transition-all disabled:opacity-50 cursor-pointer"
                        title="Restructure and format notes with AI"
                      >
                        <Wand2 className="w-3.5 h-3.5 text-purple-400" />
                        <span>{isAILoading ? "Processing..." : "AI Polish"}</span>
                      </button>

                      <button
                        type="button"
                        onClick={handleAISummarize}
                        disabled={isAILoading}
                        className="px-2.5 py-1.5 rounded-lg bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-300 text-xs font-medium border border-indigo-500/30 flex items-center gap-1.5 transition-all disabled:opacity-50 cursor-pointer"
                        title="Generate 2-3 sentence AI summary"
                      >
                        <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                        <span>Summarize</span>
                      </button>

                      <button
                        type="button"
                        onClick={handleAIExtractTasks}
                        disabled={isAILoading}
                        className="px-2.5 py-1.5 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 text-xs font-medium border border-emerald-500/30 flex items-center gap-1.5 transition-all disabled:opacity-50 cursor-pointer"
                        title="Extract actionable tasks into checklist"
                      >
                        <CheckSquare className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Extract Tasks</span>
                      </button>
                    </div>

                    {/* Voice Dictation (Speech-to-text) */}
                    <button
                      type="button"
                      onClick={handleVoiceDictate}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-all cursor-pointer ${
                        isListening
                          ? "bg-rose-500 text-white animate-pulse shadow-lg shadow-rose-500/50"
                          : `${darkMode ? "bg-gray-800 text-gray-300 border-gray-700" : "bg-white text-gray-700 border-gray-200"} border hover:scale-105`
                      }`}
                      title="Dictate note with microphone"
                    >
                      {isListening ? (
                        <>
                          <MicOff className="w-3.5 h-3.5 animate-bounce" />
                          <span>Listening...</span>
                        </>
                      ) : (
                        <>
                          <Mic className="w-3.5 h-3.5 text-indigo-500" />
                          <span>Voice Dictate</span>
                        </>
                      )}
                    </button>
                  </div>

                  {/* Enhanced Content Textarea - Mobile optimized */}
                  <div className="relative">
                    <textarea
                      placeholder="🚀 Pour your incredible thoughts here... Let your creativity flow!"
                      value={
                        isCreating
                          ? newNote.content
                          : editingNote?.content || ""
                      }
                      onChange={(e) => {
                        if (isCreating) {
                          setNewNote({ ...newNote, content: e.target.value });
                        } else {
                          setEditingNote({
                            ...editingNote,
                            content: e.target.value,
                          });
                        }
                      }}
                      className={`w-full h-48 sm:h-96 p-4 sm:p-6 ${
                        darkMode
                          ? "bg-gray-700/60 border-gray-600/50 text-white placeholder-gray-400"
                          : "bg-white/60 border-gray-200/50"
                      } border rounded-xl sm:rounded-2xl focus:ring-4 focus:ring-purple-500/30 focus:border-purple-500 outline-none resize-none transition-all duration-500 backdrop-blur-sm hover:shadow-lg text-sm sm:text-lg leading-relaxed`}
                    />
                    <div className="absolute bottom-3 sm:bottom-4 right-3 sm:right-4 flex items-center gap-2">
                      <div className="flex items-center gap-1">
                        <div className="w-1.5 sm:w-2 h-1.5 sm:h-2 bg-green-500 rounded-full animate-pulse"></div>
                        <span
                          className={`text-xs ${
                            darkMode ? "text-gray-400" : "text-gray-500"
                          }`}
                        >
                          Auto-saving
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Enhanced timestamps for editing */}
                  {editingNote && (
                    <div
                      className={`text-xs sm:text-sm ${
                        darkMode ? "text-gray-400" : "text-gray-500"
                      } flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 sm:gap-0 p-3 sm:p-4 ${
                        darkMode ? "bg-gray-700/30" : "bg-gray-100/30"
                      } rounded-lg sm:rounded-xl backdrop-blur-sm`}
                    >
                      <div className="flex items-center gap-2">
                        <div className="w-1.5 sm:w-2 h-1.5 sm:h-2 bg-blue-500 rounded-full"></div>
                        <span>
                          Created: {formatDate(editingNote.createdAt)}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-1.5 sm:w-2 h-1.5 sm:h-2 bg-green-500 rounded-full animate-pulse"></div>
                        <span>
                          Last Updated: {formatDate(editingNote.updatedAt)}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                // Enhanced Welcome Screen - Mobile optimized
                <div className="text-center py-12 sm:py-24 relative">
                  {/* Floating elements - reduced for mobile */}
                  <div className="absolute inset-0 overflow-hidden">
                    {[...Array(window.innerWidth < 768 ? 5 : 10)].map(
                      (_, i) => (
                        <div
                          key={i}
                          className={`absolute w-1 h-1 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full opacity-30 animate-bounce`}
                          style={{
                            left: `${20 + Math.random() * 60}%`,
                            top: `${20 + Math.random() * 60}%`,
                            animationDelay: `${Math.random() * 3}s`,
                            animationDuration: `${2 + Math.random() * 3}s`,
                          }}
                        />
                      )
                    )}
                  </div>

                  <div className="relative z-10">
                    <div className="w-20 sm:w-32 h-20 sm:h-32 bg-gradient-to-r from-purple-500 via-pink-500 to-purple-600 rounded-2xl sm:rounded-3xl flex items-center justify-center mx-auto mb-4 sm:mb-8 shadow-2xl relative">
                      <Edit3 className="w-10 sm:w-16 h-10 sm:h-16 text-white animate-pulse" />
                      <div className="absolute -inset-2 sm:-inset-4 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl sm:rounded-3xl blur opacity-30 animate-pulse"></div>
                    </div>
                    <h3
                      className={`text-2xl sm:text-4xl font-black mb-4 sm:mb-6 ${
                        darkMode ? "text-white" : "text-gray-800"
                      } bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent`}
                    >
                      Ready to Create Magic? ✨
                    </h3>
                    <p
                      className={`text-base sm:text-xl mb-6 sm:mb-10 ${
                        darkMode ? "text-gray-300" : "text-gray-600"
                      } max-w-lg mx-auto leading-relaxed px-4`}
                    >
                      Select a note to edit it, or create a new one to begin
                      your incredible creative journey. Your thoughts deserve
                      the most beautiful canvas.
                    </p>
                    <button
                      onClick={() => {
                        setIsCreating(true);
                        setShowEditor(true);
                      }}
                      className="px-8 sm:px-12 py-4 sm:py-6 bg-gradient-to-r from-purple-500 via-pink-500 to-purple-600 text-white rounded-xl sm:rounded-2xl hover:from-purple-600 hover:via-pink-600 hover:to-purple-700 transition-all duration-500 flex items-center gap-3 sm:gap-4 mx-auto transform hover:scale-110 hover:rotate-1 shadow-2xl text-base sm:text-xl font-bold animate-pulse"
                    >
                      <Plus className="w-6 sm:w-8 h-6 sm:h-8 animate-bounce" />
                      <span className="hidden sm:inline">
                        Create Your Masterpiece
                      </span>
                      <span className="sm:hidden">Create Masterpiece</span>
                      <Sparkles
                        className="w-6 sm:w-8 h-6 sm:h-8 animate-spin"
                        style={{ animationDuration: "3s" }}
                      />
                    </button>

                    <div className="mt-8 sm:mt-12 flex justify-center gap-4 sm:gap-8 text-xs sm:text-sm opacity-60">
                      <div className="flex items-center gap-1 sm:gap-2">
                        <Zap className="w-3 sm:w-4 h-3 sm:h-4" />
                        <span>Lightning Fast</span>
                      </div>
                      <div className="flex items-center gap-1 sm:gap-2">
                        <Heart className="w-3 sm:w-4 h-3 sm:h-4" />
                        <span>Made with Love</span>
                      </div>
                      <div className="flex items-center gap-1 sm:gap-2">
                        <Rocket className="w-3 sm:w-4 h-3 sm:h-4" />
                        <span>Supercharged</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;
