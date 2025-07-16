import { BrowserRouter as Router, Routes, Route } from "react-router-dom"
import { Toaster } from "react-hot-toast"
import { AuthProvider } from "./context/AuthContext"
import { NotificationProvider } from "./context/NotificationContext"

// Components
import Navbar from "./components/Navbar"
import Footer from "./components/Footer"

// Pages
import Home from "./pages/Home"
import Questions from "./pages/Questions"
import QuestionDetail from "./pages/QuestionDetail"
import AskQuestion from "./pages/AskQuestion"
import Login from "./pages/Login"
import Register from "./pages/Register"
import Profile from "./pages/Profile"
import NotFound from "./pages/NotFound"
import Admin from "./pages/Admin"
import AdminUsers from "./pages/Admin/AdminUsers"
import AdminQuestions from "./pages/Admin/AdminQuestions"
import AdminAnswers from "./pages/Admin/AdminAnswers"
// Protected Route Component
import ProtectedRoute from "./components/ProtectedRoute"
import AllNotifications from "./pages/AllNotifications"
function App() {
  return (
    <AuthProvider>
      <NotificationProvider>
        <Router>
          <div className="min-h-screen flex flex-col">
            <Navbar />
            <main className="flex-1">
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/questions" element={<Questions />} />
                <Route path="/questions/:id" element={<QuestionDetail />} />
                <Route path="/login" element={<Login />} />
                <Route path="/admin" element={<Admin />} />
                <Route path="/admin/users" element={<AdminUsers />} />
                <Route path="/admin/questions" element={<AdminQuestions />} />
                <Route path="/admin/answers" element={<AdminAnswers />} />
                <Route path="/register" element={<Register />} />
                <Route path="/notifications" element={<AllNotifications />} />
                <Route
                  path="/ask"
                  element={
                    <ProtectedRoute>
                      <AskQuestion />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/profile"
                  element={
                    <ProtectedRoute>
                      <Profile />
                    </ProtectedRoute>
                  }
                />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </main>
            <Footer />
          </div>
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: "#363636",
                color: "#fff",
              },
            }}
          />
        </Router>
      </NotificationProvider>
    </AuthProvider>
  )
}

export default App
