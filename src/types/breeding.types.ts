export type ServiceType = 'AI' | 'ET' | 'IVF' | 'Nature';
export type BreedingMethod = 'Back-cross' | 'Cross-Breeding' | 'Inbreeding';
export type DamSource = 'Existing Dam' | 'Dam from Calf' | 'New Dam';
export type PregnancyStatus = 'Draft' | 'Pending' | 'Confirmed Pregnant' | 'Open' | 'Calved' | 'Cancelled' | 'Archived';

export interface BreedingRecord {
  id: string; // BRD-xxxx
  damId: string;
  damBreed?: string;
  sireId?: string;
  matingDate: string; // Breeding Date
  breedingType: 'AI' | 'Natural'; // Legacy field mapped to ServiceType
  technician?: string;
  pregnancyStatus: PregnancyStatus;
  pregnancyCheckDate?: string | null;
  expectedCalvingDate?: string | null;
  actualCalvingDate?: string | null;
  calfId?: string | null;
  notes?: string;
  createdAt?: string;

  // Breeding Program Fields
  cowOwner?: string;
  ownerType?: 'Farm' | 'Cow Owner';
  farmCode?: string;
  farmLocation?: string;
  ownerContact?: string;
  damSource?: DamSource;
  calfIdSource?: string; // Linked calf ID if Dam from Calf
  breederName?: string;
  breederId?: string;
  breederContact?: string;
  serviceType?: ServiceType;
  breedingMethod?: BreedingMethod;
  targetBreed?: string;
  bullName?: string;
  sireName?: string;
  damName?: string;
  sireImageUrl?: string;
  damImageUrl?: string;
  heatDetectionDate?: string | null;
  checkupDate?: string | null;
  expectedBirthdate?: string | null;
  breedingServiceCost?: number;
  breedingInseminationCost?: number;
  price?: number;
  currency?: 'USD' | 'KHR';
}

export interface BreedingSummary {
  activeDams: number;
  pregnantDams: number;
  openDams: number;
  expectedCalvingsNext30Days: number;
  aiSuccessRate: number; // Percentage
}
