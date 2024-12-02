import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';
import { getRecentEmail, deleteMessage } from '../src/services/messageService';
import { BASE_URL } from '../src/utils/constant';
import { getToken } from '../src/services/authService';

jest.mock('../src/services/authService', () => ({
  getToken: jest.fn(),
}));

const mock = new MockAdapter(axios);

describe('messageService', () => {
  const token = 'mockToken';
  const messages = [{ id: 'msg1', subject: 'Test Subject', text: 'Test Body' }];

  beforeEach(() => {
    mock.reset();
    (getToken as jest.Mock).mockReturnValue(token);
  });

  describe('getRecentEmail', () => {
    it('should throw an error if no token is present', async () => {
      (getToken as jest.Mock).mockReturnValue(null);

      await expect(getRecentEmail()).rejects.toThrow(
        'Failed to fetch messages. Please try again later.'
      );
    });
  });

  describe('deleteMessage', () => {
    it('should delete the specified message successfully', async () => {
      const messageId = 'msg1';
      mock.onDelete(`${BASE_URL}/messages/${messageId}`).reply(204);

      await deleteMessage(messageId);

      expect(mock.history.delete.length).toBe(1);
    });

    it('should throw an error if token is missing', async () => {
      (getToken as jest.Mock).mockReturnValue(null);

      await expect(deleteMessage('msg1')).rejects.toThrow(
        'Authentication required.'
      );
    });
  });
});
