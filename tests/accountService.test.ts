import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';
import { createInbox, deleteAccount } from '../src/services/accountService';
import { BASE_URL } from '../src/utils/constant';
import { authenticate, getToken } from '../src/services/authService';

jest.mock('../src/services/authService', () => ({
  authenticate: jest.fn(),
  getToken: jest.fn(),
}));

const mock = new MockAdapter(axios);

describe('accountService', () => {
  const mockDomains = [{ domain: 'mail.tm' }];
  const email = 'test@mail.tm';
  const password = 'randomPassword';
  const token = 'mockToken';
  const accountId = 'mockAccountId';

  beforeEach(() => {
    mock.reset();
    (authenticate as jest.Mock).mockResolvedValue(undefined);
    (getToken as jest.Mock).mockReturnValue(token);
  });

  describe('createInbox', () => {
    it('should create an inbox and authenticate', async () => {
      mock
        .onGet(`${BASE_URL}/domains`)
        .reply(200, { 'hydra:member': mockDomains });
      mock.onPost(`${BASE_URL}/accounts`).reply(201, { id: accountId });

      const result = await createInbox();

      expect(result).toMatch(/.+@mail\.tm/);
      expect(authenticate).toHaveBeenCalledWith(
        expect.any(String),
        expect.any(String)
      );
    });

    it('should throw an error if no domains are available', async () => {
      mock.onGet(`${BASE_URL}/domains`).reply(200, { 'hydra:member': [] });

      await expect(createInbox()).rejects.toThrow('No available domains.');
    });
  });

  describe('deleteAccount', () => {
    it('should delete the account successfully', async () => {
      mock.onDelete(`${BASE_URL}/accounts/${accountId}`).reply(204);

      await deleteAccount();

      expect(mock.history.delete.length).toBe(1);
    });

    it('should throw an error if no token or accountId is available', async () => {
      (getToken as jest.Mock).mockReturnValue(null);

      await expect(deleteAccount()).rejects.toThrow(
        'Account information missing.'
      );
    });
  });
});
