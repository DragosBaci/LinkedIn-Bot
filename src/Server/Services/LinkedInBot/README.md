# LinkedIn Bot Service

A highly modular and scalable LinkedIn automation bot built with TypeScript and Puppeteer.

## Architecture

The bot follows a clean, modular architecture with clear separation of concerns:

```
LinkedInBot/
├── Core/              # Main bot orchestrator
│   └── LinkedInBot.ts
├── Services/          # Specialized service classes
│   ├── BrowserManager.ts      # Browser lifecycle management
│   ├── NavigationService.ts   # Page navigation
│   └── StateManager.ts        # Bot state management
├── Commands/          # Command pattern implementations
│   ├── ICommand.ts           # Command interface
│   ├── StartCommand.ts       # Start bot command
│   └── README.md             # Command documentation
├── Config/            # Configuration constants
│   ├── BrowserConfig.ts      # Browser settings
│   └── LinkedInConfig.ts     # LinkedIn URLs
├── Enums/             # Enums and constants
│   └── BotMessages.ts        # Message constants
├── Types/             # Type definitions
│   └── BotContext.ts         # Shared context type
├── Utils/             # Utility functions
│   └── ErrorHandler.ts       # Error handling utilities
├── index.ts           # Public exports
└── README.md          # This file
```

## Design Principles

### 1. **Single Responsibility**
Each class has one clear purpose:
- `BrowserManager`: Manages browser lifecycle
- `NavigationService`: Handles page navigation
- `StateManager`: Manages bot state
- `ErrorHandler`: Centralizes error handling

### 2. **Dependency Injection**
Services are injected through constructors, making testing and modification easier.

### 3. **Command Pattern**
Actions are implemented as commands, making it easy to add new LinkedIn features without modifying existing code.

### 4. **Configuration Over Code**
Settings are centralized in `Config/` files, not hardcoded.

### 5. **Type Safety**
Strong typing throughout with TypeScript interfaces and types.

## Usage

### Basic Usage

```typescript
import { LinkedInBot } from '@/Server/Services/LinkedInBot';

const bot = new LinkedInBot();

// Start the bot
await bot.start();

// Get current state
const state = bot.getState();

// Stop the bot
await bot.stop();
```

### Adding New Commands

To add a new LinkedIn action:

1. Create a new command in `Commands/` directory
2. Implement the `ICommand` interface
3. Inject required services
4. Execute the command through the bot

Example:
```typescript
// In Commands/LikePostCommand.ts
export class LikePostCommand implements ICommand {
  constructor(
    private navigationService: NavigationService,
    private logger: LoggerService,
    private postId: string
  ) {}

  async execute(context: BotContext): Promise<void> {
    // Implementation
  }
}

// Usage
const likeCommand = new LikePostCommand(
  navigationService,
  logger,
  'post-123'
);
await likeCommand.execute(context);
```

## Services

### BrowserManager
Manages browser and page lifecycle:
- Launch browser with anti-detection settings
- Create and configure pages
- Close pages and browsers
- Set user agents

### NavigationService
Handles all navigation operations:
- Navigate to URLs
- Wait for selectors
- Get current URL
- Configurable timeouts and wait conditions

### StateManager
Manages bot state:
- Update state
- Get current state
- Check if running/idle
- Log state changes

### ErrorHandler
Centralizes error handling:
- Extract error messages
- Log errors with context
- Handle specific error scenarios

## Configuration

### BrowserConfig
Browser and Puppeteer settings:
- Launch options
- User agents
- Timeouts
- Wait conditions

### LinkedInConfig
LinkedIn-specific URLs:
- Base URL
- Login, feed, profile, messaging, jobs, network URLs

## Extensibility

The architecture is designed for easy extension:

### Adding New Services
1. Create service class in `Services/`
2. Inject LoggerService if needed
3. Export from `index.ts`
4. Use in commands or bot core

### Adding New Commands
1. Create command in `Commands/`
2. Implement `ICommand` interface
3. Inject required services
4. Export from `index.ts`

### Adding Configuration
1. Add to relevant config file in `Config/`
2. Export from `index.ts`
3. Use in services or commands

## Best Practices

1. **Always use absolute imports** (`@/...` not `../`)
2. **Log all significant actions** using LoggerService
3. **Extract magic strings** to BotMessages or config
4. **Inject dependencies** through constructors
5. **Keep commands focused** on single actions
6. **Use type-safe contexts** - pass BotContext between layers
7. **Handle errors gracefully** using ErrorHandler

## Future Enhancements

Potential commands to add:
- `LoginCommand` - Authenticate with LinkedIn
- `SendMessageCommand` - Send messages to connections
- `LikePostCommand` - Like posts in feed
- `ConnectCommand` - Send connection requests
- `SearchCommand` - Search for people/jobs
- `PostContentCommand` - Create new posts
- `CommentCommand` - Comment on posts
- `EndorseCommand` - Endorse skills

The modular architecture makes adding these features straightforward!

