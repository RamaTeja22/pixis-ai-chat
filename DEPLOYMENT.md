# Deployment Guide

## Environment Setup

Create a `.env.local` file in the root directory with the following variables:

```env
# LibreChat Configuration
NEXT_PUBLIC_LIBRECHAT_BASE_URL=http://localhost:3080
NEXT_PUBLIC_LIBRECHAT_API_KEY=your_api_key_here

# Development Mode (uses mock API when true or no API key)
NEXT_PUBLIC_USE_MOCK_API=true
```

## Development

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start development server:
   ```bash
   npm run dev
   ```

3. Open http://localhost:3000

## Production Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Set environment variables in Vercel dashboard:
   - `NEXT_PUBLIC_LIBRECHAT_BASE_URL`
   - `NEXT_PUBLIC_LIBRECHAT_API_KEY`
   - `NEXT_PUBLIC_USE_MOCK_API=false`

### Other Platforms

The app can be deployed to any platform that supports Next.js static exports or server-side rendering.

## Build Commands

```bash
# Development
npm run dev

# Production build
npm run build

# Start production server
npm start

# Lint code
npm run lint
```
