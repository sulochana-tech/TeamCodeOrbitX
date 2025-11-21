import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import api from "../api/axios";
import { useAuth } from "../hooks/useAuth";
import { getSessionId } from "../utils/sessionUtils";

export default function IssueCard({ issue }) {
  const [upvoteCount, setUpvoteCount] = useState(issue.upvoteCount || 0);
  const [upvoted, setUpvoted] = useState(false);
  const [loading, setLoading] = useState(false);
  const { isAuthenticated } = useAuth();

  // Status configuration
  const statusConfig = {
    pending: { 
      color: "bg-orange-100 text-orange-800 border-orange-200",
      label: "Under Review", 
      icon: "🕒" 
    },
    "in-progress": { 
      color: "bg-blue-100 text-blue-800 border-blue-200",
      label: "In Progress", 
      icon: "🚧" 
    },
    resolved: { 
      color: "bg-green-100 text-green-800 border-green-200",
      label: "Resolved", 
      icon: "✅" 
    }
  };

  const status = statusConfig[issue.status] || statusConfig.pending;

  // Fetch upvote status when component mounts
  useEffect(() => {
    const fetchUpvoteStatus = async () => {
      try {
        const sessionId = getSessionId();
        const { data } = await api.get(
          `/upvotes/status/${issue._id}?sessionId=${sessionId}`
        );
        setUpvoted(data.upvoted);
        setUpvoteCount(data.upvoteCount);
      } catch (error) {
        console.error("Error fetching upvote status:", error);
      }
    };
    fetchUpvoteStatus();
  }, [issue._id]);

  const handleToggleUpvote = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const sessionId = getSessionId();
      const { data } = await api.post("/upvotes/toggle", {
        issueId: issue._id,
        sessionId: sessionId,
      });
      setUpvoted(data.upvoted);
      setUpvoteCount(data.upvoteCount);
    } catch (error) {
      console.error("Error toggling upvote:", error);
      alert("Failed to upvote. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-all duration-300 overflow-hidden h-full flex flex-col">
      {/* Image Section */}
      <Link to={`/issue/${issue._id}`} className="block flex-shrink-0">
        <div className="relative">
          <img
            src={issue.image}
            className="w-full h-48 object-cover"
            alt={issue.category}
          />
          <div className="absolute top-3 right-3">
            <span className={`px-3 py-1.5 rounded-full text-xs font-semibold border ${status.color}`}>
              {status.icon} {status.label}
            </span>
          </div>
        </div>
      </Link>

      {/* Content Section */}
      <div className="p-6 flex-grow flex flex-col">
        <Link to={`/issue/${issue._id}`} className="flex-grow block">
          {/* Category and Date */}
          <div className="flex items-start justify-between mb-3">
            <h2 className="text-xl font-bold text-gray-900 capitalize leading-tight flex-1 pr-2">
              {issue.category}
            </h2>
            <span className="text-sm text-gray-500 whitespace-nowrap flex-shrink-0">
              {formatDate(issue.createdAt)}
            </span>
          </div>

          {/* Description */}
          <p className="text-gray-700 line-clamp-3 leading-relaxed mb-4">
            {issue.description}
          </p>

          {/* Location */}
          <div className="flex items-center text-sm text-gray-600">
            <span className="mr-2">📍</span>
            <span className="truncate">{issue.locationName}</span>
          </div>
        </Link>

        {/* Action Section */}
        <div className="mt-auto pt-4 border-t border-gray-100">
          <div className="flex items-center justify-between gap-3">
            <button
              onClick={handleToggleUpvote}
              disabled={loading}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-lg font-semibold transition-all flex-shrink-0 ${
                upvoted
                  ? "bg-red-50 text-red-700 border border-red-200 hover:bg-red-100"
                  : "bg-gray-50 text-gray-700 border border-gray-200 hover:bg-gray-100"
              } ${loading ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
            >
              <span className={`text-lg ${upvoted ? "text-red-500" : "text-gray-400"}`}>
                {upvoted ? "❤️" : "🤍"}
              </span>
              <span className="font-medium min-w-[20px] text-center">
                {upvoteCount}
              </span>
              <span className="text-sm whitespace-nowrap hidden sm:inline">
                {upvoted ? "Supported" : "Support"}
              </span>
            </button>

            <Link 
              to={`/issue/${issue._id}`}
              className="px-5 py-2.5 bg-gray-900 text-white rounded-lg font-semibold hover:bg-gray-800 transition-colors text-sm whitespace-nowrap flex-shrink-0 text-center"
            >
              View Details
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}