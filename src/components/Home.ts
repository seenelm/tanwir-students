import '../styles/home.css';

export class Home {
  private readonly CLASS_NAMES = {
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

  private renderScores(): HTMLElement {
    const scoresSection = document.createElement('section');
    scoresSection.className = this.CLASS_NAMES.scoresSection;

    const title = document.createElement('h2');
    title.className = this.CLASS_NAMES.scoresTitle;
    title.innerHTML = '<span class="material-icons">analytics</span>My Scores';

    const scoresGrid = document.createElement('div');
    scoresGrid.className = this.CLASS_NAMES.scoresGrid;

    const scores = [
      { title: 'Overall Average', score: '92%' },
      { title: 'Assignments Completed', score: '24/25' },
      { title: 'Current Course Grade', score: 'A' },
      { title: 'Participation Score', score: '95%' }
    ];

    scores.forEach(item => {
      const scoreItem = document.createElement('div');
      scoreItem.className = this.CLASS_NAMES.scoreItem;
      scoreItem.innerHTML = `
        <h4>${item.title}</h4>
        <p>${item.score}</p>
      `;
      scoresGrid.appendChild(scoreItem);
    });

    scoresSection.appendChild(title);
    scoresSection.appendChild(scoresGrid);

    return scoresSection;
  }

  private renderUpcomingAssignments(): HTMLElement {
    const upcomingSection = document.createElement('section');
    upcomingSection.className = this.CLASS_NAMES.upcomingSection;

    const title = document.createElement('h2');
    title.className = this.CLASS_NAMES.upcomingTitle;
    title.innerHTML = '<span class="material-icons">assignment</span>Upcoming Assignments';

    const upcomingList = document.createElement('div');
    upcomingList.className = this.CLASS_NAMES.upcomingList;

    const assignments = [
      { title: 'Final Project Submission', course: 'Web Development', dueDate: 'Apr 15, 2025' },
      { title: 'Database Design Quiz', course: 'Database Systems', dueDate: 'Apr 10, 2025' },
      { title: 'Algorithm Analysis', course: 'Data Structures', dueDate: 'Apr 8, 2025' }
    ];

    assignments.forEach(item => {
      const assignmentItem = document.createElement('div');
      assignmentItem.className = this.CLASS_NAMES.upcomingItem;
      assignmentItem.innerHTML = `
        <span class="material-icons">event</span>
        <div class="${this.CLASS_NAMES.upcomingItemContent}">
          <h4>${item.title}</h4>
          <p>${item.course}</p>
        </div>
        <span class="${this.CLASS_NAMES.upcomingItemDate}">${item.dueDate}</span>
      `;
      upcomingList.appendChild(assignmentItem);
    });

    upcomingSection.appendChild(title);
    upcomingSection.appendChild(upcomingList);

    return upcomingSection;
  }

  render(): HTMLElement {
    const container = document.createElement('div');
    container.className = this.CLASS_NAMES.container;
    container.appendChild(this.renderOverview());
    container.appendChild(this.renderScores());
    container.appendChild(this.renderUpcomingAssignments());
    return container;
  }
}