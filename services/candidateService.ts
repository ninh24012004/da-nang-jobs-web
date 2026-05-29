import api from "./api";
import { ApiResponse } from "@/types/apiResponse";
import { PageResponse } from "@/types/pageResponse";
import { CandidateResponse, UpdateCandidateRequest } from "@/types/candidate";

export const candidateService = {
  getCandidateProfile: async (): Promise<CandidateResponse> => {
    const response = await api.get<ApiResponse<CandidateResponse>>("candidates/profile");
    return response.data.data;
  },

  updateCandidateProfile: async (request: UpdateCandidateRequest): Promise<CandidateResponse> => {
    const response = await api.put<ApiResponse<CandidateResponse>>("candidates/profile", request);
    return response.data.data;
  },

  getAllCandidates: async (page: number = 0, size: number = 10): Promise<PageResponse<CandidateResponse>> => {
    const response = await api.get<ApiResponse<PageResponse<CandidateResponse>>>("candidates", {
      params: { page, size }
    });
    return response.data.data;
  },

  getCandidateById: async (id: number): Promise<CandidateResponse> => {
    const response = await api.get<ApiResponse<CandidateResponse>>(`candidates/${id}`);
    return response.data.data;
  }
};

export default candidateService;
