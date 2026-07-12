export const API_ENDPOINTS = {
  LOGIN: '/users/login',
  REGISTER: '/users/register',
  HABITS: '/habits',
  COMPLETE_HABIT: (id: string) => `/habits/${id}/complete`,
  DELETE_HABIT: (id: string) => `/habits/${id}`,
  UPDATE_HABIT: (id: string) => `/habits/${id}`
};