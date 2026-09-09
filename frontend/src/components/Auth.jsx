import React, { useState, useEffect } from "react";
import {
  Eye,
  EyeOff,
  Mail,
  Lock,
  User,
  ArrowRight,
  Sparkles,
  Star,
  Zap,
  Heart,
  Coffee,
  Shield,
  CheckCircle,
  AlertCircle,
  Github,
  Chrome,
  Apple,
  Moon,
  Sun,
  Rocket,
  Crown,
  Flame,
} from "lucide-react";
import api from "../api/client";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";


const AuthApp = () => {
 
  const [isLogin, setIsLogin] = useState(true);
  // const [darkMode, setDarkMode] = useState(false);
   const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem('darkMode');
    return saved ? JSON.parse(saved) : false;
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isLoading, setIsLoading] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [authMode, setAuthMode] = useState("login");
  const navigate = useNavigate();
  const [data, setData] = useState("AI Learning Platform");
  const [email, setEmail] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    firstName: "",
    lastName: "",
    rememberMe: false,
  });

   useEffect(() => {
    localStorage.setItem('darkMode', JSON.stringify(darkMode));
    // Apply a class to body
    if (darkMode) {
      document.body.classList.add('dark-mode');
    } else {
      document.body.classList.remove('dark-mode');
    }
  }, [darkMode]);

  useEffect(() => {
    api
      .get("/api/message")
      .then((response) => setData(response.data.message))
      .catch((error) => console.error("Error:", error));
  }, []);

  const [errors, setErrors] = useState({});
  const [validations, setValidations] = useState({
    email: false,
    password: false,
    confirmPassword: false,
    firstName: false,
    lastName: false,
  });

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

  // Form validation
  useEffect(() => {
    const newValidations = {
      email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email),
      password: formData.password.length >= 8,
      confirmPassword: !isLogin
        ? formData.password === formData.confirmPassword &&
          formData.confirmPassword.length > 0
        : true,
      firstName: !isLogin ? formData.firstName.trim().length >= 2 : true,
      lastName: !isLogin ? formData.lastName.trim().length >= 2 : true,
    };
    setValidations(newValidations);
  }, [formData, isLogin]);

  const colors = [
    { name: "purple", bg: "from-purple-400 via-purple-500 to-purple-600" },
    { name: "blue", bg: "from-blue-400 via-blue-500 to-blue-600" },
    { name: "pink", bg: "from-pink-400 via-pink-500 to-pink-600" },
    { name: "green", bg: "from-green-400 via-green-500 to-green-600" },
    { name: "orange", bg: "from-orange-400 via-orange-500 to-orange-600" },
  ];

  const getGreeting = () => {
    const hour = currentTime.getHours();
    if (hour < 12) return "🌅 Good Morning";
    if (hour < 17) return "☀️ Good Afternoon";
    if (hour < 21) return "🌆 Good Evening";
    return "🌙 Good Night";
  };

  const triggerConfetti = () => {
    setShowConfetti(true);
    setTimeout(() => setShowConfetti(false), 3000);
  };

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear errors when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.email) {
      newErrors.email = "Email is required";
    } else if (!validations.email) {
      newErrors.email = "Please enter a valid email";
    }

    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (!validations.password) {
      newErrors.password = "Password must be at least 8 characters";
    }

    if (!isLogin) {
      if (!formData.firstName.trim())
        newErrors.firstName = "First name is required";
      if (!formData.lastName.trim())
        newErrors.lastName = "Last name is required";
      if (!formData.confirmPassword) {
        newErrors.confirmPassword = "Please confirm your password";
      } else if (!validations.confirmPassword) {
        newErrors.confirmPassword = "Passwords do not match";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
  e.preventDefault();
  if (!validateForm()) return;

  setIsLoading(true);

  const endpoint = isLogin ? "/api/auth/login" : "/api/auth/signup";

  const payload = isLogin
    ? { email: formData.email, password: formData.password }
    : {
        name: `${formData.firstName} ${formData.lastName}`,
        email: formData.email,
        password: formData.password,
      };

  try {
    const res = await api.post(endpoint, payload);
    const { token, user } = res.data;

    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(user));

    triggerConfetti();

    await Swal.fire({
  icon: "success",
  title: "Welcome back! 🎉",
  text: "You have logged in successfully.",
  showConfirmButton: false,
  timer: 2000,
  backdrop: `rgba(0,0,0,0.3)`,
  customClass: {
    popup: 'glass-popup'
  }
});


    navigate("/Note");
  } catch (err) {
    Swal.fire({
      icon: "error",
      title: "Oops...",
      text: err.response?.data?.msg || "Something went wrong!",
    });
  } finally {
    setIsLoading(false);
  }
};

  const handleSocialAuth = (provider) => {
    Swal.fire({
      icon: "info",
      title: `${provider} Sign-in`,
      text: `${provider} OAuth is in preview! Please sign in with your Email and Password.`,
      confirmButtonColor: "#6366f1",
    });
  };

  const resetForm = () => {
    setFormData({
      email: "",
      password: "",
      confirmPassword: "",
      firstName: "",
      lastName: "",
      rememberMe: false,
    });
    setErrors({});
  };

  const switchMode = () => {
    setIsLogin(!isLogin);
    resetForm();
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
        {/* Floating particles - reduced for mobile */}
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

        {/* Dynamic gradient orbs */}
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
        <div
          className="absolute w-64 sm:w-96 h-64 sm:h-96 bg-gradient-to-r from-green-400 to-teal-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"
          style={{
            left: "50%",
            top: "50%",
            transform: `translate(-50%, -50%) translate(${
              (mousePosition.x -
                (typeof window !== "undefined" ? window.innerWidth / 2 : 500)) *
              0.02
            }px, ${
              (mousePosition.y -
                (typeof window !== "undefined"
                  ? window.innerHeight / 2
                  : 500)) *
              0.02
            }px)`,
            animationDelay: "4s",
          }}
        />
      </div>

      {/* Confetti Effect */}
      {showConfetti && (
        <div className="fixed inset-0 pointer-events-none z-50">
          {[...Array(50)].map((_, i) => (
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

      {/* Dark mode toggle */}
      <div className="absolute top-4 sm:top-8 right-4 sm:right-8 z-20">
        <button
          onClick={() => setDarkMode(!darkMode)}
          className={`p-3 sm:p-4 ${
            darkMode
              ? "bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600"
              : "bg-gradient-to-r from-gray-700 to-gray-800 hover:from-gray-800 hover:to-gray-900"
          } text-white rounded-xl sm:rounded-2xl transition-all duration-500 transform hover:scale-110 hover:rotate-12 shadow-lg backdrop-blur-sm`}
        >
          {darkMode ? (
            <Sun
              className="w-5 sm:w-6 h-5 sm:h-6 animate-spin"
              style={{ animationDuration: "4s" }}
            />
          ) : (
            <Moon className="w-5 sm:w-6 h-5 sm:h-6" />
          )}
        </button>
      </div>

      <div className="relative z-10 min-h-screen flex items-center justify-center px-4 sm:px-6 py-8 sm:py-12">
        <div className="w-full max-w-md sm:max-w-lg lg:max-w-2xl">
          {/* Header */}
          <div className="text-center mb-6 sm:mb-8">
            <div className="flex items-center justify-center gap-3 sm:gap-4 mb-4 sm:mb-6">
              <div className="relative">
                <div className="w-12 sm:w-16 h-12 sm:h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl sm:rounded-2xl flex items-center justify-center shadow-2xl animate-pulse">
                  <Sparkles
                    className="w-6 sm:w-8 h-6 sm:h-8 text-white animate-spin"
                    style={{ animationDuration: "3s" }}
                  />
                </div>
                <div className="absolute -inset-1 sm:-inset-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl sm:rounded-2xl blur opacity-20 animate-pulse"></div>
              </div>
              <div>
                <h1
                  className={`text-3xl sm:text-5xl font-black bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600 bg-clip-text text-transparent animate-pulse`}
                >
                  Ultra Notes
                </h1>
                <div
                  className={`text-sm sm:text-base ${
                    darkMode ? "text-gray-300" : "text-gray-600"
                  } mt-1`}
                >
                  {getGreeting()}
                </div>
              </div>
            </div>

            <h2
              className={`text-2xl sm:text-4xl font-bold mb-2 sm:mb-4 ${
                darkMode ? "text-white" : "text-gray-800"
              }`}
            >
              {isLogin ? "Welcome Back! ✨" : "Join the Magic! 🚀"}
            </h2>
            <p
              className={`text-sm sm:text-lg ${
                darkMode ? "text-gray-300" : "text-gray-600"
              } max-w-md mx-auto`}
            >
              {isLogin
                ? "Ready to dive back into your brilliant thoughts?"
                : "Start your incredible note-taking journey today!"}
            </p>
          </div>

          {/* Main Auth Card */}
          <div
            className={`backdrop-blur-xl ${
              darkMode ? "bg-gray-800/40" : "bg-white/40"
            } rounded-2xl sm:rounded-3xl border ${
              darkMode ? "border-gray-700/50" : "border-white/50"
            } p-6 sm:p-10 shadow-2xl transition-all duration-500 relative overflow-hidden`}
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
                    {isLogin ? "Signing you in..." : "Creating your account..."}
                  </span>
                </div>
              </div>
            )}

            {/* Mode Toggle */}
            <div className="flex bg-gray-100/50 dark:bg-gray-700/50 rounded-xl sm:rounded-2xl p-1 sm:p-2 mb-6 sm:mb-8">
              <button
                onClick={() => isLogin || switchMode()}
                className={`flex-1 px-4 sm:px-6 py-2 sm:py-3 rounded-lg sm:rounded-xl transition-all duration-500 font-bold text-sm sm:text-base ${
                  isLogin
                    ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg transform scale-105"
                    : `${
                        darkMode
                          ? "text-gray-300 hover:text-white"
                          : "text-gray-600 hover:text-gray-800"
                      }`
                }`}
              >
                Sign In
              </button>
              <button
                onClick={() => !isLogin || switchMode()}
                className={`flex-1 px-4 sm:px-6 py-2 sm:py-3 rounded-lg sm:rounded-xl transition-all duration-500 font-bold text-sm sm:text-base ${
                  !isLogin
                    ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg transform scale-105"
                    : `${
                        darkMode
                          ? "text-gray-300 hover:text-white"
                          : "text-gray-600 hover:text-gray-800"
                      }`
                }`}
              >
                Sign Up
              </button>
            </div>

            {/* Social Auth */}
            <div className="space-y-3 sm:space-y-4 mb-6 sm:mb-8">
              <button
                onClick={() => handleSocialAuth("Google")}
                disabled={isLoading}
                className={`w-full px-4 sm:px-6 py-3 sm:py-4 ${
                  darkMode
                    ? "bg-gray-700/60 hover:bg-gray-600/60 border-gray-600"
                    : "bg-white/60 hover:bg-white/80 border-gray-200/50"
                } border rounded-xl sm:rounded-2xl transition-all duration-500 flex items-center justify-center gap-3 sm:gap-4 font-medium transform hover:scale-105 shadow-lg backdrop-blur-sm disabled:opacity-50 text-sm sm:text-base`}
              >
                <Chrome className="w-4 sm:w-5 h-4 sm:h-5" />
                Continue with Google
              </button>

              <div className="grid grid-cols-2 gap-3 sm:gap-4">
                <button
                  onClick={() => handleSocialAuth("GitHub")}
                  disabled={isLoading}
                  className={`px-4 sm:px-6 py-3 sm:py-4 ${
                    darkMode
                      ? "bg-gray-700/60 hover:bg-gray-600/60 border-gray-600"
                      : "bg-white/60 hover:bg-white/80 border-gray-200/50"
                  } border rounded-xl sm:rounded-2xl transition-all duration-500 flex items-center justify-center gap-2 sm:gap-3 font-medium transform hover:scale-105 shadow-lg backdrop-blur-sm disabled:opacity-50 text-sm sm:text-base`}
                >
                  <Github className="w-4 sm:w-5 h-4 sm:h-5" />
                  <span className="hidden sm:inline">GitHub</span>
                </button>
                <button
                  onClick={() => handleSocialAuth("Apple")}
                  disabled={isLoading}
                  className={`px-4 sm:px-6 py-3 sm:py-4 ${
                    darkMode
                      ? "bg-gray-700/60 hover:bg-gray-600/60 border-gray-600"
                      : "bg-white/60 hover:bg-white/80 border-gray-200/50"
                  } border rounded-xl sm:rounded-2xl transition-all duration-500 flex items-center justify-center gap-2 sm:gap-3 font-medium transform hover:scale-105 shadow-lg backdrop-blur-sm disabled:opacity-50 text-sm sm:text-base`}
                >
                  <Apple className="w-4 sm:w-5 h-4 sm:h-5" />
                  <span className="hidden sm:inline">Apple</span>
                </button>
              </div>
            </div>

            {/* Divider */}
            <div className="relative mb-6 sm:mb-8">
              <div className={`absolute inset-0 flex items-center`}>
                <div
                  className={`w-full border-t ${
                    darkMode ? "border-gray-600/50" : "border-gray-200/50"
                  }`}
                ></div>
              </div>
              <div className="relative flex justify-center text-xs sm:text-sm">
                <span
                  className={`px-3 sm:px-4 ${
                    darkMode
                      ? "bg-gray-800/40 text-gray-400"
                      : "bg-white/40 text-gray-500"
                  } backdrop-blur-sm rounded-lg`}
                >
                  Or continue with email
                </span>
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
              {/* Name fields for signup */}
              {!isLogin && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 sm:pl-4 flex items-center pointer-events-none">
                      <User
                        className={`w-4 sm:w-5 h-4 sm:h-5 ${
                          darkMode ? "text-gray-400" : "text-gray-500"
                        }`}
                      />
                    </div>
                    <input
                      type="text"
                      placeholder="First Name"
                      value={formData.firstName}
                      onChange={(e) =>
                        handleInputChange("firstName", e.target.value)
                      }
                      className={`w-full pl-10 sm:pl-12 pr-10 sm:pr-12 py-3 sm:py-4 ${
                        darkMode
                          ? "bg-gray-700/60 border-gray-600/50 text-white placeholder-gray-400"
                          : "bg-white/60 border-gray-200/50"
                      } border rounded-xl sm:rounded-2xl focus:ring-4 focus:ring-purple-500/30 focus:border-purple-500 outline-none transition-all duration-500 backdrop-blur-sm hover:shadow-lg text-sm sm:text-base ${
                        errors.firstName ? "border-red-500 ring-red-500/30" : ""
                      }`}
                    />
                    <div className="absolute inset-y-0 right-0 pr-3 sm:pr-4 flex items-center">
                      {validations.firstName ? (
                        <CheckCircle className="w-4 sm:w-5 h-4 sm:h-5 text-green-500" />
                      ) : (
                        formData.firstName && (
                          <AlertCircle className="w-4 sm:w-5 h-4 sm:h-5 text-red-500" />
                        )
                      )}
                    </div>
                    {errors.firstName && (
                      <p className="mt-1 text-xs sm:text-sm text-red-500 flex items-center gap-1">
                        <AlertCircle className="w-3 sm:w-4 h-3 sm:h-4" />
                        {errors.firstName}
                      </p>
                    )}
                  </div>

                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 sm:pl-4 flex items-center pointer-events-none">
                      <User
                        className={`w-4 sm:w-5 h-4 sm:h-5 ${
                          darkMode ? "text-gray-400" : "text-gray-500"
                        }`}
                      />
                    </div>
                    <input
                      type="text"
                      placeholder="Last Name"
                      value={formData.lastName}
                      onChange={(e) =>
                        handleInputChange("lastName", e.target.value)
                      }
                      className={`w-full pl-10 sm:pl-12 pr-10 sm:pr-12 py-3 sm:py-4 ${
                        darkMode
                          ? "bg-gray-700/60 border-gray-600/50 text-white placeholder-gray-400"
                          : "bg-white/60 border-gray-200/50"
                      } border rounded-xl sm:rounded-2xl focus:ring-4 focus:ring-purple-500/30 focus:border-purple-500 outline-none transition-all duration-500 backdrop-blur-sm hover:shadow-lg text-sm sm:text-base ${
                        errors.lastName ? "border-red-500 ring-red-500/30" : ""
                      }`}
                    />
                    <div className="absolute inset-y-0 right-0 pr-3 sm:pr-4 flex items-center">
                      {validations.lastName ? (
                        <CheckCircle className="w-4 sm:w-5 h-4 sm:h-5 text-green-500" />
                      ) : (
                        formData.lastName && (
                          <AlertCircle className="w-4 sm:w-5 h-4 sm:h-5 text-red-500" />
                        )
                      )}
                    </div>
                    {errors.lastName && (
                      <p className="mt-1 text-xs sm:text-sm text-red-500 flex items-center gap-1">
                        <AlertCircle className="w-3 sm:w-4 h-3 sm:h-4" />
                        {errors.lastName}
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* Email */}
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 sm:pl-4 flex items-center pointer-events-none">
                  <Mail
                    className={`w-4 sm:w-5 h-4 sm:h-5 ${
                      darkMode ? "text-gray-400" : "text-gray-500"
                    }`}
                  />
                </div>
                <input
                  type="email"
                  placeholder="Enter your email"
                  value={formData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  className={`w-full pl-10 sm:pl-12 pr-10 sm:pr-12 py-3 sm:py-4 ${
                    darkMode
                      ? "bg-gray-700/60 border-gray-600/50 text-white placeholder-gray-400"
                      : "bg-white/60 border-gray-200/50"
                  } border rounded-xl sm:rounded-2xl focus:ring-4 focus:ring-purple-500/30 focus:border-purple-500 outline-none transition-all duration-500 backdrop-blur-sm hover:shadow-lg text-sm sm:text-base ${
                    errors.email ? "border-red-500 ring-red-500/30" : ""
                  }`}
                />
                <div className="absolute inset-y-0 right-0 pr-3 sm:pr-4 flex items-center">
                  {validations.email ? (
                    <CheckCircle className="w-4 sm:w-5 h-4 sm:h-5 text-green-500" />
                  ) : (
                    formData.email && (
                      <AlertCircle className="w-4 sm:w-5 h-4 sm:h-5 text-red-500" />
                    )
                  )}
                </div>
                {errors.email && (
                  <p className="mt-1 text-xs sm:text-sm text-red-500 flex items-center gap-1">
                    <AlertCircle className="w-3 sm:w-4 h-3 sm:h-4" />
                    {errors.email}
                  </p>
                )}
              </div>

              {/* Password */}
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 sm:pl-4 flex items-center pointer-events-none">
                  <Lock
                    className={`w-4 sm:w-5 h-4 sm:h-5 ${
                      darkMode ? "text-gray-400" : "text-gray-500"
                    }`}
                  />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={(e) =>
                    handleInputChange("password", e.target.value)
                  }
                  className={`w-full pl-10 sm:pl-12 pr-10 sm:pr-12 py-3 sm:py-4 ${
                    darkMode
                      ? "bg-gray-700/60 border-gray-600/50 text-white placeholder-gray-400"
                      : "bg-white/60 border-gray-200/50"
                  } border rounded-xl sm:rounded-2xl focus:ring-4 focus:ring-purple-500/30 focus:border-purple-500 outline-none transition-all duration-500 backdrop-blur-sm hover:shadow-lg text-sm sm:text-base ${
                    errors.password ? "border-red-500 ring-red-500/30" : ""
                  }`}
                />
                <div className="absolute inset-y-0 right-0 pr-3 sm:pr-4 flex items-center gap-2">
                  {validations.password && (
                    <CheckCircle className="w-4 sm:w-5 h-4 sm:h-5 text-green-500" />
                  )}
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className={`${
                      darkMode
                        ? "text-gray-400 hover:text-gray-300"
                        : "text-gray-500 hover:text-gray-700"
                    } transition-colors duration-300`}
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 sm:w-5 h-4 sm:h-5" />
                    ) : (
                      <Eye className="w-4 sm:w-5 h-4 sm:h-5" />
                    )}
                  </button>
                </div>
                {errors.password && (
                  <p className="mt-1 text-xs sm:text-sm text-red-500 flex items-center gap-1">
                    <AlertCircle className="w-3 sm:w-4 h-3 sm:h-4" />
                    {errors.password}
                  </p>
                )}
                {!isLogin && formData.password && (
                  <div className="mt-2">
                    <div className="flex gap-1">
                      {[...Array(4)].map((_, i) => (
                        <div
                          key={i}
                          className={`h-1 flex-1 rounded-full transition-all duration-300 ${
                            formData.password.length >= (i + 1) * 2
                              ? formData.password.length >= 8
                                ? "bg-green-500"
                                : "bg-yellow-500"
                              : "bg-gray-300"
                          }`}
                        />
                      ))}
                    </div>
                    <p
                      className={`mt-1 text-xs ${
                        formData.password.length >= 8
                          ? "text-green-500"
                          : "text-yellow-500"
                      }`}
                    >
                      Password strength:{" "}
                      {formData.password.length >= 8 ? "Strong" : "Weak"}
                    </p>
                  </div>
                )}
              </div>

              {/* Confirm Password for signup */}
              {!isLogin && (
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 sm:pl-4 flex items-center pointer-events-none">
                    <Shield
                      className={`w-4 sm:w-5 h-4 sm:h-5 ${
                        darkMode ? "text-gray-400" : "text-gray-500"
                      }`}
                    />
                  </div>
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Confirm your password"
                    value={formData.confirmPassword}
                    onChange={(e) =>
                      handleInputChange("confirmPassword", e.target.value)
                    }
                    className={`w-full pl-10 sm:pl-12 pr-10 sm:pr-12 py-3 sm:py-4 ${
                      darkMode
                        ? "bg-gray-700/60 border-gray-600/50 text-white placeholder-gray-400"
                        : "bg-white/60 border-gray-200/50"
                    } border rounded-xl sm:rounded-2xl focus:ring-4 focus:ring-purple-500/30 focus:border-purple-500 outline-none transition-all duration-500 backdrop-blur-sm hover:shadow-lg text-sm sm:text-base ${
                      errors.confirmPassword
                        ? "border-red-500 ring-red-500/30"
                        : ""
                    }`}
                  />
                  <div className="absolute inset-y-0 right-0 pr-3 sm:pr-4 flex items-center gap-2">
                    {validations.confirmPassword &&
                      formData.confirmPassword && (
                        <CheckCircle className="w-4 sm:w-5 h-4 sm:h-5 text-green-500" />
                      )}
                    <button
                      type="button"
                      onClick={() =>
                        setShowConfirmPassword(!showConfirmPassword)
                      }
                      className={`${
                        darkMode
                          ? "text-gray-400 hover:text-gray-300"
                          : "text-gray-500 hover:text-gray-700"
                      } transition-colors duration-300`}
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="w-4 sm:w-5 h-4 sm:h-5" />
                      ) : (
                        <Eye className="w-4 sm:w-5 h-4 sm:h-5" />
                      )}
                    </button>
                  </div>
                  {errors.confirmPassword && (
                    <p className="mt-1 text-xs sm:text-sm text-red-500 flex items-center gap-1">
                      <AlertCircle className="w-3 sm:w-4 h-3 sm:h-4" />
                      {errors.confirmPassword}
                    </p>
                  )}
                </div>
              )}

              {/* Remember Me / Forgot Password */}
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 sm:gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.rememberMe}
                    onChange={(e) =>
                      handleInputChange("rememberMe", e.target.checked)
                    }
                    className="w-4 sm:w-5 h-4 sm:h-5 text-purple-600 bg-gray-100 border-gray-300 rounded focus:ring-purple-500 focus:ring-2"
                  />
                  <span
                    className={`text-xs sm:text-sm ${
                      darkMode ? "text-gray-300" : "text-gray-700"
                    }`}
                  >
                    Remember me
                  </span>
                </label>

                {isLogin && (
                  <button
                    type="button"
                    className="text-xs sm:text-sm text-purple-600 hover:text-purple-500 transition-colors duration-300 font-medium"
                  >
                    Forgot password?
                  </button>
                )}
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full px-6 sm:px-8 py-3 sm:py-4 bg-gradient-to-r from-purple-500 via-pink-500 to-purple-600 text-white rounded-xl sm:rounded-2xl hover:from-purple-600 hover:via-pink-600 hover:to-purple-700 transition-all duration-500 flex items-center justify-center gap-3 sm:gap-4 font-bold transform hover:scale-105 shadow-2xl text-sm sm:text-lg disabled:opacity-50 disabled:cursor-not-allowed animate-pulse"
              >
                {isLoading ? (
                  <>
                    <div className="w-4 sm:w-5 h-4 sm:h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    {isLogin ? "Signing In..." : "Creating Account..."}
                  </>
                ) : (
                  <>
                    {isLogin
                      ? "Sign In to Ultra Notes"
                      : "Create Ultra Account"}
                    <ArrowRight className="w-4 sm:w-5 h-4 sm:h-5 animate-bounce" />
                  </>
                )}
              </button>
            </form>

            {/* Additional Info */}
            <div className="mt-6 sm:mt-8 text-center">
              <p
                className={`text-xs sm:text-sm ${
                  darkMode ? "text-gray-400" : "text-gray-500"
                }`}
              >
                {isLogin
                  ? "Don't have an account? "
                  : "Already have an account? "}
                <button
                  onClick={switchMode}
                  disabled={isLoading}
                  className="text-purple-600 hover:text-purple-500 transition-colors duration-300 font-medium disabled:opacity-50"
                >
                  {isLogin ? "Sign up for free" : "Sign in here"}
                </button>
              </p>

              {!isLogin && (
                <p
                  className={`mt-3 sm:mt-4 text-xs ${
                    darkMode ? "text-gray-400" : "text-gray-500"
                  } leading-relaxed`}
                >
                  By creating an account, you agree to our{" "}
                  <a
                    href="#"
                    className="text-purple-600 hover:text-purple-500 transition-colors duration-300"
                  >
                    Terms of Service
                  </a>{" "}
                  and{" "}
                  <a
                    href="#"
                    className="text-purple-600 hover:text-purple-500 transition-colors duration-300"
                  >
                    Privacy Policy
                  </a>
                </p>
              )}
            </div>

            {/* Features Highlight */}
            <div className="mt-6 sm:mt-8 grid grid-cols-3 gap-4 sm:gap-6">
              {[
                {
                  icon: Zap,
                  title: "Lightning Fast",
                  color: "text-yellow-500",
                },
                { icon: Shield, title: "Secure", color: "text-green-500" },
                {
                  icon: Heart,
                  title: "Made with Love",
                  color: "text-pink-500",
                },
              ].map((feature, index) => (
                <div key={index} className="text-center">
                  <div
                    className={`inline-flex p-2 sm:p-3 rounded-lg sm:rounded-xl ${
                      darkMode ? "bg-gray-700/40" : "bg-white/40"
                    } backdrop-blur-sm mb-2 sm:mb-3`}
                  >
                    <feature.icon
                      className={`w-4 sm:w-6 h-4 sm:h-6 ${feature.color}`}
                    />
                  </div>
                  <p
                    className={`text-xs sm:text-sm font-medium ${
                      darkMode ? "text-gray-300" : "text-gray-700"
                    }`}
                  >
                    {feature.title}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Bottom Stats */}
          <div className="mt-6 sm:mt-8 text-center">
            <div className="flex justify-center gap-6 sm:gap-8 text-xs sm:text-sm opacity-60">
              <div className="flex items-center gap-1 sm:gap-2">
                <Star className="w-3 sm:w-4 h-3 sm:h-4 text-yellow-500" />
                <span>10M+ Users</span>
              </div>
              <div className="flex items-center gap-1 sm:gap-2">
                <Rocket className="w-3 sm:w-4 h-3 sm:h-4 text-blue-500" />
                <span>500M+ Notes</span>
              </div>
              <div className="flex items-center gap-1 sm:gap-2">
                <Crown className="w-3 sm:w-4 h-3 sm:h-4 text-purple-500" />
                <span>Award Winning</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthApp;
