import { PregnancyStatus } from '@/types/breeding.types';

export interface StockMovementRecord {
  id: string;
  sireId: string;
  sireCode: string;
  sireName: string;
  type: 'STOCK_IN' | 'STOCK_OUT' | 'TRANSFER' | 'SALE';
  quantity: number;
  recipientOrSupplier: string;
  pricePerUnit: number;
  currency: 'USD' | 'KHR';
  tankStorageId: string;
  date: string;
  notes: string;
}

export interface SemenBull {
  id: string;
  name: string;
  fromCountry: string;
  code: string;
  tagId?: string;
  registrationNumber?: string;
  dob: string;
  breed: string;
  production: 'Frozen Semen' | 'Live Bull' | 'Fresh Semen' | 'Imported Semen' | 'Embryos';
  color: string;
  weight: string;
  height: string;
  bcs?: number;
  hornStatus?: 'Polled' | 'Horned' | 'Dehorned';
  healthStatus?: string;
  vaccinationStatus?: string;
  lastHealthCheck?: string;
  certification?: string;

  // Ownership
  ownerType?: 'Farm' | 'Cow Owner' | 'Company-Owned';
  ownerName?: string;
  ownerPhone?: string;
  ownerAddress?: string;
  farmCode?: string;
  farmLocation?: string;

  // Genetics & Pedigree
  bloodline?: string;
  geneticLine?: string;
  geneticGrade?: string;
  registrationAssociation?: string;
  dnaNumber?: string;
  pedigreeNotes?: string;
  damBreed: string;
  damName: string;
  sireBreed: string;
  sireName: string;
  sourcingCompanies: string[];

  // Inventory
  semenCode?: string;
  batchNumber?: string;
  collectionDate?: string;
  expiryDate?: string;
  unit?: 'Straws' | 'Doses' | 'Vials';

  // Pricing
  purchasePrice?: number;
  purchaseCurrency?: 'USD' | 'KHR';
  pricePerStraw?: number;
  currency?: 'USD' | 'KHR';
  supplier?: string;

  note: string;
  imageUrl?: string;
  stockQuantity?: number;
  tankStorageId?: string;
}

export interface DamRecord {
  id: string;
  cowOwner: string;
  tagId: string;
  name: string;
  breed: string;
  generation: string;
  dob: string;
  parity: number;
  weight: string;
  height: string;
  color: string;
  damBreed: string;
  damName: string;
  sireBreed: string;
  sireName: string;
  note: string;
  imageUrl?: string;
  sex: 'Female';
}

export interface FullCalfRecord {
  id: string;
  certNo: string;
  calfName: string;
  breedingRecordId: string;
  code: string;
  tagId: string;
  generation: string;
  placeOfBirth: string;
  birthFacility: string;
  birthStatusCed: string;
  dob: string;
  time: string;
  sex: 'Female' | 'Male';
  color: string;
  breed: string;
  birthWeight: string;
  height: string;
  bodyLength: string;
  chestSize: string;
  legSize: string;
  gestationPeriod: string;
  numberOfCalf: string;
  birthTemperature: string;
  navelTreatment: boolean;
  virusTest: boolean;
  timingOfFeeding: string;
  methodOfFeeding: string[];
  imageUrl?: string;

  // Pedigree details
  sireId: string;
  sireName: string;
  sireBreed: string;
  damId: string;
  damName: string;
  damBreed: string;

  // Location
  farmName: string;
  provinceDistrict: string;
  villageCommune: string;
  gpsCoordinates: string;

  // Verification & Audit
  dateOfRegistration: string;
  recordedBy: string;
  systemVersion: string;
  verifiedBy: string;
  verificationDate: string;
  currentStatus: string;
  notes: string;
}

export const CAMBODIA_PROVINCES = [
  'Kandal / Ang Snoul',
  'Phnom Penh',
  'Kampong Speu',
  'Takeo',
  'Siem Reap',
  'Battambang',
  'Kampong Cham',
  'Prey Veng',
  'PurSat',
  'Ratanakiri',
  'Stung Treng',
  'Mondulkiri',
  'Svay Rieng',
  'Kratie',
  'Banteay Meanchey',
  'Oddar Meanchey',
  'Pailin',
  'Tboung Khmum',
  'Kep',
  'Kampot',
  'Koh Kong',
  'Preah Sihanouk'
];

export const BIRTH_FACILITIES = [
  'Maternity Barn A',
  'Nursery Bay 1',
  'Open Pasture',
  'Quarantine Shed',
  'Delivery Ward 2',
  'Special Care Pen'
];

export const BIRTH_STATUS_CED = [
  'Nature / Unassisted (Easy)',
  'Doctor Assisted / Pulling (Moderate)',
  'Surgical / C-Section (Difficult)',
  'Complicated / Malpresentation'
];

export const CALF_GENERATIONS = [
  'F1 (First Cross)',
  'F2 (Second Cross)',
  'F3 (Third Cross)',
  'F4 (Fourth Cross)',
  'F5 (Fifth Cross)',
  'Purebred',
  'N/A'
];

export const FEEDING_TIMING = [
  'Immediate (<1h)',
  '1 - 2 hours',
  '2 - 4 hours',
  '>4 hours'
];

export const FEEDING_METHODS = [
  'Natural Nursing',
  'Bottle Colostrum',
  'Feed Equipment / Tube',
  'Milk Replacer'
];

export const SOURCING_COMPANIES = [
  'World Wide Sires',
  'Texas Genetics',
  'EuroBull Breeding',
  'Select Sires',
  'ABS Global',
  'Semex Alliance',
  'CRV International',
  'Genus PLC',
  'Alta Genetics',
  'Accelerated Genetics',
];

export const DEFAULT_SEMEN_BULLS: SemenBull[] = [
  { id: 'SEM-01', name: 'Black Angus Supreme', fromCountry: 'USA 🇺🇸', code: 'SIRE-ANGUS-01', dob: '2018-03-15', breed: 'Angus', production: 'Frozen Semen', color: 'Black', weight: '980', height: '148', damBreed: 'Angus', damName: 'Supreme Lady', sireBreed: 'Angus', sireName: 'Champion Black', sourcingCompanies: ['World Wide Sires'], note: 'High genetic merit. EPD: CED+8, BW+1.2, WW+55, YW+98.', imageUrl: 'https://images.unsplash.com/photo-1546445317-29f4545f9d52?auto=format&fit=crop&w=800&q=80', stockQuantity: 150, pricePerStraw: 85, currency: 'USD', tankStorageId: 'Tank 01 - Canister A' },
  { id: 'SEM-02', name: 'Red Brahman King', fromCountry: 'Australia 🇦🇺', code: 'SIRE-BRAHMAN-08', dob: '2019-06-20', breed: 'Brahman', production: 'Frozen Semen', color: 'Red', weight: '1050', height: '155', damBreed: 'Brahman', damName: 'Royal Red', sireBreed: 'Brahman', sireName: 'King Brahma', sourcingCompanies: ['Texas Genetics'], note: 'Excellent heat tolerance. Tropical conditions specialist.', imageUrl: 'https://images.unsplash.com/photo-1500595046743-cd271d694d30?auto=format&fit=crop&w=800&q=80', stockQuantity: 200, pricePerStraw: 70, currency: 'USD', tankStorageId: 'Tank 02 - Canister B' },
  { id: 'SEM-03', name: 'Wagyu F1 Elite', fromCountry: 'Japan 🇯🇵', code: 'SIRE-WAGYU-03', dob: '2017-11-10', breed: 'Wagyu', production: 'Embryos', color: 'Black', weight: '890', height: '142', damBreed: 'Wagyu', damName: 'Elite Marbling', sireBreed: 'Wagyu', sireName: 'Tajima Sire', sourcingCompanies: ['ABS Global'], note: 'Premium marbling genetics. Embryo production only.', imageUrl: 'https://images.unsplash.com/photo-1570042707228-a4005086d4e5?auto=format&fit=crop&w=800&q=80', stockQuantity: 45, pricePerStraw: 250, currency: 'USD', tankStorageId: 'Tank 03 - Canister C' },
];

export const BREEDING_CARD_IMAGES = [
  'https://images.unsplash.com/photo-1546445317-29f4545f9d52?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1500595046743-cd271d694d30?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1570042707228-a4005086d4e5?auto=format&fit=crop&w=800&q=80'
];
