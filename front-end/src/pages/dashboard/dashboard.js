import React, { useEffect, useState, useRef } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { getDashboardData, getAllPaymentStatistics } from '../../servicecall/api';

const AnimatedStat = ({ value, prefix = '', suffix = '' }) => {
  const [count, setCount] = useState(0);
  const startTimeRef = useRef(null);

  useEffect(() => {
    let animationFrame;
    const step = (timestamp) => {
      if (!startTimeRef.current) startTimeRef.current = timestamp;
      const progress = timestamp - startTimeRef.current;
      const progressRatio = Math.min(progress / 400, 1);
      const easeOutQuart = 1 - Math.pow(1 - progressRatio, 4);
      setCount(Math.floor(easeOutQuart * value));
      if (progress < 400) {
        animationFrame = requestAnimationFrame(step);
      } else {
        setCount(value);
      }
    };
    animationFrame = requestAnimationFrame(step);
    return () => {
      if (animationFrame) cancelAnimationFrame(animationFrame);
      startTimeRef.current = null;
    };
  }, [value]);

  return <>{prefix}{count.toLocaleString()}{suffix}</>;
};

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
        <p className="text-gray-700 font-medium mb-1">{`Date: ${label}`}</p>
        {payload.map((entry) => (
          <p key={entry.dataKey} style={{ color: entry.color }} className="text-sm">
            {`${entry.dataKey === 'totalIncome' ? 'Income' : 'Expenses'}: $${entry.value.toLocaleString()}`}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

const Dashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [financialData, setFinancialData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const userData = JSON.parse(localStorage.getItem('userData') || '{}');
  const loggedInUserRole = userData.role;

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return `${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getDate().toString().padStart(2, '0')}`;
  };

  useEffect(() => {
    const fetchAll = async () => {
      try {
        setLoading(true);
        const [dashboard, financial] = await Promise.all([
          getDashboardData(),
          getAllPaymentStatistics()
        ]);

        setDashboardData(dashboard);

        const processedFinancialData = financial.map(item => ({
          ...item,
          date: formatDate(item.date)
        }));

        setFinancialData(processedFinancialData);
      } catch (err) {
        console.error(err);
        setError('Failed to fetch dashboard data');
      } finally {
        setLoading(false);
      }
    };

    fetchAll();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center p-6 bg-white rounded-lg shadow-lg">
          <div className="text-red-500 text-xl mb-2">⚠️</div>
          <p className="text-red-600 font-medium">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-2">
      <div className="max-w-full mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7 gap-4 mb-6">

          {loggedInUserRole !== 'ROLE_GUEST' && loggedInUserRole !== 'ROLE_RESIDENT' && dashboardData?.userAnalytics && (
            <div className="lg:col-span-2 relative overflow-hidden rounded-xl shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 bg-gradient-to-br from-blue-500 to-blue-600">
              <div className="absolute top-0 right-0 w-16 h-16 opacity-10">
                <svg className="w-full h-full" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="p-4 relative z-10">
                <h3 className="text-sm font-semibold text-white mb-3 flex items-center">
                  <span className="mr-2 opacity-80">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                    </svg>
                  </span>
                  User Analytics
                </h3>
                <div className="grid grid-cols-3 gap-2">
                  <div className="text-center">
                    <div className="text-white text-xl font-bold">
                      <AnimatedStat value={dashboardData.userAnalytics.totalUsers} />
                    </div>
                    <div className="text-white/80 text-xs">Total</div>
                  </div>
                  <div className="text-center">
                    <div className="text-white text-xl font-bold">
                      <AnimatedStat value={dashboardData.userAnalytics.activeUsers} />
                    </div>
                    <div className="text-white/80 text-xs">Active</div>
                  </div>
                  <div className="text-center">
                    <div className="text-white text-xl font-bold">
                      <AnimatedStat value={dashboardData.userAnalytics.inactiveUsers} />
                    </div>
                    <div className="text-white/80 text-xs">Inactive</div>
                  </div>
                </div>
              </div>
            </div>
          )}
          {dashboardData?.taskOverview && (
            <div className="lg:col-span-2 relative overflow-hidden rounded-xl shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 bg-gradient-to-br from-purple-500 to-purple-600">
              <div className="absolute top-0 right-0 w-16 h-16 opacity-10">
                <svg className="w-full h-full" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="p-4 relative z-10">
                <h3 className="text-sm font-semibold text-white mb-3 flex items-center">
                  <span className="mr-2 opacity-80">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                    </svg>
                  </span>
                  Task Overview
                </h3>
                <div className="grid grid-cols-3 gap-2">
                  <div className="text-center">
                    <div className="text-white text-xl font-bold">
                      <AnimatedStat value={dashboardData.taskOverview.completed} />
                    </div>
                    <div className="text-white/80 text-xs">Completed</div>
                  </div>
                  <div className="text-center">
                    <div className="text-white text-xl font-bold">
                      <AnimatedStat value={dashboardData.taskOverview.pending} />
                    </div>
                    <div className="text-white/80 text-xs">Pending</div>
                  </div>
                  <div className="text-center">
                    <div className="text-white text-xl font-bold">
                      <AnimatedStat value={dashboardData.taskOverview.inProgress} />
                    </div>
                    <div className="text-white/80 text-xs">In Progress</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {loggedInUserRole === 'ROLE_ADMIN' && dashboardData?.totalAnnouncements !== undefined && (
            <div className="relative overflow-hidden rounded-xl shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 bg-gradient-to-br from-emerald-500 to-emerald-600">
              <div className="absolute top-0 right-0 w-16 h-16 opacity-10">
                <svg className="w-full h-full" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="p-4 relative z-10">
                <h3 className="text-sm font-semibold text-white mb-3 flex items-center">
                  <span className="mr-2 opacity-80">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                    </svg>
                  </span>
                  Announcements
                </h3>
                <div className="text-center">
                  <div className="text-white text-3xl font-bold">
                    <AnimatedStat value={dashboardData.totalAnnouncements} />
                  </div>
                  <div className="text-white/80 text-xs">Total</div>
                </div>
              </div>
            </div>
          )}

          {dashboardData?.todayIncome !== null && (
            <div className="relative overflow-hidden rounded-xl shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 bg-gradient-to-br from-green-500 to-green-600">
              <div className="absolute top-0 right-0 w-16 h-16 opacity-10">
                <svg className="w-full h-full" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="p-4 relative z-10">
                <h3 className="text-sm font-semibold text-white mb-2">Today's Income</h3>
                <div className="text-white text-xl font-bold">
                  $<AnimatedStat value={Math.round(dashboardData.todayIncome)} />
                </div>
              </div>
            </div>
          )}

          {dashboardData?.todayExpenses !== null && (
            <div className="relative overflow-hidden rounded-xl shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 bg-gradient-to-br from-red-500 to-red-600">
              <div className="absolute top-0 right-0 w-16 h-16 opacity-10">
                <svg className="w-full h-full" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 2a4 4 0 00-4 4v1H5a1 1 0 00-.994.89l-1 9A1 1 0 004 18h12a1 1 0 00.994-1.11l-1-9A1 1 0 0015 7h-1V6a4 4 0 00-4-4zm2 5V6a2 2 0 10-4 0v1h4zm-6 3a1 1 0 112 0 1 1 0 01-2 0zm7-1a1 1 0 100 2 1 1 0 000-2z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="p-4 relative z-10">
                <h3 className="text-sm font-semibold text-white mb-2">Today's Expenses</h3>
                <div className="text-white text-xl font-bold">
                  $<AnimatedStat value={dashboardData.todayExpenses} />
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-xl font-bold text-gray-800 mb-1">Financial Overview</h2>
              <p className="text-gray-600 text-sm">Income vs Expenses - Last 10 Days</p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
                <span className="text-sm font-medium text-gray-700">Income</span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 bg-red-500 rounded-full mr-2"></div>
                <span className="text-sm font-medium text-gray-700">Expenses</span>
              </div>
            </div>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={financialData}
                margin={{
                  top: 10,
                  right: 30,
                  left: 40,
                  bottom: 10,
                }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="#f0f0f0"
                  horizontal={true}
                  vertical={false}
                />
                <XAxis
                  dataKey="date"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 11, fill: '#6b7280' }}
                  dy={5}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 11, fill: '#6b7280' }}
                  tickFormatter={(value) => `$${value}`}
                />
                <Tooltip content={<CustomTooltip />} />
                <Line
                  type="monotone"
                  dataKey="totalIncome"
                  stroke="#10b981"
                  strokeWidth={2}
                  dot={{ fill: '#10b981', strokeWidth: 1, r: 3 }}
                  activeDot={{ r: 5, stroke: '#10b981', strokeWidth: 2, fill: '#ffffff' }}
                />
                <Line
                  type="monotone"
                  dataKey="totalExpense"
                  stroke="#ef4444"
                  strokeWidth={2}
                  dot={{ fill: '#ef4444', strokeWidth: 1, r: 3 }}
                  activeDot={{ r: 5, stroke: '#ef4444', strokeWidth: 2, fill: '#ffffff' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4 pt-4 border-t border-gray-200">
            <div className="text-center">
              <p className="text-sm font-medium text-gray-600 mb-1">Total Income (10 days)</p>
              <p className="text-xl font-bold text-green-600">
                ${financialData.reduce((sum, item) => sum + item.totalIncome, 0).toLocaleString()}
              </p>
            </div>
            <div className="text-center">
              <p className="text-sm font-medium text-gray-600 mb-1">Total Expenses (10 days)</p>
              <p className="text-xl font-bold text-red-600">
                ${financialData.reduce((sum, item) => sum + item.totalExpense, 0).toLocaleString()}
              </p>
            </div>
            <div className="text-center">
              <p className="text-sm font-medium text-gray-600 mb-1">Net Balance</p>
              <p className={`text-xl font-bold ${financialData.reduce((sum, item) => sum + (item.totalIncome - item.totalExpense), 0) >= 0
                  ? 'text-green-600'
                  : 'text-red-600'
                }`}>
                ${financialData.reduce((sum, item) => sum + (item.totalIncome - item.totalExpense), 0).toLocaleString()}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;