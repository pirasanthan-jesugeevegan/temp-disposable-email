<h1 align="center">Temp Disposable Email 📧</h1>
<p align="center"> A lightweight, efficient npm package for creating and managing temporary disposable email accounts. </p>

<p align="center">
<a href="#feature">✨ Features</a> |
<a href="#install">🚀 Install</a> |
<a href="#usage">📖 Usage </a>|
<a href="#example">🔧 Examples </a>|
<a href="#doc">📚 API Documentation</a>
</p>
<div align="center"> <a href="https://www.npmjs.com/package/temp-disposable-email"> <img src="https://badge.fury.io/js/temp-disposable-email.svg" alt="npm version" /> </a> <img src="https://img.shields.io/npm/d18m/temp-disposable-email" alt="NPM Downloads" /> <a href="https://opensource.org/licenses/MIT"> <img src="https://img.shields.io/badge/License-MIT-yellow.svg" alt="License: MIT" /> </a> <a href="https://github.com/pirasanthan-jesugeevegan/temp-disposable-email"> <img src="https://img.shields.io/github/stars/pirasanthan-jesugeevegan/temp-disposable-email?style=social" alt="GitHub stars" /> </a> </div>

---

<p id="feature"></p>

## ✨ Features

- 📬 **Create Inbox**: Generate a unique, random email address and create an inbox.
- 🔍 **Fetch Latest Messages**: Retrieve the latest messages from the inbox.
- 📄 **Read Message Content**: Get the content (HTML and text) of a specific message.
- 🧹 **Clean Up**: Automatically delete messages and accounts post-test to keep your environment neat.

<p id="install"></p>

## 🚀 Installation

Install the package using npm:

```bash
npm install temp-disposable-email --save-dev
```

Install the package using yarn:

```bash
yarn add temp-disposable-email --dev
```

<p id="usage"></p>

## 📖 Usage

### 1️⃣ Importing the package

To use the package, import the functions in your TypeScript or JavaScript project:

#### Using ES Modules (Recommended)

```typescript
import { generateEmail, getRecentEmail } from 'temp-disposable-email';
```

#### Using CommonJS

```javascript
const { generateEmail, getRecentEmail } = require('temp-disposable-email');
```

### 2️⃣ Create an Inbox

This function creates a new disposable email account using a random prefix or a specified one.

```typescript
const { emailAddress, accountId } = await generateEmail(); // or pass a custom prefix
console.log('Created email address:', emailAddress);
```

#### Parameters

- `prefix` (Optional): The prefix for the new email address. If not provided, a random email will be generated.

#### Returns

- `Promise<object>`: An object containing email details like `emailAddress`, and `accountId`.

### 3️⃣ Fetch Recent Email

This function retrieves the latest message from the created inbox. You can specify polling options (timeout, interval, logging) for periodic checks when no message is immediately available.

```typescript
const message = await getRecentEmail();
console.log('Message received:', message);
```

#### Parameters

- `options` (Optional): Polling options that can include:
  - `maxWaitTime`: Maximum polling time in milliseconds (default: 30,000ms).
  - `waitInterval`: Interval between polling attempts in milliseconds (default: 2,000ms).
  - `logPolling`: Enable or disable logging of polling attempts (default: false).
  - `deleteAfterRead`: Whether to delete the latest message after reading, helpful for parallel run

#### Returns

- `Promise<object | null>`: An object containing email details like `from`, `to`, `subject`, `intro`, `text`, `html`, `createdAt`, `updatedAt` and `attachments`.

<p id="example"></p>

## 🔧 Examples

### **Playwright Example**

For using temp-disposable-email with Playwright, see the example in the [Playwright folder](https://github.com/pirasanthan-jesugeevegan/temp-disposable-email/tree/master/examples/playwright).

### **Cypress Example**

For using temp-disposable-email with Cypress.

#### Import package

import package in your `support/commands.{ts|js}`

```typescript
import 'temp-disposable-email/cypress';
```

test may look like this: see the example in the [Cypress folder](https://github.com/pirasanthan-jesugeevegan/temp-disposable-email/tree/master/examples/cypress).

```typescript
it('[Custom Command] - Sign up - Check email content and subject', () => {
  // Create a dynamic email address
  cy.generateEmail(`cypress_${Math.random().toString().substr(2, 9)}`).then(
    ({ emailAddress }) => {
      // Navigate to the sign-up page
      cy.visit('https://app.postdrop.io/signup');

      // Fill in the sign-up form
      cy.get('#email').type(emailAddress);
      cy.get('#password').type('Pass@123');
      cy.get('#name').type('testMMMM');
      cy.get('#company').type('testMMMMc');
      cy.get('#btn-signup').click();
      // Verify the success message is displayed
      cy.contains('h1', 'Thanks for signing up!').should('be.visible');
      // Fetch the verification email
      cy.getRecentEmail({
        maxWaitTime: 80000,
        waitInterval: 1000,
        deleteAfterRead: true,
        logPolling: true,
      }).then((mailbox) => {
        // Assert email subject and content
        expect(mailbox?.subject).to.contain('Postdrop - Verify Account');
        expect(mailbox?.html[0]).to.contain(
          'please verify your account by clicking the button'
        );
      });
    }
  );
});
```

### **Node Example**

Here's a complete example of creating an inbox, retrieving a message, and deleting the account:

```typescript
import { generateEmail, getRecentEmail } from 'temp-disposable-email';

async function run() {
  try {
    // Create a new inbox
    const { emailAddress } = await generateEmail();
    console.log('Created email:', emailAddress);

    // Get the first available message from the inbox
    const message = await getRecentEmail({
      maxWaitTime: 50000,
      waitInterval: 3000,
      logPolling: true,
    });
    console.log('Received message:', message);
  } catch (error) {
    console.error('Error:', error);
  }
}

run();
```

<p id="doc"></p>

## 📚 API Documentation

### `generateEmail(prefix?: string): Promise<string>`

- **Description**: Creates a disposable inbox with a randomly generated or provided prefix.
- **Parameters**:
  - `prefix` (Optional): A custom prefix for the email address.
- **Returns**: A promise that resolves to the generated email address.

```json
{
  emailAddress: string;
  accountId: string;
}
```

### `getRecentEmail(options?: GetEmailOptions): Promise<any | null>`

- **Description**: Retrieves the latest message from the inbox, polling if necessary.
- **Parameters**:
  - `options` (Optional): Polling configuration for waiting for messages. See GetEmailOptions.
    - `maxWaitTime` (Optional): The maximum time to wait for messages (in milliseconds).
    - `waitInterval` (Optional): The interval between polling attempts (in milliseconds).
    - `logPolling` (Optional): Whether to log each polling attempt for debugging purposes.
    - `deleteAfterRead` (Optional): Whether to delete messages after reading
- **Returns**: A promise that resolves to the message content (or `null` if no messages are found).

```json
{
  from: { address: string };
  to: { address: string }[];
  subject: string;
  intro: string;
  text: string;
  html: string[];
  createdAt: string;
  updatedAt: string;
  attachments: {
    title: string;
    data: Buffer;
  }[];
}
```

## 📄 License

This project is licensed under the MIT License.
