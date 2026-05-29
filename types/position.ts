export interface PositionResponse {
  id: number;
  positionName: string;
}

export interface PositionRequest {
  positionName: string;
}

export type PositionFormData = PositionRequest;
