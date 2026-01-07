# WashLab Customer Dashboard Setup Guide

## 🎨 Overview

This is a modern, responsive customer dashboard for WashLab - a comprehensive laundry management system. The dashboard features:

- ✨ Beautiful, clean, and responsive UI
- 🔐 Clerk authentication integration
- 📡 Real-time data with Convex backend
- 📱 Mobile-first design with sidebar navigation
- 🎯 Dashboard with stats and quick actions
- 📦 Orders management with filtering and tracking
- 🔔 Notifications system
- 👤 Profile management
- ⭐ Loyalty points tracking

## 🚀 Installation

All required packages are already installed:

```bash
npm install
```

## ⚙️ Configuration

### 1. Convex Setup

Update `convex.json` with your Convex project details:

```json
{
  "project": "your-convex-project-name",
  "team": "your-team-name",
  "prodUrl": "https://your-deployment.convex.cloud",
  "functions": "../washlab-backend/convex/"
}
```

### 2. Environment Variables

Create a `.env.local` file in the root with:

```env
# Convex
NEXT_PUBLIC_CONVEX_URL=https://your-deployment.convex.cloud

# Clerk
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...

# Clerk URLs
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/dashboard
```

### 3. Clerk Configuration

1. Go to [Clerk Dashboard](https://dashboard.clerk.com)
2. Create a new application or use existing
3. Copy your API keys to `.env.local`
4. Configure sign-in/sign-up options:
   - Enable Email & Phone authentication
   - Set up social logins (optional)
5. Add redirect URLs:
   - `http://localhost:3000/dashboard` (development)
   - Your production URL (when deploying)

### 4. Convex Backend

Ensure the `washlab-backend` package is properly set up and deployed:

```bash
# In washlab-backend directory
cd ../washlab-backend
npx convex dev  # For development
# or
npx convex deploy  # For production
```

## 🏃 Running the Application

### Development Mode

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000)

### Build for Production

```bash
npm run build
npm start
```

## 📂 Project Structure

```
washlab-customer/
├── app/
│   ├── (protected)/
│   │   └── dashboard/          # Protected dashboard routes
│   │       ├── page.tsx        # Dashboard overview
│   │       ├── orders/
│   │       │   └── page.tsx    # Orders management
│   │       ├── notifications/
│   │       │   └── page.tsx    # Notifications
│   │       └── profile/
│   │           └── page.tsx    # User profile
│   ├── (public)/               # Public routes
│   ├── layout.tsx              # Root layout with providers
│   └── globals.css
├── components/
│   ├── customer/
│   │   └── CustomerLayout.tsx  # Dashboard layout with sidebar
│   ├── ui/                     # Reusable UI components
│   └── ConvexClientProvider.tsx
├── middleware.ts               # Clerk route protection
└── convex.json                 # Convex configuration
```

## 🎯 Features

### Dashboard Page (`/dashboard`)
- Welcome header with user greeting
- Stats cards (Total Orders, In Progress, Completed, Total Spent)
- Loyalty points progress tracker
- Quick action buttons
- Recent orders list

### Orders Page (`/dashboard/orders`)
- Complete order history
- Advanced filtering (status, service type)
- Search by order number
- Order details modal
- Responsive table/card layout

### Notifications Page (`/dashboard/notifications`)
- All notifications with badges
- Filter by type and read status
- Mark as read/unread
- Delete notifications
- Priority indicators
- Notification details modal

### Profile Page (`/dashboard/profile`)
- User information display
- Edit profile functionality
- Account statistics
- Loyalty program details
- Preferred branch selection

## 🎨 Design Features

### Responsive Design
- **Mobile-first approach**: Optimized for small screens
- **Breakpoints**: sm (640px), md (768px), lg (1024px), xl (1280px)
- **Mobile sidebar**: Slide-in navigation with backdrop
- **Flexible grids**: Adaptive layouts for all screen sizes

### UI Components
- **Shadcn/ui**: High-quality, accessible components
- **Tailwind CSS**: Utility-first styling
- **Dark mode**: Automatic theme switching
- **Animations**: Smooth transitions and hover effects

### Color Scheme
- **Primary**: Blue gradient (from-blue-600 to-purple-600)
- **Accent**: Purple tones
- **Status colors**: Semantic colors for different states
- **Dark mode**: Fully supported with proper contrast

## 🔐 Authentication Flow

1. **Public Routes**: Home, Order (guest), Track, Pricing
2. **Protected Routes**: All `/dashboard/*` routes require authentication
3. **Middleware**: Automatically redirects unauthenticated users
4. **Sign In/Up**: Managed by Clerk with customizable flows

## 📊 Data Flow

1. **Convex Backend**: Central data source
2. **Real-time Updates**: Live query updates via Convex
3. **Type Safety**: TypeScript with generated types from backend
4. **Error Handling**: Toast notifications for user feedback

## 🔧 Customization

### Branding
- Update logo in `CustomerLayout.tsx`
- Modify color scheme in `tailwind.config.ts`
- Change app name in metadata

### Features
- Add/remove navigation items in `CustomerLayout.tsx`
- Extend forms in profile page
- Add new dashboard widgets

### Styling
- All components use Tailwind classes
- Easy to customize via config
- Consistent spacing and sizing

## 📱 Mobile Optimization

- Touch-friendly buttons and targets
- Responsive typography
- Optimized images
- Fast loading times
- Smooth scrolling

## 🐛 Troubleshooting

### Common Issues

1. **Clerk not working**: Check API keys in `.env.local`
2. **Convex connection failed**: Verify Convex URL and deployment
3. **Type errors**: Run `npx convex dev` to regenerate types
4. **Styling issues**: Clear `.next` cache and rebuild

### Development Tips

- Use React DevTools for debugging
- Check browser console for errors
- Verify Convex dashboard for data
- Test on multiple devices/browsers

## 🚀 Deployment

### Vercel (Recommended)

1. Connect your repository
2. Add environment variables
3. Deploy automatically on push

### Other Platforms

- Set Node.js version to 18+
- Configure build command: `npm run build`
- Set start command: `npm start`
- Add all environment variables

## 📚 Learn More

- [Next.js Documentation](https://nextjs.org/docs)
- [Clerk Documentation](https://clerk.com/docs)
- [Convex Documentation](https://docs.convex.dev)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [Shadcn/ui](https://ui.shadcn.com)

## 🤝 Support

For issues or questions:
- Check existing documentation
- Review error messages carefully
- Test in different environments
- Contact the development team

---

**Built with ❤️ for WashLab**

