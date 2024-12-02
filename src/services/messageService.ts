import axios from 'axios';
import { getToken } from './authService';
import { BASE_URL } from '../utils/constant';
import { getMessagesContent, getMessages } from '../utils/api';

export interface MessageContent {
  from: { address: string };
  to: { address: string }[];
  subject: string;
  intro: string;
  text: string;
  html: string[];
  createdAt: string;
  updatedAt: string;
}
export interface GetEmailOptions {
  maxWaitTime?: number;
  waitInterval?: number;
  logPolling?: boolean;
  deleteAfterRead?: boolean;
}

/**
 * Retrieves the latest message from the inbox.
 *
 * If messages are available, this function fetches the first one and
 * returns its details. Polling options can be specified to wait for
 * messages if the inbox is empty. Optionally, the message can be
 * deleted after reading.
 *
 * @param {GetEmailOptions} [options] - Optional settings for polling and deletion.
 * @param {number} [options.maxWaitTime=30000] - Maximum time to wait for messages (in milliseconds). Default is 30 seconds.
 * @param {number} [options.waitInterval=2000] - Time interval between polling attempts (in milliseconds). Default is 2 seconds.
 * @param {boolean} [options.logPolling=false] - Whether to log polling attempts. Default is `false`.
 * @param {boolean} [options.deleteAfterRead=false] - Whether to delete the message after reading. Default is `false`.
 * @returns {Promise<MessageContent | null>} The email content (sender, recipient, subject, text, HTML), or `null` if no messages are found.
 *
 * @throws {Error} If no messages are available within the polling timeout or authentication fails.
 *
 * @example
 * const message = await getRecentEmail({ maxWaitTime: 5000, waitInterval: 1000, logPolling: true });
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
  } = options || {};

  const startTime = Date.now();
  const logger = (message: string) => logPolling && console.log(message);

  logger(
    `Polling started with a timeout of ${
      maxWaitTime / 1000
    }sec and interval of ${waitInterval / 1000}sec.`
  );
  while (Date.now() - startTime < maxWaitTime) {
    const messages = await getMessages();
    if (messages.length > 0) {
      logger(`Found ${messages.length} message(s), fetching details...`);
      const sortedMessages = messages.sort(
        (a, b) =>
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      );
      const messageId = sortedMessages[0].id;

      logger(`Found ${messageId}`);

      const { from, to, subject, intro, text, html, createdAt, updatedAt } =
        await getMessagesContent(messageId);

      if (deleteAfterRead) {
        await deleteMessage(messageId);
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
      };
    }
    await new Promise((resolve) => setTimeout(resolve, waitInterval));
    logger(`No messages found, waiting for ${waitInterval / 1000} seconds...`);
  }
  logger(
    `Waiting timeout of ${
      maxWaitTime / 1000
    } seconds reached. No messages found.`
  );

  throw new Error(
    `No messages available within ${maxWaitTime / 1000} seconds timeout`
  );
};

/**
 * Deletes a message by its unique ID from the Mail.tm inbox.
 *
 * This function requires a valid authentication token. If the
 * token is not set, an error is thrown. The message is deleted
 * using the Mail.tm API, and a success or failure message is logged.
 *
 * @param {string} messageId - The unique ID of the message to delete.
 * @returns {Promise<void>} Resolves after the message is deleted.
 *
 * @throws {Error} If authentication is missing or the deletion fails.
 *
 * @example
 * await deleteMessage("12345");
 * console.log("Message deleted successfully.");
 */
export const deleteMessage = async (messageId: string): Promise<void> => {
  const token = getToken();
  if (!token)
    throw new Error('Authentication required. Call generateEmail() first.');

  try {
    await axios.delete(`${BASE_URL}/messages/${messageId}`, {
      headers: {
        accept: '*/*',
        Authorization: `Bearer ${token}`,
      },
    });
  } catch (error) {
    console.error(`Failed to delete message with ID ${messageId}: ${error}`);
  }
};
