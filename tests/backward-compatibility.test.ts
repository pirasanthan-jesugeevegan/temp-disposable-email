import {
  generateEmail,
  getRecentEmail,
} from '../src/index';
import {
  createAccount,
  authenticate,
  getMessages,
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
const mockedGetMessagesContent = getMessagesContent as jest.MockedFunction<
  typeof getMessagesContent
>;

describe('Backward Compatibility Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('OLD API - should work without destructuring accountId', async () => {
    // Mock setup
    mockedGetDomains.mockResolvedValue([
      {
        domain: 'mail.tm',
        isActive: true,
        id: '1',
        isPrivate: false,
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
      },
    ]);

    mockedCreateAccount.mockResolvedValue({
      id: 'account1',
      address: 'test@mail.tm',
      quota: 1000,
      used: 100,
      isDisabled: false,
      isDeleted: false,
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z',
    });

    mockedAuthenticate.mockResolvedValue();

    // OLD CODE - Users might only destructure emailAddress
    const { emailAddress } = await generateEmail('test-user');
    
    // Verify it still works
    expect(emailAddress).toBe('test-user@mail.tm');
  });

  it('OLD API - should work without passing accountId to getRecentEmail', async () => {
    mockedGetMessages.mockResolvedValue([
      { id: 'msg1', createdAt: '2024-01-01T00:00:00Z' } as any,
    ]);

    mockedGetMessagesContent.mockResolvedValue({
      id: 'msg1',
      msgid: 'msgid1',
      from: { address: 'sender@example.com', name: 'Sender' },
      to: [{ address: 'recipient@mail.tm', name: '' }],
      cc: [],
      bcc: [],
      subject: 'Test Subject',
      intro: 'Intro text',
      text: 'Email content',
      html: ['<p>Email content</p>'],
      attachments: [],
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z',
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

    // OLD CODE - Users might not pass accountId at all
    const message = await getRecentEmail({
      maxWaitTime: 30000,
      waitInterval: 2000,
      logPolling: false,
    });

    // Verify it still works
    expect(message?.subject).toBe('Test Subject');
  });

  it('OLD API - complete old workflow should still work', async () => {
    // Setup mocks
    mockedGetDomains.mockResolvedValue([
      {
        domain: 'mail.tm',
        isActive: true,
        id: '1',
        isPrivate: false,
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
      },
    ]);

    mockedCreateAccount.mockResolvedValue({
      id: 'account1',
      address: 'old-user@mail.tm',
      quota: 1000,
      used: 100,
      isDisabled: false,
      isDeleted: false,
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z',
    });

    mockedAuthenticate.mockResolvedValue();

    mockedGetMessages.mockResolvedValue([
      { id: 'msg1', createdAt: '2024-01-01T00:00:00Z' } as any,
    ]);

    mockedGetMessagesContent.mockResolvedValue({
      id: 'msg1',
      msgid: 'msgid1',
      from: { address: 'sender@example.com', name: 'Sender' },
      to: [{ address: 'old-user@mail.tm', name: '' }],
      cc: [],
      bcc: [],
      subject: 'Welcome Email',
      intro: 'Welcome',
      text: 'Welcome to our service',
      html: ['<p>Welcome to our service</p>'],
      attachments: [],
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z',
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

    // OLD WORKFLOW - Exactly as users have it now
    const { emailAddress } = await generateEmail('old-user');
    console.log('Email:', emailAddress);

    const message = await getRecentEmail({
      maxWaitTime: 30000,
      logPolling: true,
    });
    
    console.log('Message:', message?.subject);

    // Verify everything works
    expect(emailAddress).toBe('old-user@mail.tm');
    expect(message?.subject).toBe('Welcome Email');
  });
});
