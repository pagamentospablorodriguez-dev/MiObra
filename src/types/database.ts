export type UserRole = 'admin' | 'worker' | 'client';
export type ProjectStatus = 'planning' | 'in_progress' | 'paused' | 'completed';
export type TaskStatus = 'pending' | 'in_progress' | 'review' | 'approved' | 'rejected';
export type PriorityLevel = 'low' | 'medium' | 'high' | 'urgent';
export type IssueSeverity = 'low' | 'medium' | 'high' | 'critical';
export type IssueStatus = 'open' | 'in_progress' | 'resolved';
export type PhotoType = 'progress' | 'issue' | 'completion' | 'before' | 'after';
export type NotificationType = 'alert' | 'info' | 'warning' | 'success';

export interface Profile {
  id: string;
  full_name: string;
  role: UserRole;
  phone: string | null;
  avatar_url: string | null;
  rating: number;
  total_ratings: number;
  is_active: boolean;
  created_at: string;
}

export interface Project {
  id: string;
  name: string;
  client_id: string | null;
  address: string;
  description: string | null;
  status: ProjectStatus;
  start_date: string | null;
  expected_end_date: string | null;
  budget: number;
  spent: number;
  progress_percentage: number;
  project_documents: string[] | null;
  created_at: string;
  updated_at: string;
}

export interface Task {
  id: string;
  project_id: string;
  title: string;
  description: string | null;
  assigned_to: string | null;
  status: TaskStatus;
  priority: PriorityLevel;
  due_date: string | null;
  quality_score: number | null;
  review_notes: string | null;
  created_at: string;
  completed_at: string | null;
}

export interface CheckIn {
  id: string;
  worker_id: string;
  project_id: string;
  check_in_time: string;
  check_out_time: string | null;
  location_lat: number | null;
  location_lng: number | null;
  check_in_photo: string | null;
  check_out_photo: string | null;
  notes: string | null;
  created_at: string;
}

export interface Photo {
  id: string;
  project_id: string;
  task_id: string | null;
  uploaded_by: string;
  photo_url: string;
  description: string | null;
  photo_type: PhotoType;
  is_approved: boolean;
  created_at: string;
}

export interface Issue {
  id: string;
  project_id: string;
  reported_by: string;
  title: string;
  description: string | null;
  severity: IssueSeverity;
  status: IssueStatus;
  photo_urls: string[] | null;
  resolved_at: string | null;
  created_at: string;
}

export interface Comment {
  id: string;
  project_id: string | null;
  task_id: string | null;
  user_id: string;
  comment: string;
  created_at: string;
}

export interface Notification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: NotificationType;
  is_read: boolean;
  link: string | null;
  created_at: string;
}
