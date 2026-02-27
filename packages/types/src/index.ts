// ─── Enums & Constants ───────────────────────────────────────────────────────

export const PROFICIENCY_LEVELS = [
  "beginner",
  "intermediate",
  "advanced",
  "expert",
] as const;

export type ProficiencyLevel = (typeof PROFICIENCY_LEVELS)[number];

export const SESSION_STATUSES = [
  "pending",
  "confirmed",
  "in_progress",
  "completed",
  "cancelled",
] as const;

export type SessionStatus = (typeof SESSION_STATUSES)[number];

export const TRANSACTION_TYPES = [
  "earned",
  "spent",
  "bonus",
  "starter",
] as const;

export type TransactionType = (typeof TRANSACTION_TYPES)[number];

// ─── Core Types ──────────────────────────────────────────────────────────────

export interface User {
  id: string;
  email: string;
  username: string;
  bio: string | null;
  avatar_url: string | null;
  time_balance_hours: number;
  total_hours_taught: number;
  total_hours_learned: number;
  rating_avg: number;
  rating_count: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface UserProfile extends User {
  skills_offered: UserSkillOffered[];
  skills_wanted: UserSkillWanted[];
}

export interface SkillCategory {
  id: string;
  name: string;
  icon: string;
  description: string | null;
}

export interface Skill {
  id: string;
  name: string;
  category_id: string;
  description: string | null;
  category?: SkillCategory;
}

export interface UserSkillOffered {
  id: string;
  user_id: string;
  skill_id: string;
  proficiency_level: ProficiencyLevel;
  description: string | null;
  hourly_rate_credits: number;
  is_active: boolean;
  skill?: Skill;
  created_at: string;
}

export interface UserSkillWanted {
  id: string;
  user_id: string;
  skill_id: string;
  desired_level: ProficiencyLevel;
  notes: string | null;
  skill?: Skill;
  created_at: string;
}

// ─── Session Types ───────────────────────────────────────────────────────────

export interface Session {
  id: string;
  teacher_id: string;
  learner_id: string;
  skill_id: string;
  scheduled_at: string;
  duration_hours: number;
  status: SessionStatus;
  meeting_link: string | null;
  notes: string | null;
  teacher?: User;
  learner?: User;
  skill?: Skill;
  created_at: string;
}

export interface SessionReview {
  id: string;
  session_id: string;
  reviewer_id: string;
  reviewee_id: string;
  rating: number;
  comment: string | null;
  reviewer?: User;
  reviewee?: User;
  created_at: string;
}

// ─── Transaction Types ───────────────────────────────────────────────────────

export interface Transaction {
  id: string;
  from_user_id: string | null;
  to_user_id: string;
  session_id: string | null;
  hours: number;
  type: TransactionType;
  description: string | null;
  created_at: string;
}

export interface TimeBalance {
  available: number;
  total_earned: number;
  total_spent: number;
}

// ─── Matching Types ──────────────────────────────────────────────────────────

export interface MatchedUser {
  id: string;
  username: string;
  bio: string | null;
  avatar_url: string | null;
  rating_avg: number;
  rating_count: number;
}

export interface SkillMatch {
  user: MatchedUser;
  skills_they_offer_you_want: UserSkillOffered[];
  skills_you_offer_they_want: UserSkillWanted[];
  compatibility_score: number;
  rating: number;
}

// ─── Dashboard Types ─────────────────────────────────────────────────────────

export interface CommunityStats {
  total_users: number;
  total_skills: number;
  total_sessions: number;
  total_hours_exchanged: number;
}

export interface SkillMapEntry {
  skill_name: string;
  category: string;
  user_count: number;
}

export interface TopTeacher {
  id: string;
  username: string;
  avatar_url: string | null;
  total_hours_taught: number;
  rating_avg: number;
  rating_count: number;
  top_skills: string[];
}

export interface UserDashboard {
  balance: TimeBalance;
  upcoming_sessions_count: number;
  completed_sessions_count: number;
  total_hours_taught: number;
  total_hours_learned: number;
  rating_avg: number;
  rating_count: number;
  skills_offered_count: number;
  skills_wanted_count: number;
  recent_matches_count: number;
}

// ─── Auth Types ──────────────────────────────────────────────────────────────

export interface TokenResponse {
  access_token: string;
  token_type: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  username: string;
  password: string;
  bio?: string;
}

// ─── Request Types ───────────────────────────────────────────────────────────

export interface SessionCreateRequest {
  teacher_id: string;
  skill_id: string;
  scheduled_at: string;
  duration_hours: number;
  notes?: string;
}

export interface SessionReviewCreateRequest {
  rating: number;
  comment?: string;
}

export interface UserSkillOfferedCreateRequest {
  skill_id: string;
  proficiency_level: ProficiencyLevel;
  description?: string;
  hourly_rate_credits?: number;
}

export interface UserSkillWantedCreateRequest {
  skill_id: string;
  desired_level: ProficiencyLevel;
  notes?: string;
}

export interface SkillBrowseEntry {
  skill: Skill;
  offered_count: number;
  wanted_count: number;
}
