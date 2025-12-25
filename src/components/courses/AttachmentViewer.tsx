import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router';
import { CourseService } from '../../services/courses/service/CourseService';
import { CourseAttachment } from '../../services/courses/types/course';
import './CourseAttachments.css';

export const AttachmentViewer: React.FC = () => {
  const { courseId, attachmentId } = useParams<{ courseId: string; attachmentId: string }>();
  const [attachment, setAttachment] = useState<CourseAttachment | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAttachment = async () => {
      if (!courseId || !attachmentId) {
        setError('Invalid course or attachment ID');
        setLoading(false);
        return; 
      }

      try {
        const courseService = CourseService.getInstance();
        const course = await courseService.getCourseById(courseId);
        
        if (!course || !course.attachments) {
          setError('Course or attachments not found');
          setLoading(false);
          return;
        }

        const foundAttachment = course.attachments.find(att => att.id === attachmentId);
        
        if (!foundAttachment) {
          setError('Attachment not found');
          setLoading(false);
          return;
        }

        setAttachment(foundAttachment);
      } catch (err) {
        console.error('Error fetching attachment:', err);
        setError('Failed to load attachment');
      } finally {
        setLoading(false);
      }
    };

    fetchAttachment();
  }, [courseId, attachmentId]);

  // Function to modify Google Drive URLs for proper embedding
  const getModifiedDriveUrl = (url: string): string => {
    let modifiedUrl = url;
    
    // Convert edit links to preview links
    if (modifiedUrl.includes('/edit')) {
      modifiedUrl = modifiedUrl.replace('/edit', '/preview');
    }
    
    // Handle different Google Drive URL formats
    if (modifiedUrl.includes('drive.google.com/file/d/')) {
      // Format: https://drive.google.com/file/d/FILE_ID/view
      // Make sure it ends with /preview for embedding
      const fileIdMatch = modifiedUrl.match(/\/file\/d\/([^\/]+)/);
      if (fileIdMatch && fileIdMatch[1]) {
        modifiedUrl = `https://drive.google.com/file/d/${fileIdMatch[1]}/preview`;
      }
    } else if (modifiedUrl.includes('drive.google.com/open?id=')) {
      // Format: https://drive.google.com/open?id=FILE_ID
      // Convert to /preview format for embedding
      const fileIdMatch = modifiedUrl.match(/id=([^&]+)/);
      if (fileIdMatch && fileIdMatch[1]) {
        modifiedUrl = `https://drive.google.com/file/d/${fileIdMatch[1]}/preview`;
      }
    } else if (modifiedUrl.includes('docs.google.com')) {
      // For Google Docs, Sheets, Slides
      if (!modifiedUrl.includes('/preview')) {
        // Remove any existing parameters
        const baseUrl = modifiedUrl.split('?')[0];
        // Add preview mode
        modifiedUrl = `${baseUrl}/preview`;
      }
    }
    
    // Add embedded parameter if not already present
    if (!modifiedUrl.includes('embedded=true')) {
      modifiedUrl += (modifiedUrl.includes('?') ? '&' : '?') + 'embedded=true';
    }
    
    return modifiedUrl;
  };

  if (loading) {
    return <div className="loading">Loading attachment...</div>;
  }

  if (error || !attachment) {
    return (
      <div className="attachment-error">
        <h3>Error</h3>
        <p>{error || 'Attachment not found'}</p>
      </div>
    );
  }

  return (
    <div className="attachment-viewer-page">

      <div className="attachment-viewer-content">
        {attachment.source === 'drive' ? (
          <div className="drive-viewer">
            <iframe 
              src={getModifiedDriveUrl(attachment.url)}
              title={attachment.name}
              width="100%" 
              height="800px"
              style={{ border: 'none' }}
              allow="autoplay"
            />
          </div>
        ) : attachment.type === 'application/pdf' ? (
          <div className="pdf-viewer">
            <iframe 
              src={attachment.url} 
              title={attachment.name}
              width="100%" 
              height="800px"
              style={{ border: 'none' }}
            />
          </div>
        ) : (
          <div className="unsupported-file">
            <p>This file type cannot be previewed.</p>
            <a href={attachment.url} target="_blank" rel="noopener noreferrer" className="download-button">
              Download {attachment.name}
            </a>
          </div>
        )}
      </div>
    </div>
  );
};
