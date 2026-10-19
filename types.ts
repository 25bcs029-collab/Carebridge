
export type Role = 'PUBLIC' | 'ADMIN' | 'EMERGENCY';

export interface User {
  id: string;
  name: string;
  mobile: string;
  email?: string;
  role: Role;
  isBloodDonor: boolean;
  bloodType?: string;
  isDonorActive: boolean;
  location?: string;
  isOrganDonor: boolean;
  donatedOrgans: string[]; // List of organ IDs the user has pledged to donate
}

export interface Doctor {
  id: string;
  name: string;
  specialty: string;
  hospital: string;
  address?: string; // Physical location of the hospital
  availability: string[]; // e.g., ["Mon 09:00-12:00", "Wed 14:00-17:00"]
  diseases: string[];
}

export interface Appointment {
  id: string;
  userId: string;
  doctorId: string;
  patientName: string;
  patientMobile: string;
  reason: string;
  timeSlot: string;
  tokenNumber: number | string; // Use string for "PRIORITY" or number for standard
  isEmergency: boolean;
  status: 'PENDING' | 'CONFIRMED' | 'CANCELLED';
}

export interface OrganInfo {
  id: string;
  name: string;
  icon: string;
  description: string;
  hospitals: string[];
}

export interface HealthMetric {
  date: string;
  painLevel: number;
  energyLevel: number;
  appetite: number;
  sleepHours: number;
}
