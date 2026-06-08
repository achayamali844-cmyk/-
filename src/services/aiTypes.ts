export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  files?: { mimeType: string; data: string; name: string }[];
}

export interface TaskItem {
  name: string;
  description: string;
}

export interface StudyCheckInResult {
  passed: boolean;
  message: string;
  score: number;
}
