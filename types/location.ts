export interface DistrictResponse {
  id: number;
  districtName: string;
}

export interface DistrictRequest {
  districtName: string;
}

export type DistrictFormData = DistrictRequest;

export interface WardResponse {
  id: number;
  wardName: string;
  districtId: number;
  districtName?: string;
}

export interface WardRequest {
  wardName: string;
  districtId: number;
}

export type WardFormData = WardRequest;
