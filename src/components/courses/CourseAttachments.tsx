import React from 'react';
import { CourseAttachment } from '../../services/courses/types/course';
import { usePage } from '../../context/PageContext';
import { AttachmentCard } from './AttachmentCard';
import './CourseAttachments.css';

interface CourseAttachmentsProps {
  attachments: CourseAttachment[];
}

export const CourseAttachments: React.FC<CourseAttachmentsProps> = ({ attachments }) => {
  const { courseId } = usePage();

  if (!attachments || attachments.length === 0) {
    return <p className="empty">No attachments available for this course.</p>;
  }

  return (
    <div className="course-attachments">
      <div className="attachments-grid">
        {attachments.map((attachment) => (
          <AttachmentCard 
            key={attachment.id}
            attachment={attachment}
            courseId={courseId}
          />
        ))}
      </div>
    </div>
  );
};
