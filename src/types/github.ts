export interface EventDetails {
  id: string;
  date: string;
  repo: string;
  action: string;
  actionType: string;
  description: string;
  url: string;
  state: string;
  user: string;
  avatarUrl: string;
  number: number;
  merged: boolean;
  comments: number;
  commits: number;
  ref: string;
  commitsList: any[];
  payload?: any;
}

export interface GitHubEvent {
  id: string;
  type: string;
  repo: { name: string };
  created_at: string;
  payload: any;
}

export interface CachedData {
  events: GitHubEvent[];
  lastFetched: number;
  totalCount: number;
} 