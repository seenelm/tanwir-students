import React from 'react';
import { useAuth } from '../../context/AuthContext';
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
  const { user } = useAuth();

  const getFirstName = () => {
    if (user?.displayName) {
      return user.displayName.split(' ')[0];
    }
    if (user?.FirstName) {
      return user.FirstName;
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