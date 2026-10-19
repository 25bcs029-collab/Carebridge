
import { Doctor, OrganInfo } from './types';

export const SPECIALTIES = [
  'Child/Pediatrics',
  'Adult',
  'Skin',
  'Teeth',
  'Bones',
  'ENT',
  'Eye'
];

export const BLOOD_TYPES = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

export const INITIAL_DOCTORS: Doctor[] = [
  {
    id: 'd1',
    name: 'Dr. Sarah Smith',
    specialty: 'Child/Pediatrics',
    hospital: 'City Kids Care Hospital',
    address: '123 Health Ave, Adyar, Chennai',
    availability: [
      'Mon 09:00-12:00', 
      'Tue 09:00-12:00', 
      'Wed 09:00-12:00', 
      'Thu 09:00-12:00', 
      'Sat 10:00-14:00', 
      'Sun 10:00-14:00'
    ], // OFF FRIDAY
    diseases: ['Fever', 'Vaccination', 'Cough', 'Growth Tracking']
  },
  {
    id: 'd2',
    name: 'Dr. John Miller',
    specialty: 'Adult',
    hospital: 'Metro Life Center',
    address: '456 Wellness Blvd, Anna Nagar, Chennai',
    availability: [
      'Mon 14:00-18:00',
      'Wed 14:00-17:00',
      'Thu 14:00-17:00',
      'Fri 09:00-13:00',
      'Sat 11:00-15:00',
      'Sun 11:00-15:00'
    ], // OFF TUESDAY
    diseases: ['Diabetes', 'Hypertension', 'Thyroid', 'General Checkup']
  },
  {
    id: 'd3',
    name: 'Dr. Emily Chen',
    specialty: 'Skin',
    hospital: 'Derma-Glow Clinic',
    address: '789 Glow St, T-Nagar, Chennai',
    availability: [
      'Mon 13:00-16:00',
      'Tue 13:00-16:00',
      'Thu 09:00-12:00',
      'Fri 15:00-19:00',
      'Sat 10:00-13:00',
      'Sun 10:00-13:00'
    ], // OFF WEDNESDAY
    diseases: ['Acne', 'Eczema', 'Rashes', 'Hair Fall', 'Skin Allergy']
  },
  {
    id: 'd4',
    name: 'Dr. Rajesh Kumar',
    specialty: 'Bones',
    hospital: 'Apex Ortho Center',
    address: '22 Joint Road, Velachery, Chennai',
    availability: [
      'Tue 08:00-12:00',
      'Wed 08:00-12:00',
      'Thu 08:00-12:00',
      'Fri 16:00-20:00',
      'Sat 09:00-13:00',
      'Sun 09:00-13:00'
    ], // OFF MONDAY
    diseases: ['Fracture', 'Back Pain', 'Arthritis', 'Joint Pain']
  },
  {
    id: 'd5',
    name: 'Dr. Priya Lakshmi',
    specialty: 'Eye',
    hospital: 'Vision First Eye Clinic',
    address: '55 Sight Lane, Mylapore, Chennai',
    availability: [
      'Mon 10:00-14:00',
      'Tue 10:00-14:00',
      'Wed 10:00-14:00',
      'Fri 10:00-14:00',
      'Sat 10:00-14:00',
      'Sun 12:00-15:00'
    ], // OFF THURSDAY
    diseases: ['Cataract', 'Eye Strain', 'Vision Correction', 'Glaucoma']
  }
];

export const ORGANS: OrganInfo[] = [
  {
    id: 'kidney',
    name: 'Kidney',
    icon: 'fa-lungs', // FontAwesome icon
    description: 'Vital organs that filter blood and remove waste.',
    hospitals: ['Central Nephrology Inst', 'National Hospital']
  },
  {
    id: 'liver',
    name: 'Liver',
    icon: 'fa-wave-square',
    description: 'Processes blood and creates nutrients.',
    hospitals: ['Liver Care Hospital', 'University Med']
  },
  {
    id: 'heart',
    name: 'Heart',
    icon: 'fa-heart',
    description: 'Pumps oxygenated blood through the body.',
    hospitals: ['Cardiology Center of Excellence']
  },
  {
    id: 'eyes',
    name: 'Cornea/Eyes',
    icon: 'fa-eye',
    description: 'Restores vision to those with corneal blindness.',
    hospitals: ['Eye Bank Foundation', 'City Eye Care']
  }
];
