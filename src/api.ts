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
  const response = await apiClient.post('/token', { address: email, password });
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
      } catch (_authError) {
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
  } catch (_error) {
    throw new Error('Failed to fetch domains. Please try again later.');
  }
};

// Function to fetch messages with retry logic and timeout
export const getMessages = async (
  maxRetries = 5,
  retryDelay = 10000
): Promise<EmailObject[]> => {
  let attempt = 0;

  while (attempt < maxRetries) {
    try {
      const { data } = await apiClient.get('/messages?page=1', {
        headers: getAuthHeaders(),
      });
      return data;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      attempt++;
      if (error.response?.status === 429 && attempt < maxRetries) {
        console.warn(
          `Rate limited. Retrying in ${retryDelay / 1000}s... (Attempt ${attempt}/${maxRetries})`
        );
        await delay(retryDelay);
      } else if (attempt >= maxRetries) {
        throw new Error(
          `Failed to fetch messages after ${maxRetries} attempts. Please try again later.`
        );
      } else {
        throw new Error('Failed to fetch messages. Please try again later.');
      }
    }
  }

  throw new Error('Failed to fetch messages after maximum retries.');
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
  } catch (_error) {
    throw new Error('Failed to fetch message content. Please try again later.');
  }
};

// Function to fetch message attachments
export const getMessageAttachments = async (
  messageId: string,
  attachmentsId: string
): Promise<Buffer> => {
  try {
    const { data } = await apiClient.get(
      `/messages/${messageId}/attachment/${attachmentsId}`,
      {
        responseType: 'arraybuffer',
        headers: getAuthHeaders(),
      }
    );
    return data;
  } catch (_error) {
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
  } catch (_error) {
    console.warn(`Error deleting message for ID ${messageId}`);
    return 0;
  }
};

// Function to create an email account
export const createAccount = async (
  payload: { address: string; password: string },
  domain?: string, // Domain to use for fallback email generation
  maxRetries = 10,
  delayMs = 6000,
  infiniteRetry = false // Optional: Keep retrying forever
): Promise<EmailAccount> => {
  let attempt = 1;

  while (attempt <= maxRetries || infiniteRetry) {
    try {
      const { data } = await apiClient.post('/accounts', payload, {
        headers: { accept: 'application/json' },
      });
      return data;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      const status = error.response?.status;
      const isNetworkError = error.code === 'ECONNABORTED' || !error.response;

      if (status === 409 || status === 422) {
        // Use provided domain or extract from original address
        const domainToUse = domain || payload.address.split('@')[1];
        payload.address = `${Date.now()}-${Math.floor(
          Math.random() * 100000
        )}@${domainToUse}`;
        console.warn(
          `Address already exists or invalid. Retrying with: ${payload.address}`
        );
      } else if (status === 429) {
        console.warn(
          `Rate limited. Waiting 30 seconds before retry... (Attempt ${attempt}/${maxRetries})`
        );
        await delay(30000);
      } else if (status === 500 || isNetworkError) {
        const waitTime = Math.min(30000, delayMs * attempt);
        console.warn(
          `Server error or network issue. Waiting ${waitTime / 1000}s... (Attempt ${attempt}/${maxRetries})`
        );
        await delay(waitTime);
      } else {
        throw error;
      }

      attempt++;
    }
  }

  throw new Error('🚨 Max retries reached. Account creation failed.');
};

// Function to delete an account
export const deleteAccount = async (accountId: string): Promise<void> => {
  try {
    await apiClient.delete(`/accounts/${accountId}`, {
      headers: getAuthHeaders(),
    });
  } catch (_error) {
    console.warn(`Failed to delete account ${accountId}, ignoring error.`);
  }
};
