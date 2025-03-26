import '../styles/main.css';

export class Content {
  private readonly CLASS_NAMES = {
    content: 'content',
  };

  render(): HTMLElement {
    const content = document.createElement('div');
    content.className = this.CLASS_NAMES.content;
    
    content.innerHTML = `
      <h2>Main Content</h2>
      <p>Your content goes here...</p>
    `;

    return content;
  }
}
