import React, { useState } from 'react';
import { AssignmentService } from '../../services/assignments/service/AssignmentService';


interface GoogleFormAssignmentCreatorProps {
  courseId: string;
  courseName: string;
  onAssignmentCreated?: () => void;
}

export const GoogleFormAssignmentCreator: React.FC<GoogleFormAssignmentCreatorProps> = ({
  courseId,
  courseName,
  onAssignmentCreated
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [formUrl, setFormUrl] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [points, setPoints] = useState(100);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState('');

  const convertToEmbedUrl = (url: string): string => {
    // Convert regular Google Form URL to embed URL
    // Handle various formats:
    // - https://docs.google.com/forms/d/FORM_ID/viewform
    // - https://docs.google.com/forms/d/e/FORM_ID/viewform
    // - URLs with extra parameters
    
    try {
      const urlObj = new URL(url);
      
      // Extract the form ID from the path
      const pathParts = urlObj.pathname.split('/');
      const dIndex = pathParts.indexOf('d');
      
      if (dIndex === -1) {
        return url + '?embedded=true';
      }
      
      // Get the form ID (skip 'e' if it exists)
      let formId = '';
      if (pathParts[dIndex + 1] === 'e' && pathParts[dIndex + 2]) {
        formId = pathParts[dIndex + 2];
      } else if (pathParts[dIndex + 1]) {
        formId = pathParts[dIndex + 1];
      }
      
      if (!formId) {
        return url + '?embedded=true';
      }
      
      // Construct clean embed URL
      return `https://docs.google.com/forms/d/e/${formId}/viewform?embedded=true`;
    } catch (error) {
      console.error('Error parsing URL:', error);
      // Fallback: just add embedded parameter
      return url.split('?')[0] + '?embedded=true';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setCreating(true);

    try {
      if (!formUrl.includes('docs.google.com/forms')) {
        throw new Error('Please enter a valid Google Forms URL');
      }

      const embedUrl = convertToEmbedUrl(formUrl);
      const service = AssignmentService.getInstance();
      
      await service.createGoogleFormAssignment({
        title,
        description,
        formUrl,
        embedUrl,
        courseId,
        courseName,
        dueDate: new Date(dueDate),
        points
      });

      // Reset form
      setTitle('');
      setDescription('');
      setFormUrl('');
      setDueDate('');
      setPoints(100);
      
      if (onAssignmentCreated) {
        onAssignmentCreated();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create assignment');
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="google-form-creator">
      <h3>Create Google Form Assignment</h3>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="title">Assignment Title</label>
          <input
            id="title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            placeholder="e.g., Week 1 Reflection Form"
          />
        </div>

        <div className="form-group">
          <label htmlFor="description">Description</label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
            placeholder="Describe the assignment..."
            rows={4}
          />
        </div>

        <div className="form-group">
          <label htmlFor="formUrl">Google Form URL</label>
          <input
            id="formUrl"
            type="url"
            value={formUrl}
            onChange={(e) => setFormUrl(e.target.value)}
            required
            placeholder="https://docs.google.com/forms/d/e/..."
          />
          <small>Paste the full URL of your Google Form</small>
        </div>

        <div className="form-group">
          <label htmlFor="dueDate">Due Date</label>
          <input
            id="dueDate"
            type="datetime-local"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="points">Points</label>
          <input
            id="points"
            type="number"
            value={points}
            onChange={(e) => setPoints(Number(e.target.value))}
            required
            min="0"
          />
        </div>

        {error && <div className="error-message">{error}</div>}

        <button type="submit" disabled={creating}>
          {creating ? 'Creating...' : 'Create Assignment'}
        </button>
      </form>
    </div>
  );
};
