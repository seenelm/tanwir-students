// src/components/Dashboard.ts
import { getUpcomingAssignments } from '../data/assignments';
import { getUpcomingQuizzes } from '../data/quizzes';
import { getRecentSubmissions } from '../data/submissions';
import { Notification } from '../types';

export function renderDashboard(container: HTMLElement): void {
  container.innerHTML = '';
  
  // Notifications
  const notificationsCard = createCard('Notifications');
  const notificationsList = document.createElement('ul');
  notificationsList.className = 'notifications-list';
  
  const notifications: Notification[] = [
    { id: 1, text: 'New assignment added: Tafsir Research Paper', date: '2 hours ago', read: false },
    { id: 2, text: 'Quiz results available: Usul al-Fiqh', date: '1 day ago', read: true },
    { id: 3, text: 'Reminder: Fiqh Case Studies assignment due tomorrow', date: '3 hours ago', read: false }
  ];
  
  notifications.forEach(notification => {
    const li = document.createElement('li');
    li.className = 'notification-item';
    if (!notification.read) li.classList.add('unread');
    
    const text = document.createElement('p');
    text.textContent = notification.text;
    
    const date = document.createElement('small');
    date.textContent = notification.date;
    
    li.appendChild(text);
    li.appendChild(date);
    notificationsList.appendChild(li);
  });
  
  notificationsCard.appendChild(notificationsList);
  container.appendChild(notificationsCard);
  
  // Create grid for dashboard widgets
  const dashboardGrid = document.createElement('div');
  dashboardGrid.className = 'dashboard-grid';
  
  // Upcoming assignments
  const assignmentsCard = createCard('Upcoming Assignments');
  assignmentsCard.classList.add('assignments-card');
  
  const upcomingAssignments = getUpcomingAssignments();
  
  if (upcomingAssignments.length === 0) {
    const emptyState = document.createElement('div');
    emptyState.className = 'empty-state';
    emptyState.innerHTML = '<span class="material-icons">assignment_turned_in</span><p>No upcoming assignments</p>';
    assignmentsCard.appendChild(emptyState);
  } else {
    const assignmentsGrid = document.createElement('div');
    assignmentsGrid.className = 'assignments-grid';
    
    upcomingAssignments.forEach(assignment => {
      const assignmentCard = document.createElement('div');
      assignmentCard.className = 'assignment-card';
      
      // Date display
      const dateBox = document.createElement('div');
      dateBox.className = 'assignment-date-box';
      
      const dateObj = new Date(assignment.dueDate);
      const month = dateObj.toLocaleString('default', { month: 'short' });
      const day = dateObj.getDate();
      
      const monthEl = document.createElement('div');
      monthEl.className = 'assignment-month';
      monthEl.textContent = month;
      
      const dayEl = document.createElement('div');
      dayEl.className = 'assignment-day';
      dayEl.textContent = day.toString();
      
      dateBox.appendChild(monthEl);
      dateBox.appendChild(dayEl);
      
      // Assignment content
      const assignmentContent = document.createElement('div');
      assignmentContent.className = 'assignment-content';
      
      const title = document.createElement('h3');
      title.className = 'assignment-title';
      title.textContent = assignment.title;
      
      const description = document.createElement('div');
      description.className = 'assignment-description';
      description.textContent = assignment.description;
      
      const status = document.createElement('div');
      status.className = `status status-${assignment.status.toLowerCase().replace(' ', '-')}`;
      status.textContent = assignment.status;
      
      assignmentContent.appendChild(title);
      assignmentContent.appendChild(description);
      assignmentContent.appendChild(status);
      
      assignmentCard.appendChild(dateBox);
      assignmentCard.appendChild(assignmentContent);
      assignmentsGrid.appendChild(assignmentCard);
    });
    
    assignmentsCard.appendChild(assignmentsGrid);
  }
  
  dashboardGrid.appendChild(assignmentsCard);
  
  // Upcoming quizzes
  const quizzesCard = createCard('Upcoming Quizzes & Tests');
  quizzesCard.classList.add('quizzes-card');
  
  const upcomingQuizzes = getUpcomingQuizzes();
  
  if (upcomingQuizzes.length === 0) {
    const emptyState = document.createElement('div');
    emptyState.className = 'empty-state';
    emptyState.innerHTML = '<span class="material-icons">event_available</span><p>No upcoming quizzes or tests</p>';
    quizzesCard.appendChild(emptyState);
  } else {
    const quizzesGrid = document.createElement('div');
    quizzesGrid.className = 'quizzes-grid';
    
    upcomingQuizzes.forEach(quiz => {
      const quizCard = document.createElement('div');
      quizCard.className = 'quiz-card';
      
      // Date display
      const dateBox = document.createElement('div');
      dateBox.className = 'quiz-date-box';
      
      // Check if scheduledDate exists, use current date as fallback
      const dateObj = quiz.scheduledDate ? new Date(quiz.scheduledDate) : new Date();
      const month = dateObj.toLocaleString('default', { month: 'short' });
      const day = dateObj.getDate();
      
      const monthEl = document.createElement('div');
      monthEl.className = 'quiz-month';
      monthEl.textContent = month;
      
      const dayEl = document.createElement('div');
      dayEl.className = 'quiz-day';
      dayEl.textContent = day.toString();
      
      dateBox.appendChild(monthEl);
      dateBox.appendChild(dayEl);
      
      // Quiz content
      const quizContent = document.createElement('div');
      quizContent.className = 'quiz-content';
      
      const title = document.createElement('h3');
      title.className = 'quiz-title';
      title.textContent = quiz.title;
      
      const subject = document.createElement('div');
      subject.className = 'quiz-subject';
      subject.innerHTML = `<span class="material-icons">book</span> ${quiz.subject}`;
      
      const duration = document.createElement('div');
      duration.className = 'quiz-duration';
      duration.innerHTML = `<span class="material-icons">schedule</span> ${quiz.duration}`;
      
      quizContent.appendChild(title);
      quizContent.appendChild(subject);
      quizContent.appendChild(duration);
      
      // Topics tags
      if (quiz.topics && quiz.topics.length > 0) {
        const topicsContainer = document.createElement('div');
        topicsContainer.className = 'quiz-topics';
        
        quiz.topics.forEach(topic => {
          const topicTag = document.createElement('span');
          topicTag.className = 'topic-tag';
          topicTag.textContent = topic;
          topicsContainer.appendChild(topicTag);
        });
        
        quizContent.appendChild(topicsContainer);
      }
      
      quizCard.appendChild(dateBox);
      quizCard.appendChild(quizContent);
      quizzesGrid.appendChild(quizCard);
    });
    
    quizzesCard.appendChild(quizzesGrid);
  }
  
  dashboardGrid.appendChild(quizzesCard);
  
  // Recent submissions
  const submissionsCard = createCard('Recent Submissions');
  submissionsCard.classList.add('submissions-card');
  
  const recentSubmissions = getRecentSubmissions();
  
  if (recentSubmissions.length === 0) {
    const emptyState = document.createElement('div');
    emptyState.className = 'empty-state';
    emptyState.innerHTML = '<span class="material-icons">upload_file</span><p>No recent submissions</p>';
    submissionsCard.appendChild(emptyState);
  } else {
    const submissionsGrid = document.createElement('div');
    submissionsGrid.className = 'submissions-grid';
    
    recentSubmissions.forEach(submission => {
      const submissionCard = document.createElement('div');
      submissionCard.className = 'submission-card';
      
      // Submission icon/status
      const statusBox = document.createElement('div');
      statusBox.className = `submission-status-box status-${submission.status.toLowerCase()}`;
      
      const statusIcon = document.createElement('span');
      statusIcon.className = 'material-icons';
      
      if (submission.status === 'Graded') {
        statusIcon.textContent = 'grading';
      } else if (submission.status === 'Submitted') {
        statusIcon.textContent = 'pending';
      } else {
        statusIcon.textContent = 'check_circle';
      }
      
      statusBox.appendChild(statusIcon);
      
      // Submission content
      const submissionContent = document.createElement('div');
      submissionContent.className = 'submission-content';
      
      const title = document.createElement('h3');
      title.className = 'submission-title';
      title.textContent = submission.assignmentTitle;
      
      const date = document.createElement('div');
      date.className = 'submission-date';
      date.innerHTML = `<span class="material-icons">event</span> Submitted: ${submission.submittedDate}`;
      
      const status = document.createElement('div');
      status.className = 'submission-status';
      status.innerHTML = `<span class="material-icons">info</span> ${submission.status}`;
      
      submissionContent.appendChild(title);
      submissionContent.appendChild(date);
      submissionContent.appendChild(status);
      
      if (submission.feedback) {
        const feedback = document.createElement('div');
        feedback.className = 'submission-feedback';
        feedback.innerHTML = `<span class="material-icons">comment</span> ${submission.feedback}`;
        submissionContent.appendChild(feedback);
      }
      
      submissionCard.appendChild(statusBox);
      submissionCard.appendChild(submissionContent);
      submissionsGrid.appendChild(submissionCard);
    });
    
    submissionsCard.appendChild(submissionsGrid);
  }
  
  dashboardGrid.appendChild(submissionsCard);
  
  container.appendChild(dashboardGrid);
}

function createCard(title: string): HTMLElement {
  const card = document.createElement('div');
  card.className = 'card';
  
  const cardTitle = document.createElement('h2');
  cardTitle.className = 'card-title';
  cardTitle.textContent = title;
  
  card.appendChild(cardTitle);
  return card;
}