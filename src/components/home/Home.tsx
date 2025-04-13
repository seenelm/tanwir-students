import React from 'react';

const CLASS_NAMES = {
  container: 'home-container',
  overview: 'overview-section',
  overviewTitle: 'overview-title',
  overviewDivider: 'overview-divider',
  overviewCards: 'overview-cards',
  overviewCard: 'overview-card',
  cardContent: 'card-content',
  scoresSection: 'scores-section',
  scoresTitle: 'scores-title',
  scoresGrid: 'scores-grid',
  scoreItem: 'score-item',
  upcomingSection: 'upcoming-section',
  upcomingTitle: 'upcoming-title',
  upcomingList: 'upcoming-list',
  upcomingItem: 'upcoming-item',
  upcomingItemContent: 'upcoming-item-content',
  upcomingItemDate: 'upcoming-item-date'
};

export const Home: React.FC = () => {
  const cardData = [
    { title: 'In Progress Courses', count: '3', icon: 'school' },
    { title: 'Completed Courses', count: '5', icon: 'check_circle' },
    { title: 'Certifications', count: '2', icon: 'workspace_premium' },
    { title: 'Achievement Points', count: '750', icon: 'stars' },
    { title: 'Learning Hours', count: '45', icon: 'schedule' }
  ];

  const scores = [
    { title: 'Overall Average', score: '92%' },
    { title: 'Assignments Completed', score: '24/25' },
    { title: 'Current Course Grade', score: 'A' },
    { title: 'Participation Score', score: '95%' }
  ];

  const assignments = [
    { title: 'Final Project Submission', course: 'Web Development', dueDate: 'Apr 15, 2025' },
    { title: 'Database Design Quiz', course: 'Database Systems', dueDate: 'Apr 10, 2025' },
    { title: 'Algorithm Analysis', course: 'Data Structures', dueDate: 'Apr 8, 2025' }
  ];

  return (
    <div className={CLASS_NAMES.container}>
      {/* Overview Section */}
      <section className={CLASS_NAMES.overview}>
        <h2 className={CLASS_NAMES.overviewTitle}>My Overview</h2>
        <div className={CLASS_NAMES.overviewDivider}></div>
        <div className={CLASS_NAMES.overviewCards}>
          {cardData.map((card, i) => (
            <div key={i} className={CLASS_NAMES.overviewCard}>
              <span className="material-icons">{card.icon}</span>
              <div className={CLASS_NAMES.cardContent}>
                <h3>{card.title}</h3>
                <p>{card.count}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Scores Section */}
      <section className={CLASS_NAMES.scoresSection}>
        <h2 className={CLASS_NAMES.scoresTitle}>
          <span className="material-icons">analytics</span>My Scores
        </h2>
        <div className={CLASS_NAMES.scoresGrid}>
          {scores.map((score, i) => (
            <div key={i} className={CLASS_NAMES.scoreItem}>
              <h4>{score.title}</h4>
              <p>{score.score}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Upcoming Assignments */}
      <section className={CLASS_NAMES.upcomingSection}>
        <h2 className={CLASS_NAMES.upcomingTitle}>
          <span className="material-icons">assignment</span>Upcoming Assignments
        </h2>
        <div className={CLASS_NAMES.upcomingList}>
          {assignments.map((item, i) => (
            <div key={i} className={CLASS_NAMES.upcomingItem}>
              <span className="material-icons">event</span>
              <div className={CLASS_NAMES.upcomingItemContent}>
                <h4>{item.title}</h4>
                <p>{item.course}</p>
              </div>
              <span className={CLASS_NAMES.upcomingItemDate}>{item.dueDate}</span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};