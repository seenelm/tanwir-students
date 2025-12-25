import React from 'react';
import { Card } from '../Card';
import { CourseAttachment } from '../../services/courses/types/course';
import { useNavigate } from 'react-router';

interface AttachmentCardProps {
  attachment: CourseAttachment;
  courseId: string | null;
}

export const AttachmentCard: React.FC<AttachmentCardProps> = ({
  attachment,
  courseId
}) => {
  
  const navigate = useNavigate();
  
  const handleCardClick = () => {
    if (courseId) {
      navigate(`/courses/${courseId}/attachments/${attachment.id}`);
    } else {
      console.error('Cannot navigate to attachment');
    }
  };

  // Get the appropriate icon based on attachment type
  const getAttachmentIcon = () => {
    if (attachment.source === 'drive') {
      return (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 2L4.5 20.29l.71.71L12 18l6.79 3 .71-.71z"></path>
          <path d="M9.13 9.13L2 20.29l2.5.5L12 18l7.5 2.79 2.5-.5L16.87 9.13"></path>
          <path d="M12 2v16"></path>
        </svg>
      );
    } else if (attachment.type === 'application/pdf') {
      return (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
          <polyline points="14 2 14 8 20 8"></polyline>
          <line x1="16" y1="13" x2="8" y2="13"></line>
          <line x1="16" y1="17" x2="8" y2="17"></line>
          <polyline points="10 9 9 9 8 9"></polyline>
        </svg>
      );
    } else {
      return (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"></path>
          <polyline points="13 2 13 9 20 9"></polyline>
        </svg>
      );
    }
  };

  // Get the attachment type display text
  const getAttachmentType = () => {
    if (attachment.source === 'drive') {
      return 'Google Drive';
    } else {
      return attachment.type || 'File';
    }
  };

  // Get the footer text
  const getFooter = () => {
    return (
      <>
        <div className="attachment-type-label">{getAttachmentType()}</div>
        <div className="attachment-date">
          {attachment.uploadedAt && 
            new Date(attachment.uploadedAt).toLocaleDateString()
          }
        </div>
      </>
    );
  };

  // Get the description or action text
  const getDescription = () => {
    if (attachment.source === 'drive') {
      return (
        <div className="attachment-action">
          <span className="external-link-icon">↗</span> Opens in new tab
        </div>
      );
    } else {
      return (
        <div className="attachment-action">
          <span className="external-link-icon">↗</span> View attachment
        </div>
      );
    }
  };

  return (
    <Card
      title={attachment.name}
      description={getDescription()}
      footer={getFooter()}
      onClick={handleCardClick}
      icon={getAttachmentIcon()}
    />
  );
};
