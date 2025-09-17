# Chekup AI - Mobile-First PWA

A high-quality responsive Progressive Web App that looks and feels like a mobile app, built with React, TailwindCSS, and Framer Motion.

## 🚀 Features

### Complete User Journey
- **Splash Screen** - Animated logo with auto-navigation
- **Onboarding** - Two-step signup with form validation
- **Dashboard** - Patient view with balance, files, and research toggle
- **Files Management** - Detailed file management with sharing options
- **Doctor View** - Case research with search functionality
- **Pharma Marketplace** - Dataset marketplace for research
- **Wallet** - Financial management with transaction history
- **Settings** - Comprehensive user preferences

### HCI Excellence
- **Accessibility** - ARIA labels, keyboard navigation, screen reader support
- **Touch Interactions** - Optimized for mobile with proper touch targets
- **Visual Feedback** - Haptic feedback simulation, loading states, animations
- **Error Handling** - Form validation, error states, user feedback
- **Responsive Design** - Fixed 375px viewport for consistent mobile experience

### Technical Features
- **React 18** with modern hooks and functional components
- **TailwindCSS** for responsive, mobile-first styling
- **Framer Motion** for smooth animations and transitions
- **PWA Ready** with manifest.json and proper meta tags
- **Mobile-First** design with app-style navigation

## 🎨 Design System

### Colors
- **Trust Blue** (#2563eb) - Primary brand color
- **Money Green** (#16a34a) - Financial elements
- **Accent Blue** (#3b82f6) - Secondary actions
- **Clean Whites** - Background and cards

### Typography
- **Inter Font** - Clean, modern sans-serif
- **SF Pro Display** - iOS-style fallback

### Animations
- **Fade-in** splash screen with progress bar
- **Slide transitions** between screens
- **Hover and tap** animations on interactive elements
- **Payment confirmations** with spring animations
- **Toggle switches** with smooth state changes

## 📱 Mobile Experience

- **Fixed 375px width** for consistent mobile app feel
- **Touch-friendly** button sizes (minimum 44px)
- **App-style** bottom navigation
- **Full-screen** card layouts
- **Smooth scrolling** and gesture support
- **Safe area** handling for devices with home indicators

## 🛠️ Getting Started

### Prerequisites
- Node.js 16+ 
- npm or yarn

### Installation
```bash
# Install dependencies
npm install

# Start development server
npm start

# Build for production
npm run build
```

### Development
The app runs on `http://localhost:3000` (or next available port) and automatically opens in your browser.

## 🎯 User Flows

### Patient Journey
1. **Splash** → Auto-navigate after 2 seconds
2. **Onboarding** → Email/password signup → Consent screen
3. **Dashboard** → View balance, manage files, toggle research
4. **Files** → Detailed file management and sharing
5. **Wallet** → Track earnings and cash out

### Doctor Journey
1. **Case Research** → Search similar cases
2. **View Cases** → Pay to view patient data
3. **Earnings** → Track research payments

### Pharma Journey
1. **Marketplace** → Browse available datasets
2. **Request Access** → Submit research proposals
3. **Data Access** → Get anonymized patient data

## 🔧 Technical Architecture

### Component Structure
```
src/
├── components/
│   ├── SplashScreen.js
│   ├── OnboardingScreen.js
│   ├── DashboardScreen.js
│   ├── FilesScreen.js
│   ├── DoctorViewScreen.js
│   ├── PharmaViewScreen.js
│   ├── WalletScreen.js
│   ├── SettingsScreen.js
│   ├── BottomNavigation.js
│   ├── LoadingSkeleton.js
│   └── Toast.js
├── App.js
├── index.js
└── index.css
```

### State Management
- **Local State** - Component-level state with useState
- **Global State** - User data passed through props
- **Form State** - Controlled components with validation

### Animation System
- **Framer Motion** - Page transitions and micro-interactions
- **CSS Animations** - Loading states and hover effects
- **Spring Physics** - Natural feeling animations

## 🎨 Design Principles

### Mobile-First
- Designed for mobile, enhanced for desktop
- Touch-optimized interactions
- App-like navigation patterns

### Accessibility
- WCAG 2.1 AA compliance
- Keyboard navigation support
- Screen reader compatibility
- High contrast ratios

### Performance
- Optimized animations (60fps)
- Lazy loading where appropriate
- Minimal bundle size
- Fast initial load

## 🚀 Deployment

### Build for Production
```bash
npm run build
```

### PWA Features
- **Manifest** - App metadata and icons
- **Service Worker** - Offline functionality (ready for implementation)
- **Responsive** - Works on all device sizes
- **Installable** - Can be installed on mobile devices

## 📊 Mock Data

The app includes comprehensive mock data for:
- **User Profiles** - Balance, files, preferences
- **Medical Cases** - Searchable case database
- **Datasets** - Pharma marketplace listings
- **Transactions** - Wallet history and earnings

## 🔮 Future Enhancements

- **Backend Integration** - Real API endpoints
- **Authentication** - User login and registration
- **Real-time Updates** - Live data synchronization
- **Push Notifications** - Earnings and updates
- **Offline Support** - Service worker implementation
- **Analytics** - User behavior tracking

## 📝 License

This project is a demo prototype for Chekup AI - Your Data. Your Power.

---

**Built with ❤️ using React, TailwindCSS, and Framer Motion**
