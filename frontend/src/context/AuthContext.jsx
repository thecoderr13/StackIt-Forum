"use client"

import { createContext, useContext, useReducer, useEffect } from "react"
import axios from "axios"
import toast from "react-hot-toast"

const AuthContext = createContext()

const initialState = {
  user: null,
  token: localStorage.getItem("token"),
  isLoading: true,
  isAuthenticated: false,
}

const authReducer = (state, action) => {
  switch (action.type) {
    case "SET_LOADING":
      return { ...state, isLoading: action.payload }
    case "LOGIN_SUCCESS":
      return {
        ...state,
        user: action.payload.user,
        token: action.payload.token,
        isAuthenticated: true,
        isLoading: false,
      }
    case "LOGOUT":
      return {
        ...state,
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
      }
    case "UPDATE_USER":
      return {
        ...state,
        user: { ...state.user, ...action.payload },
      }
    default:
      return state
  }
}

export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState)

  // Set axios default headers
  useEffect(() => {
    if (state.token) {
      axios.defaults.headers.common["Authorization"] = `Bearer ${state.token}`
    } else {
      delete axios.defaults.headers.common["Authorization"]
    }
  }, [state.token])

  // Check if user is logged in on app start
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem("token")
      if (token) {
        try {
          const response = await axios.get(`${import.meta.env.VITE_API_URL}/auth/me`)
          
          dispatch({
            type: "LOGIN_SUCCESS",
            payload: {
              user: response.data.user,
              token,
            },
          })
        } catch (error) {
          localStorage.removeItem("token")
          dispatch({ type: "LOGOUT" })
        }
      } else {
        dispatch({ type: "SET_LOADING", payload: false })
      }
    }

    checkAuth()
  }, [])

  const login = async (email, password) => {
  //    console.log("LOGIN called with:", email, password);
  // console.log("URL:", `${import.meta.env.VITE_API_URL}/auth/login`);
    try {
      const response = await axios.post(`${import.meta.env.VITE_API_URL}/auth/login`, {
        email,
        password,
      })

      const { token, user } = response.data
      localStorage.setItem("token", token)

      dispatch({
        type: "LOGIN_SUCCESS",
        payload: { user, token },
      })

      toast.success("Login successful!")
      return { success: true }
    } catch (error) {
      const message = error.response?.data?.message || "Login failed"
      toast.error(message)
      return { success: false, message }
    }
  }

  const register = async (username, email, password) => {
    try {
      const response = await axios.post(`${import.meta.env.VITE_API_URL}/auth/register`, {
        username,
        email,
        password,
      })

      const { token, user } = response.data
      localStorage.setItem("token", token)

      dispatch({
        type: "LOGIN_SUCCESS",
        payload: { user, token },
      })

      toast.success("Registration successful!")
      return { success: true }
    } catch (error) {
      const message = error.response?.data?.message || "Registration failed"
      toast.error(message)
      return { success: false, message }
    }
  }

  const logout = () => {
    localStorage.removeItem("token")
    dispatch({ type: "LOGOUT" })
    toast.success("Logged out successfully")
  }

  const updateUser = (userData) => {
    dispatch({ type: "UPDATE_USER", payload: userData })
  }

  const value = {
    ...state,
    login,
    register,
    logout,
    updateUser,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
