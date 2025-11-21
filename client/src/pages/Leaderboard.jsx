import { useQuery } from "@tanstack/react-query";
import api from "../api/axios";
import useAuth from "../hooks/useAuth";
import AchievementShare from "../components/AchievementShare";

export default function Leaderboard() {
  const { user } = useAuth();
  const { data: users, isLoading } = useQuery({
    queryKey: ["leaderboard"],
    queryFn: async () => {
      const { data } = await api.get("/users/leaderboard");
      return data;
    },
  });

  // Find current user's rank
  const currentUserRank = user
    ? users?.findIndex((u) => u._id === user._id) + 1
    : null;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading community rankings...</p>
        </div>
      </div>
    );
  }

  const getRankTier = (index) => {
    if (index === 0) return { 
      color: "from-amber-500 to-amber-600", 
      border: "border-amber-200",
      bg: "bg-amber-50"
    };
    if (index === 1) return { 
      color: "from-gray-400 to-gray-600", 
      border: "border-gray-200",
      bg: "bg-gray-50"
    };
    if (index === 2) return { 
      color: "from-orange-400 to-orange-500", 
      border: "border-orange-200",
      bg: "bg-orange-50"
    };
    return { 
      color: "from-white to-gray-50", 
      border: "border-gray-100",
      bg: "bg-white"
    };
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header Section */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-6">
            <div className="w-16 h-16 bg-blue-800 rounded-full flex items-center justify-center mr-6">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
            </div>
            <div className="text-left">
              <h1 className="text-4xl font-bold text-gray-900">Community Engagement Rankings</h1>
              <p className="text-gray-600 mt-2 text-lg">Public Service Contribution Metrics</p>
            </div>
          </div>
          <div className="w-32 h-1 bg-blue-800 mx-auto rounded-full"></div>
        </div>

        {/* Statistics Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 text-center">
            <div className="text-2xl font-bold text-blue-800 mb-2">{users?.length || 0}</div>
            <div className="text-gray-600 font-medium">Active Contributors</div>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 text-center">
            <div className="text-2xl font-bold text-green-600 mb-2">
              {users?.reduce((total, user) => total + (user.points || 0), 0) || 0}
            </div>
            <div className="text-gray-600 font-medium">Total Points</div>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 text-center">
            <div className="text-2xl font-bold text-purple-600 mb-2">
              {users?.filter(u => u.points > 50).length || 0}
            </div>
            <div className="text-gray-600 font-medium">High Contributors</div>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 text-center">
            <div className="text-2xl font-bold text-orange-600 mb-2">
              {currentUserRank || '--'}
            </div>
            <div className="text-gray-600 font-medium">Your Position</div>
          </div>
        </div>

        {/* Current User Status */}
        {user && currentUserRank && currentUserRank > 0 && (
          <div className="bg-gradient-to-r from-blue-800 to-blue-900 rounded-lg shadow-lg p-6 mb-8 text-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-6">
                <div className="w-20 h-20 bg-white/10 rounded-full flex items-center justify-center border border-white/20">
                  <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-2xl font-semibold mb-2">Your Community Standing</h3>
                  <p className="text-blue-100 text-lg">
                    Position #{currentUserRank} of {users?.length || 0} contributors
                  </p>
                  <p className="text-blue-200 mt-1">
                    {users?.[currentUserRank - 1]?.points || 0} contribution points
                  </p>
                </div>
              </div>
              <AchievementShare 
                user={user} 
                rank={currentUserRank} 
                totalUsers={users?.length || 0}
              />
            </div>
          </div>
        )}

        {/* Rankings Table */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          {/* Table Header */}
          <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
            <div className="grid grid-cols-12 gap-4 text-sm font-semibold text-gray-700 uppercase tracking-wide">
              <div className="col-span-1">Rank</div>
              <div className="col-span-6">Contributor</div>
              <div className="col-span-3 text-center">Points</div>
              <div className="col-span-2 text-center">Status</div>
            </div>
          </div>

          {/* Table Body */}
          {!users || users.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No Active Contributors</h3>
              <p className="text-gray-600 max-w-md mx-auto">
                Community engagement metrics will appear as citizens participate in public service initiatives.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {users.map((u, index) => {
                const isCurrentUser = user && u._id === user._id;
                const tier = getRankTier(index);

                return (
                  <div
                    key={u._id}
                    className={`px-6 py-4 transition-colors ${
                      isCurrentUser ? 'bg-blue-50 border-l-4 border-blue-500' : 'hover:bg-gray-50'
                    }`}
                  >
                    <div className="grid grid-cols-12 gap-4 items-center">
                      {/* Rank */}
                      <div className="col-span-1">
                        <div className={`w-10 h-10 rounded-full bg-gradient-to-r ${tier.color} flex items-center justify-center text-white font-bold text-sm border ${tier.border}`}>
                          {index + 1}
                        </div>
                      </div>

                      {/* Contributor Info */}
                      <div className="col-span-6">
                        <div className="flex items-center gap-3">
                          <h3 className="text-lg font-semibold text-gray-900">
                            {u.fullName}
                          </h3>
                          {isCurrentUser && (
                            <span className="bg-blue-100 text-blue-800 text-xs font-medium px-3 py-1 rounded-full border border-blue-200">
                              Your Account
                            </span>
                          )}
                        </div>
                        <p className="text-gray-600 text-sm mt-1">{u.email}</p>
                      </div>

                      {/* Points */}
                      <div className="col-span-3 text-center">
                        <div className="inline-flex flex-col items-center">
                          <span className="text-2xl font-bold text-gray-900">{u.points}</span>
                          <span className="text-xs text-gray-500 uppercase tracking-wide">Points</span>
                        </div>
                      </div>

                      {/* Status */}
                      <div className="col-span-2 text-center">
                        {index < 3 ? (
                          <span className="inline-flex items-center gap-1 bg-green-100 text-green-800 text-xs font-medium px-3 py-1 rounded-full">
                            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                            Top Contributor
                          </span>
                        ) : (
                          <span className="text-gray-500 text-sm">Active</span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Points System */}
        <div className="mt-8 bg-white rounded-lg shadow-sm border border-gray-200 p-8">
          <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">Contribution Metrics System</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="text-center p-6 border border-gray-200 rounded-lg">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">Issue Reporting</h4>
              <p className="text-3xl font-bold text-blue-600 mb-2">+10</p>
              <p className="text-gray-600 text-sm">Points per verified issue report</p>
            </div>

            <div className="text-center p-6 border border-gray-200 rounded-lg">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
                </svg>
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">Community Support</h4>
              <p className="text-3xl font-bold text-green-600 mb-2">+1</p>
              <p className="text-gray-600 text-sm">Point per issue upvote received</p>
            </div>

            <div className="text-center p-6 border border-gray-200 rounded-lg">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                </svg>
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">Constructive Feedback</h4>
              <p className="text-3xl font-bold text-purple-600 mb-2">+2</p>
              <p className="text-gray-600 text-sm">Points per helpful comment</p>
            </div>

            <div className="text-center p-6 border border-gray-200 rounded-lg">
              <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">Resolution Impact</h4>
              <p className="text-3xl font-bold text-orange-600 mb-2">+5</p>
              <p className="text-gray-600 text-sm">Bonus points for resolved issues</p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-8 pt-6 border-t border-gray-200">
          <p className="text-sm text-gray-500">
            Municipal Corporation Public Service Portal • Community Engagement Metrics
          </p>
          <p className="text-xs text-gray-400 mt-1">
            Rankings updated in real-time based on community contributions
          </p>
        </div>
      </div>
    </div>
  );
}