import { App } from './components/App';
import './style.css';

document.addEventListener('DOMContentLoaded', () => {
  const app = new App();
  const appContainer = document.getElementById('app');
  if (appContainer) {
    appContainer.appendChild(app.render());
  }
});