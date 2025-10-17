import type { UserGender } from '@/types/auth';

export const getPartnerName = (gender: UserGender): string => {
  switch (gender) {
    case 'male':
      return '她';
    case 'female':
      return '他';
    default:
      return 'Ta';
  }
};

export const getGenderHonorific = (gender: UserGender): string => {
  switch (gender) {
    case 'male':
      return '先生';
    case 'female':
      return '女士';
    default:
      return '';
  }
};
