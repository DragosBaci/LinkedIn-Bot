# LinkedIn Bot Commands

This directory contains command implementations for the LinkedIn bot. Each command encapsulates a specific action or workflow.

## Command Pattern

All commands implement the `ICommand` interface:

```typescript
interface ICommand {
  execute(context: BotContext): Promise<void>;
  canExecute(context: BotContext): boolean;
  getName(): string;
}
```

## Creating New Commands

To add a new LinkedIn action:

1. Create a new file in this directory (e.g., `SendMessageCommand.ts`)
2. Implement the `ICommand` interface
3. Inject required services via constructor
4. Implement the action in the `execute()` method

### Example: SendMessageCommand

```typescript
import type { ICommand } from './ICommand';
import type { BotContext } from '../Types/BotContext';
import { NavigationService } from '../Services/NavigationService';
import { LoggerService } from '@/Server/Services/LoggerService';

export class SendMessageCommand implements ICommand {
  constructor(
    private navigationService: NavigationService,
    private logger: LoggerService,
    private recipientId: string,
    private message: string
  ) {}

  getName(): string {
    return 'SendMessageCommand';
  }

  canExecute(context: BotContext): boolean {
    return context.page !== null && context.browser !== null;
  }

  async execute(context: BotContext): Promise<void> {
    if (!context.page) throw new Error('No page available');
    
    // Navigate to messaging
    await this.navigationService.navigateTo(context.page, {
      url: `https://www.linkedin.com/messaging/thread/${this.recipientId}`,
      userMessage: 'Opening message thread'
    });

    // Type and send message
    await context.page.type('.msg-form__contenteditable', this.message);
    await context.page.click('.msg-form__send-button');
    
    this.logger.log({
      level: LogLevel.SUCCESS,
      message: `Message sent to ${this.recipientId}`,
      userMessage: 'Message sent successfully'
    });
  }
}
```

## Available Commands

- **StartCommand**: Initialize browser and navigate to LinkedIn
- (More commands to be added as features are implemented)

## Best Practices

1. **Single Responsibility**: Each command should do one thing well
2. **Inject Dependencies**: Pass services through constructor
3. **Use Context**: Access browser/page through BotContext
4. **Log Actions**: Use LoggerService for all operations
5. **Handle Errors**: Let errors bubble up to be handled by bot orchestrator
6. **Validate State**: Use `canExecute()` to check if command can run

