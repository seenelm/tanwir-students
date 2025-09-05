import React from 'react';
import { useUser } from '../../context/UserContext';
import '../../styles/home.css';

const CLASS_NAMES = {
  container: 'home-container',
  welcome: 'welcome-section',
  welcomeContent: 'welcome-content',
  welcomeTitle: 'welcome-title',
  welcomeSubtitle: 'welcome-subtitle',
  welcomeIcon: 'welcome-icon'
};

export const Home: React.FC = () => {
  const { userData } = useUser();

  const getFirstName = () => {
    if (userData && userData.FirstName) {
      return userData.FirstName;
    }
    return '';
  };

  return (
    <div className={CLASS_NAMES.container}>
      <div className={CLASS_NAMES.welcome}>
        <div className={CLASS_NAMES.welcomeIcon}>
          <span className="material-icons">school</span>
        </div>
        <h1 className={CLASS_NAMES.welcomeTitle}>
          Marhaba{getFirstName() ? `, ${getFirstName()}` : ''}!
        </h1>
        <div className={CLASS_NAMES.welcomeSubtitle}>
          <h2>Introducing Courses</h2>
          <p>Explore your learning journey with our new courses feature</p>
        </div>
        <div className={CLASS_NAMES.welcomeContent}>
          <p>Access your enrolled courses, track your progress, and engage with course materials all in one place.</p>
          <p>Use the sidebar to navigate to your courses and explore all available features.</p>
        </div>
      </div>
    </div>
  );
};