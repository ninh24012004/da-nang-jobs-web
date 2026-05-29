import { UserResponse } from "./user";
import { WardResponse } from "./location";
import { CategoryResponse } from "./category";
import { SkillResponse } from "./skill";

export interface CandidateResponse {
    id: number;
    user: UserResponse;
    ward: WardResponse | null;
    address: string | null;
    categories: CategoryResponse[];
    skills: SkillResponse[];
    createdAt: string;
    updatedAt: string;
}

export interface UpdateCandidateRequest {
    fullName: string;
    avatarUrl?: string;
    wardId?: number;
    address?: string;
    categoryIds: number[];
    skillIds: number[];
}
