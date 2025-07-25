"use client";

import React, { useState, useEffect } from 'react';
import { bookingLogger, BookingLogEntry, BookingSessionLog } from '@/lib/utils/booking-debug-logger';
import { useConsoleMonitor } from '@/lib/hooks/use-console-monitor';
import { networkInterceptor } from '@/lib/utils/network-interceptor';

interface DebugDashboardProps {
  isOpen: boolean;
  onToggle: () => void;
}

export function BookingDebugDashboard({ isOpen, onToggle }: DebugDashboardProps) {
  const [activeTab, setActiveTab] = useState<'logs' | 'console' | 'network' | 'sessions' | 'errors'>('logs');
  const [logs, setLogs] = useState<BookingLogEntry[]>([]);
  const [sessions, setSessions] = useState<BookingSessionLog[]>([]);
  const [refreshKey, setRefreshKey] = useState(0);
  
  const consoleMonitor = useConsoleMonitor();

  // Refresh data
  const refreshData = () => {
    setLogs(bookingLogger.getAllLogs());
    setSessions(bookingLogger.getAllSessions());
    setRefreshKey(prev => prev + 1);
  };

  useEffect(() => {
    refreshData();
    const interval = setInterval(refreshData, 2000); // Refresh every 2 seconds
    return () => clearInterval(interval);
  }, []);

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString();
  };

  const getLogIcon = (level: BookingLogEntry['level']) => {
    switch (level) {
      case 'error': return '❌';
      case 'warn': return '⚠️';
      case 'info': return 'ℹ️';
      case 'debug': return '🔍';
      default: return '📋';
    }
  };

  const getCategoryIcon = (category: BookingLogEntry['category']) => {
    switch (category) {
      case 'validation': return '✅';
      case 'network': return '🌐';
      case 'api': return '🔌';
      case 'payment': return '💳';
      case 'transform': return '🔄';
      default: return '📋';
    }
  };

  const getLevelColor = (level: BookingLogEntry['level']) => {
    switch (level) {
      case 'error': return 'text-red-600 bg-red-50';
      case 'warn': return 'text-yellow-600 bg-yellow-50';
      case 'info': return 'text-blue-600 bg-blue-50';
      case 'debug': return 'text-purple-600 bg-purple-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const exportLogs = () => {
    const data = bookingLogger.exportLogs();
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `booking-logs-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const clearAllLogs = () => {
    if (confirm('Are you sure you want to clear all logs?')) {
      bookingLogger.clearLogs();
      if (consoleMonitor) {
        consoleMonitor.clearCaptures();
      }
      refreshData();
    }
  };

  const errorLogs = logs.filter(log => log.level === 'error');
  const warningLogs = logs.filter(log => log.level === 'warn');
  const recentLogs = logs.slice(-50);

  if (!isOpen) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <button
          onClick={onToggle}
          className="bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-full shadow-lg transition-colors"
          title="Open Debug Dashboard"
        >
          🔍
        </button>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-6xl h-5/6 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-xl font-bold">🔍 Booking Debug Dashboard</h2>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500">
              {logs.length} logs | {errorLogs.length} errors | {warningLogs.length} warnings
            </span>
            <button
              onClick={refreshData}
              className="px-3 py-1 bg-blue-100 text-blue-700 rounded text-sm hover:bg-blue-200"
            >
              🔄 Refresh
            </button>
            <button
              onClick={exportLogs}
              className="px-3 py-1 bg-green-100 text-green-700 rounded text-sm hover:bg-green-200"
            >
              📥 Export
            </button>
            <button
              onClick={clearAllLogs}
              className="px-3 py-1 bg-red-100 text-red-700 rounded text-sm hover:bg-red-200"
            >
              🗑️ Clear
            </button>
            <button
              onClick={onToggle}
              className="px-3 py-1 bg-gray-100 text-gray-700 rounded text-sm hover:bg-gray-200"
            >
              ✕ Close
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b">
          {[
            { id: 'logs', label: '📋 Recent Logs', count: recentLogs.length },
            { id: 'errors', label: '❌ Errors', count: errorLogs.length },
            { id: 'console', label: '🖥️ Console', count: consoleMonitor?.totalBookingLogs || 0 },
            { id: 'network', label: '🌐 Network', count: networkInterceptor.getPendingRequests().length },
            { id: 'sessions', label: '📊 Sessions', count: sessions.length }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600 bg-blue-50'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'
              }`}
            >
              {tab.label} ({tab.count})
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden">
          {activeTab === 'logs' && (
            <div className="h-full overflow-auto p-4">
              <div className="space-y-2">
                {recentLogs.length === 0 ? (
                  <div className="text-center text-gray-500 py-8">
                    No logs available. Logging will appear here when booking operations occur.
                  </div>
                ) : (
                  recentLogs.reverse().map(log => (
                    <div
                      key={log.id}
                      className={`p-3 rounded border-l-4 ${getLevelColor(log.level)} border-l-current`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-2">
                          <span>{getCategoryIcon(log.category)}</span>
                          <span>{getLogIcon(log.level)}</span>
                          <span className="font-medium">[{log.step.toUpperCase()}]</span>
                          <span className="text-sm text-gray-500">{formatTimestamp(log.timestamp)}</span>
                        </div>
                        <span className={`px-2 py-1 rounded text-xs font-medium ${getLevelColor(log.level)}`}>
                          {log.level}
                        </span>
                      </div>
                      <div className="mt-1">
                        <p className="font-medium">{log.message}</p>
                        {log.error && (
                          <p className="text-red-600 mt-1 text-sm">Error: {log.error}</p>
                        )}
                        {log.data && (
                          <details className="mt-2">
                            <summary className="cursor-pointer text-sm text-gray-600 hover:text-gray-800">
                              View Data
                            </summary>
                            <pre className="mt-1 p-2 bg-gray-100 rounded text-xs overflow-auto max-h-40">
                              {JSON.stringify(log.data, null, 2)}
                            </pre>
                          </details>
                        )}
                        {log.stackTrace && (
                          <details className="mt-2">
                            <summary className="cursor-pointer text-sm text-red-600 hover:text-red-800">
                              View Stack Trace
                            </summary>
                            <pre className="mt-1 p-2 bg-red-50 rounded text-xs overflow-auto max-h-40 text-red-700">
                              {log.stackTrace}
                            </pre>
                          </details>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {activeTab === 'errors' && (
            <div className="h-full overflow-auto p-4">
              <div className="space-y-2">
                {errorLogs.length === 0 ? (
                  <div className="text-center text-gray-500 py-8">
                    No errors recorded. This is good! 🎉
                  </div>
                ) : (
                  errorLogs.reverse().map(log => (
                    <div key={log.id} className="p-3 rounded border border-red-200 bg-red-50">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-2">
                          <span>❌</span>
                          <span className="font-medium">[{log.step.toUpperCase()}]</span>
                          <span className="text-sm text-gray-600">{formatTimestamp(log.timestamp)}</span>
                        </div>
                        <span className="px-2 py-1 rounded text-xs font-medium bg-red-100 text-red-800">
                          {log.category}
                        </span>
                      </div>
                      <div className="mt-2">
                        <p className="font-medium text-red-800">{log.message}</p>
                        {log.error && (
                          <p className="text-red-700 mt-1 text-sm">Error: {log.error}</p>
                        )}
                        {log.data && (
                          <details className="mt-2">
                            <summary className="cursor-pointer text-sm text-red-600 hover:text-red-800">
                              View Error Data
                            </summary>
                            <pre className="mt-1 p-2 bg-red-100 rounded text-xs overflow-auto max-h-40">
                              {JSON.stringify(log.data, null, 2)}
                            </pre>
                          </details>
                        )}
                        {log.stackTrace && (
                          <details className="mt-2">
                            <summary className="cursor-pointer text-sm text-red-600 hover:text-red-800">
                              View Stack Trace
                            </summary>
                            <pre className="mt-1 p-2 bg-red-100 rounded text-xs overflow-auto max-h-40 text-red-700">
                              {log.stackTrace}
                            </pre>
                          </details>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {activeTab === 'console' && (
            <div className="h-full overflow-auto p-4">
              <div className="space-y-2">
                {!consoleMonitor ? (
                  <div className="text-center text-gray-500 py-8">
                    Console monitor not available
                  </div>
                ) : consoleMonitor.bookingRelatedLogs.length === 0 ? (
                  <div className="text-center text-gray-500 py-8">
                    No booking-related console output captured yet
                  </div>
                ) : (
                  consoleMonitor.bookingRelatedLogs.reverse().map((capture, index) => (
                    <div key={index} className="p-3 rounded border border-gray-200 bg-gray-50">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-mono bg-gray-200 px-2 py-1 rounded">
                            console.{capture.method}
                          </span>
                          <span className="text-sm text-gray-600">{formatTimestamp(capture.timestamp)}</span>
                        </div>
                      </div>
                      <div className="mt-2 font-mono text-sm">
                        {capture.args.map((arg, argIndex) => (
                          <div key={argIndex} className="mb-1">
                            {typeof arg === 'string' ? arg : JSON.stringify(arg, null, 2)}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {activeTab === 'network' && (
            <div className="h-full overflow-auto p-4">
              <div className="space-y-2">
                <div className="mb-4 p-3 bg-blue-50 rounded border border-blue-200">
                  <div className="flex items-center gap-2 mb-2">
                    <span>🌐</span>
                    <span className="font-medium">Network Interceptor Status</span>
                  </div>
                  <div className="text-sm">
                    <p>Status: {networkInterceptor.isIntercepting() ? '✅ Active' : '❌ Inactive'}</p>
                    <p>Pending Requests: {networkInterceptor.getPendingRequests().length}</p>
                  </div>
                </div>
                
                {networkInterceptor.getPendingRequests().map(request => (
                  <div key={request.id} className="p-3 rounded border border-yellow-200 bg-yellow-50">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        <span>🔄</span>
                        <span className="font-medium">{request.method} {request.url}</span>
                      </div>
                      <span className="text-sm text-gray-600">{formatTimestamp(request.timestamp)}</span>
                    </div>
                    <div className="mt-2 text-sm">
                      <p>Status: Pending...</p>
                      <p>Booking Related: {request.isBookingRelated ? 'Yes' : 'No'}</p>
                    </div>
                  </div>
                ))}

                {networkInterceptor.getPendingRequests().length === 0 && (
                  <div className="text-center text-gray-500 py-8">
                    No pending network requests
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'sessions' && (
            <div className="h-full overflow-auto p-4">
              <div className="space-y-4">
                {sessions.length === 0 ? (
                  <div className="text-center text-gray-500 py-8">
                    No booking sessions recorded yet
                  </div>
                ) : (
                  sessions.reverse().map(session => (
                    <div key={session.sessionId} className="p-4 rounded border border-gray-200 bg-gray-50">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className={`w-3 h-3 rounded-full ${
                              session.status === 'completed' ? 'bg-green-500' :
                              session.status === 'failed' ? 'bg-red-500' : 'bg-yellow-500'
                            }`}></span>
                            <span className="font-medium">{session.sessionId}</span>
                          </div>
                          <div className="text-sm text-gray-600 mt-1">
                            Started: {formatTimestamp(session.startTime)}
                            {session.endTime && ` • Ended: ${formatTimestamp(session.endTime)}`}
                            {session.summary?.duration && ` • Duration: ${session.summary.duration}ms`}
                          </div>
                        </div>
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          session.status === 'completed' ? 'bg-green-100 text-green-800' :
                          session.status === 'failed' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {session.status}
                        </span>
                      </div>
                      
                      {session.summary && (
                        <div className="grid grid-cols-4 gap-4 mb-3 text-sm">
                          <div className="text-center p-2 bg-white rounded">
                            <div className="font-medium">{session.summary.totalSteps}</div>
                            <div className="text-gray-600">Total Steps</div>
                          </div>
                          <div className="text-center p-2 bg-white rounded">
                            <div className="font-medium text-green-600">{session.summary.totalSteps - session.summary.errorCount}</div>
                            <div className="text-gray-600">Completed</div>
                          </div>
                          <div className="text-center p-2 bg-white rounded">
                            <div className="font-medium text-red-600">{session.summary.errorCount}</div>
                            <div className="text-gray-600">Errors</div>
                          </div>
                          <div className="text-center p-2 bg-white rounded">
                            <div className="font-medium text-yellow-600">{session.summary.warningCount}</div>
                            <div className="text-gray-600">Warnings</div>
                          </div>
                        </div>
                      )}

                      <details>
                        <summary className="cursor-pointer text-sm font-medium text-blue-600 hover:text-blue-800">
                          View Session Steps ({session.entries.length})
                        </summary>
                        <div className="mt-2 space-y-1">
                          {session.entries.map(entry => (
                            <div key={entry.id} className="text-xs p-2 bg-white rounded flex items-center gap-2">
                              <span>{getLogIcon(entry.level)}</span>
                              <span className="font-mono">{entry.step}</span>
                              <span className="flex-1">{entry.message}</span>
                              <span className="text-gray-500">{formatTimestamp(entry.timestamp)}</span>
                            </div>
                          ))}
                        </div>
                      </details>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}