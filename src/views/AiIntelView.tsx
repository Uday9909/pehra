import React, { useState } from 'react';
import {
  Sparkles,
  Search,
  ExternalLink,
  ShieldCheck,
  AlertTriangle,
  Send,
  Radio,
  Clock,
  Compass,
} from 'lucide-react';
import { api } from '../api/client.ts';

export const AiIntelView: React.FC = () => {
  const [query, setQuery] = useState('Current Mumbai monsoon rainfall warnings, waterlogging hotspots, and local train disruptions');
  const [loading, setLoading] = useState(false);
  const [intel, setIntel] = useState<any>(null);

  const presets = [
    'Current Mumbai monsoon rainfall warnings, waterlogging hotspots, and local train disruptions',
    'Mithi river flood barrier operations, high tide timing, and Kurla evacuation readiness',
    'Suburban railway waterlogging at Sion, Kurla, Dadar, and Western railway track status',
    'Emergency helpline numbers, BMC disaster management control room advisories',
  ];

  const handleFetchIntel = async (q?: string) => {
    const searchQuery = q || query;
    setLoading(true);
    try {
      const res = await api.getGroundedIntel(searchQuery);
      setIntel(res.intelligence);
    } catch (err: any) {
      alert(err.message || 'Failed to retrieve AI intelligence');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-pehra-border-subtle pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-pehra-text tracking-tight">Grounded Disaster Intelligence</h1>
            <span className="rounded bg-pehra-panel border border-pehra-border-subtle px-2 py-0.5 text-pehra-text font-mono text-pehra-text">
              GEMINI 3.8-FLASH + GOOGLE SEARCH GROUNDING
            </span>
          </div>
          <p className="text-xs text-pehra-text mt-1">
            Real-time verification of official IMD warnings, MCGM advisories, and transit alerts via server-side grounded models
          </p>
        </div>
      </div>

      {/* Query Bar & Presets */}
      <div className="rounded-none border border-pehra-border-subtle bg-pehra-panel p-5 space-y-4 shadow-none">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleFetchIntel();
          }}
          className="flex flex-col sm:flex-row gap-2"
        >
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 h-4 w-4 text-pehra-text" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Ask for grounded disaster intelligence or local advisory updates..."
              className="w-full border border-pehra-border-control bg-pehra-raised py-2.5 pl-10 pr-4 text-xs text-pehra-text placeholder:text-pehra-text-muted focus:border-pehra-focus focus:outline-none"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="flex items-center justify-center gap-2 bg-pehra-action px-5 py-2.5 text-xs font-bold text-pehra-action-text transition-opacity hover:opacity-90"
          >
            <Sparkles className="h-4 w-4" />
            <span>{loading ? 'Synthesizing...' : 'Query Intel'}</span>
          </button>
        </form>

        <div className="space-y-1.5">
          <span className="text-pehra-text font-semibold text-pehra-text block">Suggested Quick Grounding Queries:</span>
          <div className="flex flex-wrap gap-2">
            {presets.map((p, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setQuery(p);
                  handleFetchIntel(p);
                }}
                className="rounded-none border border-pehra-border-subtle bg-pehra-panel px-2.5 py-1.5 text-left text-pehra-text-2 hover:border-pehra-border-subtle hover:text-pehra-text transition-all"
              >
                {p}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Structured Output Display */}
      {intel ? (
        <div className="rounded-none border border-pehra-border-subtle bg-pehra-panel p-6 space-y-6 shadow-none">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-pehra-border-subtle pb-4">
            <div>
              <div className="flex items-center gap-2">
                <span
                  className={`rounded px-2.5 py-0.5 text-xs font-bold uppercase ${
                    intel.alertLevel === 'RED'
                      ? 'bg-pehra-severity-critical text-pehra-bg'
                      : intel.alertLevel === 'ORANGE'
                      ? 'bg-pehra-severity-warning text-pehra-bg'
                      : 'border border-pehra-border-subtle bg-pehra-raised text-pehra-text-2'
                  }`}
                >
                  IMD ALERT LEVEL: {intel.alertLevel}
                </span>
                <span className="text-xs text-pehra-text flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  <span>Synthesized: {new Date(intel.timestamp).toLocaleTimeString()}</span>
                </span>
              </div>
              <h2 className="mt-2 text-xl font-bold text-pehra-text tracking-tight">Executive Situation Summary</h2>
            </div>

            <div className="rounded-none bg-pehra-panel px-3 py-1.5 border border-pehra-border-subtle text-pehra-text font-mono text-pehra-text">
              Model: {intel.model}
            </div>
          </div>

          <div className="text-sm text-pehra-text leading-relaxed bg-pehra-panel p-4 rounded-none border border-pehra-border-subtle">
            {intel.summary}
          </div>

          {/* Actionable Advisories */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-pehra-text flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-pehra-text" />
              <span>Verified Operational Advisories:</span>
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {intel.actionableAdvisories.map((adv: string, i: number) => (
                <div key={i} className="rounded-none border border-pehra-border-subtle bg-pehra-panel p-3 text-xs text-pehra-text flex items-start gap-2">
                  <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center border border-pehra-border-control bg-pehra-raised font-mono font-bold text-pehra-text-2">
                    {i + 1}
                  </span>
                  <span>{adv}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Grounding Source URLs & Citations */}
          <div className="space-y-2 border-t border-pehra-border-subtle pt-4 text-xs">
            <span className="font-bold text-pehra-text block">Grounding Sources & Official Citations:</span>
            <div className="flex flex-wrap gap-2">
              {intel.groundingSources.map((src: any, idx: number) => (
                <a
                  key={idx}
                  href={src.uri}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1.5 rounded-none border border-pehra-border-subtle bg-pehra-panel px-3 py-1.5 text-pehra-text hover:border-pehra-border-subtle hover:text-pehra-text transition-all"
                >
                  <span>{src.title}</span>
                  <ExternalLink className="h-3 w-3" />
                </a>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="rounded-none border border-pehra-border-subtle bg-pehra-panel p-12 text-center text-pehra-text text-xs">
          Enter a prompt or click one of the suggested grounding queries above to trigger real-time Google Search grounding.
        </div>
      )}
    </div>
  );
};
