import { authenticate } from './authService';
import { generateRandomName } from '../utils/generateRandomName';
import { delay } from '../utils/delay';
import { createAccount, getDomains } from '../utils/api';

export interface GeneratedEmail {
  emailAddress: string;
  accountId: string;
}

/**
 * Creates a new email inbox with a unique address.
 *
 * This function generates an temp inbox & email address
 *
 * @param {string} [emailPrefix] - Optional emailPrefix; a random one is generated if not provided.
 * @returns {Promise<GeneratedEmail>} The generated email address & account ID.
 *
 * @throws {Error} If no domains are available or account creation fails.
 *
 * @example
 * const email = await createInbox("customUser");
 * console.log(email); // Outputs: {"emailAddress": "customUser@mail.tm" ,  "accountId": "1234"}
 */

export const generateEmail = async (
  emailPrefix?: string
): Promise<GeneratedEmail> => {
  const domainsResponse = await getDomains();
  const domains = domainsResponse
    .filter((domain: { isActive: boolean }) => domain.isActive)
    .map((domain: { domain: string }) => domain.domain);
  if (domains.length === 0) throw new Error('No available domains.');

  const emailAddress = `${emailPrefix || generateRandomName()}@${domains[0]}`;
  const password = generateRandomName();

  let attempts = 0;
  const maxRetries = 5;

  while (attempts < maxRetries) {
    try {
      const accountResponse = await createAccount({
        address: emailAddress,
        password,
      });

      await authenticate(emailAddress, password);
      return { emailAddress, accountId: accountResponse.id };
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
