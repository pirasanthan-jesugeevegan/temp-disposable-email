import axios from 'axios';
import { BASE_URL } from './constant';
import { getToken } from '../services/authService';

interface EmailAccount {
  id: string;
  address: string;
  quota: number;
  used: number;
  isDisabled: boolean;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
}
interface ListOfDomains {
  id: string;
  domain: string;
  isActive: boolean;
  isPrivate: boolean;
  createdAt: string;
  updatedAt: string;
}

interface Address {
  address: string;
  name: string;
}
interface EmailObject {
  id: string;
  msgid: string;
  from: Address;
  to: Address[];
  subject: string;
  intro: string;
  seen: boolean;
  isDeleted: boolean;
  hasAttachments: boolean;
  size: number;
  downloadUrl: string;
  sourceUrl: string;
  createdAt: string;
  updatedAt: string;
  accountId: string;
}
interface Attachment {
  id: string;
  filename: string;
  contentType: string;
  disposition: string;
  transferEncoding: string;
  related: boolean;
  size: number;
  downloadUrl: string;
}
interface EmailResource {
  id: string;
  msgid: string;
  from: Address;
  to: Address[];
  cc: Address[];
  bcc: Address[];
  subject: string;
  intro: string;
  seen: boolean;
  flagged: boolean;
  isDeleted: boolean;
  verifications: string[];
  retention: boolean;
  retentionDate: string;
  text: string;
  html: string[];
  hasAttachments: boolean;
  attachments: Attachment[];
  size: number;
  downloadUrl: string;
  sourceUrl: string;
  createdAt: string;
  updatedAt: string;
  accountId: string;
}

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

export const getDomains = async (): Promise<ListOfDomains[]> => {
  try {
    const { data } = await axios.get(`${BASE_URL}/domains`, {
      headers: { accept: 'application/json' },
    });
    return data;
  } catch (error) {
    console.error('Error fetching domains:', error);
    throw new Error('Failed to fetch messages. Please try again later.');
  }
};

export const getMessages = async (): Promise<EmailObject[]> => {
  try {
    const { data } = await axios.get(`${BASE_URL}/messages`, {
      headers: getAuthHeaders(),
    });
    return data;
  } catch (error) {
    console.error('Error fetching messages:', error);
    throw new Error('Failed to fetch messages. Please try again later.');
  }
};

export const getMessagesContent = async (
  messageId: string
): Promise<EmailResource> => {
  try {
    const { data } = await axios.get(`${BASE_URL}/messages/${messageId}`, {
      headers: getAuthHeaders(),
    });
    return data;
  } catch (error) {
    console.error(`Error fetching message content for ID ${messageId}:`, error);
    throw new Error('Failed to fetch message content. Please try again later.');
  }
};

export const getMessageAttachments = async (
  messageId: string,
  attachmentsId: string
): Promise<any> => {
  try {
    const { data } = await axios.get(
      `${BASE_URL}/messages/${messageId}/attachment/${attachmentsId}`,
      {
        headers: getAuthHeaders(),
      }
    );
    return data;
  } catch (error) {
    console.error(
      `Error fetching message attachment for ID ${messageId}:`,
      error
    );
    throw new Error('Failed to fetch message content. Please try again later.');
  }
};

export const deleteMessage = async (messageId: string): Promise<number> => {
  try {
    const { status } = await axios.delete(`${BASE_URL}/messages/${messageId}`, {
      headers: getAuthHeaders(),
    });
    return status;
  } catch (error) {
    console.error(`Error deleting message for ID ${messageId}:`, error);
    throw new Error('Failed to fetch message content. Please try again later.');
  }
};

export const createAccount = async (payload: {
  address: string;
  password: string;
}): Promise<EmailAccount> => {
  const { data } = await axios.post(`${BASE_URL}/accounts`, payload, {
    headers: { accept: 'application/json' },
  });
  return data;
};

/**
 * Deletes the account created during `generateEmail`.
 *
 * @returns {Promise<number>} status code of 204 when the account is successfully deleted.
 *
 * @throws {Error} If no account is authenticated or deletion fails.
 *
 * @example
 * await deleteAccount();
 * console.log("Account deleted successfully.");
 */
export const deleteAccount = async (accountId: string): Promise<number> => {
  try {
    const { status } = await axios.delete(`${BASE_URL}/accounts/${accountId}`, {
      headers: getAuthHeaders(),
    });
    return status;
  } catch (error) {
    console.error(`Error deleting account for ID ${accountId}:`, error);
    throw new Error('Failed to fetch message content. Please try again later.');
  }
};
