# Temp Disposable Email

<span align="center">

[![npm version](https://badge.fury.io/js/temp-disposable-email.svg)](https://www.npmjs.com/package/gmail-tester)
![NPM Downloads](https://img.shields.io/npm/d18m/temp-disposable-email)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
![GitHub stars](https://img.shields.io/github/stars/pirasanthan-jesugeevegan/temp-disposable-email?style=social)

</span>

This npm package provides a simple interface for temp email. You can use it to create disposable email accounts, retrieve messages, and delete accounts when done. It includes polling functionality to wait for messages in the inbox and fetch their content.

## Features

- **Create Inbox**: Generate a unique, random email address and create an inbox.
- **Fetch Messages**: Retrieve the latest messages from the inbox.
- **Read Message Content**: Get the content (HTML and text) of a specific message.
- **Delete Messages**: Delete a specific message from the inbox.
- **Delete Account**: Remove the temporary account after usage

## Installation

You can install this package via npm:

```bash
npm install temp-disposable-email
```

## Usage

### 1\. Importing the package

To use the package, import the functions in your TypeScript or JavaScript project:

#### Using ES Modules (Recommended)

```typescript
import { createInbox, getMessage, deleteAccount } from 'temp-disposable-email';
```

#### Using CommonJS

```javascript
import { createInbox, getMessage, deleteAccount } from 'temp-disposable-email';
```

### 2\. Create an Inbox

This function creates a new disposable email account using a random username or a specified one. It also authenticates and generates a token for accessing messages.

```typescript
const email = await createInbox(); // or pass a custom username
console.log('Created email address:', email);
```

#### Parameters

- `username` (Optional): The username for the new email address. If not provided, a random username will be generated.

#### Returns

- `Promise<string>`: The generated email address.

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

- `Promise<object | null>`: An object containing email details like `from`, `to`, `subject`, `intro`, `text`, and `html`.

### 4\. Delete the Created Account

Once you're done with the email inbox, you can delete the account to clean up resources.

```typescript
await deleteAccount();
console.log('Account deleted');
```

#### Returns

- `Promise<void>`: Resolves when the account is successfully deleted.

## Example Workflow

Here's a complete example of creating an inbox, retrieving a message, and deleting the account:

```typescript
import { createInbox, getMessage, deleteAccount } from 'temp-disposable-email';

async function run() {
  try {
    // Create a new inbox
    const email = await createInbox();
    console.log('Created email:', email);

    // Get the first available message from the inbox
    const message = await getMessage({
      maxWaitTime: 50000,
      waitInterval: 3000,
      logPolling: true,
    });
    console.log('Received message:', message);

    // Delete the inbox
    await deleteAccount();
    console.log('Account deleted successfully');
  } catch (error) {
    console.error('Error:', error.message);
  }
}

run();
```

## API Documentation

### `createInbox(username?: string): Promise<string>`

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
- **Returns**: A promise that resolves when the account is successfully deleted.

## Get Email Options

You can configure polling behavior by passing an options object to `getMessage`. The available options are:

- `maxWaitTime` (Optional): The maximum time to wait for messages (in milliseconds).
- `waitInterval` (Optional): The interval between polling attempts (in milliseconds).
- `logPolling` (Optional): Whether to log each polling attempt for debugging purposes.
- `deleteAfterRead` (Optional): Whether to delete messages after reading

## License

This project is licensed under the MIT License.
