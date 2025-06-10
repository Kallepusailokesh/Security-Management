
# Security Management App - Gate Security System

A mobile-first web application for security personnel at entry gates of communities, universities, and other facilities to manage vehicle entries efficiently.

## Features

- **License Plate Scanner**: OCR-powered automatic license plate recognition
- **Manual Entry**: Fallback option for manual plate number input
- **Vehicle Tracking**: Real-time status of vehicles inside the premises
- **Entry Management**: Complete visitor information form with authority validation
- **History Logs**: Comprehensive vehicle entry/exit history with export functionality
- **Mobile-First Design**: Optimized for mobile devices with responsive web support

## Technology Stack

- **Frontend**: React 18, TypeScript, Vite
- **UI Components**: shadcn/ui, Tailwind CSS
- **OCR**: Tesseract.js for license plate recognition
- **State Management**: React hooks and local storage
- **Mobile Support**: Capacitor for native mobile features

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v18 or higher) - [Download here](https://nodejs.org/)
- **npm** (comes with Node.js)
- **Git** - [Download here](https://git-scm.com/)

For mobile development:
- **Android Studio** (for Android) - [Download here](https://developer.android.com/studio)
- **Xcode** (for iOS, Mac only) - Available on Mac App Store

## Installation & Setup

### 1. Clone the Repository

```bash
git clone <YOUR_REPOSITORY_URL>
cd security-management-app
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Development Server

Start the development server:

```bash
npm run dev
```

The app will be available at `http://localhost:5173`

### 4. Build for Production

```bash
npm run build
```

## Mobile App Setup (Capacitor)

### 1. Install Capacitor Dependencies

```bash
npm install @capacitor/core @capacitor/cli @capacitor/ios @capacitor/android
```

### 2. Initialize Capacitor

```bash
npx cap init
```

When prompted, use these values:
- **App Name**: Security Management App
- **App ID**: app.lovable.6d66be0a22f4462eba2abf8af131a184
- **Directory**: (press Enter for default)

### 3. Build the Web App

```bash
npm run build
```

### 4. Add Mobile Platforms

For Android:
```bash
npx cap add android
```

For iOS (Mac only):
```bash
npx cap add ios
```

### 5. Sync Web Assets

```bash
npx cap sync
```

### 6. Run on Mobile Device/Emulator

For Android:
```bash
npx cap run android
```

For iOS (Mac only):
```bash
npx cap run ios
```

## Mobile Permissions

The app requires the following permissions:

### Android (android/app/src/main/AndroidManifest.xml)
```xml
<uses-permission android:name="android.permission.CAMERA" />
<uses-permission android:name="android.permission.WRITE_EXTERNAL_STORAGE" />
<uses-permission android:name="android.permission.READ_EXTERNAL_STORAGE" />
```

### iOS (ios/App/App/Info.plist)
```xml
<key>NSCameraUsageDescription</key>
<string>This app needs camera access to scan license plates</string>
<key>NSPhotoLibraryUsageDescription</key>
<string>This app needs photo library access to save captured images</string>
```

## Development Commands

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run preview` | Preview production build |
| `npx cap sync` | Sync web assets to mobile |
| `npx cap run android` | Run on Android |
| `npx cap run ios` | Run on iOS |
| `npx cap open android` | Open Android project in Android Studio |
| `npx cap open ios` | Open iOS project in Xcode |

## Project Structure

```
src/
├── components/
│   ├── ui/                 # shadcn/ui components
│   ├── LicensePlateScanner.tsx
│   ├── VisitorForm.tsx
│   ├── VehiclesInside.tsx
│   └── VehicleHistory.tsx
├── pages/
│   └── Index.tsx           # Main application page
├── types/
│   └── SecurityTypes.ts    # TypeScript type definitions
├── utils/
│   └── dataManager.ts      # Data persistence utilities
└── main.tsx                # Application entry point
```

## Mobile Testing

### 1. Using Browser DevTools
1. Open Chrome DevTools (F12)
2. Click the device toggle button (phone icon)
3. Select a mobile device preset
4. Test camera functionality and responsive design

### 2. Using Physical Device
1. Connect your device via USB
2. Enable USB debugging (Android) or trust computer (iOS)
3. Run the appropriate command:
   - Android: `npx cap run android --target=<device-id>`
   - iOS: `npx cap run ios --target=<device-id>`

### 3. Camera Permissions
- The app will automatically request camera permissions
- Users must allow camera access for scanning functionality
- Manual entry is available as fallback

## Troubleshooting

### Common Issues

1. **Camera not working on mobile**
   - Ensure HTTPS is enabled (required for camera access)
   - Check browser permissions in settings
   - Try refreshing the page

2. **Build errors**
   - Clear node_modules: `rm -rf node_modules package-lock.json && npm install`
   - Check Node.js version: `node --version`

3. **Capacitor sync issues**
   - Run `npx cap doctor` to check configuration
   - Ensure web assets are built: `npm run build`

4. **Android build fails**
   - Ensure Android SDK is properly installed
   - Check ANDROID_HOME environment variable
   - Update Android Studio and SDK tools

5. **iOS build fails (Mac only)**
   - Ensure Xcode is installed and updated
   - Check iOS deployment target in Xcode
   - Verify Apple Developer account setup

### Performance Optimization

- **OCR Processing**: Large images may slow down scanning. The app automatically optimizes image quality.
- **Memory Usage**: Close camera stream when not in use
- **Storage**: Regular cleanup of old history entries recommended

## Features Checklist

### ✅ Completed Features
- [x] License plate scanning with OCR
- [x] Manual plate entry
- [x] Visitor information form
- [x] Authority validation system
- [x] Real-time vehicles inside tracking
- [x] Entry/exit history with timestamps
- [x] CSV export functionality
- [x] Mobile-responsive design
- [x] Professional UI with minimal colors
- [x] Tab-based navigation
- [x] Camera permission handling
- [x] Offline data persistence

### 📱 Mobile-Specific Features
- [x] Camera access with mobile optimization
- [x] Touch-friendly interface
- [x] Responsive design for all screen sizes
- [x] File download support
- [x] Gesture navigation support
- [x] Native mobile app capability via Capacitor

## Browser Support

- **Chrome/Chromium** (recommended)
- **Safari** (iOS/macOS)
- **Firefox**
- **Edge**

Note: Camera features require HTTPS in production.

## License

This project is licensed under the MIT License.

## Support

For technical support or feature requests, please create an issue in the repository.
