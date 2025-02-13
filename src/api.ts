import axios, { AxiosRequestConfig } from 'axios';
import { delay } from '.';

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

// Store token and credentials globally
let token: string | null = null;
let email: string;
let password: string;

const apiClient = axios.create({
  baseURL: 'https://api.mail.tm',
  headers: { accept: 'application/json' },
});

// Function to authenticate and get a new token
export const authenticate = async (
  _email: string,
  _password: string
): Promise<void> => {
  email = _email;
  password = _password;
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

// Function to get auth headers
export const getAuthHeaders = () => {
  if (!token) {
    throw new Error('Authentication required. Token not found.');
  }
  return {
    accept: 'application/json',
    Authorization: `Bearer ${token}`,
  };
};

// Axios interceptor to handle 401 errors and refresh token
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401 && token) {
      try {
        await authenticate(email, password); // Get a new token
        error.config.headers = getAuthHeaders(); // Update headers with new token
        return apiClient.request(error.config as AxiosRequestConfig); // Retry request
      } catch (authError) {
        console.error('Failed to refresh token:', authError);
        throw new Error('Authentication failed. Please check credentials.');
      }
    }
    return Promise.reject(error);
  }
);

// Function to fetch domains
export const getDomains = async (): Promise<ListOfDomains[]> => {
  try {
    const { data } = await apiClient.get('/domains', {
      headers: { accept: 'application/json' },
    });
    return data;
  } catch (error: any) {
    console.error('Error fetching domains:', error.response?.data);
    throw new Error('Failed to fetch domains. Please try again later.');
  }
};

// Function to fetch messages
export const getMessages = async (): Promise<EmailObject[]> => {
  while (true) {
    try {
      const { data } = await apiClient.get('/messages?page=1', {
        headers: getAuthHeaders(),
      });
      return data;
    } catch (error: any) {
      if (error.response?.status === 429) {
        await delay(10 * 1000);
      } else {
        console.error('Error fetching messages:', error.response?.data);
        throw new Error('Failed to fetch messages. Please try again later.');
      }
    }
  }
};

// Function to fetch message content
export const getMessagesContent = async (
  messageId: string
): Promise<EmailResource> => {
  try {
    const { data } = await apiClient.get(`/messages/${messageId}`, {
      headers: getAuthHeaders(),
    });
    return data;
  } catch (error: any) {
    console.error(
      `Error fetching message content for ID ${messageId}:`,
      error.response?.data
    );
    throw new Error('Failed to fetch message content. Please try again later.');
  }
};

// Function to fetch message attachments
export const getMessageAttachments = async (
  messageId: string,
  attachmentsId: string
): Promise<any> => {
  try {
    const { data } = await apiClient.get(
      `/messages/${messageId}/attachment/${attachmentsId}`,
      {
        responseType: 'arraybuffer',
        headers: getAuthHeaders(),
      }
    );
    return data;
  } catch (error: any) {
    console.error(
      `Error fetching message attachment for ID ${messageId}:`,
      error.response?.data
    );
    throw new Error(
      'Failed to fetch message attachment. Please try again later.'
    );
  }
};

// Function to delete a message
export const deleteMessage = async (messageId: string): Promise<number> => {
  try {
    const { status } = await apiClient.delete(`/messages/${messageId}`, {
      headers: getAuthHeaders(),
    });
    return status;
  } catch (error: any) {
    console.warn(
      `Error deleting message for ID ${messageId}:`,
      error.response?.data
    );
  }
};

// Function to create an email account
export const createAccount = async (
  payload: { address: string; password: string },
  maxRetries = 5,
  delayMs = 6000
): Promise<EmailAccount> => {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const { data } = await apiClient.post('/accounts', payload, {
        headers: { accept: 'application/json' },
      });

      return data;
    } catch (error: any) {
      if (error.response?.status !== 201) {
        if (attempt < maxRetries) {
          await delay(maxRetries * delayMs);
        } else {
          console.log(
            'Max retries reached. Could not create account.',
            error.response.status
          );
          throw new Error(
            'Failed to create account after multiple attempts.',
            error.response.status
          );
        }
      } else {
        throw error.response.status;
      }
    }
  }
};

// Function to delete an account
export const deleteAccount = async (accountId: string): Promise<void> => {
  try {
    await apiClient.delete(`/accounts/${accountId}`, {
      headers: getAuthHeaders(),
    });
    console.log(`Account ${accountId} deleted successfully.`);
  } catch (error: any) {
    console.warn(`Failed to delete account ${accountId}, ignoring error.`);
  }
};
