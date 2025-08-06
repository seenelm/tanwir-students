# Financial Aid Review Feature

## Overview

The Financial Aid Review feature allows administrators to review, approve, or deny scholarship applications submitted by students. This feature is restricted to users with the admin role and provides a streamlined workflow for managing financial aid requests.

## Features

- **Admin-only access**: Only users with the admin role can access the Financial Aid tab
- **Application listing**: View all scholarship applications with status filtering
- **Detailed review**: View comprehensive application details including personal information and statements
- **Status management**: Approve or deny applications with optional review comments
- **Test utility**: Generate sample applications for testing purposes

## Components

### 1. Scholarships Component

The main component that displays a list of all scholarship applications with filtering options:

- **Path**: `/src/components/scholarships/Scholarships.tsx`
- **Features**:
  - Filter applications by status (All, Pending, Approved, Denied)
  - View application details
  - Test utility for generating sample applications

### 2. ScholarshipDetail Component

Displays detailed information about a selected scholarship application:

- **Path**: `/src/components/scholarships/ScholarshipDetail.tsx`
- **Features**:
  - View applicant's personal information
  - View program information
  - Read statements of interest and need
  - Add review comments
  - Approve or deny the application

### 3. ScholarshipTest Component

A utility for generating sample scholarship applications for testing:

- **Path**: `/src/components/scholarships/ScholarshipTest.tsx`
- **Features**:
  - Add sample applications to the Firestore database
  - Preview sample application data

### 4. ScholarshipService

Service class that handles all Firestore operations related to scholarship applications:

- **Path**: `/src/services/scholarshipService.ts`
- **Features**:
  - Fetch all applications
  - Fetch application by ID
  - Update application status
  - Delete applications

## Data Structure

Scholarship applications are stored in the `scholarships` collection in Firestore with the following structure:

```typescript
interface ScholarshipApplication {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  age: number;
  gender: string;
  employment: string;
  course: string;
  form: string;
  interest: string;
  need: string;
  reason: string;
  zakat: string;
  status?: 'pending' | 'approved' | 'denied';
  reviewerUid?: string;
  reviewDate?: string;
  reviewComments?: string;
}
```

## Access Control

The Financial Aid tab is only visible to users with the admin role. This is enforced in two places:

1. **Sidebar.tsx**: The Financial Aid tab is only rendered for admin users
2. **Content.tsx**: The Scholarships component is only rendered for admin users

## Usage

1. Log in as an admin user
2. Click on the "Financial Aid" tab in the sidebar
3. View the list of scholarship applications
4. Filter applications by status if needed
5. Click "View Details" to review a specific application
6. Add review comments if needed
7. Click "Approve" or "Deny" to update the application status

## Testing

For testing purposes, you can use the built-in test utility:

1. Click "Show Test Utility" on the Scholarships page
2. Review the sample applications that will be added
3. Click "Add Sample Applications" to generate test data
4. The sample applications will appear in the applications list

## Security Considerations

- All operations that modify scholarship data should be restricted to admin users in Firestore security rules
- The UI enforces admin-only access, but server-side security rules are essential
- Sensitive applicant information should be handled according to privacy regulations

## Future Enhancements

- Email notifications to applicants when their status changes
- Pagination for large numbers of applications
- Advanced search and filtering options
- Export functionality for application data
- Applicant portal for students to check their application status
