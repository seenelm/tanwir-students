import { App } from './components/App';
import './styles/main.css';

document.addEventListener('DOMContentLoaded', () => {
  const app = new App();
  const appContainer = document.getElementById('app');
  if (appContainer) {
    appContainer.appendChild(app.render());
  }
});