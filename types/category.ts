export interface CategoryResponse {
  id: number;
  categoryName: string;
  parentId: number | null;
}

export interface CategoryRequest {
  categoryName: string;
  parentId: number | null;
}

export interface CategoryTreeResponse {
  id: number;
  categoryName: string;
  parentId?: number | null;
  children?: CategoryTreeResponse[];
}

// Alias dùng trong component tree (tương đương CategoryTreeResponse)
export type Category = CategoryTreeResponse;

export type CategoryFormData = {
  categoryName: string;
  parentId: number | null;
};
