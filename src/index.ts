import { authenticate, getMessageAttachments } from './api';
import {
  createAccount,
  deleteAccount,
  deleteMessage,
  getDomains,
  getMessages,
  getMessagesContent,
} from './api';

export interface GeneratedEmail {
  emailAddress: string;
  accountId: string;
}
export interface MessageContent {
  from: { address: string };
  to: { address: string }[];
  subject: string;
  intro: string;
  text: string;
  html: string[];
  createdAt: string;
  updatedAt: string;
  attachments: Attachment[];
}
export interface Attachment {
  title: string;
  data: Buffer;
}
export interface GetEmailOptions {
  maxWaitTime?: number;
  waitInterval?: number;
  logPolling?: boolean;
  deleteAfterRead?: boolean;
  accountId?: string; // Optional for backward compatibility
}

const delay = (ms: number): Promise<void> =>
  new Promise((resolve) => setTimeout(resolve, ms));
const generateRandomName = (): string =>
  Math.random().toString(36).substring(2, 15);

// Export delay for testing purposes
export { delay };

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
 * const email = await generateEmail("customUser");
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

  // eslint-disable-next-line no-constant-condition
  while (true) {
    try {
      const accountResponse = await createAccount(
        {
          address: emailAddress,
          password,
        },
        domains[0] // Pass the first active domain for fallback
      );
      await authenticate(emailAddress, password);
      return { emailAddress, accountId: accountResponse.id };
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      if (error.response?.status === 429) {
        await delay(5 * 1000);
      } else {
        throw error;
      }
    }
  }
};

/**
 * Retrieves the latest message from the inbox.
 *
 * @param {GetEmailOptions} [options] - Optional settings for polling and deletion.
 * @param {string} [options.accountId] - Account ID to cleanup after reading. If not provided, account won't be deleted.
 * @param {number} [options.maxWaitTime=30000] - Maximum time to wait for messages (in milliseconds). Default is 30 seconds.
 * @param {number} [options.waitInterval=2000] - Time interval between polling attempts (in milliseconds). Default is 2 seconds.
 * @param {boolean} [options.logPolling=false] - Whether to log polling attempts. Default is `false`.
 * @param {boolean} [options.deleteAfterRead=false] - Whether to delete the message after reading. Default is `false`.
 * @returns {Promise<MessageContent | null>} The email content (sender, recipient, subject, text, HTML), or `null` if no messages are found.
 *
 * @throws {Error} If no messages are available within the polling timeout or authentication fails.
 *
 * @example
 * const { accountId } = await generateEmail();
 * const message = await getRecentEmail({ accountId, maxWaitTime: 5000, waitInterval: 1000, logPolling: true });
 * console.log(message.subject); // Outputs: "Hello!"
 */
export const getRecentEmail = async (
  options?: GetEmailOptions
): Promise<MessageContent | null> => {
  const {
    maxWaitTime = 30000,
    waitInterval = 2000,
    logPolling = false,
    deleteAfterRead = false,
    accountId,
  } = options || {};

  const startTime = Date.now();
  const logger = (message: string) => logPolling && console.log(message);

  logger(
    `Polling started with a timeout of ${
      maxWaitTime / 1000
    }sec and interval of ${waitInterval / 1000}sec.`
  );

  try {
    while (Date.now() - startTime < maxWaitTime) {
      const messages = await getMessages();
      if (messages.length > 0) {
        logger(`Found ${messages.length} message(s), fetching details...`);
        // Sort by newest first (descending order)
        const sortedMessages = messages.sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        const messageId = sortedMessages[0].id;

        logger(`Found ${messageId}`);

        const {
          from,
          to,
          subject,
          intro,
          text,
          html,
          createdAt,
          updatedAt,
          hasAttachments,
          attachments,
        } = await getMessagesContent(messageId);

        const attachmentArray: Array<{ title: string; data: Buffer }> = [];
        if (hasAttachments) {
          for (const { id, filename } of attachments) {
            logger(`Fetching attachment ID: ${id}`);
            const attachmentData = await getMessageAttachments(messageId, id);

            attachmentArray.push({ title: filename, data: attachmentData });
          }
        }
        if (deleteAfterRead) {
          await deleteMessage(messageId);
          logger(`Deleted message ${messageId}`);
        }

        return {
          from: from,
          to: to,
          subject,
          intro,
          text,
          html,
          createdAt,
          updatedAt,
          attachments: attachmentArray,
        };
      }
      await new Promise((resolve) => setTimeout(resolve, waitInterval));
      logger(
        `No messages found, waiting for ${waitInterval / 1000} seconds...`
      );
    }
    logger(
      `Waiting timeout of ${
        maxWaitTime / 1000
      } seconds reached. No messages found.`
    );

    throw new Error(
      `No messages available within ${maxWaitTime / 1000} seconds timeout`
    );
  } finally {
    // Cleanup account if accountId is provided
    if (accountId) {
      await deleteAccount(accountId);
      logger(`Deleted account ${accountId}`);
    }
  }
};

/**
 * Extracts a verification code from the provided email content.
 *
 * This function scans the given text for a sequence of 5 or more
 * consecutive digits and returns the first valid verification code.
 * If no valid sequence is found, the function returns `null`.
 *
 * @param {string} text - The content of the email, typically the body.
 * @returns {Promise<string | null>} The first verification code found, or `null` if no valid code exists.
 *
 * @example
 * const emailContent = "Your code is 123456.";
 * const verificationCode = await getVerificationCode(emailContent);
 * console.log(verificationCode); // Output: "123456"
 */

export const getVerificationCode = async (
  text: string | undefined
): Promise<string> => {
  console.log('Extracting the verification code from the email content...');

  if (!text) {
    throw new Error('No text provided to extract verification code from.');
  }

  const matches = text.match(/\b\d{5,}\b/);
  if (matches) {
    return matches[0];
  }
  throw new Error('No verification code found in the provided email content.');
};
