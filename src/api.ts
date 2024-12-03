import axios from 'axios';

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
let token: string | null = null;
const apiClient = axios.create({
  baseURL: process.env.BASE_URL || 'https://api.mail.tm',
  headers: { accept: 'application/json' },
});
export const authenticate = async (
  email: string,
  password: string
): Promise<void> => {
  const response = await apiClient.post(
    '/token',
    { address: email, password },
    {
      headers: {
        accept: 'application/json',
        'Content-Type': 'application/json',
      },
    }
  );
  token = response.data.token;
};
export const getAuthHeaders = () => {
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
    const { data } = await apiClient.get('/domains', {
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
    const { data } = await apiClient.get('/messages', {
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
    const { data } = await apiClient.get(`/messages/${messageId}`, {
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
    const { data } = await apiClient.get(
      `/messages/${messageId}/attachment/${attachmentsId}`,
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
    const { status } = await apiClient.delete(`/messages/${messageId}`, {
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
  const { data } = await apiClient.post(`/accounts`, payload, {
    headers: { accept: 'application/json' },
  });
  return data;
};

export const deleteAccount = async (accountId: string): Promise<number> => {
  try {
    const { status } = await apiClient.delete(`/accounts/${accountId}`, {
      headers: getAuthHeaders(),
    });
    return status;
  } catch (error) {
    console.error(`Error deleting account for ID ${accountId}:`, error);
    throw new Error('Failed to fetch message content. Please try again later.');
  }
};
