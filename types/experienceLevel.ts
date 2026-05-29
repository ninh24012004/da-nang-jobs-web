export interface ExperienceLevelResponse {
  id: number;
  levelName: string;
}

export interface ExperienceLevelRequest {
  levelName: string;
}

export type ExperienceLevelFormData = ExperienceLevelRequest;
