import { axiosClient } from './axiosClient';
import { User } from '../types';
import { INITIAL_USERS } from '../data/mockData';

export const isMockMode = import.meta.env.VITE_USE_MOCK === 'true';

export const userApi = {
    getUsers: async (): Promise<User[]> => {
        if (isMockMode) {
            return INITIAL_USERS;
        }
        const response = await axiosClient.get<User[]>('/users');
        return response.data;
    },
};