import { useQuery } from "@tanstack/react-query";
import api from "../api/axios";
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  XAxis,
  YAxis,
  Tooltip,
  Bar,
  ResponsiveContainer,
  Legend
} from "recharts";

export default function Statistics() {
  const { data: issues, isLoading } = useQuery({
    queryKey: ["stats"],
    queryFn: async () => {
      const { data } = await api.get("/issues/all");
      return data;
    },
  });

  if (isLoading) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Loading statistics...</p>
      </div>
    </div>
  );

  // Status data with Nepali government-themed colors
  const statusCounts = [
    { name: "Pending", value: issues.filter((i) => i.status === "pending").length, color: "#dc2626" },
    { name: "In Progress", value: issues.filter((i) => i.status === "in-progress").length, color: "#d97706" },
    { name: "Resolved", value: issues.filter((i) => i.status === "resolved").length, color: "#059669" },
  ];

  // Priority data
  const priorityCounts = issues.reduce((acc, curr) => {
    acc[curr.priority] = (acc[curr.priority] || 0) + 1;
    return acc;
  }, {});

  const priorityData = Object.keys(priorityCounts).map((key) => ({
    priority: key.charAt(0).toUpperCase() + key.slice(1),
    count: priorityCounts[key],
  }));

  // Category data
  const categoryCounts = issues.reduce((acc, curr) => {
    acc[curr.category] = (acc[curr.category] || 0) + 1;
    return acc;
  }, {});

  const categoryData = Object.keys(categoryCounts).map((key) => ({
    category: key,
    count: categoryCounts[key],
  }));

  // Summary cards data
  const totalIssues = issues.length;
  const resolvedIssues = statusCounts.find(s => s.name === "Resolved")?.value || 0;
  const resolutionRate = totalIssues > 0 ? ((resolvedIssues / totalIssues) * 100).toFixed(1) : 0;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Public Grievance Statistics
          </h1>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Comprehensive overview of citizen issues and resolution metrics for transparent governance
          </p>
          <div className="w-24 h-1 bg-red-600 mx-auto mt-4 rounded-full"></div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 text-center">
            <div className="text-3xl font-bold text-red-600 mb-2">{totalIssues}</div>
            <div className="text-gray-600 font-medium">Total Issues Reported</div>
            <div className="text-sm text-gray-500 mt-2">All citizen grievances</div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 text-center">
            <div className="text-3xl font-bold text-green-600 mb-2">{resolvedIssues}</div>
            <div className="text-gray-600 font-medium">Issues Resolved</div>
            <div className="text-sm text-gray-500 mt-2">Successfully addressed</div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 text-center">
            <div className="text-3xl font-bold text-blue-600 mb-2">{resolutionRate}%</div>
            <div className="text-gray-600 font-medium">Resolution Rate</div>
            <div className="text-sm text-gray-500 mt-2">Overall efficiency</div>
          </div>
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Status Distribution */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6 pb-2 border-b border-gray-200">
              Issue Status Distribution
            </h2>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statusCounts}
                    innerRadius={70}
                    outerRadius={120}
                    paddingAngle={2}
                    dataKey="value"
                    label={({ name, value, percent }) => 
                      `${name}: ${value} (${(percent * 100).toFixed(1)}%)`
                    }
                    labelLine={false}
                  >
                    {statusCounts.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value) => [`${value} issues`, 'Count']}
                    contentStyle={{ 
                      borderRadius: '8px',
                      border: '1px solid #e5e7eb',
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                    }}
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Category Distribution */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6 pb-2 border-b border-gray-200">
              Issues by Category
            </h2>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={categoryData} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
                  <XAxis 
                    dataKey="category" 
                    angle={-45}
                    textAnchor="end"
                    height={80}
                    interval={0}
                    tick={{ fontSize: 12 }}
                  />
                  <YAxis />
                  <Tooltip 
                    formatter={(value) => [`${value} issues`, 'Count']}
                    contentStyle={{ 
                      borderRadius: '8px',
                      border: '1px solid #e5e7eb',
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                    }}
                  />
                  <Bar 
                    dataKey="count" 
                    fill="#dc2626" 
                    radius={[4, 4, 0, 0]}
                    name="Number of Issues"
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Priority Distribution */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 lg:col-span-2">
            <h2 className="text-xl font-semibold text-gray-900 mb-6 pb-2 border-b border-gray-200">
              Issues by Priority Level
            </h2>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={priorityData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                  <XAxis 
                    dataKey="priority" 
                    tick={{ fontSize: 14 }}
                  />
                  <YAxis />
                  <Tooltip 
                    formatter={(value) => [`${value} issues`, 'Count']}
                    contentStyle={{ 
                      borderRadius: '8px',
                      border: '1px solid #e5e7eb',
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                    }}
                  />
                  <Bar 
                    dataKey="count" 
                    fill="#1e40af" 
                    radius={[4, 4, 0, 0]}
                    name="Number of Issues"
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Footer Note */}
        <div className="mt-8 text-center text-sm text-gray-500">
          <p>Data updated in real-time • Government of Nepal Public Grievance Management System</p>
        </div>
      </div>
    </div>
  );
}