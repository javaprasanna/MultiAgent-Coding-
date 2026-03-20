import React from 'react';
import { ShieldAlert, AlertTriangle, CheckCircle } from 'lucide-react';

export default function ReviewReport({ report }) {
  if (!report) return <div className="p-4 text-gray-400">No review report available yet.</div>;

  return (
    <div className="p-4 bg-white h-full overflow-y-auto">
      <div className="flex items-center gap-3 mb-6">
        <h2 className="text-xl font-bold text-gray-900">Code Review Report</h2>
        <span className={`px-2 py-1 rounded text-xs font-bold ${report.status === 'Approved' ? 'bg-green-900 text-green-300' : 'bg-red-900 text-red-300'}`}>
          {report.status}
        </span>
      </div>

      <div className="space-y-4">
        {report.issues && report.issues.length === 0 ? (
          <div className="text-green-400 flex items-center gap-2">
            <CheckCircle className="w-5 h-5"/> All checks passed perfectly!
          </div>
        ) : (
          report.issues?.map((issue, idx) => (
            <div key={idx} className="p-4 border border-gray-200 rounded-lg bg-gray-50">
              <div className="flex items-center gap-2 mb-2">
                {issue.severity === 'Critical' ? <ShieldAlert className="w-5 h-5 text-red-500" /> : <AlertTriangle className="w-5 h-5 text-yellow-500" />}
                <span className="font-bold text-gray-900">{issue.severity}</span>
              </div>
              <p className="text-gray-700 text-sm mb-2">{issue.description}</p>
              {issue.suggestion && (
                <div className="bg-white p-2 rounded text-sm text-gray-600 border border-gray-200 whitespace-pre-wrap">
                  <span className="text-primary font-bold">Suggestion: </span>
                  {issue.suggestion}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
