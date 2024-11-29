import axios from 'axios';
import { getToken } from './authService';
import { BASE_URL } from '../utils/constant';
import { fetchMessageContent, fetchMessages } from '../utils/api';

export interface MessageContent {
  from: { address: string };
  to: { address: string }[];
  subject: string;
  intro: string;
  text: string;
  html: string;
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
  const token = getToken();
  const {
    maxWaitTime = 30000,
    waitInterval = 2000,
    logPolling = false,
    deleteAfterRead = false,
  } = options || {};
  if (!token)
    throw new Error('Authentication required. Call createInbox() first.');

  if (!options) {
    const messages = await fetchMessages();
    if (messages.length === 0) throw new Error('No messages available');
    const messageId = messages[0].id;
    const { from, to, subject, intro, text, html } = await fetchMessageContent(
      messageId
    );
    if (deleteAfterRead) {
      await deleteMessage(messageId);
    }
    return {
      from: from.address,
      to: to[0].address,
      subject,
      intro,
      text,
      html,
    };
  }

  const startTime = Date.now();

  if (logPolling) {
    console.log(
      `Polling started with a timeout of ${
        maxWaitTime / 1000
      }sec and interval of ${waitInterval / 1000}sec.`
    );
  }
  while (Date.now() - startTime < maxWaitTime) {
    const messages = await fetchMessages();
    if (messages.length > 0) {
      if (logPolling) {
        console.log(`Found ${messages.length} message(s), fetching details...`);
      }
      const messageId = messages[0].id;
      if (logPolling) {
        console.log(`Message retrieved`);
      }
      const { from, to, subject, intro, text, html } =
        await fetchMessageContent(messageId);

      if (deleteAfterRead) {
        await deleteMessage(messageId);
      }
      return {
        from: from.address,
        to: to[0].address,
        subject,
        intro,
        text,
        html,
      };
    }
    await new Promise((resolve) => setTimeout(resolve, waitInterval));
    if (logPolling) {
      console.log(
        `No messages found, waiting for ${waitInterval / 1000} seconds...`
      );
    }
  }
  if (logPolling) {
    console.log(
      `Waiting timeout of ${
        maxWaitTime / 1000
      } seconds reached. No messages found.`
    );
  }
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
    throw new Error('Authentication required. Call createInbox() first.');

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
