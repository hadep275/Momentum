export interface Note {
  id: string;
  title: string;
  content: string;
  isPinned: boolean;
  createdAt: string;
  updatedAt: string;
  photos?: string[]; // Array of photo URIs from camera
}
