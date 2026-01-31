"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import { logs as initialLogs } from "@/lib/data";
import type { LogEntry } from "@/lib/data/types";

type LogLevel = "ALL" | "INFO" | "WARN" | "ERROR";

export default function SystemLog() {
  const [filter, setFilter] = useState<LogLevel>("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [displayedLogs, setDisplayedLogs] = useState<LogEntry[]>([]);
  const logContainerRef = useRef<HTMLDivElement>(null);
  const currentIndexRef = useRef(0);

  // 初回ロード時にログを順番に表示するアニメーション
  useEffect(() => {
    currentIndexRef.current = 0;
    setDisplayedLogs([]);

    const interval = setInterval(() => {
      if (currentIndexRef.current < initialLogs.length) {
        const logToAdd = initialLogs[currentIndexRef.current];
        if (logToAdd) {
          setDisplayedLogs((prev) => [...prev, logToAdd]);
        }
        currentIndexRef.current++;
      } else {
        clearInterval(interval);
      }
    }, 150);

    return () => clearInterval(interval);
  }, []);

  // スクロールを最新に保つ
  useEffect(() => {
    if (logContainerRef.current) {
      logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
    }
  }, [displayedLogs]);

  // フィルタリングされたログ
  const filteredLogs = useMemo(() => {
    return displayedLogs.filter((log) => {
      if (!log) return false;
      const matchesLevel = filter === "ALL" || log.level === filter;
      const matchesSearch =
        searchQuery === "" ||
        log.message.toLowerCase().includes(searchQuery.toLowerCase()) ||
        log.type.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesLevel && matchesSearch;
    });
  }, [displayedLogs, filter, searchQuery]);

  // ログレベルに応じた色
  const getLevelColor = (level: string) => {
    switch (level) {
      case "INFO":
        return "var(--color-status-info)";
      case "WARN":
        return "var(--color-status-warn)";
      case "ERROR":
        return "var(--color-status-error)";
      default:
        return "var(--color-text-secondary)";
    }
  };

  // タイムスタンプをフォーマット
  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toISOString().replace("T", " ").substring(0, 19);
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <h2 className="font-[var(--font-display)] font-bold text-[var(--color-text-primary)]">
          System Log
        </h2>
        <div className="flex items-center gap-1">
          <div className="w-2 h-2 rounded-full bg-[var(--color-status-ok)] animate-pulse" />
          <span className="text-[10px] text-[var(--color-text-muted)]">LIVE</span>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-2 mb-3">
        {(["ALL", "INFO", "WARN", "ERROR"] as LogLevel[]).map((level) => (
          <button
            key={level}
            onClick={() => setFilter(level)}
            className={`px-2 py-1 text-[10px] font-[var(--font-mono)] rounded transition-colors ${
              filter === level
                ? "bg-[var(--color-accent-primary)] text-[var(--color-bg-primary)]"
                : "bg-[var(--color-bg-tertiary)] text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]"
            }`}
          >
            {level}
          </button>
        ))}
      </div>

      {/* Search */}
      <input
        type="text"
        placeholder="Search logs..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className="w-full px-3 py-1.5 mb-3 text-xs bg-[var(--color-bg-tertiary)] border border-[var(--color-border)] rounded focus:outline-none focus:border-[var(--color-accent-primary)] text-[var(--color-text-primary)] placeholder-[var(--color-text-muted)]"
      />

      {/* Log Entries */}
      <div
        ref={logContainerRef}
        className="flex-1 overflow-y-auto font-[var(--font-mono)] text-[11px] leading-relaxed space-y-0.5"
      >
        {filteredLogs.map((log, index) => (
          <div
            key={`${log.timestamp}-${index}`}
            className="flex gap-2 py-0.5 hover:bg-[var(--color-bg-tertiary)] px-1 rounded transition-colors"
          >
            <span className="text-[var(--color-text-muted)] shrink-0">
              [{formatTimestamp(log.timestamp)}]
            </span>
            <span
              className="shrink-0 w-12"
              style={{ color: getLevelColor(log.level) }}
            >
              {log.level.padEnd(5)}
            </span>
            <span className="text-[var(--color-accent-primary)] shrink-0 w-24 truncate">
              {log.type}
            </span>
            <span className="text-[var(--color-text-secondary)]">:</span>
            <span className="text-[var(--color-text-primary)] break-words">
              {log.message}
            </span>
          </div>
        ))}

        {/* Cursor blink */}
        <div className="flex items-center gap-1 py-0.5 px-1">
          <span className="text-[var(--color-text-muted)]">&gt;</span>
          <span className="w-2 h-4 bg-[var(--color-accent-primary)] animate-pulse" />
        </div>
      </div>

      {/* Footer */}
      <div className="pt-2 mt-2 border-t border-[var(--color-border)] text-[10px] text-[var(--color-text-muted)] flex justify-between">
        <span>{filteredLogs.length} entries</span>
        <span>Career Timeline: 2018 - Present</span>
      </div>
    </div>
  );
}
