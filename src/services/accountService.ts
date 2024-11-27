import axios from 'axios';
import { authenticate, getToken } from './authService';
import { generateRandomName } from '../utils/generateRandomName';
import { delay } from '../utils/delay';
import { BASE_URL } from '../utils/constant';

let accountId: string | null = null;
/**
 * Creates a new email inbox with a unique address.
 *
 * This function selects an available domain, generates an email
 * address, and attempts to create an account on the Mail.tm service.
 * If account creation is rate-limited, the function retries with a
 * delay. Upon successful creation, it authenticates the account and
 * stores the token and account ID for future API calls.
 *
 * @param {string} [username] - Optional username; a random one is generated if not provided.
 * @returns {Promise<string>} The generated email address.
 *
 * @throws {Error} If no domains are available or account creation fails.
 *
 * @example
 * const email = await createInbox("customUser");
 * console.log(email); // Outputs: "customUser@mail.tm"
 */

export const createInbox = async (username?: string): Promise<string> => {
  const domainsResponse = await axios.get(`${BASE_URL}/domains`, {
    headers: { accept: 'application/ld+json' },
  });
  const domains = domainsResponse.data['hydra:member'].map(
    (domain: { domain: string }) => domain.domain
  );
  if (domains.length === 0) throw new Error('No available domains.');

  const emailAddress = `${username || generateRandomName()}@${domains[0]}`;
  const password = generateRandomName();

  let attempts = 0;
  const maxRetries = 5;

  while (attempts < maxRetries) {
    try {
      const accountResponse = await axios.post(
        `${BASE_URL}/accounts`,
        { address: emailAddress, password },
        {
          headers: {
            accept: 'application/json',
            'Content-Type': 'application/json',
          },
        }
      );
      accountId = accountResponse.data.id;
      await authenticate(emailAddress, password);
      return emailAddress;
    } catch (error: any) {
      if (error.response?.status === 429) {
        attempts++;
        const retryAfter = error.response.headers['retry-after']
          ? parseInt(error.response.headers['retry-after'])
          : 5;
        await delay(retryAfter * 1000);
      } else {
        throw error;
      }
    }
  }
  throw new Error('Failed to create account after multiple retries.');
};

/**
 * Deletes the account created during `createInbox`.
 *
 * This function removes the email account from the Mail.tm service
 * and clears the stored authentication token and account ID.
 * Subsequent API calls requiring authentication will fail until a
 * new account is created.
 *
 * @returns {Promise<void>} Resolves when the account is successfully deleted.
 *
 * @throws {Error} If no account is authenticated or deletion fails.
 *
 * @example
 * await deleteAccount();
 * console.log("Account deleted successfully.");
 */
export const deleteAccount = async (): Promise<void> => {
  const token = getToken();
  if (!token || !accountId) {
    throw new Error(
      'Account information missing. Create and authenticate an account first.'
    );
  }

  await axios.delete(`${BASE_URL}/accounts/${accountId}`, {
    headers: {
      accept: '*/*',
      Authorization: `Bearer ${token}`,
    },
  });
  accountId = null;
};
