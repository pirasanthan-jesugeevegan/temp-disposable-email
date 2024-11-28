import * as dotenv from 'dotenv';
dotenv.config();

export { createInbox, deleteAccount } from './services/accountService';
export {
  getRecentEmail,
  deleteMessage,
  MessageContent,
  GetEmailOptions,
} from './services/messageService';
export { getVerificationCode } from './utils/getVerificationCode';
