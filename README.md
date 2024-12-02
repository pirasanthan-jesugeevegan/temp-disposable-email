<h1 align="center">Temp Disposable Email</h1>
<p align="center">
<a href="#feature">Features</a> |
<a href="#install">Install</a> |
<a href="#usage">Usage </a>|
<a href="#example">Examples </a>|
<a href="#doc">API Document</a>
</p>

<div align="center">
  <span style="display: inline-block; margin-right: 10px;">
    <a href="https://www.npmjs.com/package/gmail-tester">
      <img src="https://badge.fury.io/js/temp-disposable-email.svg" alt="npm version" />
    </a>
  </span>
  <span style="display: inline-block; margin-right: 10px;">
    <img src="https://img.shields.io/npm/d18m/temp-disposable-email" alt="NPM Downloads" />
  </span>
  <span style="display: inline-block; margin-right: 10px;">
    <a href="https://opensource.org/licenses/MIT">
      <img src="https://img.shields.io/badge/License-MIT-yellow.svg" alt="License: MIT" />
    </a>
  </span>
  <span style="display: inline-block;">
    <a href="https://github.com/pirasanthan-jesugeevegan/temp-disposable-email">
      <img src="https://img.shields.io/github/stars/pirasanthan-jesugeevegan/temp-disposable-email?style=social" alt="GitHub stars" />
    </a>
  </span>
</div>

This npm package provides a simple interface for temp email. You can use it to create disposable email accounts, retrieve messages, and delete accounts when done. It includes polling functionality to wait for messages in the inbox and fetch their content.

<p id="feature"></p>

## Features

- **Create Inbox**: Generate a unique, random email address and create an inbox.
- **Fetch Latest Messages**: Retrieve the latest messages from the inbox.
- **Read Message Content**: Get the content (HTML and text) of a specific message.
- **Delete Messages**: Delete a specific message from the inbox.
- **Delete Account**: Remove the temporary account after usage

<p id="install"></p>

## Installation

You can install this package via npm:

```bash
npm install temp-disposable-email
```

<p id="usage"></p>

## Usage

### 1\. Importing the package

To use the package, import the functions in your TypeScript or JavaScript project:

#### Using ES Modules (Recommended)

```typescript
import {
  generateEmail,
  getRecentEmail,
  deleteAccount,
} from 'temp-disposable-email';
```

#### Using CommonJS

```javascript
const {
  generateEmail,
  getRecentEmail,
  deleteAccount,
} = require('temp-disposable-email');
```

### 2\. Create an Inbox

This function creates a new disposable email account using a random username or a specified one.

```typescript
const { emailAddress, accountId } = await generateEmail(); // or pass a custom username
console.log('Created email address:', emailAddress);
```

#### Parameters

- `username` (Optional): The username for the new email address. If not provided, a random username will be generated.

#### Returns

- `Promise<object>`: An object containing email details like `emailAddress`, and `accountId`.

### 3\. Fetch Recent Email

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

- `Promise<object | null>`: An object containing email details like `from`, `to`, `subject`, `intro`, `text`, `html`, `createdAt`, and `updatedAt`.

### 4\. Delete the Created Account

Once you're done with the email inbox, you can delete the account to clean up resources.

```typescript
const res = await deleteAccount('accountId');
console.log(res); // status code
```

#### Parameters

- `accountId`: `accountId` from `generateEmail()`

#### Returns

- `Promise<number>`: status code.

<p id="example"></p>

## Example Workflow

### Playwright Example

For using temp-disposable-email with Playwright, see the example in the [Playwright folder](https://github.com/pirasanthan-jesugeevegan/temp-disposable-email/tree/master/examples/playwright).

### Cypress Example

For using temp-disposable-email with Cypress, see the example in the [Cypress folder](https://github.com/pirasanthan-jesugeevegan/temp-disposable-email/tree/master/examples/cypress).

### Node Example

Here's a complete example of creating an inbox, retrieving a message, and deleting the account:

```typescript
import {
  generateEmail,
  getRecentEmail,
  deleteAccount,
} from 'temp-disposable-email';

async function run() {
  try {
    // Create a new inbox
    const { emailAddress, accountId } = await generateEmail();
    console.log('Created email:', emailAddress);

    // Get the first available message from the inbox
    const message = await getRecentEmail({
      maxWaitTime: 50000,
      waitInterval: 3000,
      logPolling: true,
    });
    console.log('Received message:', message);

    // Delete the inbox
    const res = await deleteAccount(accountId);
    if (res === 204) {
      console.log('Account deleted successfully');
    } else {
      console.log('Account deleted failed');
    }
  } catch (error) {
    console.error('Error:', error);
  }
}

run();
```

<p id="doc"></p>

## API Documentation

### `generateEmail(username?: string): Promise<string>`

- **Description**: Creates a disposable inbox with a randomly generated or provided username.
- **Parameters**:
  - `username` (Optional): A custom username for the email address.
- **Returns**: A promise that resolves to the generated email address.

### `getRecentEmail(options?: GetEmailOptions): Promise<any | null>`

- **Description**: Retrieves the latest message from the inbox, polling if necessary.
- **Parameters**:
  - `options` (Optional): Polling configuration for waiting for messages. See GetEmailOptions.
- **Returns**: A promise that resolves to the message content (or `null` if no messages are found).

### `deleteAccount(): Promise<void>`

- **Description**: Deletes the inbox and its associated account.
- **Parameters**:
  - `accountId` accountId from `generateEmail()`
- **Returns**: A promise that resolves when the account is successfully deleted.

## Get Email Options

You can configure polling behavior by passing an options object to `getRecentEmail`. The available options are:

- `maxWaitTime` (Optional): The maximum time to wait for messages (in milliseconds).
- `waitInterval` (Optional): The interval between polling attempts (in milliseconds).
- `logPolling` (Optional): Whether to log each polling attempt for debugging purposes.
- `deleteAfterRead` (Optional): Whether to delete messages after reading

## License

This project is licensed under the MIT License.
