# PayGuard
[![Pitch Deck](https://img.shields.io/badge/Pitch_Deck-View_Slides-blue?style=for-the-badge)](./slides/PayGuard.pptx)

PayGuard is a cross-platform system designed to protect shop owners from fake payment screenshot scams. By capturing real-time SMS notifications for mobile wallets and banking apps on the owner's device, PayGuard instantly verifies transactions and syncs the confirmation to the cashier's web terminal.

## 🔗 Quick Links
- [**Pitch Deck / Presentation Slides**](./slides/PayGuard.pptx)

## 🚀 Features

- **Real-Time Payment Verification**: Stop fake screenshot scams by verifying actual SMS receipts.
- **Multi-Platform Support**: Automatically parses incoming SMS formats for **EasyPaisa**, **JazzCash**, and **Raast**.
- **Owner App (Android)**: A background-capable React Native Android app that safely listens to notification SMS and uploads verified payments to the cloud.
- **Cashier Web Terminal**: A secure React web dashboard for your cashiers. They just enter a 4-digit code and wait for a pulsing confirmation screen when a payment drops.
- **Robust Parsing Engine**: Handles variations in amounts (decimals, commas) and extracts sender names/numbers automatically.
- **Manual Payment Fallback**: Owners can manually mark payments from the Listening Dashboard if an SMS doesn't arrive.

## 🏗️ System Architecture

1. **Owner App (`/owner-app`)**: 
   - Built with React Native (Expo) targeted for Android.
   - Requires SMS read permissions.
   - Intercepts incoming messages from specific shortcodes (ignoring standard 10-digit text messages).
   - Syncs valid payment records to a shared Firebase Firestore database.

2. **Cashier Terminal (`/cashier-web`)**:
   - Built with React.
   - Listens to Firebase firestore hooks in real-time.
   - Employs a zero-interaction design: Cashiers simply wait for the `PaymentConfirmed` screen to blink green. Includes auto-timeout logic (120 seconds).

## 🛠️ Tech Stack

- **Frontend (Web)**: React.js
- **Mobile**: React Native (Expo)
- **Backend/Database**: Firebase Firestore
- **Authentication**: Firebase Auth
- **SMS Parsing**: `react-native-get-sms-android` with custom Regex patterns

## ⚙️ Setup and Installation

### Prerequisites
- Node.js & npm
- EAS CLI (for building the Android APK)
- A Firebase Project with Firestore and Authentication enabled

### 1. Clone the repository
```bash
git clone https://github.com/muzzammilsajid1/payguard-micathon.git
cd payguard-micathon
```

### 2. Configure Firebase
- Ensure the Firebase config object is set accurately in both the `cashier-web` and `owner-app`.

### 3. Run the Cashier Web App
```bash
cd cashier-web
npm install
npm run dev
```

### 4. Run the Owner Android App
*Note: SMS listening capabilities require a physical Android device.*
```bash
cd owner-app
npm install
npx expo start
```
Use the Expo Go app on your physical Android device to scan the QR code and run the app, or build an APK using `eas build -p android --profile preview`.