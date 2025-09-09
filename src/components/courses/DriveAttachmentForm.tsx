import React, { useState } from 'react';
import { getFirestore, doc, runTransaction } from 'firebase/firestore';
import { v4 as uuidv4 } from 'uuid';
import { CourseAttachment } from '../../services/courses/types/course';
import './CourseAttachments.css';

interface DriveAttachmentFormProps {
  courseId: string;
  onAttachmentAdded?: () => void;
}

export const DriveAttachmentForm: React.FC<DriveAttachmentFormProps> = ({ courseId, onAttachmentAdded }) => {
  const [name, setName] = useState('');
  const [url, setUrl] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const validateDriveUrl = (url: string): boolean => {
    // Basic validation for Google Drive links
    return url.includes('drive.google.com') || url.includes('docs.google.com');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    // Validate inputs
    if (!name.trim()) {
      setError('Please enter a name for the attachment');
      return;
    }

    if (!url.trim()) {
      setError('Please enter a URL for the attachment');
      return;
    }

    if (!validateDriveUrl(url)) {
      setError('Please enter a valid Google Drive URL');
      return;
    }

    try {
      setIsSubmitting(true);

      // Create attachment object
      const newAttachment: CourseAttachment = {
        id: uuidv4(),
        name: name.trim(),
        url: url.trim(),
        type: 'application/google-drive',
        source: 'drive',
        uploadedAt: new Date().toISOString()
      };

      // Update course document in Firestore using a transaction to avoid duplicates
      const db = getFirestore();
      const courseRef = doc(db, 'courses', courseId);
      
      await runTransaction(db, async (transaction) => {
        const courseDoc = await transaction.get(courseRef);
        if (!courseDoc.exists()) {
          throw new Error('Course document not found');
        }
      
        const courseData = courseDoc.data();
        const existingAttachments = courseData.attachments || [];
      
        // Add the new attachment
        const updatedAttachments = [...existingAttachments, newAttachment];
      
        // ✅ Only update lowercase "attachments"
        transaction.update(courseRef, { 
          attachments: updatedAttachments 
        });
      });
      

      // Reset form
      setName('');
      setUrl('');
      setSuccess(true);
      
      // Notify parent component
      if (onAttachmentAdded) {
        onAttachmentAdded();
      }
    } catch (err) {
      console.error('Error adding drive attachment:', err);
      setError('Failed to add attachment. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="drive-attachment-form">
      <h4>Add Google Drive Link</h4>
      
      {error && (
        <div className="error-message">
          {error}
        </div>
      )}
      
      {success && (
        <div className="success-message">
          Drive link added successfully!
        </div>
      )}
      
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="attachment-name">Name</label>
          <input
            id="attachment-name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g., Course Syllabus, Reading Material"
            disabled={isSubmitting}
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="attachment-url">Google Drive URL</label>
          <input
            id="attachment-url"
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://drive.google.com/..."
            disabled={isSubmitting}
          />
          <small className="form-hint">
            Enter a Google Drive or Google Docs URL that is accessible to students
          </small>
        </div>
        
        <button 
          type="submit" 
          className="add-attachment-btn"
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Adding...' : 'Add Drive Link'}
        </button>
      </form>
    </div>
  );
};
