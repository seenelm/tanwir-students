# Tanwir Learning Platform

<p align="center">
  <img src="/public/logo.webp" alt="Tanwir Learning Platform Logo" width="200">
</p>

<p align="center">
  A modern, secure learning management system built with TypeScript and Firebase
</p>

## ✨ Features

- **Secure Authentication** - Google sign-in with Firebase Authentication
- **Role-Based Access Control** - Admin and student roles with appropriate permissions
- **Course Management** - Create, browse, and manage educational courses
- **Assignment System** - Create, submit, and grade assignments
- **Real-time Updates** - Leveraging Firebase Firestore for instant data synchronization
- **Responsive Design** - Beautiful UI that works on all devices

## 🔒 Security

The application uses Firestore with role-based security rules:

- **authorizedUsers**: Manages user roles (admin/student)
- **courses**: Stores course information
- **courseEnrollments**: Tracks student enrollment in courses
- **assignments**: Stores course assignments
- **studentAssignments**: Tracks individual student submissions

Access control is based on user authentication and admin/student roles, ensuring data privacy and security.

## 🛠️ Technology Stack

- **TypeScript** - Type-safe JavaScript
- **Firebase** - Authentication, Firestore database, and storage
- **Web Components** - Custom elements with Shadow DOM for encapsulation
- **Vite** - Fast, modern frontend build tool

## 🚀 Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- Firebase account

### Installation

1. Clone the repository

```bash
git clone https://github.com/yourusername/tanwir-students.git
cd tanwir-students
```

2. Install dependencies

```bash
npm install
# or
yarn
```

3. Set up Firebase configuration

   - Create a Firebase project at [firebase.google.com](https://firebase.google.com)
   - Enable Authentication with Google provider
   - Create a Firestore database
   - Add your Firebase config to the project

4. Start the development server

```bash
npm run dev
# or
yarn dev
```

5. Open your browser and navigate to `http://localhost:5173`

## 📱 Application Structure

- **Components** - Web components for UI elements
- **Services** - Firebase integration and business logic
- **Styles** - CSS for styling components

## 👥 User Management

The platform includes functionality to search for students by name rather than email, with:

- Case-insensitive search
- Visual feedback for search results
- Easy addition of students to courses

## 🔍 Data Model

The application uses a structured Firestore database with collections and subcollections:

```
/assignments/{assignmentId}
  /attachments/{attachmentId}
  /questions/{questionId}
  /studentAnswers/{answerId}
  /discussions/{discussionId}
```

This structure provides better data organization, efficient querying, and automatic cleanup of related data.

## 🖌️ UI/UX

The interface features:

- Clean, modern design
- Consistent spacing and typography
- Responsive layouts for all screen sizes
- Intuitive navigation

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

---

<p align="center">
  Made with ❤️ for education -  Free Palestine 🇵🇸
</p>
