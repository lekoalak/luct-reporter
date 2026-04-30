// LUCT Brand Colors - Limkokwing University of Creative Technology
export const COLORS = {
  // Primary brand colors
  navy: '#002147',
  navyLight: '#003366',
  navyDark: '#001830',

  // Accent - Gold/Amber from LUCT branding
  gold: '#C9A84C',
  goldLight: '#F0C060',
  goldDark: '#A07830',

  // UI Colors
  white: '#FFFFFF',
  offWhite: '#F5F7FA',
  lightGray: '#E8ECF0',
  gray: '#9AA5B4',
  darkGray: '#4A5568',
  black: '#1A202C',

  // Status
  success: '#38A169',
  error: '#E53E3E',
  warning: '#DD6B20',
  info: '#3182CE',

  // Card backgrounds
  cardBg: '#FFFFFF',
  inputBg: '#F7F8FA',
  borderColor: '#DDE1E7',
};

export const FONTS = {
  regular: 'System',
  bold: 'System',
  sizes: {
    xs: 11,
    sm: 13,
    md: 15,
    lg: 17,
    xl: 20,
    xxl: 24,
    xxxl: 30,
  },
};

export const SHADOWS = {
  card: {
    shadowColor: '#002147',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
  button: {
    shadowColor: '#002147',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 6,
  },
};

export const VENUES = {
  lectureRooms: Array.from({ length: 15 }, (_, i) => `Lecture Room ${i + 1}`),
  lectureHalls: Array.from({ length: 15 }, (_, i) => `Lecture Hall ${i + 1}`),
  multimedia: Array.from({ length: 10 }, (_, i) => `MM ${i + 1}`),
};

export const ALL_VENUES = [
  ...VENUES.lectureRooms,
  ...VENUES.lectureHalls,
  ...VENUES.multimedia,
];

export const WEEKS = Array.from({ length: 18 }, (_, i) => `Week ${i + 1}`);

export const USER_ROLES = {
  STUDENT: 'student',
  LECTURER: 'lecturer',
  PRINCIPAL_LECTURER: 'principal_lecturer',
  PROGRAM_LEADER: 'program_leader',
};

export const FACULTIES = [
  'Faculty of Design Innovation',
  'Faculty of Communication, Media and Broadcasting',
  'Faculty of Architecture and the Built Environment',
  'Faculty of Business and Globalization',
  'Faculty of Creativity in Tourism and Hospitality',
  'Faculty of Information and Communication Technology',
];
