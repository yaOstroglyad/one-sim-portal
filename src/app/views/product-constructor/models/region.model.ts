import { Country } from './common.model';

export interface Region {
  id: number;
  name: string;
  countries?: Country[];
}

export interface RegionSummary {
  id: number;
  name: string;
  countryCount?: number;
}

export interface CreateRegionRequest {
  name: string;
  countryIds: number[];
}

export interface UpdateRegionRequest {
  name: string;
  countryIds: number[];
}

export interface RegionSearchParams {
  name?: string;
}