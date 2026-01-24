import { generateEmail, getRecentEmail } from '../src/index';
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

describe('Race Condition Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should handle parallel email generation without race conditions', async () => {
    // Mock domains
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

    // Mock account creation to return unique account IDs
    let accountCounter = 0;
    mockedCreateAccount.mockImplementation(async () => {
      accountCounter++;
      return {
        id: `account${accountCounter}`,
        address: `test${accountCounter}@mail.tm`,
        quota: 1000,
        used: 100,
        isDisabled: false,
        isDeleted: false,
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
      };
    });

    mockedAuthenticate.mockResolvedValue();

    // Generate 5 emails in parallel
    const promises = Array.from({ length: 5 }, (_, i) =>
      generateEmail(`test-user-${i}`)
    );

    const results = await Promise.all(promises);

    // Verify all emails have unique account IDs
    const accountIds = results.map((r) => r.accountId);
    const uniqueAccountIds = new Set(accountIds);

    expect(uniqueAccountIds.size).toBe(5);
    expect(accountIds).toEqual([
      'account1',
      'account2',
      'account3',
      'account4',
      'account5',
    ]);
  });

  it('should handle parallel email retrieval without interference', async () => {
    // Mock different messages for different accounts
    const mockMessages = [
      {
        id: 'msg1',
        createdAt: '2024-01-01T00:00:00Z',
        subject: 'Message 1',
      },
      {
        id: 'msg2',
        createdAt: '2024-01-02T00:00:00Z',
        subject: 'Message 2',
      },
      {
        id: 'msg3',
        createdAt: '2024-01-03T00:00:00Z',
        subject: 'Message 3',
      },
    ];

    let messageIndex = 0;
    mockedGetMessages.mockImplementation(async () => {
      const msg = [mockMessages[messageIndex % mockMessages.length]];
      messageIndex++;
      return msg as any;
    });

    let contentIndex = 0;
    mockedGetMessagesContent.mockImplementation(async () => {
      const idx = contentIndex % mockMessages.length;
      contentIndex++;
      return {
        id: mockMessages[idx].id,
        msgid: `msgid${idx}`,
        from: { address: `sender${idx}@example.com`, name: 'Sender' },
        to: [{ address: 'recipient@mail.tm', name: '' }],
        cc: [],
        bcc: [],
        subject: mockMessages[idx].subject,
        intro: 'Intro text',
        text: `Email content ${idx}`,
        html: [`<p>Email content ${idx}</p>`],
        attachments: [],
        createdAt: mockMessages[idx].createdAt,
        updatedAt: mockMessages[idx].createdAt,
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
        accountId: `account${idx}`,
      };
    });

    mockedDeleteAccount.mockResolvedValue();

    // Retrieve 3 emails in parallel with different account IDs
    const promises = [
      getRecentEmail({ accountId: 'account1', logPolling: false }),
      getRecentEmail({ accountId: 'account2', logPolling: false }),
      getRecentEmail({ accountId: 'account3', logPolling: false }),
    ];

    const results = await Promise.all(promises);

    // Verify all emails were retrieved correctly
    expect(results).toHaveLength(3);
    expect(results[0]?.subject).toBe('Message 1');
    expect(results[1]?.subject).toBe('Message 2');
    expect(results[2]?.subject).toBe('Message 3');

    // Verify each account was deleted independently
    expect(mockedDeleteAccount).toHaveBeenCalledTimes(3);
    expect(mockedDeleteAccount).toHaveBeenCalledWith('account1');
    expect(mockedDeleteAccount).toHaveBeenCalledWith('account2');
    expect(mockedDeleteAccount).toHaveBeenCalledWith('account3');
  });

  it('should handle mixed parallel operations (generation + retrieval)', async () => {
    // Mock domains
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

    let accountCounter = 0;
    mockedCreateAccount.mockImplementation(async () => {
      accountCounter++;
      return {
        id: `account${accountCounter}`,
        address: `test${accountCounter}@mail.tm`,
        quota: 1000,
        used: 100,
        isDisabled: false,
        isDeleted: false,
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
      };
    });

    mockedAuthenticate.mockResolvedValue();

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

    mockedDeleteAccount.mockResolvedValue();

    // Mix email generation and retrieval in parallel
    const promises = [
      generateEmail('user1'),
      getRecentEmail({ accountId: 'old-account-1', logPolling: false }),
      generateEmail('user2'),
      getRecentEmail({ accountId: 'old-account-2', logPolling: false }),
    ];

    const results = await Promise.all(promises);

    // Verify generations
    expect((results[0] as any).accountId).toBe('account1');
    expect((results[2] as any).accountId).toBe('account2');

    // Verify retrievals
    expect((results[1] as any).subject).toBe('Test Subject');
    expect((results[3] as any).subject).toBe('Test Subject');

    // Verify correct accounts were deleted
    expect(mockedDeleteAccount).toHaveBeenCalledWith('old-account-1');
    expect(mockedDeleteAccount).toHaveBeenCalledWith('old-account-2');
  });

  it('should not interfere when one email generation fails', async () => {
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

    let accountCounter = 0;
    mockedCreateAccount.mockImplementation(async (payload) => {
      accountCounter++;
      // Fail the second account creation
      if (accountCounter === 2) {
        throw new Error('Account creation failed');
      }
      return {
        id: `account${accountCounter}`,
        address: payload.address,
        quota: 1000,
        used: 100,
        isDisabled: false,
        isDeleted: false,
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
      };
    });

    mockedAuthenticate.mockResolvedValue();

    // Generate 3 emails in parallel, one will fail
    const promises = [
      generateEmail('user1'),
      generateEmail('user2'), // This will fail
      generateEmail('user3'),
    ];

    const results = await Promise.allSettled(promises);

    // Verify first and third succeeded
    expect(results[0].status).toBe('fulfilled');
    expect(results[2].status).toBe('fulfilled');

    // Verify second failed
    expect(results[1].status).toBe('rejected');

    // Verify successful ones have correct account IDs
    expect((results[0] as any).value.accountId).toBe('account1');
    expect((results[2] as any).value.accountId).toBe('account3');
  });
});
