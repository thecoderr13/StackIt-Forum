"use client"

import { useState,useEffect, useRef } from "react"
import { Link, useNavigate, useLocation } from "react-router-dom"
import { Menu, X, Bell, User, LogOut, Search } from "lucide-react"
import { useAuth } from "../context/AuthContext"
import { useNotifications } from "../context/NotificationContext"
import NotificationDropdown from "./NotificationDropdown"
import axios from "axios"

const Navbar = () => {
  const menuRef = useRef(null);
  const buttonRef = useRef(null);
  const profileRef = useRef(null);
const [searchTerm, setSearchTerm] = useState("")
const [searchResults, setSearchResults] = useState([])
const [showDropdown, setShowDropdown] = useState(false)
const searchRef = useRef(null)

  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isNotificationOpen, setIsNotificationOpen] = useState(false)
  const [isProfileOpen, setIsProfileOpen] = useState(false)
  const { isAuthenticated, user, logout } = useAuth()
  const { unreadCount } = useNotifications()
  const navigate = useNavigate()
  const location = useLocation()

  const handleLogout = () => {
    logout()
    navigate("/")
    setIsProfileOpen(false)
  }

  const isActive = (path) => location.pathname === path
useEffect(() => {
  const handleClickOutside = (event) => {
    if (
      isMenuOpen &&
      menuRef.current &&
      !menuRef.current.contains(event.target) &&
      buttonRef.current &&
      !buttonRef.current.contains(event.target)
    ) {
      setIsMenuOpen(false);
    }
  };
  document.addEventListener("mousedown", handleClickOutside, true); // third arg true = capture phase

  return () => {
   document.addEventListener("mousedown", handleClickOutside, true); // third arg true = capture phase

  };
}, [isMenuOpen]);
useEffect(() => {
  const handleClickOutside = (event) => {
    if (
      isProfileOpen &&
      profileRef.current &&
      !profileRef.current.contains(event.target)
    ) {
      setIsProfileOpen(false);
    }
  };

  document.addEventListener("mousedown", handleClickOutside);
  return () => {
    document.removeEventListener("mousedown", handleClickOutside);
  };
}, [isProfileOpen]);

useEffect(() => {
  const delayDebounce = setTimeout(async () => {
    if (searchTerm.trim() !== "") {
      try {
        const res = await axios.get(`${import.meta.env.VITE_API_URL}/search?q=${searchTerm}`)
        setSearchResults(res.data)
        setShowDropdown(true)
      } catch (err) {
        console.error("Search failed", err)
      }
    } else {
      setSearchResults([])
      setShowDropdown(false)
    }
  }, 300) // 300ms debounce

  return () => clearTimeout(delayDebounce)
}, [searchTerm])
useEffect(() => {
  const handleClickOutside = (e) => {
    if (searchRef.current && !searchRef.current.contains(e.target)) {
      setShowDropdown(false)
    }
  }

  document.addEventListener("mousedown", handleClickOutside)
  return () => document.removeEventListener("mousedown", handleClickOutside)
}, [])


  return (
 <nav className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <div className="flex items-center justify-between h-16">
      {/* Logo */}
      <Link to="/" className="flex items-center space-x-2">
        <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
          <span className="text-white font-bold text-lg">S</span>
        </div>
        <span className="text-xl font-bold text-gray-900">StackIt</span>
      </Link>

      {/* Search (Desktop) */}
      <div className="relative hidden md:flex w-1/2 mx-6" ref={searchRef}>
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
        <input
          type="text"
          placeholder="Search questions..."
          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        {showDropdown && searchResults.length > 0 && (
          <div className="absolute top-full left-0 right-0 bg-white border border-gray-300 rounded-md mt-1 max-h-60 overflow-y-auto z-50 shadow-lg">
            {searchResults.map((q) => (
              <div
                key={q._id}
                onClick={() => {
                  navigate(`/questions/${q._id}`)
                  setShowDropdown(false)
                  setSearchTerm("")
                }}
                className="px-4 py-2 hover:bg-gray-100 cursor-pointer text-sm"
              >
                {q.title}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Desktop Navigation */}
      <div className="hidden md:flex items-center space-x-6">
        <Link
          to="/questions"
          className={`text-sm font-medium transition-colors duration-200 ${
            isActive("/questions") ? "text-primary-600" : "text-gray-700 hover:text-primary-600"
          }`}
        >
          Questions
        </Link>
        {isAuthenticated && (
          <Link
            to="/ask"
            className={`text-sm font-medium transition-colors duration-200 ${
              isActive("/ask") ? "text-primary-600" : "text-gray-700 hover:text-primary-600"
            }`}
          >
            Ask Question
          </Link>
        )}
        {user?.role === "admin" && (
          <Link
            to="/admin"
            className="hidden md:block text-sm font-medium text-gray-700 hover:text-primary-600 transition-colors duration-200"
          >
            Admin Dashboard
          </Link>
        )}
      </div>

      {/* User Actions */}
      <div className="flex items-center space-x-4">
        {isAuthenticated ? (
          <>
            {/* Notifications */}
            <div className="relative">
              <button
                onClick={() => setIsNotificationOpen(!isNotificationOpen)}
                className="relative p-2 text-gray-600 hover:text-primary-600 transition-colors duration-200"
              >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="notification-badge">
                    {unreadCount > 99 ? "99+" : unreadCount}
                  </span>
                )}
              </button>
              {isNotificationOpen && (
                <NotificationDropdown onClose={() => setIsNotificationOpen(false)} />
              )}
            </div>

            {/* Profile Dropdown */}
            <div className="relative" ref={profileRef}>
              <button
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                className="flex items-center space-x-2 p-2 text-gray-600 hover:text-primary-600 transition-colors duration-200"
              >
                {user?.avatar ? (
                  <img
                    src={user.avatar}
                    alt={user.username}
                    className="w-10 h-10 rounded-full object-cover shrink-0"
                    onError={(e) => {
                      e.target.onerror = null
                      e.target.style.display = "none"
                    }}
                  />
                ) : (
                  <div className="w-7 h-7 bg-primary-100 rounded-full flex items-center justify-center">
                    <span className="text-primary-600 text-xs font-semibold">
                      {user?.username?.[0]?.toUpperCase() || "U"}
                    </span>
                  </div>
                )}
              </button>

              {isProfileOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
                  <Link
                    to="/profile"
                    className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    onClick={() => setIsProfileOpen(false)}
                  >
                    <User className="w-4 h-4 mr-2" />
                    Profile
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    Logout
                  </button>
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="flex items-center space-x-4">
            <Link
              to="/login"
              className="text-sm font-medium text-gray-700 hover:text-primary-600 transition-colors duration-200"
            >
              Login
            </Link>
            <Link to="/register" className="btn-primary text-sm">
              Sign Up
            </Link>
          </div>
        )}

        {/* Mobile Menu Button */}
        <button
          ref={buttonRef}
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="md:hidden p-2 text-gray-600 hover:text-primary-600"
        >
          {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>
    </div>

    {/* Mobile Navigation */}
    {isMenuOpen && (
      <div
        ref={menuRef}
        className="md:hidden flex flex-col space-y-4 p-4 bg-white rounded-lg shadow"
      >
        {/* Mobile Search */}
        <div className="relative" ref={searchRef}>
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Search questions..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          {showDropdown && searchResults.length > 0 && (
            <div className="absolute top-full left-0 right-0 bg-white border border-gray-300 rounded-md mt-1 max-h-60 overflow-y-auto z-50 shadow-lg">
              {searchResults.map((q) => (
                <div
                  key={q._id}
                  onClick={() => {
                    navigate(`/questions/${q._id}`)
                    setShowDropdown(false)
                    setSearchTerm("")
                  }}
                  className="px-4 py-2 hover:bg-gray-100 cursor-pointer text-sm"
                >
                  {q.title}
                </div>
              ))}
            </div>
          )}
        </div>

        <Link
          to="/questions"
          className="text-gray-700 hover:text-primary-600 font-medium"
          onClick={() => setIsMenuOpen(false)}
        >
          Questions
        </Link>
        {isAuthenticated && (
          <Link
            to="/ask"
            className="text-gray-700 hover:text-primary-600 font-medium"
            onClick={() => setIsMenuOpen(false)}
          >
            Ask Question
          </Link>
        )}
        {user?.role === "admin" && (
          <Link
            to="/admin"
            className="text-gray-700 hover:text-primary-600 font-medium"
            onClick={() => setIsMenuOpen(false)}
          >
            Admin Dashboard
          </Link>
        )}
      </div>
    )}
  </div>
</nav>

  )
}

export default Navbar
