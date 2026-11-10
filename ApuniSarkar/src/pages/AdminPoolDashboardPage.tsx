import React, { useState, useEffect } from 'react';
import { Activity, RotateCcw, AlertTriangle, CheckCircle, Flame, Mail, Database, ShieldAlert, Sparkles } from 'lucide-react';
import { KeyPoolTelemetry } from '../types/frontend';

export const AdminPoolDashboardPage: React.FC = () => {
  const [telemetry, setTelemetry] = useState<KeyPoolTelemetry | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionMessage, setActionMessage] = useState<string | null>(null);

  const fetchTelemetry = async () => {
    try {
      const res = await fetch('/api/keys/status');
      if (res.ok) {
        const data = await res.json();
        setTelemetry(data);
      }
    } catch (err) {
      console.warn('Failed to fetch telemetry:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTelemetry();
    const interval = setInterval(fetchTelemetry, 3000);
    return () => clearInterval(interval);
  }, []);

  const handleSimulateRotation = async () => {
    try {
      const res = await fetch('/api/keys/test-rotation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      });
      const data = await res.json();
      setActionMessage(`Rotated! ${data.result.exhausted.accountEmail} exhausted → ${data.result.nextActive.accountEmail} active.`);
      fetchTelemetry();
      setTimeout(() => setActionMessage(null), 5000);
    } catch (err: any) {
      alert('Error simulating rotation: ' + err.message);
    }
  };

  const handleResetKey = async (keyId: string) => {
    try {
      const res = await fetch('/api/keys/reset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ keyId }),
      });
      if (res.ok) {
        setActionMessage(`Account ${keyId} reset back to ACTIVE.`);
        fetchTelemetry();
        setTimeout(() => setActionMessage(null), 4000);
      }
    } catch (err: any) {
      alert('Error resetting key: ' + err.message);
    }
  };

  if (loading) {
    return <div className="p-10 text-center text-sm font-semibold text-gray-500">Loading Key Pool Telemetry...</div>;
  }

  const pool = telemetry?.poolSummary;

  return (
    <div className="max-w-7xl mx-auto py-10 px-4 sm:px-6 lg:px-8 space-y-8 animate-fade-in">
      {/* Title & Live Status */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b pb-6">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-blue-100 text-navbar mb-2">
            <Database className="size-3.5" />
            <span>Strict Non-RAM Persistent Disk Store: keys_pool_state.json</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-ink-900 tracking-tight">
            ElevenLabs Multi-Account Key Pool Telemetry
          </h1>
          <p className="text-xs sm:text-sm text-gray-600 mt-1">
            Dynamic 20-Account Rotation Manager (~300 Mins Free Playback) with Automated Email Alerting
          </p>
        </div>

        {/* Action Button: Test Rotation Live */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleSimulateRotation}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold shadow-md transition-all"
            title="Simulate hitting 9,500 characters quota limit"
          >
            <Flame className="size-4" />
            <span>Simulate Quota Limit (Rotate Key)</span>
          </button>
        </div>
      </div>

      {actionMessage && (
        <div className="p-4 bg-emerald-50 border border-emerald-300 rounded-xl text-emerald-900 text-xs font-bold flex items-center gap-2 animate-fade-in">
          <CheckCircle className="size-4 text-emerald-600 shrink-0" />
          <span>{actionMessage}</span>
        </div>
      )}

      {/* Top 4 Metric Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-white border border-gray-200 shadow-xs space-y-1">
          <span className="text-xs font-bold uppercase text-gray-500">Active Account in Use</span>
          <div className="text-xl font-extrabold text-navbar truncate">
            {telemetry?.activeKey?.accountEmail || 'None'}
          </div>
          <span className="text-[11px] text-gray-500">
            Key ID: <strong>{telemetry?.activeKey?.id}</strong> ({telemetry?.activeKey?.charactersUsed.toLocaleString()} chars)
          </span>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-gray-200 shadow-xs space-y-1">
          <span className="text-xs font-bold uppercase text-gray-500">Healthy Active Pool</span>
          <div className="text-2xl font-extrabold text-emerald-700">
            {pool?.activeAccounts} <span className="text-sm font-semibold text-gray-500">/ {pool?.totalAccounts} Accounts</span>
          </div>
          <span className="text-[11px] text-gray-500">
            {pool?.exhaustedAccounts} exhausted &bull; Safe failover active
          </span>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-gray-200 shadow-xs space-y-1">
          <span className="text-xs font-bold uppercase text-gray-500">Playback Time Remaining</span>
          <div className="text-2xl font-extrabold text-uk-blue">
            ~{pool?.remainingMinutes} <span className="text-sm font-semibold text-gray-500">/ {pool?.totalCapacityMinutes} Mins</span>
          </div>
          <span className="text-[11px] text-gray-500">
            {((pool?.remainingMinutes || 1) / (pool?.totalCapacityMinutes || 1) * 100).toFixed(0)}% capacity intact
          </span>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-gray-200 shadow-xs space-y-1">
          <span className="text-xs font-bold uppercase text-gray-500">Audio Disk Cache</span>
          <div className="text-2xl font-extrabold text-amber-600">
            {telemetry?.cacheStats?.cachedAudiosCount || 0} <span className="text-sm font-semibold text-gray-500">Audios</span>
          </div>
          <span className="text-[11px] text-gray-500">
            Cache Hits: <strong>{telemetry?.cacheStats?.cacheHits}</strong> (0 API quota cost)
          </span>
        </div>
      </div>

      {/* Accounts List Table */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-xs overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-sm font-bold uppercase tracking-wider text-ink-900">
            All 20 ElevenLabs Accounts in Pool
          </h2>
          <span className="text-xs text-gray-500 font-mono">
            Rotation Threshold: {pool?.rotationThresholdChars} chars
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-gray-50 text-gray-700 font-bold border-b border-gray-200">
              <tr>
                <th className="py-3 px-4">Account ID</th>
                <th className="py-3 px-4">Gmail Identity</th>
                <th className="py-3 px-4">Masked Key</th>
                <th className="py-3 px-4">Usage (Chars)</th>
                <th className="py-3 px-4">Estimated Mins</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Email Alert</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {telemetry?.keys.map((k, idx) => {
                const isActive = telemetry?.activeKey?.id === k.id;
                const isExhausted = k.status === 'EXHAUSTED';
                const usagePercent = Math.min(100, Math.round((k.charactersUsed / k.characterLimit) * 100));

                return (
                  <tr
                    key={k.id}
                    className={`hover:bg-gray-50 ${
                      isActive ? 'bg-blue-50/60 font-semibold' : isExhausted ? 'bg-red-50/30' : ''
                    }`}
                  >
                    <td className="py-3 px-4 font-mono font-bold text-gray-900 flex items-center gap-1.5">
                      <span>{k.id}</span>
                      {isActive && (
                        <span className="size-2 rounded-full bg-blue-600 animate-ping" title="Currently Active" />
                      )}
                    </td>
                    <td className="py-3 px-4 font-medium text-ink-900">{k.accountEmail}</td>
                    <td className="py-3 px-4 font-mono text-gray-500">{k.apiKeyMasked}</td>
                    <td className="py-3 px-4">
                      <div className="w-28 space-y-1">
                        <div className="flex justify-between text-[10px]">
                          <span>{k.charactersUsed.toLocaleString()}</span>
                          <span className="text-gray-400">/ 10,000</span>
                        </div>
                        <div className="h-1.5 w-full bg-gray-200 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${
                              usagePercent > 90 ? 'bg-red-500' : usagePercent > 50 ? 'bg-amber-500' : 'bg-emerald-500'
                            }`}
                            style={{ width: `${usagePercent}%` }}
                          />
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4">{k.minutesEstimated.toFixed(1)}m</td>
                    <td className="py-3 px-4">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          isExhausted
                            ? 'bg-red-100 text-red-800'
                            : k.status === 'ACTIVE'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}
                      >
                        {isExhausted ? <Flame className="size-3" /> : <CheckCircle className="size-3" />}
                        <span>{k.status}</span>
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      {k.alertSent ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-red-700">
                          <Mail className="size-3" /> Sent
                        </span>
                      ) : (
                        <span className="text-gray-400 text-[10px]">Pending</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right">
                      {isExhausted && (
                        <button
                          onClick={() => handleResetKey(k.id)}
                          className="px-2.5 py-1 rounded bg-gray-200 hover:bg-gray-300 text-ink-900 font-bold text-[10px] inline-flex items-center gap-1"
                        >
                          <RotateCcw className="size-3" /> Reset
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Recent History / Audit Trail */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-xs space-y-4">
        <h2 className="text-sm font-bold uppercase tracking-wider text-ink-900 flex items-center gap-2">
          <Activity className="size-4 text-navbar" />
          <span>Recent Rotation Events & Alert Audit Trail</span>
        </h2>
        <div className="divide-y divide-gray-100 text-xs">
          {telemetry?.recentEvents.map((evt, idx) => (
            <div key={idx} className="py-2.5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span
                  className={`size-2 rounded-full ${
                    evt.event === 'QUOTA_EXHAUSTED'
                      ? 'bg-red-500'
                      : evt.event === 'KEY_ROTATED'
                      ? 'bg-amber-500'
                      : 'bg-emerald-500'
                  }`}
                />
                <span className="font-bold text-ink-900 font-mono text-[11px]">{evt.event}</span>
                <span className="text-gray-600">{evt.details}</span>
              </div>
              <span className="text-gray-400 font-mono text-[10px]">{new Date(evt.timestamp).toLocaleTimeString()}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

