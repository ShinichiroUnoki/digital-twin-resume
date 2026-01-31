import profileData from "./profile.json";
import skillsData from "./skills.json";
import projectsData from "./projects.json";
import logsData from "./logs.json";
import type { Profile, Skill, Project, LogEntry } from "./types";

export const profile: Profile = profileData;
export const skills: Skill[] = skillsData as Skill[];
export const projects: Project[] = projectsData as Project[];
export const logs: LogEntry[] = logsData as LogEntry[];

export type { Profile, Skill, Project, LogEntry };
