import React, { useState, useCallback, useEffect, useRef } from 'react';
import { Button } from '../ui';
import { ChevronRight, Search, X, Check, Filter } from '../../icons';
import { cn } from '../../utils/cn';

const LogFilters = ({ onApplyFilters, onClearFilters }) => {
  const [open, setOpen] = useState(false);
  const [activeSubmenu, setActiveSubmenu] = useState(null);
  const containerRef = useRef(null);
  const [filters, setFilters] = useState({
    dateRange: '7days',
    method: '',
    statusCode: '',
    search: '',
    isSlow: false,
    isError: false,
  });

  useEffect(() => {
    if (!open) return;

    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [open]);

  const handleTriggerClick = useCallback(() => {
    setOpen((prev) => !prev);
  }, []);

  const handleFilterChange = useCallback((key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  }, []);

  const handleApply = useCallback(() => {
    const filterParams = { ...filters };

    if (filters.dateRange) {
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

    const cleanParams = Object.fromEntries(
      Object.entries(filterParams).filter(
        ([key, v]) => v !== '' && v !== false && v !== 'all' && key !== 'dateRange'
      )
    );

    if (filters.isSlow) cleanParams.isSlow = 'true';
    if (filters.isError) cleanParams.isError = 'true';

    onApplyFilters(cleanParams);
  }, [filters, onApplyFilters]);

  const handleClear = useCallback(() => {
    const clearedFilters = {
      dateRange: '7days',
      method: '',
      statusCode: '',
      search: '',
      isSlow: false,
      isError: false,
    };
    setFilters(clearedFilters);
    onClearFilters();
  }, [onClearFilters]);

  const activeFilterCount = Object.entries(filters).filter(
    ([key, v]) => v !== '' && v !== false && key !== 'dateRange'
  ).length;

  const dateRangeOptions = [
    { value: '', label: 'All time' },
    { value: 'today', label: 'Today' },
    { value: '7days', label: 'Last 7 days' },
    { value: '30days', label: 'Last 30 days' },
  ];

  const methodOptions = [
    { value: '', label: 'All methods' },
    { value: 'GET', label: 'GET' },
    { value: 'POST', label: 'POST' },
    { value: 'PUT', label: 'PUT' },
    { value: 'PATCH', label: 'PATCH' },
    { value: 'DELETE', label: 'DELETE' },
  ];

  const statusCodeOptions = [
    { value: '', label: 'All statuses' },
    { value: '2xx', label: '2xx Success' },
    { value: '3xx', label: '3xx Redirect' },
    { value: '4xx', label: '4xx Client Error' },
    { value: '5xx', label: '5xx Server Error' },
  ];

  const isSelected = (filterKey, value) => {
    return filters[filterKey] === value;
  };

  const toggleSubmenu = useCallback((submenu) => {
    setActiveSubmenu((prev) => (prev === submenu ? null : submenu));
  }, []);

  return (
    <div ref={containerRef} className="relative">
      <Button variant="secondary" size="sm" className="gap-2" onClick={handleTriggerClick}>
        <Filter className="h-4 w-4" />
        <span>Filter</span>
        {activeFilterCount > 0 && (
          <span className="ml-1 px-1.5 py-0.5 text-xs bg-accent text-white rounded-full">
            {activeFilterCount}
          </span>
        )}
      </Button>

      {open && (
        <div className="absolute top-full left-0 mt-1 w-[280px] bg-background-secondary border border-border rounded-md shadow-lg py-1 z-50">
          <div className="px-3 py-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-tertiary" />
              <input
                type="text"
                placeholder="Search by path, email, or IP..."
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

          <div className="border-t border-border my-1" />


          <div className="relative">
            <button
              onClick={() => toggleSubmenu('dateRange')}
              className="w-full px-3 py-2 flex items-center justify-between text-sm hover:bg-background-tertiary"
            >
              <span>Date Range</span>
              <ChevronRight className="h-4 w-4 text-text-tertiary" />
            </button>

            {activeSubmenu === 'dateRange' && (
              <div className="absolute left-full top-0 ml-1 min-w-[180px] bg-background-secondary border border-border rounded-md shadow-lg py-1 z-50">
                {dateRangeOptions.map((option) => (
                  <button
                    key={option.value}
                    className="w-full px-3 py-2 flex items-center gap-2 text-sm hover:bg-background-tertiary"
                    onClick={() => handleFilterChange('dateRange', option.value)}
                  >
                    <div
                      className={cn(
                        'w-4 h-4 border rounded flex items-center justify-center',
                        isSelected('dateRange', option.value)
                          ? 'bg-accent border-accent'
                          : 'border-border'
                      )}
                    >
                      {isSelected('dateRange', option.value) && (
                        <Check className="h-3 w-3 text-white" />
                      )}
                    </div>
                    <span>{option.label}</span>
                  </button>
                ))}
              </div>
            )}
          </div>


          <div className="relative">
            <button
              onClick={() => toggleSubmenu('method')}
              className="w-full px-3 py-2 flex items-center justify-between text-sm hover:bg-background-tertiary"
            >
              <span>Method</span>
              <ChevronRight className="h-4 w-4 text-text-tertiary" />
            </button>

            {activeSubmenu === 'method' && (
              <div className="absolute left-full top-0 ml-1 min-w-[140px] bg-background-secondary border border-border rounded-md shadow-lg py-1 z-50">
                {methodOptions.map((option) => (
                  <button
                    key={option.value}
                    className="w-full px-3 py-2 flex items-center gap-2 text-sm hover:bg-background-tertiary"
                    onClick={() => handleFilterChange('method', option.value)}
                  >
                    <div
                      className={cn(
                        'w-4 h-4 border rounded flex items-center justify-center',
                        isSelected('method', option.value)
                          ? 'bg-accent border-accent'
                          : 'border-border'
                      )}
                    >
                      {isSelected('method', option.value) && (
                        <Check className="h-3 w-3 text-white" />
                      )}
                    </div>
                    <span>{option.label}</span>
                  </button>
                ))}
              </div>
            )}
          </div>


          <div className="relative">
            <button
              onClick={() => toggleSubmenu('statusCode')}
              className="w-full px-3 py-2 flex items-center justify-between text-sm hover:bg-background-tertiary"
            >
              <span>Status Code</span>
              <ChevronRight className="h-4 w-4 text-text-tertiary" />
            </button>

            {activeSubmenu === 'statusCode' && (
              <div className="absolute left-full top-0 ml-1 min-w-[180px] bg-background-secondary border border-border rounded-md shadow-lg py-1 z-50">
                {statusCodeOptions.map((option) => (
                  <button
                    key={option.value}
                    className="w-full px-3 py-2 flex items-center gap-2 text-sm hover:bg-background-tertiary"
                    onClick={() => handleFilterChange('statusCode', option.value)}
                  >
                    <div
                      className={cn(
                        'w-4 h-4 border rounded flex items-center justify-center',
                        isSelected('statusCode', option.value)
                          ? 'bg-accent border-accent'
                          : 'border-border'
                      )}
                    >
                      {isSelected('statusCode', option.value) && (
                        <Check className="h-3 w-3 text-white" />
                      )}
                    </div>
                    <span>{option.label}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="border-t border-border my-1" />

          <button
            className="w-full px-3 py-2 flex items-center gap-2 text-sm hover:bg-background-tertiary"
            onClick={() => handleFilterChange('isSlow', !filters.isSlow)}
          >
            <div
              className={cn(
                'w-4 h-4 border rounded flex items-center justify-center',
                filters.isSlow ? 'bg-accent border-accent' : 'border-border'
              )}
            >
              {filters.isSlow && <Check className="h-3 w-3 text-white" />}
            </div>
            <span>Slow requests (&gt;1s)</span>
          </button>
          <button
            className="w-full px-3 py-2 flex items-center gap-2 text-sm hover:bg-background-tertiary"
            onClick={() => handleFilterChange('isError', !filters.isError)}
          >
            <div
              className={cn(
                'w-4 h-4 border rounded flex items-center justify-center',
                filters.isError ? 'bg-accent border-accent' : 'border-border'
              )}
            >
              {filters.isError && <Check className="h-3 w-3 text-white" />}
            </div>
            <span>Errors (4xx/5xx)</span>
          </button>

          <div className="border-t border-border my-1" />


          <div className="px-3 py-2 flex gap-2">
            <Button size="sm" onClick={handleApply} className="flex-1">
              Apply
            </Button>
            {activeFilterCount > 0 && (
              <Button size="sm" variant="secondary" onClick={handleClear} className="flex-1">
                Clear
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default LogFilters;
