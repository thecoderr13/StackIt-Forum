import { useState,useEffect } from "react";
import { useNavigate,Link } from "react-router-dom"
import { MessageCircle, Users, Award, TrendingUp, ArrowRight, Search } from "lucide-react"
import axios from "axios";

const Home = () => {
    const [searchTerm, setSearchTerm] = useState(""); 
 const [searchSuggestions, setSearchSuggestions] = useState([]);

const navigate = useNavigate();
const handleSearch = () => {
  if (searchTerm.trim()) {
    navigate(`/questions?search=${encodeURIComponent(searchTerm.trim())}`);
  }
};

useEffect(() => {
  const delayDebounce = setTimeout(() => {
    if (searchTerm.trim()) {
      axios
        .get(`${import.meta.env.VITE_API_URL}/search?q=${encodeURIComponent(searchTerm)}`)
        .then((res) => setSearchSuggestions(res.data))
        .catch(() => setSearchSuggestions([]));
    } else {
      setSearchSuggestions([]);
    }
  }, 300); // debounce

  return () => clearTimeout(delayDebounce);
}, [searchTerm]);

  const features = [
    {
      icon: MessageCircle,
      title: "Ask & Answer",
      description: "Post questions and get answers from the community with our rich text editor.",
    },
    {
      icon: Users,
      title: "Community Driven",
      description: "Join a collaborative community focused on learning and knowledge sharing.",
    },
    {
      icon: Award,
      title: "Reputation System",
      description: "Build your reputation by providing helpful answers and asking good questions.",
    },
    {
      icon: TrendingUp,
      title: "Voting System",
      description: "Upvote helpful content and help the best answers rise to the top.",
    },
  ]
const [stats, setStats] = useState({
  questions: 0,
  answers: 0,
  users: 0,
  topics: 0,
});

useEffect(() => {
  const fetchStats = async () => {
    try {
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/stats`);
      setStats(res.data);
    } catch (err) {
      console.error("Failed to load stats:", err);
    }
  };
  fetchStats();
}, []);
const statsDisplay = [
  { label: "Questions Asked", value: stats.questions },
  { label: "Answers Given", value: stats.answers },
  { label: "Active Users", value: stats.users },
  { label: "Topics Covered", value: stats.topics },
];


  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary-50 to-primary-100 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
              Welcome to <span className="text-primary-600">StackIt</span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              A minimal question-and-answer platform designed for collaborative learning and structured knowledge
              sharing within communities.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/questions" className="btn-primary text-lg px-8 py-3 inline-flex items-center">
                Browse Questions
                <ArrowRight className="ml-2 w-5 h-5" />
              </Link>
              <Link to="/register" className="btn-outline text-lg px-8 py-3">
                Join Community
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Search Section */}
      <section className="py-16 bg-white">
       <div className="relative max-w-2xl mx-auto">
  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-6 h-6" />
  <input
    type="text"
    value={searchTerm}
    onChange={(e) => setSearchTerm(e.target.value)}
    placeholder="Search for questions, topics, or keywords..."
    className="w-full pl-12 pr-4 py-4 text-lg border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent shadow-sm"
  />
  <button
    type="button"
    onClick={handleSearch}
    className="absolute right-2 top-1/2 transform -translate-y-1/2 btn-primary px-6 py-2"
  >
    Search
  </button>

  {/* Suggestions */}
  {searchSuggestions.length > 0 && (
    <ul className="absolute left-0 right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg z-10 max-h-60 overflow-auto">
      {searchSuggestions.map((q) => (
        <li
          key={q._id}
          className="px-4 py-2 hover:bg-gray-100 cursor-pointer text-sm"
          onClick={() => navigate(`/questions/${q._id}`)}
        >
          {q.title}
        </li>
      ))}
    </ul>
  )}
</div>

      </section>

      {/* Features Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Why Choose StackIt?</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Built with simplicity and user experience in mind, StackIt provides all the tools you need for effective
              knowledge sharing.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="card p-6 text-center hover:shadow-lg transition-shadow duration-300">
                <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <feature.icon className="w-6 h-6 text-primary-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-primary-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {statsDisplay.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-white mb-2">{stat.value}</div>
                <div className="text-primary-100">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Ready to get started?</h2>
          <p className="text-xl text-gray-600 mb-8">
            Join our community today and start sharing knowledge with developers worldwide.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/register" className="btn-primary text-lg px-8 py-3">
              Create Account
            </Link>
            <Link to="/ask" className="btn-outline text-lg px-8 py-3">
              Ask Your First Question
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}

export default Home
