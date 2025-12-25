import { useMatches, useLocation } from 'react-router';

interface Breadcrumb {
  label: string;
  to: string;
}

interface RouteHandle {
  crumb?: string | ((params: any) => string);
}

export function useBreadcrumbs(): Breadcrumb[] {
  const matches = useMatches();
  const location = useLocation();

  // Build breadcrumbs by analyzing the path
  const breadcrumbs: Breadcrumb[] = [];
  const pathParts = location.pathname.split('/').filter(Boolean);

  // If we're on a course-related page, add "Courses" breadcrumb
  if (pathParts[0] === 'courses' && pathParts.length > 1) {
    breadcrumbs.push({
      label: 'Courses',
      to: '/courses'
    });
  }

  // If we're on an assignment detail page, add "Assignments" breadcrumb
  if (pathParts[0] === 'assignments' && pathParts.length > 1) {
    breadcrumbs.push({
      label: 'Assignments',
      to: '/assignments'
    });
  }

  // For attachment pages, manually add course breadcrumb
  if (pathParts[0] === 'courses' && pathParts[2] === 'attachments' && pathParts.length === 4) {
    const courseId = pathParts[1];
    breadcrumbs.push({
      label: decodeURIComponent(courseId),
      to: `/courses/${courseId}`
    });
  }

  // Add breadcrumbs from matched routes with handles
  const crumbMatches = matches.filter(
    (m): m is typeof m & { handle: RouteHandle } =>
      !!(m.handle as RouteHandle | undefined)?.crumb
  );

  crumbMatches.forEach((m) => {
    const handle = m.handle as RouteHandle;
    const crumb = handle.crumb!;

    const label =
      typeof crumb === 'function'
        ? crumb(m.params)
        : crumb;

    // Skip adding course name again if we're on attachment page (already added above)
    const isAttachmentPage = pathParts[0] === 'courses' && pathParts[2] === 'attachments';
    const isCourseNameCrumb = m.pathname.startsWith('/courses/') && !m.pathname.includes('/attachments/');
    
    if (isAttachmentPage && isCourseNameCrumb) {
      return; // Skip this one, we already added it
    }

    breadcrumbs.push({
      label,
      to: m.pathname
    });
  });

  return breadcrumbs;
}
