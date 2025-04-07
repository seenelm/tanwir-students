import { AssignmentService } from '../services/assignments';
import { CourseService } from '../services/courses';
import { AuthService } from '../services/auth';
import { Assignment, AssignmentQuestion } from '../types/assignment';
import { Course } from '../types/course';
import '../styles/assignments.css';

export class Assignments {
  private container: HTMLElement;
  private assignmentService: AssignmentService;
  private courseService: CourseService;
  private authService: AuthService;
  private isAdmin: boolean = false;
  private assignments: Assignment[] = [];
  private courses: Course[] = [];
  private modal: HTMLElement | null = null;
  private isLoadingAttachments: boolean = false;
  private isLoadingQuestions: boolean = false;
  private isLoadingDiscussions: boolean = false;

  constructor() {
    this.assignmentService = AssignmentService.getInstance();
    this.courseService = CourseService.getInstance();
    this.authService = AuthService.getInstance();
    this.container = document.createElement('div');
    this.container.className = 'assignments-container';
    this.init();
  }

  private async init(): Promise<void> {
    try {
      const user = await this.authService.getCurrentUser();
      if (!user) return;

      const userDoc = await this.authService.getUserData(user.uid);
      this.isAdmin = userDoc?.Role === 'admin';

      await this.loadData();
      this.render();
    } catch (error) {
      console.error('Error initializing assignments:', error);
    }
  }

  private async loadData(): Promise<void> {
    try {
      this.courses = await this.courseService.getCourses();
      
      if (this.isAdmin) {
        // Admins see all assignments from all courses
        const assignmentPromises = this.courses.map(course => 
          this.assignmentService.getCourseAssignments(course.Id)
        );
        const assignmentsArrays = await Promise.all(assignmentPromises);
        this.assignments = assignmentsArrays.flat();
      } else {
        // Students only see their assignments
        // const studentAssignments = await this.assignmentService.getCurrentUserAssignments();
        // TODO: Fetch full assignment details for each student assignment
      }
    } catch (error) {
      console.error('Error loading assignments:', error);
    }
  }

  private createModal(): HTMLElement {
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.innerHTML = `
      <div class="modal-content">
        <div class="modal-header">
          <span class="close">&times;</span>
          <h2>Assignment</h2>
        </div>
        <div class="modal-body"></div>
      </div>
    `;

    // Add close button handler
    const closeBtn = modal.querySelector('.close');
    closeBtn?.addEventListener('click', () => {
      this.closeModal();
    });

    // Close when clicking outside the modal content
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        this.closeModal();
      }
    });

    return modal;
  }

  private closeModal(): void {
    if (this.modal) {
      this.modal.style.display = 'none';
      
      // Clean up any event listeners on tabs to prevent duplicates
      const tabsElement = this.modal.querySelector('.tabs');
      const newTabsElement = tabsElement?.cloneNode(true);
      if (tabsElement && newTabsElement) {
        tabsElement.parentNode?.replaceChild(newTabsElement, tabsElement);
      }
    }
  }

  private createAssignmentForm(): HTMLElement {
    const form = document.createElement('form');
    form.className = 'assignment-form';
    
    const courseOptions = this.courses
      .map(course => `<option value="${course.Id}">${course.Name}</option>`)
      .join('');

    form.innerHTML = `
      <h3>Create New Assignment</h3>
      <div class="form-group">
        <label for="courseSelect">Course</label>
        <select id="courseSelect" required>
          <option value="">Select a course</option>
          ${courseOptions}
        </select>
      </div>
      <div class="form-group">
        <label for="title">Title</label>
        <input type="text" id="title" placeholder="Assignment title" required>
      </div>
      <div class="form-group">
        <label for="description">Description</label>
        <textarea id="description" placeholder="Assignment description" required></textarea>
      </div>
      <div class="form-group">
        <label for="dueDate">Due Date</label>
        <input type="datetime-local" id="dueDate" required>
      </div>
      <div class="form-group">
        <label for="points">Points</label>
        <input type="number" id="points" min="0" step="1" required>
      </div>
      <div class="form-actions">
        <button type="submit" class="primary-button">Create Assignment</button>
      </div>
    `;

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const courseSelect = form.querySelector('#courseSelect') as HTMLSelectElement;
      const titleInput = form.querySelector('#title') as HTMLInputElement;
      const descInput = form.querySelector('#description') as HTMLTextAreaElement;
      const dueDateInput = form.querySelector('#dueDate') as HTMLInputElement;
      const pointsInput = form.querySelector('#points') as HTMLInputElement;

      try {
        await this.assignmentService.createAssignment(
          courseSelect.value,
          titleInput.value,
          descInput.value,
          new Date(dueDateInput.value),
          parseInt(pointsInput.value)
        );

        await this.loadData();
        this.render();
        if (this.modal) {
          this.closeModal();
        }
      } catch (error) {
        console.error('Error creating assignment:', error);
        alert('Failed to create assignment. Please try again.');
      }
    });

    return form;
  }

  private showCreateAssignmentModal(): void {
    if (!this.modal) {
      this.modal = this.createModal();
      document.body.appendChild(this.modal);
    }

    const modalBody = this.modal.querySelector('.modal-body');
    if (modalBody) {
      modalBody.innerHTML = '';
      modalBody.appendChild(this.createAssignmentForm());
    }

    this.modal.style.display = 'block';
  }

  private formatDate(date: Date): string {
    return new Date(date).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  private createAssignmentCard(assignment: Assignment): HTMLElement {
    const card = document.createElement('div');
    card.className = 'assignment-card';
    
    const courseName = this.courses.find(c => c.Id === assignment.CourseId)?.Name || 'Unknown Course';
    
    card.innerHTML = `
      <div class="assignment-header">
        <h3>${assignment.Title}</h3>
        <span class="course-name">${courseName}</span>
      </div>
      <div class="assignment-content">
        <p>${assignment.Description}</p>
        <div class="assignment-meta">
          <span class="due-date">Due: ${this.formatDate(assignment.DueDate)}</span>
          <span class="points">${assignment.Points} points</span>
        </div>
      </div>
    `;

    // Add click handler to open detail modal
    card.addEventListener('click', () => {
      this.showAssignmentDetailModal(assignment);
    });

    return card;
  }

  private async showAssignmentDetailModal(assignment: Assignment): Promise<void> {
    if (!this.modal) {
      this.modal = this.createModal();
      document.body.appendChild(this.modal);
    }

    const modalBody = this.modal.querySelector('.modal-body');
    if (!modalBody) return;

    modalBody.innerHTML = '';
    
    // Create tabs container
    const tabsContainer = document.createElement('div');
    tabsContainer.className = 'tabs-container';
    tabsContainer.innerHTML = `
      <div class="tabs">
        <button class="tab active" data-tab="details">Details</button>
        <button class="tab" data-tab="attachments">Attachments</button>
        <button class="tab" data-tab="questions">Questions</button>
        <button class="tab" data-tab="discussions">Discussions</button>
      </div>
      <div class="tab-content"></div>
    `;

    modalBody.appendChild(tabsContainer);

    const tabContent = tabsContainer.querySelector('.tab-content') as HTMLElement;
    if (!tabContent) return;

    // Load initial content (Details tab)
    this.loadDetailsTab(tabContent, assignment);

    // Use event delegation instead of attaching listeners to each tab
    const tabsElement = tabsContainer.querySelector('.tabs');
    tabsElement?.addEventListener('click', async (e) => {
      const target = e.target as HTMLElement;
      
      // Only proceed if a tab was clicked
      if (!target.classList.contains('tab')) return;
      
      const tabName = target.dataset.tab;
      if (!tabName) return;

      // Update active tab
      const tabs = tabsContainer.querySelectorAll('.tab');
      tabs.forEach(t => t.classList.remove('active'));
      target.classList.add('active');

      // Load tab content
      switch (tabName) {
        case 'details':
          this.loadDetailsTab(tabContent, assignment);
          break;
        case 'attachments':
          // Only load if not already loading
          if (!this.isLoadingAttachments) {
            await this.loadAttachmentsTab(tabContent, assignment);
          }
          break;
        case 'questions':
          // Only load if not already loading
          if (!this.isLoadingQuestions) {
            await this.loadQuestionsTab(tabContent, assignment);
          }
          break;
        case 'discussions':
          // Only load if not already loading
          if (!this.isLoadingDiscussions) {
            await this.loadDiscussionsTab(tabContent, assignment);
          }
          break;
      }
    });

    this.modal.style.display = 'block';
  }

  private loadDetailsTab(container: HTMLElement, assignment: Assignment): void {
    const courseName = this.courses.find(c => c.Id === assignment.CourseId)?.Name || 'Unknown Course';
    
    container.innerHTML = `
      <div class="assignment-details">
        <h2>${assignment.Title}</h2>
        <div class="meta-info">
          <p><strong>Course:</strong> ${courseName}</p>
          <p><strong>Due Date:</strong> ${this.formatDate(assignment.DueDate)}</p>
          <p><strong>Points:</strong> ${assignment.Points}</p>
        </div>
        <div class="description">
          <h3>Description</h3>
          <p>${assignment.Description}</p>
        </div>
      </div>
    `;
  }

  private async loadAttachmentsTab(container: HTMLElement, assignment: Assignment): Promise<void> {
    // If already loading, don't start another loading process
    if (this.isLoadingAttachments) return;
    
    this.isLoadingAttachments = true;
    container.innerHTML = '<p class="loading-indicator">Loading attachments...</p>';
    
    try {
      const attachments = await this.assignmentService.getAttachments(assignment.Id);
      
      // If we're no longer loading this tab (user switched to another tab), don't update UI
      if (!this.isLoadingAttachments) return;
      
      let html = '<div class="attachments-section">';
      
      if (this.isAdmin) {
        html += `
          <div class="upload-section">
            <input type="file" id="fileUpload" multiple>
            <button class="upload-button">Upload Attachment</button>
          </div>
        `;
      }
      
      html += '<div class="attachments-list">';
      if (attachments.length === 0) {
        html += '<p>No attachments available.</p>';
      } else {
        html += '<ul>';
        attachments.forEach(attachment => {
          html += `
            <li>
              <a href="${attachment.FileUrl}" target="_blank">${attachment.Name}</a>
              <span class="file-type">${attachment.FileType}</span>
            </li>
          `;
        });
        html += '</ul>';
      }
      html += '</div></div>';
      
      container.innerHTML = html;

      if (this.isAdmin) {
        const uploadButton = container.querySelector('.upload-button');
        const fileInput = container.querySelector('#fileUpload') as HTMLInputElement;
        
        uploadButton?.addEventListener('click', async () => {
          const files = fileInput?.files;
          if (!files?.length) return;

          try {
            for (const file of Array.from(files)) {
              await this.assignmentService.addAttachment(assignment.Id, file);
            }
            await this.loadAttachmentsTab(container, assignment);
          } catch (error) {
            console.error('Error uploading attachment:', error);
            alert('Failed to upload attachment. Please try again.');
          }
        });
      }
    } catch (error) {
      console.error('Error loading attachments:', error);
      container.innerHTML = '<p class="error-message">Error loading attachments.</p>';
    } finally {
      this.isLoadingAttachments = false;
    }
  }

  private async loadQuestionsTab(container: HTMLElement, assignment: Assignment): Promise<void> {
    // If already loading, don't start another loading process
    if (this.isLoadingQuestions) return;
    
    this.isLoadingQuestions = true;
    container.innerHTML = '<p class="loading-indicator">Loading questions...</p>';
    
    try {
      const questions = await this.assignmentService.getQuestions(assignment.Id);
      const answers = this.isAdmin ? [] : await this.assignmentService.getStudentAnswers(assignment.Id);
      
      // If we're no longer loading this tab (user switched to another tab), don't update UI
      if (!this.isLoadingQuestions) return;
      
      let html = '<div class="questions-section">';
      
      if (this.isAdmin) {
        html += `
          <div class="add-question-section">
            <button class="add-question-button">Add Question</button>
          </div>
        `;
      }
      
      html += '<div class="questions-list">';
      if (questions.length === 0) {
        html += '<p>No questions available.</p>';
      } else {
        questions.forEach(question => {
          const studentAnswer = answers.find(a => a.QuestionId === question.Id);
          
          html += `
            <div class="question-item">
              <h4>${question.Question}</h4>
              <p>Points: ${question.Points}</p>
              ${question.Type === 'multiple_choice' ? `
                <div class="options">
                  ${question.Options?.map(option => `
                    <label>
                      <input type="radio" name="q_${question.Id}" value="${option}" 
                        ${studentAnswer?.Answer === option ? 'checked' : ''} 
                        ${studentAnswer ? 'disabled' : ''}>
                      ${option}
                    </label>
                  `).join('') || ''}
                </div>
              ` : `
                <textarea class="answer-text" ${studentAnswer ? 'disabled' : ''}
                  placeholder="Enter your answer">${studentAnswer?.Answer || ''}</textarea>
              `}
              ${studentAnswer ? `
                <div class="answer-feedback">
                  ${studentAnswer.Score !== undefined ? 
                    `<p>Score: ${studentAnswer.Score}/${question.Points}</p>` : 
                    '<p>Not graded yet</p>'}
                </div>
              ` : `
                <button class="submit-answer" data-question-id="${question.Id}">Submit Answer</button>
              `}
            </div>
          `;
        });
      }
      html += '</div></div>';
      
      container.innerHTML = html;

      if (this.isAdmin) {
        const addButton = container.querySelector('.add-question-button');
        addButton?.addEventListener('click', () => this.showAddQuestionForm(container, assignment));
      } else {
        const submitButtons = container.querySelectorAll('.submit-answer');
        submitButtons.forEach(button => {
          button.addEventListener('click', async (e) => {
            const questionId = (e.target as HTMLElement).dataset.questionId;
            if (!questionId) return;

            const questionItem = (e.target as HTMLElement).closest('.question-item');
            const answer = (questionItem?.querySelector('input[type="radio"]:checked') as HTMLInputElement)?.value || 
                          (questionItem?.querySelector('.answer-text') as HTMLTextAreaElement)?.value;

            if (!answer) {
              alert('Please provide an answer');
              return;
            }

            try {
              await this.assignmentService.submitAnswer(assignment.Id, questionId, answer);
              await this.loadQuestionsTab(container, assignment);
            } catch (error) {
              console.error('Error submitting answer:', error);
              alert('Failed to submit answer. Please try again.');
            }
          });
        });
      }
    } catch (error) {
      console.error('Error loading questions:', error);
      container.innerHTML = '<p class="error-message">Error loading questions.</p>';
    } finally {
      this.isLoadingQuestions = false;
    }
  }

  private async loadDiscussionsTab(container: HTMLElement, assignment: Assignment): Promise<void> {
    // If already loading, don't start another loading process
    if (this.isLoadingDiscussions) return;
    
    this.isLoadingDiscussions = true;
    container.innerHTML = '<p class="loading-indicator">Loading discussions...</p>';
    
    try {
      const discussions = await this.assignmentService.getDiscussions(assignment.Id);
      
      // If we're no longer loading this tab (user switched to another tab), don't update UI
      if (!this.isLoadingDiscussions) return;
      
      let html = `
        <div class="discussions-section">
          <div class="post-discussion">
            <textarea placeholder="Write your message..." class="discussion-input"></textarea>
            <button class="post-button">Post</button>
          </div>
          <div class="discussions-list">
      `;
      
      if (discussions.length === 0) {
        html += '<p>No discussions yet. Start the conversation!</p>';
      } else {
        discussions.forEach(discussion => {
          html += `
            <div class="discussion-item">
              <div class="discussion-header">
                <span class="user-id">${discussion.UserId}</span>
                <span class="timestamp">${this.formatDate(discussion.CreatedAt)}</span>
              </div>
              <div class="discussion-content">${discussion.Content}</div>
            </div>
          `;
        });
      }
      html += '</div></div>';
      
      container.innerHTML = html;

      const postButton = container.querySelector('.post-button');
      const discussionInput = container.querySelector('.discussion-input') as HTMLTextAreaElement;
      
      postButton?.addEventListener('click', async () => {
        const content = discussionInput.value.trim();
        if (!content) return;

        try {
          await this.assignmentService.addDiscussion(assignment.Id, content);
          discussionInput.value = '';
          await this.loadDiscussionsTab(container, assignment);
        } catch (error) {
          console.error('Error posting discussion:', error);
          alert('Failed to post discussion. Please try again.');
        }
      });
    } catch (error) {
      console.error('Error loading discussions:', error);
      container.innerHTML = '<p class="error-message">Error loading discussions.</p>';
    } finally {
      this.isLoadingDiscussions = false;
    }
  }

  private showAddQuestionForm(container: HTMLElement, assignment: Assignment): void {
    const questionForm = document.createElement('div');
    questionForm.className = 'add-question-form';
    questionForm.innerHTML = `
      <h3>Add New Question</h3>
      <div class="form-group">
        <label for="questionType">Question Type</label>
        <select id="questionType">
          <option value="text">Text</option>
          <option value="multiple_choice">Multiple Choice</option>
        </select>
      </div>
      <div class="form-group">
        <label for="questionText">Question</label>
        <textarea id="questionText" required></textarea>
      </div>
      <div class="form-group">
        <label for="points">Points</label>
        <input type="number" id="points" min="0" required>
      </div>
      <div class="form-group options-group" style="display: none;">
        <label>Options</label>
        <div id="optionsList">
          <input type="text" class="option-input" placeholder="Option 1">
          <input type="text" class="option-input" placeholder="Option 2">
        </div>
        <button type="button" class="add-option-button">Add Option</button>
      </div>
      <div class="form-actions">
        <button type="button" class="cancel-button">Cancel</button>
        <button type="button" class="save-button">Save Question</button>
      </div>
    `;

    // Store the current content before replacing it
    // const questionsTab = container.querySelector('.questions-tab');
    container.innerHTML = '';
    container.appendChild(questionForm);

    const typeSelect = questionForm.querySelector('#questionType') as HTMLSelectElement;
    const optionsGroup = questionForm.querySelector('.options-group') as HTMLElement;
    const optionsList = questionForm.querySelector('#optionsList') as HTMLElement;
    const addOptionButton = questionForm.querySelector('.add-option-button') as HTMLElement;

    // Type change handler
    typeSelect.addEventListener('change', () => {
      optionsGroup.style.display = typeSelect.value === 'multiple_choice' ? 'block' : 'none';
    });

    // Add option handler
    addOptionButton.addEventListener('click', () => {
      const newOption = document.createElement('input');
      newOption.type = 'text';
      newOption.className = 'option-input';
      newOption.placeholder = `Option ${optionsList.children.length + 1}`;
      optionsList.appendChild(newOption);
    });

    // Cancel button handler
    const cancelButton = questionForm.querySelector('.cancel-button');
    cancelButton?.addEventListener('click', async () => {
      await this.loadQuestionsTab(container, assignment);
    });

    // Save button handler
    const saveButton = questionForm.querySelector('.save-button');
    saveButton?.addEventListener('click', async () => {
      const questionText = (questionForm.querySelector('#questionText') as HTMLTextAreaElement).value;
      const points = parseInt((questionForm.querySelector('#points') as HTMLInputElement).value);
      const type = typeSelect.value as 'text' | 'multiple_choice';
      
      if (!questionText || isNaN(points)) {
        alert('Please fill in all required fields');
        return;
      }

      const questionData: Omit<AssignmentQuestion, 'Id' | 'CreatedAt'> = {
        Question: questionText,
        Type: type,
        Points: points
      };

      if (type === 'multiple_choice') {
        const options = Array.from(optionsList.querySelectorAll('.option-input'))
          .map(input => (input as HTMLInputElement).value)
          .filter(value => value.trim() !== '');
        
        if (options.length < 2) {
          alert('Please add at least 2 options');
          return;
        }
        questionData.Options = options;
      }

      try {
        await this.assignmentService.addQuestion(assignment.Id, questionData);
        await this.loadQuestionsTab(container, assignment);
      } catch (error) {
        console.error('Error adding question:', error);
        alert('Failed to add question. Please try again.');
      }
    });
  }

  render(): HTMLElement {
    this.container.innerHTML = '';

    const assignmentsGrid = document.createElement('div');
    assignmentsGrid.className = 'assignments-grid';
    
    this.assignments.forEach(assignment => {
      assignmentsGrid.appendChild(this.createAssignmentCard(assignment));
    });

    this.container.appendChild(assignmentsGrid);

    if (this.isAdmin) {
      const createButton = document.createElement('button');
      createButton.className = 'create-assignment-button';
      createButton.textContent = 'Create Assignment';
      createButton.addEventListener('click', () => this.showCreateAssignmentModal());
      this.container.appendChild(createButton);
    }

    return this.container;
  }
}