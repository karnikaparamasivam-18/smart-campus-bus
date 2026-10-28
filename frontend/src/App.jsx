import React from 'react'

export default function App() {
  return (
    <div className="min-h-screen bg-slate-900 text-white flex flex-col items-center justify-center p-6">
      <div className="max-w-md w-full bg-slate-800 p-8 rounded-2xl shadow-xl border border-slate-700 text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-indigo-500/20 text-indigo-400 text-3xl mb-4">
          🚌
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-white mb-2">
          Smart Campus Bus
        </h1>
        <p className="text-sm text-slate-400 mb-6">
          Frontend initialized and Docker container ready.
        </p>

        <div className="bg-slate-900/60 rounded-xl p-4 text-left border border-slate-700/60 font-mono text-xs text-slate-300 space-y-2">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <span className="text-slate-400">Environment:</span>
            <span className="text-emerald-400 font-medium">Containerized</span>
          </div>
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <span className="text-slate-400">Proxy Target:</span>
            <span className="text-indigo-400 font-medium">/api/v1</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-400">DevOps Task:</span>
            <span className="text-teal-400 font-medium">Docker + Nginx</span>
          </div>
        </div>
      </div>
    </div>
  )
}

