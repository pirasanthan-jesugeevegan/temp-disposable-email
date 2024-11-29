import axios from 'axios';
import { BASE_URL } from './constant';
import { getToken } from '../services/authService';

export const getAuthHeaders = () => {
  const token = getToken();
  if (!token) {
    throw new Error('Authentication required. Token not found.');
  }
  return {
    accept: 'application/json',
    Authorization: `Bearer ${token}`,
  };
};

export const fetchMessages = async (): Promise<any[]> => {
  try {
    const res = await axios.get(`${BASE_URL}/messages`, {
      headers: getAuthHeaders(),
    });
    return res.data;
  } catch (error) {
    console.error('Error fetching messages:', error);
    throw new Error('Failed to fetch messages. Please try again later.');
  }
};

export const fetchMessageContent = async (messageId: string): Promise<any> => {
  try {
    const res = await axios.get(`${BASE_URL}/messages/${messageId}`, {
      headers: getAuthHeaders(),
    });
    return res.data;
  } catch (error) {
    console.error(`Error fetching message content for ID ${messageId}:`, error);
    throw new Error('Failed to fetch message content. Please try again later.');
  }
};
