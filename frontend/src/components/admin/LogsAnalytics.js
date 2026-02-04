import React, { useState, useMemo } from 'react';
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  LineChart,
  Line,
  ResponsiveContainer,
} from 'recharts';
import { useLogStats } from '../../hooks/useLogStats';
import { Spinner } from '../ui';
import { AlertCircle } from '../../icons';

const COLORS = {
  '2xx': '#10b981',
  '3xx': '#3b82f6',
  '4xx': '#f59e0b',
  '5xx': '#ef4444',
};

const LogsAnalytics = () => {
  const [dateRange, setDateRange] = useState('7days');

  const dateParams = useMemo(() => {
    const now = new Date();
    const startDate = new Date();

    if (dateRange === 'today') {
      startDate.setHours(0, 0, 0, 0);
    } else if (dateRange === '7days') {
      startDate.setDate(now.getDate() - 7);
    } else if (dateRange === '30days') {
      startDate.setDate(now.getDate() - 30);
    }

    return {
      startDate: startDate.toISOString(),
      endDate: now.toISOString(),
    };
  }, [dateRange]);

  const { stats, loading, error } = useLogStats(dateParams);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Spinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center gap-3 p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
        <AlertCircle className="h-5 w-5 text-red-400" />
        <p className="text-red-400">Error loading analytics: {error}</p>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="text-center py-12 text-text-tertiary">
        No analytics data available
      </div>
    );
  }

  const pieData = Object.entries(stats.statusCodeDistribution || {}).map(
    ([key, value]) => ({
      name: `${key} ${key === '2xx' ? 'Success' : key === '4xx' ? 'Client Error' : key === '5xx' ? 'Server Error' : ''}`,
      value,
      color: COLORS[key] || '#6b7280',
    })
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-text-primary">Analytics Dashboard</h2>
        <select
          value={dateRange}
          onChange={(e) => setDateRange(e.target.value)}
          className="bg-background border border-border rounded px-3 py-2 text-sm text-text-primary focus:outline-none focus:ring-1 focus:ring-accent"
        >
          <option value="today">Today</option>
          <option value="7days">Last 7 days</option>
          <option value="30days">Last 30 days</option>
        </select>
      </div>

      <div className="grid grid-cols-4 gap-4">
        <SummaryCard
          title="Total Requests"
          value={stats.totalRequests?.toLocaleString() || '0'}
        />
        <SummaryCard
          title="Avg Response Time"
          value={`${stats.averageResponseTime || 0}ms`}
        />
        <SummaryCard
          title="Error Rate"
          value={`${stats.errorRate || 0}%`}
          isNegative={stats.errorRate > 5}
        />
        <SummaryCard
          title="Slow Requests"
          value={`${stats.slowRequestRate || 0}%`}
          isNegative={stats.slowRequestRate > 10}
        />
      </div>

      <div className="grid grid-cols-2 gap-6">
        <ChartCard title="Status Code Distribution">
          {pieData.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) =>
                    `${name.split(' ')[0]} ${(percent * 100).toFixed(0)}%`
                  }
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[250px] flex items-center justify-center text-text-tertiary">
              No data
            </div>
          )}
        </ChartCard>

        <ChartCard title="Requests Over Time">
          {stats.requestsOverTime?.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={stats.requestsOverTime}>
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 12, fill: '#9ca3af' }}
                  tickFormatter={(value) => value.slice(5)}
                />
                <YAxis tick={{ fontSize: 12, fill: '#9ca3af' }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1f2937',
                    border: '1px solid #374151',
                    borderRadius: '8px',
                  }}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="count"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  name="Requests"
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[250px] flex items-center justify-center text-text-tertiary">
              No data
            </div>
          )}
        </ChartCard>
      </div>

      <ChartCard title="Top Endpoints by Request Count">
        {stats.topEndpoints?.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={stats.topEndpoints.slice(0, 8)} layout="vertical">
              <XAxis type="number" tick={{ fontSize: 12, fill: '#9ca3af' }} />
              <YAxis
                type="category"
                dataKey="path"
                tick={{ fontSize: 11, fill: '#9ca3af' }}
                width={200}
                tickFormatter={(value) =>
                  value.length > 30 ? value.slice(0, 30) + '...' : value
                }
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1f2937',
                  border: '1px solid #374151',
                  borderRadius: '8px',
                }}
              />
              <Legend />
              <Bar dataKey="count" fill="#3b82f6" name="Requests" />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-[300px] flex items-center justify-center text-text-tertiary">
            No data
          </div>
        )}
      </ChartCard>

      <ChartCard title="Top Users by Request Count">
        {stats.topUsers?.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="px-4 py-3 text-left text-xs font-medium text-text-tertiary uppercase">
                    Rank
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-text-tertiary uppercase">
                    User
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-text-tertiary uppercase">
                    Requests
                  </th>
                </tr>
              </thead>
              <tbody>
                {stats.topUsers.slice(0, 10).map((user, index) => (
                  <tr key={user.userId || index} className="border-b border-border/50">
                    <td className="px-4 py-3 text-sm text-text-secondary">
                      #{index + 1}
                    </td>
                    <td className="px-4 py-3 text-sm text-text-primary">
                      {user.userEmail || 'Anonymous'}
                    </td>
                    <td className="px-4 py-3 text-sm text-right font-medium text-text-primary">
                      {user.requestCount?.toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="h-[200px] flex items-center justify-center text-text-tertiary">
            No data
          </div>
        )}
      </ChartCard>
    </div>
  );
};

const SummaryCard = ({ title, value, isNegative }) => (
  <div className="bg-background-secondary rounded-lg p-4 border border-border">
    <div className="text-xs text-text-tertiary uppercase tracking-wide mb-1">
      {title}
    </div>
    <div
      className={`text-2xl font-bold ${
        isNegative ? 'text-red-400' : 'text-text-primary'
      }`}
    >
      {value}
    </div>
  </div>
);

const ChartCard = ({ title, children }) => (
  <div className="bg-background-secondary rounded-lg p-4 border border-border">
    <h3 className="text-sm font-semibold text-text-primary mb-4">{title}</h3>
    {children}
  </div>
);

export default LogsAnalytics;
