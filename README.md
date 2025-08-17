# JKTech Frontend

A modern, responsive Next.js 15 frontend application for the JKTech document processing and Q&A system. Built with React 19, TypeScript, Tailwind CSS, and modern UI components.

## Features

- **Framework**: Next.js 15.4.5 with React 19.1.0
- **Language**: TypeScript with strict type checking
- **Styling**: Tailwind CSS 4.x with custom design system
- **UI Components**: Radix UI primitives with custom styling
- **Icons**: Heroicons and Lucide React
- **Animations**: Framer Motion for smooth interactions
- **Forms**: React Hook Form with Zod validation
- **HTTP Client**: Axios for API communication
- **Notifications**: React Hot Toast and Sonner
- **Code Quality**: ESLint + Prettier with Next.js configuration
- **Performance**: Optimized with Next.js 15 features (Server Components, Server Actions)

## Project Structure

```
src/
├── app/                    # Next.js 15 App Router
│   ├── (auth)/            # Authentication routes group
│   ├── (dashboard)/       # Protected dashboard routes
│   ├── globals.css        # Global styles and Tailwind imports
│   ├── layout.tsx         # Root layout component
│   ├── loading.tsx        # Global loading UI
│   ├── not-found.tsx      # 404 page
│   └── page.tsx           # Home page
├── components/            # Reusable UI components
│   ├── ui/               # Base UI components (buttons, inputs, etc.)
│   ├── forms/            # Form components
│   ├── layout/           # Layout components (header, sidebar, etc.)
│   └── features/         # Feature-specific components
├── config/               # Configuration files
├── hooks/                # Custom React hooks
├── lib/                  # Utility libraries and configurations
├── types/                # TypeScript type definitions
└── utils/                # Utility functions
```

## Getting Started

### Prerequisites

- **Node.js**: 20.x or higher
- **Package Manager**: npm, yarn, pnpm, or bun
- **JKTech Backend**: Running on port 8080 (see backend README)

### Installation

1. **Clone the repository and navigate to the frontend directory:**

   ```bash
   cd jktech-frontend
   ```

2. **Install dependencies:**

   ```bash
   npm install
   # or
   yarn install
   # or
   pnpm install
   # or
   bun install
   ```

3. **Set up environment variables:**

   ```bash
   cp .env.example .env.local
   ```

   Edit `.env.local` with your configuration:

   ```env
   # API Configuration (REQUIRED)
   NEXT_PUBLIC_API_URL=http://localhost:8080

   # Environment
   NODE_ENV=development
   ```

4. **Start the development server:**

   ```bash
   npm run dev
   # or
   yarn dev
   # or
   pnpm dev
   # or
   bun dev
   ```

5. **Open your browser:**
   Navigate to [http://localhost:3000](http://localhost:3000)

## Available Scripts

### Development

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build the application for production
- `npm run start` - Start the production server
- `npm run lint` - Run ESLint for code linting
- `npm run lint:fix` - Fix ESLint issues automatically

### Code Quality

- `npm run type-check` - Run TypeScript type checking
- `npm run format` - Format code with Prettier
- `npm run format:check` - Check code formatting

## UI Components

The application uses a custom design system built on top of Radix UI primitives:

### Base Components

- **Button**: Multiple variants (default, destructive, outline, secondary, ghost, link)
- **Input**: Form inputs with validation states
- **Progress**: Progress bars for file uploads and processing
- **Scroll Area**: Custom scrollable areas
- **Separator**: Visual dividers

### Layout Components

- **Header**: Navigation and user menu
- **Sidebar**: Main navigation sidebar
- **Footer**: Application footer

### Feature Components

- **Document Upload**: Drag-and-drop file upload with progress
- **Chat Interface**: Q&A conversation interface
- **Document Viewer**: PDF and document preview
- **Processing Status**: Real-time processing updates

## Authentication

The frontend integrates with the JKTech backend authentication system:

- **JWT Token Management**: Automatic token handling with HTTP-only cookies
- **Route Protection**: Middleware-based route protection
- **Role-Based Access**: Different UI based on user roles (Admin, Moderator, User)
- **Automatic Redirects**: Seamless login/logout flow

### Protected Routes

- `/dashboard` - Main dashboard (requires authentication)
- `/documents` - Document management (requires authentication)
- `/conversations` - Q&A conversations (requires authentication)
- `/admin` - Admin panel (requires admin role)

### Public Routes

- `/` - Landing page
- `/login` - User login
- `/register` - User registration

## API Integration

The frontend communicates with the JKTech backend through:

- **Axios Client**: Configured HTTP client with interceptors
- **Error Handling**: Global error handling with user-friendly messages
- **Loading States**: Comprehensive loading states for better UX
- **Real-time Updates**: WebSocket integration for live updates (if implemented)

### API Endpoints Used

- Authentication endpoints (`/auth/*`)
- Document management (`/documents/*`)
- Processing status (`/ingestions/*`)
- Q&A system (`/conversations/*`, `/qa/*`)
- User management (`/users/*`)

## Key Features

### Document Management

- **Upload**: Drag-and-drop file upload with progress tracking
- **Preview**: In-browser document preview
- **Processing**: Real-time processing status updates
- **Organization**: Document categorization and tagging

### Q&A System

- **Conversations**: Threaded conversation interface
- **Real-time**: Live chat-like experience
- **Search**: Search through conversation history
- **Bookmarks**: Save important Q&A pairs

### User Experience

- **Responsive Design**: Mobile-first responsive layout
- **Dark Mode**: System preference-based theme switching
- **Accessibility**: WCAG 2.1 compliant components
- **Performance**: Optimized with Next.js 15 features

## Deployment

### Build for Production

```bash
# Build the application
npm run build

# Start production server
npm run start
```

### Environment Variables for Production

```env
# Production API URL
NEXT_PUBLIC_API_URL=https://your-api-domain.com

# Environment
NODE_ENV=production
```

### Deployment Platforms

The application can be deployed to:

- **Vercel** (Recommended for Next.js)
- **Netlify**
- **AWS Amplify**
- **Docker** (see Dockerfile if available)

### Vercel Deployment

1. Connect your repository to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

## Testing

```bash
# Run type checking
npm run type-check

# Run linting
npm run lint

# Check formatting
npm run format:check
```

## Configuration

### Tailwind CSS

The application uses Tailwind CSS 4.x with custom configuration:

- Custom color palette
- Extended spacing and typography
- Component-specific utilities

### TypeScript

Strict TypeScript configuration with:

- Strict mode enabled
- Path mapping for clean imports
- Type checking for all files

### ESLint

Next.js ESLint configuration with:

- React hooks rules
- TypeScript rules
- Accessibility rules
- Import sorting

## Contributing

1. Follow the existing code style and patterns
2. Use TypeScript for all new code
3. Write meaningful commit messages
4. Test your changes thoroughly
5. Update documentation as needed

## License

This project is licensed under the UNLICENSED License.

## Related Projects

- [JKTech Backend](../JKTech-backend/README.md) - Main API server
- [JKTech Processing Service](../jktech-processing-service/README.md) - Document processing microservice
