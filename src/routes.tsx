import React from 'react';
import { RouteObject } from 'react-router';
import { Home } from './components/home/Home';
import { Courses } from './components/courses/Courses';
import { CourseDetail } from './components/courses/CourseDetail';
import { Assignments } from './components/assignments/Assignments';
import { AssignmentDetail } from './components/assignments/AssignmentDetail';
import { AttachmentViewer } from './components/courses/AttachmentViewer';
import { Videos } from './components/videos/Videos';
import { Scholarships } from './components/scholarships/Scholarships';
import { Students } from './components/admin/Students';
import QuizCreation from './components/admin/QuizCreation';

export const routes: RouteObject[] = [
  {
    index: true,
    handle: { crumb: 'Home' },
    element: <Home />
  },
  {
    path: 'courses',
    handle: { crumb: 'Courses' },
    element: <Courses />
  },
  {
    path: 'courses/:courseId',
    handle: {
      crumb: (params: any) => decodeURIComponent(params.courseId)
    },
    element: <CourseDetail />
  },
  {
    path: 'courses/:courseId/attachments/:attachmentId',
    handle: { 
      crumb: () => 'Attachment'
    },
    element: <AttachmentViewer />
  },
  {
    path: 'assignments',
    handle: { crumb: 'Assignments' },
    element: <Assignments />
  },
  {
    path: 'assignments/:assignmentId',
    handle: { crumb: 'Assignment Detail' },
    element: <AssignmentDetail />
  },
  {
    path: 'videos',
    handle: { crumb: 'Videos' },
    element: <Videos />
  },
  {
    path: 'scholarships',
    handle: { crumb: 'Financial Aid' },
    element: <Scholarships />
  },
  {
    path: 'students',
    handle: { crumb: 'Students' },
    element: <Students />
  },
  {
    path: 'quiz/create/:courseId',
    handle: { crumb: 'Create Quiz' },
    element: <QuizCreation courseId={''} />
  }
];