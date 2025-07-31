import React from 'react';

const CLASS_NAMES = {
  container: 'home-container',
  comingSoon: 'coming-soon',
  comingSoonContent: 'coming-soon-content',
  comingSoonTitle: 'coming-soon-title',
  comingSoonSubtitle: 'coming-soon-subtitle',
  comingSoonIcon: 'coming-soon-icon'
};

export const Home: React.FC = () => {
  return (
    <div className={CLASS_NAMES.container}>
      <div className={CLASS_NAMES.comingSoon}>
        <div className={CLASS_NAMES.comingSoonIcon}>
          <span className="material-icons">rocket_launch</span>
        </div>
        <h1 className={CLASS_NAMES.comingSoonTitle}>Coming Soon</h1>
        <p className={CLASS_NAMES.comingSoonSubtitle}>
          We're working on something awesome for you!
        </p>
        <div className={CLASS_NAMES.comingSoonContent}>
          <p>Our new dashboard is under construction and will be available soon.</p>
          <p>Thank you for your patience!</p>
        </div>
      </div>
    </div>
  );
};