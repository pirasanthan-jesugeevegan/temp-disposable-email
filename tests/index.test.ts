import {
  generateEmail,
  getRecentEmail,
  getVerificationCode,
} from '../src/index';
import {
  createAccount,
  authenticate,
  getMessages,
  deleteAccount,
  getDomains,
  getMessagesContent,
} from '../src/api';

jest.mock('../src/api');
const mockedGetDomains = getDomains as jest.MockedFunction<typeof getDomains>;
const mockedCreateAccount = createAccount as jest.MockedFunction<
  typeof createAccount
>;
const mockedAuthenticate = authenticate as jest.MockedFunction<
  typeof authenticate
>;
const mockedGetMessages = getMessages as jest.MockedFunction<
  typeof getMessages
>;
const mockedDeleteAccount = deleteAccount as jest.MockedFunction<
  typeof deleteAccount
>;
const mockedGetMessagesContent = getMessagesContent as jest.MockedFunction<
  typeof getMessagesContent
>;

describe('Email Utils Tests', () => {
  it('should generate a valid email address', async () => {
    mockedGetDomains.mockResolvedValueOnce([
      {
        domain: 'mail.tm',
        isActive: true,
        id: '1',
        isPrivate: false,
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
      },
    ]);
    mockedCreateAccount.mockResolvedValueOnce({
      id: 'account1',
      address: 'test@mail.tm',
      quota: 1000,
      used: 100,
      isDisabled: false,
      isDeleted: false,
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z',
    });
    mockedAuthenticate.mockResolvedValueOnce();
    const email = await generateEmail('test-user');
    expect(email).toEqual({
      emailAddress: 'test-user@mail.tm',
      accountId: 'account1',
    });
  });

  it('should retrieve the most recent email', async () => {
    const messages = [
      { id: 'msg1', createdAt: '2024-01-01T00:00:00Z' },
      { id: 'msg2', createdAt: '2024-01-02T00:00:00Z' },
    ];
    mockedGetMessages.mockResolvedValueOnce(messages as any);

    mockedGetMessagesContent.mockResolvedValueOnce({
      id: 'msg2',
      msgid: 'msgid2',
      from: { address: 'sender@example.com', name: 'Sender Name' },
      to: [{ address: 'recipient@mail.tm', name: '' }],
      cc: [],
      bcc: [],
      subject: 'Test Subject',
      intro: 'Intro text',
      text: 'Email content',
      html: ['<p>Email content</p>'],
      attachments: [],
      createdAt: '2024-01-02T00:00:00Z',
      updatedAt: '2024-01-02T00:00:00Z',
      seen: false,
      isDeleted: false,
      hasAttachments: false,
      size: 1024,
      flagged: false,
      verifications: [],
      retention: false,
      retentionDate: '2024-01-02T00:00:00Z',
      downloadUrl: 'https://example.com/download',
      sourceUrl: 'https://example.com/source',
      accountId: 'account1',
    });

    const recentEmail = await getRecentEmail({ logPolling: true });
    expect(recentEmail).toEqual({
      from: {
        address: 'sender@example.com',
        name: 'Sender Name',
      },
      html: ['<p>Email content</p>'],
      to: [
        {
          address: 'recipient@mail.tm',
          name: '',
        },
      ],
      subject: 'Test Subject',
      intro: 'Intro text',
      text: 'Email content',
      createdAt: '2024-01-02T00:00:00Z',
      updatedAt: '2024-01-02T00:00:00Z',
      attachments: [],
    });
  });

  it('should extract a verification code', async () => {
    const text = 'Your verification code is 123456.';
    const code = await getVerificationCode(text);
    expect(code).toBe('123456');
  });

  it('should throw an error if no verification code found', async () => {
    const text = 'No code here.';
    await expect(getVerificationCode(text)).rejects.toThrow(
      'No verification code found in the provided email content.'
    );
  });

  it('should delete an account after processing emails', async () => {
    mockedDeleteAccount.mockResolvedValueOnce();
    await expect(deleteAccount('account1')).resolves.toBe(undefined);
    expect(mockedDeleteAccount).toHaveBeenCalledWith('account1');
  });
});
