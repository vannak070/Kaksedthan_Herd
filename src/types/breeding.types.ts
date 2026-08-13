// Sire Register Interface
export interface SireItem {
  id: string; // SIR-001
  name: string;
  breed: string;
  breedId?: string;
  registrationNumber?: string;
  dob?: string;
  bloodline?: string;
  sourcingCompany?: string;
  sourcingCompanyId?: string;
  sourcingCompanyCountry?: string;
  sourcingCompanyImage?: string;
  breederId?: string;
  fatherId?: string;
  motherId?: string;
  imageUrl?: string;
  ownerType?: 'Farm Station' | 'Breeder' | 'Cow Owner' | 'Sire Sourcing Company' | 'Internal Company';
  ownerId?: string;
  ownerName?: string;
  farmId?: string;
  farmLocation?: string;
  ownershipStatus?: string;
  ownershipStartDate?: string;
  status: 'Active' | 'Retired' | 'Sold' | 'Deceased' | 'Archived';
  certificationStatus?: 'NOT_APPLIED' | 'PENDING_APPROVAL' | 'APPROVED' | 'REJECTED';
  createdAt?: string;
  updatedAt?: string;
}

// Stock Insemination (Semen Stock & Breeding Services) Interface
export interface StockInseminationItem {
  id: string; // SEM-001
  sireId: string;
  sireName?: string;
  sireBreed?: string;
  sireImageUrl?: string;
  stockAvailable: number;
  availableStraws?: number;
  priceUsd: number;
  priceKhr: number;
  currency: 'USD' | 'KHR';
  ownerName?: string;
  farmLocation?: string;
  breederName?: string;
  availability: 'Available' | 'Out of Stock' | 'Reserved' | 'Discontinued';
  status: 'Active' | 'Archived';
  tankNumber?: string;
  collectionDate?: string;
  notes?: string;
  initialQuantity?: number;
  createdAt?: string;
  updatedAt?: string;
}

// Dam Register Interface
export interface DamItem {
  id: string; // DAM-001
  name?: string;
  breed: string;
  breedId?: string;
  dob?: string;
  fatherId?: string;
  motherId?: string;
  ownerType?: string;
  ownerName?: string;
  ownerId?: string;
  customerId?: string;
  customerName?: string;
  farmLocation?: string;
  farmId?: string;
  imageUrl?: string;
  availability: 'Available' | 'In Breeding' | 'Pregnant' | 'Sold' | 'Transferred' | 'Deceased' | 'Archived';
  breedingStatus: 'Open' | 'In Breeding' | 'Confirmed Pregnant' | 'Calved';
  pregnancyStatus: 'Open' | 'Pending Check' | 'Confirmed Pregnant';
  certificationStatus?: 'NOT_APPLIED' | 'PENDING_APPROVAL' | 'APPROVED' | 'REJECTED';
  status?: string;
  createdAt?: string;
  updatedAt?: string;
}

// Breeding Program Workflow Statuses
export type BreedingProgramStatus =
  | 'Draft'
  | 'Scheduled'
  | 'Breeding'
  | 'Pregnancy Check'
  | 'Pregnant'
  | 'Expected Calving'
  | 'Calved'
  | 'Calf Registered'
  | 'Completed'
  | 'Cancelled'
  | 'Failed'
  | 'Not Pregnant';

// Breeding Program Interface
export interface BreedingProgramItem {
  id: string; // BP-2026-0001
  programNumber: string;
  breedingType: 'AI' | 'Natural Mating' | 'Embryo Transfer';
  breedingMethod: string;
  breed?: string;
  purpose?: string;
  startDate: string;
  sireId: string;
  sireName?: string;
  sireBreed?: string;
  sireImageUrl?: string;
  damId: string;
  damName?: string;
  damBreed?: string;
  damImageUrl?: string;
  ownerName?: string;
  ownerId?: string;
  cowOwner?: string;
  farmLocation?: string;
  farmId?: string;
  breederName?: string;
  breederId?: string;
  serviceFee?: number;
  semenPrice?: number;
  semenCost?: number;
  breederFee?: number;
  otherCost?: number;
  discount?: number;
  semenQty?: number;
  unitPrice?: number;
  priceOverrideReason?: string;
  numServices?: number;
  currency?: 'USD' | 'KHR';
  priceUsd: number;
  priceKhr: number;
  breedingDate?: string;
  pregnancyCheckDate?: string;
  expectedCalvingDate?: string;
  actualCalvingDate?: string;
  result?: string;
  status: BreedingProgramStatus;
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
  // Extended fields used by legacy BreedingLogsSubTab
  pregnancyStatus?: string;
  damSource?: string;
  calfIdSource?: string;
  bullName?: string;
  ownerType?: string;
  price?: number;
  breedingInseminationCost?: number;
  serviceType?: string;
  targetBreed?: string;
  matingDate?: string;
  expectedBirthdate?: string;
  technician?: string;
  checkupDate?: string;
  calfId?: string;
  heatDetectionDate?: string;
  breedingServiceCost?: number;
  farmCode?: string;
  ownerContact?: string;
  breederContact?: string;
}

export type BreedingRecord = BreedingProgramItem;

// Legacy type aliases for BreedingLogsSubTab
export type PregnancyStatus = string;
export type ServiceType = string;
export type BreedingMethod = string;
export type DamSource = string;

// Calf Register Interface
export interface CalfItem {
  id: string; // CLF-2026-001
  breedingProgramId?: string;
  sireId: string;
  sireName?: string;
  sireBreed?: string;
  damId: string;
  damName?: string;
  damBreed?: string;
  name?: string;
  sex: 'Male' | 'Female';
  breed: string;
  birthDate: string;
  birthWeight: number;
  color?: string;
  ownerName?: string;
  cowOwner?: string;
  farmLocation?: string;
  breederName?: string;
  breederId?: string;
  registrationNumber?: string;
  imageUrl?: string;
  status: 'Registered to Herdbook' | 'Under Inspection' | 'Transferred' | 'Deceased' | 'Archived';
  certificationStatus?: 'NOT_APPLIED' | 'PENDING_APPROVAL' | 'APPROVED' | 'REJECTED';
  createdAt?: string;
  updatedAt?: string;
}

// Herdbook Registration Status
export type HerdbookRegistrationStatus =
  | 'Draft'
  | 'Under Review'
  | 'Verified'
  | 'Approved'
  | 'Published'
  | 'Archived';

// Herdbook Registration Interface
export interface HerdbookRegistrationItem {
  id: string; // HR-2026-001
  registrationNumber: string; // KH-2026-8891
  animalType: 'Sire' | 'Dam' | 'Calf';
  animalId: string;
  animalName?: string;
  breed?: string;
  imageUrl?: string;
  sireId?: string;
  sireName?: string;
  damId?: string;
  damName?: string;
  calfId?: string;
  breedingProgramId?: string;
  ownerName?: string;
  farmLocation?: string;
  breederName?: string;
  registrationDate: string;
  status: HerdbookRegistrationStatus;
  approvedBy?: string;
  approvedAt?: string;
  publicToken: string;
  createdAt?: string;
  updatedAt?: string;
}

// Pedigree Tree Interface
export interface PedigreeTree {
  id?: number;
  animalId: string;
  animalName?: string;
  breed?: string;
  sireId?: string;
  sireName?: string;
  sireBreed?: string;
  damId?: string;
  damName?: string;
  damBreed?: string;
  grandSirePaternal?: string;
  grandDamPaternal?: string;
  grandSireMaternal?: string;
  grandDamMaternal?: string;
  generationLevel: number;
  verified: boolean;
}

// Certificate Center Record Interface
export interface HerdbookCertificateItem {
  id: string;
  certificateNumber: string;
  registrationId: string;
  registrationNumber: string;
  animalType?: string;
  animalName?: string;
  animalId?: string;
  calfId?: string;
  calfName?: string;
  calfBreed?: string;
  calfSex?: string;
  calfImageUrl?: string;
  birthDate?: string;
  sireId?: string;
  sireName?: string;
  sireBreed?: string;
  sireImageUrl?: string;
  sireStatus?: string;
  sireRegNumber?: string;
  damId?: string;
  damName?: string;
  damBreed?: string;
  damImageUrl?: string;
  damStatus?: string;
  damRegNumber?: string;
  breedingProgramId?: string;
  programNumber?: string;
  ownerName?: string;
  farmLocation?: string;
  imageUrl?: string;
  appliedDate?: string;
  appliedBy?: string;
  status?: string;
  issueDate: string;
  layoutType: 'A4 Landscape';
  publicVerificationUrl: string;
  qrCodeData: string;
  createdAt?: string;
  updatedAt?: string;
}

// Public Verification Payload Interface
export interface PublicVerificationData {
  verified: boolean;
  registrationNumber: string;
  animalType: string;
  animalName: string;
  breed: string;
  sex?: string;
  birthDate?: string;
  ownerName?: string;
  farmLocation?: string;
  breederName?: string;
  imageUrl?: string;
  sireInfo?: { name: string; breed: string; bloodline?: string; imageUrl?: string };
  damInfo?: { name: string; breed: string; imageUrl?: string };
  pedigree?: PedigreeTree;
  certificate?: { number: string; issueDate: string };
  publishedAt?: string;
}

// Audit Log Interface
export interface AuditLogItem {
  id?: number;
  action: string;
  module: string;
  resourceId?: string;
  performedBy: string;
  details?: any;
  createdAt?: string;
}
