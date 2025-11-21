import { useQuery } from "@tanstack/react-query";
import api from "../api/axios";
import IssueCard from "../components/IssueCard";

export default function Feed() {
  const { data: issues, isLoading } = useQuery({
    queryKey: ["issues"],
    queryFn: async () => {
      const { data } = await api.get("/issues/all");
      return data;
    },
  });

  if (isLoading)
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading public issues...</p>
        </div>
      </div>
    );

  // Calculate statistics for the header
  const totalIssues = issues?.length || 0;
  const resolvedIssues =
    issues?.filter((issue) => issue.status === "resolved").length || 0;
  const pendingIssues =
    issues?.filter((issue) => issue.status === "pending").length || 0;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header Section */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <div className="w-10 h-10 bg-red-600 rounded-full flex items-center justify-center mr-3">
              <span className="text-white font-bold text-lg">!</span>
            </div>
            <h1 className="text-4xl font-bold text-gray-900">
              Public Issues Feed
            </h1>
          </div>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Community-reported issues and their current resolution status
          </p>
          <div className="w-24 h-1 bg-red-600 mx-auto mt-4 rounded-full"></div>
        </div>

        {/* Statistics Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 text-center">
            <div className="text-2xl font-bold text-gray-900">
              {totalIssues}
            </div>
            <div className="text-gray-600">Total Issues</div>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 text-center">
            <div className="text-2xl font-bold text-green-600">
              {resolvedIssues}
            </div>
            <div className="text-gray-600">Resolved</div>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 text-center">
            <div className="text-2xl font-bold text-orange-600">
              {pendingIssues}
            </div>
            <div className="text-gray-600">Pending Review</div>
          </div>
        </div>

        {/* Issues Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {issues?.map((issue) => (
            <IssueCard key={issue._id} issue={issue} />
          ))}
        </div>

        {/* Empty State */}
        {issues?.length === 0 && (
          <div className="text-center py-12">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-4xl">📝</span>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              No Issues Reported
            </h3>
            <p className="text-gray-600">
              Be the first to report a community issue
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
