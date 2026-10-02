export interface Course {
  code: string;
  title: string;
  faculty: string;
}

export interface Resource {
  course: string;
  name: string;
  format: string; // 'PDF' | 'DOC' | 'PPT' | 'ARCHIVE' | 'IMAGE' | 'XLS' | 'TXT' | 'OTHER'
  type: string;   // 'MIDTERM' | 'FINALTERM' | 'QUIZ' | 'ASSIGNMENT' | 'HANDOUT' | 'MCQFILE' | 'OTHER'
  tags: string[];
  rlh: string;    // Opaque Resource Locator Hash (e.g. r_8f9a21bc34e0a752)
}

export interface FilterState {
  course: string;
  type: string;
  format: string;
  tags: string[];
  solvedOnly: boolean;
  pastPapersOnly: boolean;
  currentOnly: boolean;
}

export interface DownloadSession {
  rlh: string;
  name: string;
  format: string;
  course: string;
  status: 'resolving' | 'ready' | 'downloading' | 'complete' | 'error';
  errorMessage?: string;
  token?: string;
  downloadUrl?: string;
  expiresIn?: number;
}
