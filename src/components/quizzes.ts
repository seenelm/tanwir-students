// src/components/Quizzes.ts
import { getAllQuizzes } from '../data/quizzes';
import { Quiz } from '../types';

export function renderQuizzes(container: HTMLElement): void {
  container.innerHTML = '';
  
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
    const emptyState = document.createElement('div');
    emptyState.className = 'empty-state';
    emptyState.innerHTML = '<span class="material-icons">event_available</span><p>No upcoming quizzes or tests</p>';
    container.appendChild(emptyState);
    return;
  }
  
  const quizzesGrid = document.createElement('div');
  quizzesGrid.className = 'quizzes-grid';
  
  quizzes.forEach(quiz => {
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
    duration.innerHTML = `<span class="material-icons">schedule</span> ${quiz.duration || 'Not specified'}`;
    
    // Topics tags
    const topicsContainer = document.createElement('div');
    topicsContainer.className = 'quiz-topics';
    
    if (quiz.topics && quiz.topics.length > 0) {
      quiz.topics.forEach(topic => {
        const topicTag = document.createElement('span');
        topicTag.className = 'topic-tag';
        topicTag.textContent = topic;
        topicsContainer.appendChild(topicTag);
      });
    }
    
    // Action button
    const actionContainer = document.createElement('div');
    actionContainer.className = 'quiz-actions';
    
    const prepareBtn = document.createElement('button');
    prepareBtn.className = 'btn btn-secondary';
    prepareBtn.innerHTML = '<span class="material-icons">menu_book</span> Prepare';
    prepareBtn.addEventListener('click', () => {
      alert(`Prepare for ${quiz.title} on ${quiz.subject}`);
    });
    
    actionContainer.appendChild(prepareBtn);
    
    quizContent.appendChild(title);
    quizContent.appendChild(subject);
    quizContent.appendChild(duration);
    quizContent.appendChild(topicsContainer);
    quizContent.appendChild(actionContainer);
    
    quizCard.appendChild(dateBox);
    quizCard.appendChild(quizContent);
    quizzesGrid.appendChild(quizCard);
  });
  
  container.appendChild(quizzesGrid);
}

function renderCompletedQuizzes(container: HTMLElement, quizzes: Quiz[]): void {
  container.innerHTML = '';
  
  if (quizzes.length === 0) {
    const emptyState = document.createElement('div');
    emptyState.className = 'empty-state';
    emptyState.innerHTML = '<span class="material-icons">assignment_turned_in</span><p>No completed quizzes or tests</p>';
    container.appendChild(emptyState);
    return;
  }
  
  const completedGrid = document.createElement('div');
  completedGrid.className = 'completed-quizzes-grid';
  
  quizzes.forEach(quiz => {
    const quizCard = document.createElement('div');
    quizCard.className = 'completed-quiz-card';
    
    // Score display
    const scoreBox = document.createElement('div');
    scoreBox.className = 'quiz-score-box';
    
    let scoreClass = 'score-average';
    if (quiz.score && quiz.score >= 90) {
      scoreClass = 'score-excellent';
    } else if (quiz.score && quiz.score < 70) {
      scoreClass = 'score-poor';
    }
    
    scoreBox.classList.add(scoreClass);
    
    const scoreLabel = document.createElement('div');
    scoreLabel.className = 'score-label';
    scoreLabel.textContent = 'Score';
    
    const scoreValue = document.createElement('div');
    scoreValue.className = 'score-value';
    scoreValue.textContent = quiz.score ? `${quiz.score}%` : 'N/A';
    
    scoreBox.appendChild(scoreLabel);
    scoreBox.appendChild(scoreValue);
    
    // Quiz content
    const quizContent = document.createElement('div');
    quizContent.className = 'quiz-content';
    
    const title = document.createElement('h3');
    title.className = 'quiz-title';
    title.textContent = quiz.title;
    
    const subject = document.createElement('div');
    subject.className = 'quiz-subject';
    subject.innerHTML = `<span class="material-icons">book</span> ${quiz.subject}`;
    
    const date = document.createElement('div');
    date.className = 'quiz-date';
    date.innerHTML = `<span class="material-icons">event</span> ${quiz.dateTaken || 'Unknown'}`;
    
    quizContent.appendChild(title);
    quizContent.appendChild(subject);
    quizContent.appendChild(date);
    
    // Feedback section
    if (quiz.feedback) {
      const feedback = document.createElement('div');
      feedback.className = 'quiz-feedback';
      
      const feedbackIcon = document.createElement('span');
      feedbackIcon.className = 'material-icons';
      feedbackIcon.textContent = 'comment';
      
      const feedbackText = document.createElement('p');
      feedbackText.textContent = quiz.feedback;
      
      feedback.appendChild(feedbackIcon);
      feedback.appendChild(feedbackText);
      quizContent.appendChild(feedback);
    }
    
    // Action button
    const actionContainer = document.createElement('div');
    actionContainer.className = 'quiz-actions';
    
    const viewBtn = document.createElement('button');
    viewBtn.className = 'btn btn-secondary';
    viewBtn.innerHTML = '<span class="material-icons">visibility</span> View Details';
    viewBtn.addEventListener('click', () => {
      alert(`Quiz details for: ${quiz.title}\nScore: ${quiz.score || 'N/A'}%\nFeedback: ${quiz.feedback || 'No feedback available'}`);
    });
    
    actionContainer.appendChild(viewBtn);
    quizContent.appendChild(actionContainer);
    
    quizCard.appendChild(scoreBox);
    quizCard.appendChild(quizContent);
    completedGrid.appendChild(quizCard);
  });
  
  container.appendChild(completedGrid);
}