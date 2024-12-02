import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';
import { generateEmail } from '../src/services/accountService';
import { BASE_URL } from '../src/utils/constant';
import { authenticate, getToken } from '../src/services/authService';
import { createAccount, deleteAccount, getDomains } from '../src/utils/api';

jest.mock('../src/services/authService', () => ({
  authenticate: jest.fn(),
  getToken: jest.fn(),
}));
jest.mock('../src/utils/api', () => ({
  getDomains: jest.fn(),
  createAccount: jest.fn(),
  deleteAccount: jest.fn(),
}));

const mock = new MockAdapter(axios);

describe('accountService', () => {
  const mockDomains = [{ isActive: true, domain: 'mail.tm' }];
  const email = 'test@mail.tm';
  const password = 'randomPassword';
  const token = 'mockToken';
  const accountId = 'mockAccountId';

  beforeEach(() => {
    mock.reset();
    (authenticate as jest.Mock).mockResolvedValue(undefined);
    (getToken as jest.Mock).mockReturnValue(token);
    (getDomains as jest.Mock).mockResolvedValue(mockDomains);
    (createAccount as jest.Mock).mockResolvedValue({ id: accountId });
  });

  describe('generateEmail', () => {
    console.log(BASE_URL);
    it('should create an email and authenticate', async () => {
      const result = await generateEmail();

      expect(result).toEqual({
        emailAddress: expect.stringMatching(/.+@mail\.tm/),
        accountId,
      });
      expect(getDomains).toHaveBeenCalledTimes(1);
      expect(createAccount).toHaveBeenCalledWith({
        address: expect.stringMatching(/.+@mail\.tm/),
        password: expect.any(String),
      });
      expect(authenticate).toHaveBeenCalledWith(
        expect.any(String),
        expect.any(String)
      );
    });
  });
});
