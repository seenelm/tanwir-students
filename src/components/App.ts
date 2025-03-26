import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { Content } from './Content';
import '../style.css';

export class App {
  private readonly CLASS_NAMES = {
    layout: 'layout',
    mainContent: 'main-content',
  };

  private sidebar: Sidebar;
  private header: Header;
  private content: Content;

  constructor() {
    this.sidebar = new Sidebar();
    this.header = new Header(this.sidebar);
    this.content = new Content();
  }

  render(): HTMLElement {
    const layout = document.createElement('div');
    layout.className = this.CLASS_NAMES.layout;

    const main = document.createElement('main');
    main.className = this.CLASS_NAMES.mainContent;
    
    main.appendChild(this.header.render());
    main.appendChild(this.content.render());
    
    layout.appendChild(this.sidebar.render());
    layout.appendChild(main);

    return layout;
  }
}
