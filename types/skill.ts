export interface SkillResponse {
  id: number;
  skillName: string;
}

export interface SkillRequest {
  skillName: string;
}

// Alias dùng trong form (tương đương SkillRequest)
export type SkillFormData = SkillRequest;
