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
  const matches = text.match(/\b\d{5,}\b/);
  if (matches) {
    return matches[0];
  }
  throw new Error('No verification code found in the provided email content.');
};
