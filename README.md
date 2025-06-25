# Conspecto

> **Notes Reimagined: Capture, Question, Master**

A next-generation AI-powered note-taking application that transforms learning through intelligent questioning, spaced repetition, ai-review sessions and advanced editing capabilities.

> I am a serious web developer, so you can easily find demo on my localhost. I mean, literally: www.mylocalhost.at

## Features

### AI-Powered Learning
- **Intelligent Question Generation** - Automatically create review questions from your notes
- **AI Summary Generation** - Get key takeaways and summaries from your content
- **Personalized Study Sessions** - Adaptive AI review sessions with multiple question types

### Advanced Editor
- **Rich Text Editing** - Mathematical equations, diagrams, and interactive elements
- **Lexical-Powered** - Modern, extensible editor with real-time collaboration
- **Markdown Support** - Seamless import/export with full markdown compatibility

### Spaced Repetition
- **SM-2 Algorithm** - Scientifically-proven spaced repetition scheduling
- **Performance Tracking** - Detailed analytics on learning progress
- **Adaptive Scheduling** - Questions appear when you need to review them most

### Learning Analytics
- **Progress Dashboard** - Comprehensive overview of your learning journey  
- **Performance Insights** - Track retention rates and study patterns*

## Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript
- **Database**: PostgreSQL with optimized queries
- **Editor**: Lexical with custom plugins
- **Authentication**: Custom auth with email confirmation and OAuth (Google, GitHub)
- **Payments**: Stripe integration**
- **AI**: Google Gemini API for content analysis, question generation and evaluation with seamless ai-provider change
- **Styling**: Tailwind CSS with shadcn/ui components
- **State Management**: Zustand + React Context with virtual state on client, optimistic UI that requires just enough server calls and datafetching that user will never notice

## Quick Start

1. **Clone the repository**
   ```bash
   git clone https://github.com/EgorMitin/conspecto.git
   cd conspecto
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   # Add your database URL, API keys, etc.
   ```

4. **Run the development server**
   ```bash
   pnpm dev
   ```

5. **Open [http://localhost:3000](http://localhost:3000)**

## Project Structure

```
conspecto/
├── app/                    # Next.js App Router
│   ├── (auth)/            # Authentication pages
│   ├── (landing)/         # Landing page
│   ├── dashboard/         # Main application
│   └── api/               # API routes
├── components/            # Reusable UI components
│   ├── ui/               # Base UI components
│   ├── dashboard/        # Dashboard-specific components
│   └── landing-page/     # Landing page components
├── lib/                  # Utilities and configuration
│   ├── Editor/           # Lexical editor setup
│   ├── auth/             # Authentication logic
│   └── providers/        # React context providers
├── services/             # External service integrations
│   ├── DatabaseService/  # Database operations
│   ├── AIService/        # AI integrations
│   └── EmailService/     # Email functionality
└── types/                # TypeScript type definitions
```

## Design Patterns

The application architecture leverages several key design patterns to ensure separation of concerns, scalability, and maintainability.

### Service Layer

A core concept is the use of a **Service Layer** to abstract external integrations and complex business logic. This is evident in the `services/` directory:

-   `DatabaseService`: Encapsulates all direct interactions with the PostgreSQL database. It exposes a clean API for data manipulation (`CRUD` operations) and complex queries, decoupling the main application logic from the database implementation. This makes it easier to manage migrations, optimize queries, and potentially switch database providers in the future.
-   `AIService`: Manages all communication with the AI provider (e.g., Google Gemini). It handles API requests for features like question generation, content summarization, and evaluation. This isolates AI-specific logic, allowing for different AI models or providers to be integrated without altering the core application code.
-   `EmailService`: Handles sending transactional emails for features like email verification and notifications.

This pattern promotes the **Single Responsibility Principle**, where each service has a distinct and focused purpose.

### State Management

The application employs a hybrid state management strategy:

-   **Zustand (Client-Side State)**: For managing global UI state, such as user preferences, UI toggles, and session information. Zustand's minimalist API and hook-based approach provide a lightweight and efficient way to handle state that is shared across many components.
-   **React Context (Scoped State)**: Used for providing state within specific component sub-trees, such as the state of the Lexical editor or the current theme.
-   **Virtual State & Optimistic UI**: The application creates a "virtual state" on the client to provide an immediate and responsive user experience. When a user performs an action (e.g., creating a note), the UI is updated instantly ("optimistically") while the actual server request happens in the background. This reduces perceived latency and makes the application feel faster. Server calls are minimized to only what is essential, reducing network overhead.

### Architectural Patterns

-   **Next.js App Router**: The file-based routing and component structure (`app/` directory) follows modern Next.js conventions, enabling features like server components, layouts, and API routes for a clear and organized project structure.
-   **Modular Structure**: The codebase is organized into distinct modules by feature or responsibility (e.g., `components/`, `lib/`, `services/`, `types/`). This modularity makes the codebase easier to navigate, understand, and maintain as it grows.

## Configuration

### Environment Variables

```env
# Database
POSTGRES_URL=your_postgresql_url

# Authentication
NEXTAUTH_SECRET=your_secret
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

# AI Services
GOOGLE_AI_API_KEY=your_gemini_api_key

# Payments
STRIPE_SECRET_KEY=your_stripe_secret
STRIPE_WEBHOOK_SECRET=your_webhook_secret
```

## Key Features Deep Dive

### AI Review Sessions
Create intelligent study sessions with 20+ configured question types including:
- Multiple choice (basic & conceptual)
- Fill-in-the-blank with cloze deletion
- Scenario-based questions
- Compare & contrast exercises

### Advanced Note Organization
- **Folders & Nested Structure** - Organize notes hierarchically*
- **Tags & Search** - Full-text search with PostgreSQL FTS
- **Status Management** - Draft, active, and archived states

## Responsive Design

Fully responsive interface optimized for:***
- Mobile devices
- Tablets 
- Desktop computers

## Roadmap

- [ ] Mobile app (React Native)
- [ ] Offline support with sync
- [ ] Advanced collaboration features
- [ ] Plugin system for custom question types
- [ ] Integration with external learning platforms
- [ ] New study modes

## 🤝 Contributing

Contributions are welcome! Please read our [Contributing Guidelines](CONTRIBUTING.md) first.

---

<div align="center">
  <strong>Built with ❤️ for learners everywhere</strong>
</div>


* - comming soon
** - not yet fully implemented
*** - some editor components may not be fully adjustet for dark theme
