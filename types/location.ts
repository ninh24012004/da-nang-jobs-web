export interface DistrictResponse {
    id: number;
    districtName: string;
}

export interface DistrictRequest {
    districtName: string;
}

export interface DistrictFormData {
    districtName: string;
}

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

export interface WardFormData {
    wardName: string;
    districtId: number;
}
