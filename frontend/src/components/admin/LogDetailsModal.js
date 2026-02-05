import React, { useState, useEffect, useCallback } from 'react';
import { adminApi } from '../../services/adminApi';
import { formatDate, formatJSON, formatResponseTime } from '../../utils/formatters';
import StatusBadge, { MethodBadge } from './StatusBadge';
import { Button, Spinner } from '../ui';
import { X, AlertCircle } from '../../icons';
import { cn } from '../../utils/cn';

const LogDetailsModal = ({ logId, onClose }) => {
  const [log, setLog] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [copiedField, setCopiedField] = useState(null);

  useEffect(() => {
    if (!logId) return;

    const fetchLog = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await adminApi.getLogById(logId);
        setLog(response.log);
      } catch (err) {
        console.error('Failed to fetch log:', err);
        setError(err.message || 'Failed to fetch log details');
      } finally {
        setLoading(false);
      }
    };

    fetchLog();
  }, [logId]);

  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [onClose]);

  const copyToClipboard = useCallback(async (text, field) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(field);
      setTimeout(() => setCopiedField(null), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  }, []);

  if (!logId) return null;

  return (
    <div
      className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-background-secondary rounded-lg w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <h2 className="text-lg font-semibold text-text-primary">Log Details</h2>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex-1 overflow-auto p-6">
          {loading && (
            <div className="flex items-center justify-center py-12">
              <Spinner />
            </div>
          )}

          {error && (
            <div className="flex items-center gap-3 p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
              <AlertCircle className="h-5 w-5 text-red-400" />
              <p className="text-red-400">{error}</p>
            </div>
          )}

          {log && !loading && (
            <div className="space-y-6">
              <Section title="Overview">
                <div className="grid grid-cols-2 gap-4">
                  <Field label="Method">
                    <MethodBadge method={log.method} />
                  </Field>
                  <Field label="Status">
                    <StatusBadge statusCode={log.statusCode} />
                  </Field>
                  <Field label="Response Time">
                    <span className={cn(log.isSlow && 'text-orange-400 font-semibold')}>
                      {formatResponseTime(log.responseTime)}
                      {log.isSlow && ' (Slow)'}
                    </span>
                  </Field>
                  <Field label="User">
                    {log.userEmail || 'Anonymous'}
                  </Field>
                </div>
                <div className="mt-4">
                  <Field label="Path">
                    <code className="px-2 py-1 bg-background rounded text-sm font-mono">
                      {log.path}
                    </code>
                  </Field>
                </div>
              </Section>

              <Section title="Request Details">
                {log.queryParams && Object.keys(log.queryParams).length > 0 && (
                  <DetailBlock
                    title="Query Parameters"
                    content={formatJSON(log.queryParams)}
                    onCopy={() => copyToClipboard(formatJSON(log.queryParams), 'query')}
                    copied={copiedField === 'query'}
                  />
                )}
                {log.requestHeaders && Object.keys(log.requestHeaders).length > 0 && (
                  <DetailBlock
                    title="Request Headers"
                    content={formatJSON(log.requestHeaders)}
                    onCopy={() => copyToClipboard(formatJSON(log.requestHeaders), 'headers')}
                    copied={copiedField === 'headers'}
                  />
                )}
                {log.requestBody && (
                  <DetailBlock
                    title="Request Body"
                    content={formatJSON(log.requestBody)}
                    onCopy={() => copyToClipboard(formatJSON(log.requestBody), 'body')}
                    copied={copiedField === 'body'}
                  />
                )}
                {(!log.queryParams || Object.keys(log.queryParams).length === 0) &&
                  (!log.requestHeaders || Object.keys(log.requestHeaders).length === 0) &&
                  !log.requestBody && (
                  <p className="text-text-tertiary text-sm">No request data available</p>
                )}
              </Section>

              {log.responseBody && (
                <Section title="Response Details">
                  <DetailBlock
                    title="Response Body"
                    content={formatJSON(log.responseBody)}
                    onCopy={() => copyToClipboard(formatJSON(log.responseBody), 'response')}
                    copied={copiedField === 'response'}
                  />
                </Section>
              )}

              {log.isError && (log.errorMessage || log.errorStack) && (
                <Section title="Error Details">
                  {log.errorMessage && (
                    <div className="mb-4">
                      <div className="text-sm font-medium text-red-400 mb-2">
                        Error Message
                      </div>
                      <div className="bg-red-500/10 border border-red-500/30 p-3 rounded text-sm text-red-300">
                        {log.errorMessage}
                      </div>
                    </div>
                  )}
                  {log.errorStack && (
                    <DetailBlock
                      title="Stack Trace"
                      content={log.errorStack}
                      onCopy={() => copyToClipboard(log.errorStack, 'stack')}
                      copied={copiedField === 'stack'}
                    />
                  )}
                </Section>
              )}

              <Section title="Metadata">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <Field label="IP Address">
                    <span className="font-mono">{log.ipAddress || '-'}</span>
                  </Field>
                  <Field label="Timestamp">
                    {formatDate(log.timestamp)}
                  </Field>
                  <Field label="Log ID" className="col-span-2">
                    <span className="font-mono text-xs">{log._id}</span>
                  </Field>
                  {log.userAgent && (
                    <Field label="User Agent" className="col-span-2">
                      <span className="text-xs break-all">{log.userAgent}</span>
                    </Field>
                  )}
                </div>
              </Section>
            </div>
          )}
        </div>

        <div className="px-6 py-4 border-t border-border flex justify-end">
          <Button onClick={onClose}>Close</Button>
        </div>
      </div>
    </div>
  );
};

const Section = ({ title, children }) => (
  <div>
    <h3 className="text-sm font-semibold text-text-primary mb-3 uppercase tracking-wide">
      {title}
    </h3>
    {children}
  </div>
);

const Field = ({ label, children, className }) => (
  <div className={className}>
    <div className="text-xs text-text-tertiary mb-1">{label}</div>
    <div className="text-text-primary">{children}</div>
  </div>
);

const DetailBlock = ({ title, content, onCopy, copied }) => (
  <div className="mb-4">
    <div className="flex items-center justify-between mb-2">
      <span className="text-sm font-medium text-text-secondary">{title}</span>
      <button
        onClick={onCopy}
        className="text-xs text-accent hover:text-accent/80 transition-colors"
      >
        {copied ? 'Copied!' : 'Copy'}
      </button>
    </div>
    <pre className="bg-background p-3 rounded text-xs overflow-x-auto max-h-48 overflow-y-auto">
      <code className="text-text-secondary font-mono">{content}</code>
    </pre>
  </div>
);

export default LogDetailsModal;
