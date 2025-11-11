# LinkedInBot Architecture

## Overview

The LinkedInBot service is built with a highly modular, scalable architecture that separates concerns and makes it easy to add new LinkedIn automation features.

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                        LinkedInBot                              │
│                   (Main Orchestrator)                           │
│                                                                 │
│  Coordinates all services and executes commands                │
└────────┬───────────────────────────────────────────────────────┘
         │
         │ Uses
         ├──────────────────────────────────────────────────────┐
         │                                                       │
         v                                                       v
┌─────────────────────┐                            ┌────────────────────────┐
│     Services        │                            │      Commands          │
│                     │                            │                        │
│ • BrowserManager    │◄───────────────────────────│ • ICommand (Interface) │
│ • NavigationService │   Injected into           │ • StartCommand         │
│ • StateManager      │   Commands                │ • (Future commands)    │
│ • ErrorHandler      │                            │                        │
└──────┬──────────────┘                            └────────────────────────┘
       │                                                      │
       │ Uses                                                 │ Executes on
       v                                                      v
┌─────────────────────┐                            ┌────────────────────────┐
│   Configuration     │                            │      BotContext        │
│                     │                            │                        │
│ • BrowserConfig     │                            │ • Browser instance     │
│ • LinkedInConfig    │                            │ • Page instance        │
└─────────────────────┘                            │ • Current state        │
                                                   └────────────────────────┘
       │
       │ Provides
       v
┌─────────────────────┐
│     Messages        │
│                     │
│ • BotMessages       │
│   (Enums as const)  │
└─────────────────────┘
```

## Component Responsibilities

### Core Layer

#### LinkedInBot
- **Purpose**: Main orchestrator that coordinates all bot operations
- **Responsibilities**:
  - Initialize services
  - Execute commands
  - Manage bot lifecycle
  - Handle errors at top level
- **Dependencies**: All services, commands, and utilities

### Service Layer

#### BrowserManager
- **Purpose**: Manage Puppeteer browser lifecycle
- **Responsibilities**:
  - Launch browser with anti-detection settings
  - Create and configure pages
  - Close pages and browsers
  - Apply user agent settings
- **Used by**: Commands that need browser operations

#### NavigationService
- **Purpose**: Handle all page navigation
- **Responsibilities**:
  - Navigate to URLs
  - Wait for page elements
  - Get current URL
  - Handle navigation timeouts
- **Used by**: Commands that navigate pages

#### StateManager
- **Purpose**: Manage bot state
- **Responsibilities**:
  - Update bot status
  - Track state changes
  - Provide state queries
  - Log state transitions
- **Used by**: LinkedInBot core and commands

### Command Layer

#### ICommand (Interface)
- **Purpose**: Define contract for all bot commands
- **Methods**:
  - `execute(context)`: Perform the command action
  - `canExecute(context)`: Check if command can run
  - `getName()`: Get command name for logging
- **Benefits**: Easy to add new commands without modifying existing code

#### StartCommand
- **Purpose**: Initialize bot and navigate to LinkedIn
- **Responsibilities**:
  - Launch browser
  - Create page
  - Navigate to LinkedIn
  - Update state appropriately
- **Example of**: Command pattern implementation

### Configuration Layer

#### BrowserConfig
- **Purpose**: Centralize browser settings
- **Contains**:
  - Launch options
  - User agent strings
  - Timeouts
  - Wait conditions

#### LinkedInConfig
- **Purpose**: Centralize LinkedIn URLs
- **Contains**:
  - Base URL
  - Page URLs (login, feed, profile, etc.)

### Utility Layer

#### ErrorHandler
- **Purpose**: Centralize error handling
- **Responsibilities**:
  - Extract error messages
  - Log errors with context
  - Handle specific error scenarios
- **Used by**: All layers for consistent error handling

### Type Layer

#### BotContext
- **Purpose**: Share state between components
- **Contains**:
  - Browser instance
  - Page instance
  - Current bot state
- **Passed to**: All commands during execution

### Enum Layer

#### BotMessages
- **Purpose**: Centralize all user-facing and log messages
- **Benefits**:
  - Single source of truth
  - Easy to update messages
  - Type-safe message access

## Data Flow

### Starting the Bot

```
User Request
    ↓
LinkedInBot.start()
    ↓
StateManager.updateState(STARTING)
    ↓
StartCommand.execute(context)
    ↓
BrowserManager.launchBrowser()
    ↓
BrowserManager.createPage()
    ↓
NavigationService.navigateTo(LinkedIn)
    ↓
StateManager.updateState(RUNNING)
    ↓
Return to User
```

### Adding a New Command

```
1. Create MyCommand.ts implementing ICommand
    ↓
2. Inject required services (BrowserManager, NavigationService, etc.)
    ↓
3. Implement execute(context) method
    ↓
4. Implement canExecute(context) validation
    ↓
5. Export from index.ts
    ↓
6. Use in LinkedInBot or expose via API
```

## Extension Points

### Adding New Services
1. Create in `Services/` directory
2. Inject LoggerService
3. Export from index.ts
4. Use in commands or core

### Adding New Commands
1. Create in `Commands/` directory
2. Implement `ICommand` interface
3. Inject required services
4. Export from index.ts
5. Document in Commands/README.md

### Adding Configuration
1. Add to relevant config file
2. Use in services or commands
3. Export from index.ts if needed

### Adding Utilities
1. Create in `Utils/` directory
2. Export from index.ts
3. Use across layers

## Benefits of This Architecture

1. **Scalability**: Easy to add new features without modifying existing code
2. **Testability**: Each component can be tested independently
3. **Maintainability**: Clear separation of concerns
4. **Flexibility**: Services can be swapped or mocked
5. **Type Safety**: Strong typing throughout
6. **Reusability**: Services can be used by multiple commands
7. **Clarity**: Each file has a single, clear purpose

## Future Command Ideas

Commands ready to be implemented:

- **LoginCommand**: Authenticate with LinkedIn credentials
- **SendMessageCommand**: Send messages to connections
- **LikePostCommand**: Like posts in feed
- **ConnectCommand**: Send connection requests
- **SearchCommand**: Search for people/companies/jobs
- **PostContentCommand**: Create new posts
- **CommentCommand**: Comment on posts
- **EndorseCommand**: Endorse skills
- **ViewProfileCommand**: View user profiles
- **AcceptInviteCommand**: Accept connection invitations

Each command would follow the same pattern:
- Implement `ICommand`
- Inject required services
- Execute specific LinkedIn action
- Handle errors gracefully
- Log all operations

## Code Quality Standards

- ✅ All imports are absolute (`@/...`)
- ✅ Functions with 3+ params use object parameters
- ✅ All messages are in BotMessages enum
- ✅ All configuration is in Config files
- ✅ All services use dependency injection
- ✅ All errors go through ErrorHandler
- ✅ All actions are logged via LoggerService
- ✅ TypeScript strict mode enabled

