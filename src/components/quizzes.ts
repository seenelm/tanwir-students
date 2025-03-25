// src/components/Quizzes.ts
import { getAllQuizzes } from '../data/quizzes';
import { Quiz } from '../types';

export function renderQuizzes(container: HTMLElement): void {
  container.innerHTML = '';
  
  // Page title
  const pageTitle = document.createElement('h1');
  pageTitle.className = 'page-title';
  pageTitle.textContent = 'Quizzes & Tests';
  container.appendChild(pageTitle);
  
  // Create tabs
  const tabsContainer = document.createElement('div');
  tabsContainer.className = 'tabs-container';
  
  const upcomingTab = document.createElement('button');
  upcomingTab.className = 'tab-btn active';
  upcomingTab.textContent = 'Upcoming';
  
  const completedTab = document.createElement('button');
  completedTab.className = 'tab-btn';
  completedTab.textContent = 'Completed';
  
  tabsContainer.appendChild(upcomingTab);
  tabsContainer.appendChild(completedTab);
  container.appendChild(tabsContainer);
  
  // Content container
  const contentContainer = document.createElement('div');
  contentContainer.className = 'tab-content';
  container.appendChild(contentContainer);
  
  // Get all quizzes
  const quizzes = getAllQuizzes();
  const upcomingQuizzes = quizzes.filter(quiz => quiz.status === 'Upcoming');
  const completedQuizzes = quizzes.filter(quiz => quiz.status === 'Completed');
  
  // Initial render
  renderUpcomingQuizzes(contentContainer, upcomingQuizzes);
  
  // Tab functionality
  upcomingTab.addEventListener('click', () => {
    upcomingTab.classList.add('active');
    completedTab.classList.remove('active');
    renderUpcomingQuizzes(contentContainer, upcomingQuizzes);
  });
  
  completedTab.addEventListener('click', () => {
    completedTab.classList.add('active');
    upcomingTab.classList.remove('active');
    renderCompletedQuizzes(contentContainer, completedQuizzes);
  });
}

function renderUpcomingQuizzes(container: HTMLElement, quizzes: Quiz[]): void {
  container.innerHTML = '';
  
  if (quizzes.length === 0) {
    const emptyMessage = document.createElement('p');
    emptyMessage.className = 'empty-message';
    emptyMessage.textContent = 'No upcoming quizzes or tests.';
    container.appendChild(emptyMessage);
    return;
  }
  
  const quizGrid = document.createElement('div');
  quizGrid.className = 'quiz-grid';
  
  quizzes.forEach(quiz => {
    const quizCard = document.createElement('div');
    quizCard.className = 'card quiz-card';
    
    const title = document.createElement('h2');
    title.textContent = quiz.title;
    
    const subject = document.createElement('p');
    subject.innerHTML = `<strong>Subject:</strong> ${quiz.subject}`;
    
    const date = document.createElement('p');
    date.innerHTML = `<strong>Date:</strong> ${quiz.scheduledDate || 'TBD'}`;
    
    const duration = document.createElement('p');
    duration.innerHTML = `<strong>Duration:</strong> ${quiz.duration || 'Not specified'}`;
    
    const topics = document.createElement('p');
    topics.innerHTML = `<strong>Topics:</strong> ${quiz.topics?.join(', ') || 'Not specified'}`;
    
    quizCard.appendChild(title);
    quizCard.appendChild(subject);
    quizCard.appendChild(date);
    quizCard.appendChild(duration);
    quizCard.appendChild(topics);
    
    quizGrid.appendChild(quizCard);
  });
  
  container.appendChild(quizGrid);
}

function renderCompletedQuizzes(container: HTMLElement, quizzes: Quiz[]): void {
  container.innerHTML = '';
  
  if (quizzes.length === 0) {
    const emptyMessage = document.createElement('p');
    emptyMessage.className = 'empty-message';
    emptyMessage.textContent = 'No completed quizzes or tests.';
    container.appendChild(emptyMessage);
    return;
  }
  
  const table = document.createElement('table');
  table.className = 'quizzes-table';
  
  // Table header
  const thead = document.createElement('thead');
  const headerRow = document.createElement('tr');
  
  ['Title', 'Subject', 'Date Taken', 'Score', 'Actions'].forEach(headerText => {
    const th = document.createElement('th');
    th.textContent = headerText;
    headerRow.appendChild(th);
  });
  
  thead.appendChild(headerRow);
  table.appendChild(thead);
  
  // Table body
  const tbody = document.createElement('tbody');
  
  quizzes.forEach(quiz => {
    const tr = document.createElement('tr');
    
    // Title
    const tdTitle = document.createElement('td');
    tdTitle.textContent = quiz.title;
    tr.appendChild(tdTitle);
    
    // Subject
    const tdSubject = document.createElement('td');
    tdSubject.textContent = quiz.subject;
    tr.appendChild(tdSubject);
    
    // Date Taken
    const tdDate = document.createElement('td');
    tdDate.textContent = quiz.dateTaken || 'Unknown';
    tr.appendChild(tdDate);
    
    // Score
    const tdScore = document.createElement('td');
    const scoreBadge = document.createElement('span');
    
    let scoreClass = 'score-average';
    if (quiz.score && quiz.score >= 90) {
      scoreClass = 'score-excellent';
    } else if (quiz.score && quiz.score < 70) {
      scoreClass = 'score-poor';
    }
    
    scoreBadge.className = `score ${scoreClass}`;
    scoreBadge.textContent = quiz.score ? `${quiz.score}%` : 'N/A';
    tdScore.appendChild(scoreBadge);
    tr.appendChild(tdScore);
    
    // Actions
    const tdActions = document.createElement('td');
    
    const viewBtn = document.createElement('button');
    viewBtn.className = 'btn btn-secondary';
    viewBtn.textContent = 'View Details';
    viewBtn.addEventListener('click', () => {
      // View quiz details logic
      alert(`Quiz details for: ${quiz.title}\nScore: ${quiz.score || 'N/A'}%\nFeedback: ${quiz.feedback || 'No feedback available'}`);
    });
    tdActions.appendChild(viewBtn);
    
    tr.appendChild(tdActions);
    tbody.appendChild(tr);
  });
  
  table.appendChild(tbody);
  container.appendChild(table);
}