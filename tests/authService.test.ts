import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';
import { authenticate, getToken } from '../src/services/authService';
import { BASE_URL } from '../src/utils/constant';

const mock = new MockAdapter(axios);

describe('authService', () => {
  afterEach(() => mock.reset());

  describe('authenticate', () => {
    it('should authenticate and store the token', async () => {
      const email = 'test@mail.tm';
      const password = 'randomPassword';
      const token = 'mockToken';
      mock.onPost(`${BASE_URL}/token`).reply(200, { token });

      await authenticate(email, password);

      expect(getToken()).toBe(token);
    });

    it('should throw an error on failed authentication', async () => {
      mock.onPost(`${BASE_URL}/token`).reply(401);

      await expect(
        authenticate('test@mail.tm', 'wrongPassword')
      ).rejects.toThrow();
    });
  });

  describe('getToken', () => {
    it('should return the stored token', () => {
      expect(getToken()).toBeDefined();
    });
  });
});
