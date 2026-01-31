// Profile information
export interface Profile {
  name: string;
  title: string;
  bio: string;
  uptimeYears: number;
  contact: string;
}

// Skill entry
export interface Skill {
  id: string;
  name: string;
  category: "Backend" | "Frontend" | "Infra" | "Other";
  level: number; // 1-100
  months: number;
}

// Project entry
export interface Project {
  id: string;
  title: string;
  company: string;
  startDate: string;
  endDate: string | null;
  role: string;
  teamSize: number;
  skills: string[];
  featured: boolean;
  description?: string;
}

// System log entry
export interface LogEntry {
  timestamp: string;
  level: "INFO" | "WARN" | "ERROR";
  type: string;
  message: string;
}
