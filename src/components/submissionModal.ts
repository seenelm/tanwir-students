// src/components/SubmissionModal.ts
import { Assignment } from '../types';

export function openSubmissionModal(assignment: Assignment): void {
  // Create modal backdrop
  const backdrop = document.createElement('div');
  backdrop.className = 'modal-backdrop';
  document.body.appendChild(backdrop);
  
  // Create modal container
  const modal = document.createElement('div');
  modal.className = 'modal';
  
  // Modal header
  const modalHeader = document.createElement('div');
  modalHeader.className = 'modal-header';
  
  const modalTitle = document.createElement('h2');
  modalTitle.textContent = `Submit Assignment: ${assignment.title}`;
  
  const closeBtn = document.createElement('button');
  closeBtn.className = 'modal-close';
  closeBtn.innerHTML = '&times;';
  closeBtn.addEventListener('click', closeModal);
  
  modalHeader.appendChild(modalTitle);
  modalHeader.appendChild(closeBtn);
  
  // Modal body
  const modalBody = document.createElement('div');
  modalBody.className = 'modal-body';
  
  // File upload
  const fileUploadSection = document.createElement('div');
  fileUploadSection.className = 'file-upload-section';
  
  const fileUploadLabel = document.createElement('label');
  fileUploadLabel.textContent = 'Upload Files:';
  fileUploadLabel.htmlFor = 'file-upload';
  
  const fileUploadInput = document.createElement('input');
  fileUploadInput.type = 'file';
  fileUploadInput.id = 'file-upload';
  fileUploadInput.multiple = true;
  
  const fileList = document.createElement('div');
  fileList.className = 'file-list';
  
  fileUploadInput.addEventListener('change', () => {
    fileList.innerHTML = '';
    
    Array.from(fileUploadInput.files || []).forEach(file => {
      const fileItem = document.createElement('div');
      fileItem.className = 'file-item';
      fileItem.textContent = file.name;
      fileList.appendChild(fileItem);
    });
  });
  
  fileUploadSection.appendChild(fileUploadLabel);
  fileUploadSection.appendChild(fileUploadInput);
  fileUploadSection.appendChild(fileList);
  
  // Comments section
  const commentsSection = document.createElement('div');
  commentsSection.className = 'comments-section';
  
  const commentsLabel = document.createElement('label');
  commentsLabel.textContent = 'Additional Comments:';
  commentsLabel.htmlFor = 'submission-comments';
  
  const commentsTextarea = document.createElement('textarea');
  commentsTextarea.id = 'submission-comments';
  commentsTextarea.rows = 4;
  commentsTextarea.placeholder = 'Add any comments or notes about your submission...';
  
  commentsSection.appendChild(commentsLabel);
  commentsSection.appendChild(commentsTextarea);
  
  modalBody.appendChild(fileUploadSection);
  modalBody.appendChild(commentsSection);
  
  // Modal footer
  const modalFooter = document.createElement('div');
  modalFooter.className = 'modal-footer';
  
  const cancelBtn = document.createElement('button');
  cancelBtn.className = 'btn btn-secondary';
  cancelBtn.textContent = 'Cancel';
  cancelBtn.addEventListener('click', closeModal);
  
  const submitBtn = document.createElement('button');
  submitBtn.className = 'btn btn-primary';
  submitBtn.textContent = 'Submit Assignment';
  submitBtn.addEventListener('click', () => {
    // Submit logic would go here
    // For now, just show a success message
    showSubmissionConfirmation(assignment);
    closeModal();
  });
  
  modalFooter.appendChild(cancelBtn);
  modalFooter.appendChild(submitBtn);
  
  // Assemble modal
  modal.appendChild(modalHeader);
  modal.appendChild(modalBody);
  modal.appendChild(modalFooter);
  
  backdrop.appendChild(modal);
  
  // Function to close the modal
  function closeModal(): void {
    document.body.removeChild(backdrop);
  }
}

function showSubmissionConfirmation(assignment: Assignment): void {
  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.textContent = `Assignment "${assignment.title}" submitted successfully!`;
  
  document.body.appendChild(toast);

  // Remove toast after 3 seconds
  setTimeout(() => {
    document.body.removeChild(toast);
  }, 3000);
}