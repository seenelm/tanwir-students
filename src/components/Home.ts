import '../styles/home.css';

export class Home {
  private readonly CLASS_NAMES = {
    container: 'home-container',
    overview: 'overview-section',
    overviewTitle: 'overview-title',
    overviewDivider: 'overview-divider',
    overviewCards: 'overview-cards',
    overviewCard: 'overview-card',
    cardContent: 'card-content'
  };

  

  private createOverviewCard(title: string, count: string, icon: string): HTMLElement {
    const card = document.createElement('div');
    card.className = this.CLASS_NAMES.overviewCard;
    card.innerHTML = `
      <span class="material-icons">${icon}</span>
      <div class="${this.CLASS_NAMES.cardContent}">
        <h3>${title}</h3>
        <p>${count}</p>
      </div>
    `;
    return card;
  }

  private renderOverview(): HTMLElement {
    const overview = document.createElement('section');
    overview.className = this.CLASS_NAMES.overview;

    // Overview header
    const header = document.createElement('h2');
    header.textContent = 'My Overview';
    header.className = this.CLASS_NAMES.overviewTitle;

    const divider = document.createElement('div');
    divider.className = this.CLASS_NAMES.overviewDivider;

    // Overview cards container
    const cardsContainer = document.createElement('div');
    cardsContainer.className = this.CLASS_NAMES.overviewCards;

    // Create overview cards
    const cardData = [
      { title: 'In Progress Courses', count: '3', icon: 'school' },
      { title: 'Completed Courses', count: '5', icon: 'check_circle' },
      { title: 'Certifications', count: '2', icon: 'workspace_premium' },
      { title: 'Achievement Points', count: '750', icon: 'stars' },
      { title: 'Learning Hours', count: '45', icon: 'schedule' }
    ];

    cardData.forEach(data => {
      cardsContainer.appendChild(
        this.createOverviewCard(data.title, data.count, data.icon)
      );
    });

    // Assemble the overview section
    overview.appendChild(header);
    overview.appendChild(divider);
    overview.appendChild(cardsContainer);

    return overview;
  }

  render(): HTMLElement {
    const container = document.createElement('div');
    container.className = this.CLASS_NAMES.container;
    container.appendChild(this.renderOverview());
    return container;
  }
}