import React, { useState, useCallback } from 'react';
import { Button, Input } from '../ui';
import { ChevronDown, ChevronRight, Search, X } from '../../icons';
import { cn } from '../../utils/cn';

/**
 * LogFilters component for filtering API logs
 */
const LogFilters = ({ onApplyFilters, onClearFilters }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [filters, setFilters] = useState({
    dateRange: '7days',
    startDate: '',
    endDate: '',
    method: '',
    statusCode: '',
    search: '',
    isSlow: false,
    isError: false,
  });

  // Handle filter change
  const handleFilterChange = useCallback((key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  }, []);

  // Apply filters
  const handleApply = useCallback(() => {
    const filterParams = { ...filters };

    // Convert date range presets to actual dates
    if (filters.dateRange && filters.dateRange !== 'custom') {
      const now = new Date();
      const startDate = new Date();

      if (filters.dateRange === 'today') {
        startDate.setHours(0, 0, 0, 0);
      } else if (filters.dateRange === '7days') {
        startDate.setDate(now.getDate() - 7);
      } else if (filters.dateRange === '30days') {
        startDate.setDate(now.getDate() - 30);
      }

      filterParams.startDate = startDate.toISOString();
      filterParams.endDate = now.toISOString();
    }

    // Remove empty values
    const cleanParams = Object.fromEntries(
      Object.entries(filterParams).filter(
        ([key, v]) =>
          v !== '' && v !== false && v !== 'all' && key !== 'dateRange'
      )
    );

    // Convert booleans to strings for query params
    if (filters.isSlow) cleanParams.isSlow = 'true';
    if (filters.isError) cleanParams.isError = 'true';

    onApplyFilters(cleanParams);
  }, [filters, onApplyFilters]);

  // Clear all filters
  const handleClear = useCallback(() => {
    const clearedFilters = {
      dateRange: '',
      startDate: '',
      endDate: '',
      method: '',
      statusCode: '',
      search: '',
      isSlow: false,
      isError: false,
    };
    setFilters(clearedFilters);
    onClearFilters();
  }, [onClearFilters]);

  // Count active filters
  const activeFilterCount = Object.entries(filters).filter(
    ([key, v]) =>
      v !== '' && v !== false && key !== 'dateRange' && (key !== 'dateRange' || v !== '7days')
  ).length;

  return (
    <div className="bg-background-secondary rounded-lg border border-border mb-4">
      {/* Header */}
      <button
        className="w-full flex items-center justify-between px-4 py-3 hover:bg-background-tertiary/50 transition-colors"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-2">
          {isExpanded ? (
            <ChevronDown className="h-4 w-4 text-text-tertiary" />
          ) : (
            <ChevronRight className="h-4 w-4 text-text-tertiary" />
          )}
          <span className="font-medium text-text-primary">Filters</span>
          {activeFilterCount > 0 && (
            <span className="px-2 py-0.5 bg-accent/20 text-accent text-xs rounded-full">
              {activeFilterCount} active
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {activeFilterCount > 0 && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleClear();
              }}
              className="text-xs text-text-tertiary hover:text-text-primary"
            >
              Clear all
            </button>
          )}
        </div>
      </button>

      {/* Filter Controls */}
      {isExpanded && (
        <div className="px-4 pb-4 border-t border-border pt-4">
          <div className="grid grid-cols-3 gap-4 mb-4">
            {/* Date Range */}
            <div>
              <label className="block text-xs font-medium text-text-tertiary mb-1.5">
                Date Range
              </label>
              <select
                value={filters.dateRange}
                onChange={(e) => handleFilterChange('dateRange', e.target.value)}
                className="w-full bg-background border border-border rounded px-3 py-2 text-sm text-text-primary focus:outline-none focus:ring-1 focus:ring-accent"
              >
                <option value="">All time</option>
                <option value="today">Today</option>
                <option value="7days">Last 7 days</option>
                <option value="30days">Last 30 days</option>
                <option value="custom">Custom</option>
              </select>
            </div>

            {/* HTTP Method */}
            <div>
              <label className="block text-xs font-medium text-text-tertiary mb-1.5">
                Method
              </label>
              <select
                value={filters.method}
                onChange={(e) => handleFilterChange('method', e.target.value)}
                className="w-full bg-background border border-border rounded px-3 py-2 text-sm text-text-primary focus:outline-none focus:ring-1 focus:ring-accent"
              >
                <option value="">All methods</option>
                <option value="GET">GET</option>
                <option value="POST">POST</option>
                <option value="PUT">PUT</option>
                <option value="PATCH">PATCH</option>
                <option value="DELETE">DELETE</option>
              </select>
            </div>

            {/* Status Code */}
            <div>
              <label className="block text-xs font-medium text-text-tertiary mb-1.5">
                Status Code
              </label>
              <select
                value={filters.statusCode}
                onChange={(e) => handleFilterChange('statusCode', e.target.value)}
                className="w-full bg-background border border-border rounded px-3 py-2 text-sm text-text-primary focus:outline-none focus:ring-1 focus:ring-accent"
              >
                <option value="">All statuses</option>
                <option value="2xx">2xx Success</option>
                <option value="3xx">3xx Redirect</option>
                <option value="4xx">4xx Client Error</option>
                <option value="5xx">5xx Server Error</option>
              </select>
            </div>
          </div>

          {/* Custom Date Range */}
          {filters.dateRange === 'custom' && (
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-xs font-medium text-text-tertiary mb-1.5">
                  Start Date
                </label>
                <input
                  type="date"
                  value={filters.startDate}
                  onChange={(e) => handleFilterChange('startDate', e.target.value)}
                  className="w-full bg-background border border-border rounded px-3 py-2 text-sm text-text-primary focus:outline-none focus:ring-1 focus:ring-accent"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-text-tertiary mb-1.5">
                  End Date
                </label>
                <input
                  type="date"
                  value={filters.endDate}
                  onChange={(e) => handleFilterChange('endDate', e.target.value)}
                  className="w-full bg-background border border-border rounded px-3 py-2 text-sm text-text-primary focus:outline-none focus:ring-1 focus:ring-accent"
                />
              </div>
            </div>
          )}

          {/* Search */}
          <div className="mb-4">
            <label className="block text-xs font-medium text-text-tertiary mb-1.5">
              Search
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-tertiary" />
              <input
                type="text"
                placeholder="Search by path, email, or IP address..."
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                className="w-full bg-background border border-border rounded pl-10 pr-3 py-2 text-sm text-text-primary placeholder:text-text-tertiary focus:outline-none focus:ring-1 focus:ring-accent"
              />
              {filters.search && (
                <button
                  onClick={() => handleFilterChange('search', '')}
                  className="absolute right-3 top-1/2 -translate-y-1/2"
                >
                  <X className="h-4 w-4 text-text-tertiary hover:text-text-primary" />
                </button>
              )}
            </div>
          </div>

          {/* Checkboxes */}
          <div className="flex gap-6 mb-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={filters.isSlow}
                onChange={(e) => handleFilterChange('isSlow', e.target.checked)}
                className="rounded border-border text-accent focus:ring-accent"
              />
              <span className="text-sm text-text-secondary">
                Show only slow requests (&gt;1s)
              </span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={filters.isError}
                onChange={(e) => handleFilterChange('isError', e.target.checked)}
                className="rounded border-border text-accent focus:ring-accent"
              />
              <span className="text-sm text-text-secondary">
                Show only errors (4xx/5xx)
              </span>
            </label>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2">
            <Button onClick={handleApply}>Apply Filters</Button>
            <Button variant="secondary" onClick={handleClear}>
              Clear All
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default LogFilters;
