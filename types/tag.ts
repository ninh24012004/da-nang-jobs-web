export interface TagResponse {
  id: number;
  tagName: string;
}

export interface TagRequest {
  tagName: string;
}

export type TagFormData = TagRequest;
