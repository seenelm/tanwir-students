// src/components/Assignments.ts
import { getAllAssignments } from '../data/assignments';
import { openSubmissionModal } from './submissionModal';

export function renderAssignments(container: HTMLElement): void {
  container.innerHTML = '';
  
  // Page title
  const pageTitle = document.createElement('h1');
  pageTitle.className = 'page-title';
  pageTitle.textContent = 'Assignments';
  container.appendChild(pageTitle);
  
  // Assignments list
  const assignmentsCard = document.createElement('div');
  assignmentsCard.className = 'card';
  
  const assignments = getAllAssignments();
  
  // Filter controls
  const filterControls = document.createElement('div');
  filterControls.className = 'filter-controls';
  
  const filterLabel = document.createElement('label');
  filterLabel.textContent = 'Filter by status: ';
  
  const filterSelect = document.createElement('select');
  filterSelect.id = 'status-filter';
  
  const filterOptions = ['All', 'Not Submitted', 'Submitted', 'Graded'];
  
  filterOptions.forEach(option => {
    const optionEl = document.createElement('option');
    optionEl.value = option;
    optionEl.textContent = option;
    filterSelect.appendChild(optionEl);
  });
  
  filterLabel.appendChild(filterSelect);
  filterControls.appendChild(filterLabel);
  assignmentsCard.appendChild(filterControls);
  
  // Create table
  const table = document.createElement('table');
  table.className = 'assignments-table';
  
  // Table header
  const thead = document.createElement('thead');
  const headerRow = document.createElement('tr');
  
  ['Title', 'Description', 'Due Date', 'Status', 'Actions'].forEach(headerText => {
    const th = document.createElement('th');
    th.textContent = headerText;
    headerRow.appendChild(th);
  });
  
  thead.appendChild(headerRow);
  table.appendChild(thead);
  
  // Table body
  const tbody = document.createElement('tbody');
  
  assignments.forEach(assignment => {
    const tr = document.createElement('tr');
    
    // Title
    const tdTitle = document.createElement('td');
    tdTitle.textContent = assignment.title;
    tr.appendChild(tdTitle);
    
    // Description
    const tdDesc = document.createElement('td');
    tdDesc.textContent = assignment.description;
    tr.appendChild(tdDesc);
    
    // Due Date
    const tdDue = document.createElement('td');
    tdDue.textContent = assignment.dueDate;
    tr.appendChild(tdDue);
    
    // Status
    const tdStatus = document.createElement('td');
    const statusBadge = document.createElement('span');
    statusBadge.className = `status status-${assignment.status.toLowerCase().replace(' ', '-')}`;
    statusBadge.textContent = assignment.status;
    tdStatus.appendChild(statusBadge);
    tr.appendChild(tdStatus);
    
    // Actions
    const tdActions = document.createElement('td');
    
    if (assignment.status === 'Not Submitted') {
      const submitBtn = document.createElement('button');
      submitBtn.className = 'btn btn-primary';
      submitBtn.textContent = 'Submit';
      submitBtn.addEventListener('click', () => {
        openSubmissionModal(assignment);
      });
      tdActions.appendChild(submitBtn);
    } else {
      const viewBtn = document.createElement('button');
      viewBtn.className = 'btn btn-secondary';
      viewBtn.textContent = 'View Submission';
      viewBtn.addEventListener('click', () => {
        // View submission logic
        alert(`Viewing submission for: ${assignment.title}`);
      });
      tdActions.appendChild(viewBtn);
      
      if (assignment.status === 'Graded') {
        const feedbackBtn = document.createElement('button');
        feedbackBtn.className = 'btn btn-secondary';
        feedbackBtn.textContent = 'View Feedback';
        feedbackBtn.addEventListener('click', () => {
          // View feedback logic
          alert(`Feedback for ${assignment.title}: ${assignment.feedback || 'No feedback available'}`);
        });
        tdActions.appendChild(feedbackBtn);
      }
    }
    
    tr.appendChild(tdActions);
    tbody.appendChild(tr);
  });
  
  table.appendChild(tbody);
  assignmentsCard.appendChild(table);
  container.appendChild(assignmentsCard);
  
  // Add filter functionality
  filterSelect.addEventListener('change', () => {
    const selectedStatus = filterSelect.value;
    const rows = tbody.querySelectorAll('tr');
    
    rows.forEach(row => {
      const statusCell = row.querySelector('td:nth-child(4)');
      if (!statusCell) return;
      
      const statusText = statusCell.textContent?.trim() || '';
      
      if (selectedStatus === 'All' || statusText === selectedStatus) {
        row.style.display = '';
      } else {
        row.style.display = 'none';
      }
    });
  });
}