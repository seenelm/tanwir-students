// src/components/Dashboard.ts
import { getUpcomingAssignments } from '../data/assignments';
import { getUpcomingQuizzes } from '../data/quizzes';
import { getRecentSubmissions } from '../data/submissions';
import { Notification } from '../types';

export function renderDashboard(container: HTMLElement): void {
  container.innerHTML = '';
  
  // Page title
  const pageTitle = document.createElement('h1');
  pageTitle.className = 'page-title';
  pageTitle.textContent = 'Dashboard';
  container.appendChild(pageTitle);
  
  // Notifications
  const notificationsCard = createCard('Notifications');
  const notificationsList = document.createElement('ul');
  notificationsList.className = 'notifications-list';
  
  const notifications: Notification[] = [
    { id: 1, text: 'New assignment added: Research Paper', date: '2 hours ago', read: false },
    { id: 2, text: 'Quiz results available: Mathematics', date: '1 day ago', read: true },
    { id: 3, text: 'Reminder: Physics assignment due tomorrow', date: '3 hours ago', read: false }
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
  const assignmentsList = document.createElement('ul');
  assignmentsList.className = 'assignments-list';
  
  const upcomingAssignments = getUpcomingAssignments();
  
  upcomingAssignments.forEach(assignment => {
    const li = document.createElement('li');
    li.className = 'assignment-item';
    
    const title = document.createElement('h3');
    title.textContent = assignment.title;
    
    const dueDate = document.createElement('p');
    dueDate.innerHTML = `<strong>Due:</strong> ${assignment.dueDate}`;
    
    const status = document.createElement('span');
    status.className = `status status-${assignment.status.toLowerCase().replace(' ', '-')}`;
    status.textContent = assignment.status;
    
    li.appendChild(title);
    li.appendChild(dueDate);
    li.appendChild(status);
    assignmentsList.appendChild(li);
  });
  
  assignmentsCard.appendChild(assignmentsList);
  dashboardGrid.appendChild(assignmentsCard);
  
  // Upcoming quizzes
  const quizzesCard = createCard('Upcoming Quizzes & Tests');
  const quizzesList = document.createElement('ul');
  quizzesList.className = 'quizzes-list';
  
  const upcomingQuizzes = getUpcomingQuizzes();
  
  upcomingQuizzes.forEach(quiz => {
    const li = document.createElement('li');
    li.className = 'quiz-item';
    
    const title = document.createElement('h3');
    title.textContent = quiz.title;
    
    const subject = document.createElement('p');
    subject.innerHTML = `<strong>Subject:</strong> ${quiz.subject}`;
    
    const date = document.createElement('p');
    date.innerHTML = `<strong>Date:</strong> ${quiz.scheduledDate || 'TBD'}`;
    
    li.appendChild(title);
    li.appendChild(subject);
    li.appendChild(date);
    quizzesList.appendChild(li);
  });
  
  quizzesCard.appendChild(quizzesList);
  dashboardGrid.appendChild(quizzesCard);
  
  // Recent submissions
  const submissionsCard = createCard('Recent Submissions');
  const submissionsList = document.createElement('ul');
  submissionsList.className = 'submissions-list';
  
  const recentSubmissions = getRecentSubmissions();
  
  recentSubmissions.forEach(submission => {
    const li = document.createElement('li');
    li.className = 'submission-item';
    
    const title = document.createElement('h3');
    title.textContent = submission.assignmentTitle;
    
    const date = document.createElement('p');
    date.innerHTML = `<strong>Submitted:</strong> ${submission.submittedDate}`;
    
    const status = document.createElement('span');
    status.className = `status status-${submission.status.toLowerCase()}`;
    status.textContent = submission.status;
    
    li.appendChild(title);
    li.appendChild(date);
    li.appendChild(status);
    submissionsList.appendChild(li);
  });
  
  submissionsCard.appendChild(submissionsList);
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