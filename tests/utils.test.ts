import { delay } from '../src/utils/delay';
import { generateRandomName } from '../src/utils/generateRandomName';
import { getVerificationCode } from '../src/utils/getVerificationCode';

describe('Utils', () => {
  describe('delay', () => {
    it('should resolve after the specified time', async () => {
      const start = Date.now();
      await delay(100);
      const end = Date.now();

      expect(end - start).toBeGreaterThanOrEqual(100);
    });
  });

  describe('generateRandomName', () => {
    it('should generate a random string', () => {
      const name = generateRandomName();
      expect(name).toMatch(/[a-z0-9]+/);
    });
  });

  describe('getVerificationCode', () => {
    it('should extract the verification code from text', async () => {
      const text = 'Your code is 123456.';
      const code = await getVerificationCode(text);

      expect(code).toBe('123456');
    });

    it('should return null if no code is present', async () => {
      const text = 'No code here.';
      const code = await getVerificationCode(text);

      expect(code).toBeNull();
    });
  });
});
