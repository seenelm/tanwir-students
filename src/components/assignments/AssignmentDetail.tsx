import React, { useEffect, useState } from 'react';
import { Assignment } from '../../services/assignments/types/assignment';
import { AssignmentService } from '../../services/assignments/service/AssignmentService';
import { usePage } from '../../context/PageContext';

type TabType = 'details' | 'attachments' | 'discussions' | 'questions';

export const AssignmentDetail: React.FC = () => {
  const { assignmentId } = usePage();
  const [assignment, setAssignment] = useState<Assignment | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabType>('details');
  const [attachments, setAttachments] = useState<any[]>([]);
  const [discussions, setDiscussions] = useState<any[]>([]);
  const [questions, setQuestions] = useState<any[]>([]);
  const [tabLoading, setTabLoading] = useState(false);

  const service = AssignmentService.getInstance();

  useEffect(() => {
    const loadAssignment = async () => {
      if (!assignmentId) return;
      const result = await service.getAssignmentById(assignmentId);
      setAssignment(result);
      setLoading(false);
    };

    loadAssignment();
  }, [assignmentId]);

  useEffect(() => {
    if (!assignmentId) return;

    const loadTabData = async () => {
      try {
        setTabLoading(true);
        if (activeTab === 'attachments') {
          const data = await service.getAttachments(assignmentId);
          console.log('Attachments data:', data);
          setAttachments(data);
        } else if (activeTab === 'discussions') {
          const data = await service.getDiscussions(assignmentId);
          console.log('Discussions data:', data);
          setDiscussions(data);
        } else if (activeTab === 'questions') {
          const data = await service.getQuestions(assignmentId);
          console.log('Questions data:', data);
          setQuestions(data);
        }
      } catch (error) {
        console.error(`Error loading ${activeTab} data:`, error);
      } finally {
        setTabLoading(false);
      }
    };

    loadTabData();
  }, [activeTab, assignmentId]);

  if (loading) return <div>Loading assignment...</div>;
  if (!assignment) return <div>Assignment not found</div>;

  const renderTabContent = () => {
    if (tabLoading) {
      return <div className="tab-loading">Loading {activeTab}...</div>;
    }

    switch (activeTab) {
      case 'attachments':
        return attachments.length > 0 ? 
          <ul className="attachments-list">{attachments.map(a => <li key={a.id}>{a.name}</li>)}</ul> :
          <div className="empty-state">No attachments available for this assignment</div>;
      case 'discussions':
        return discussions.length > 0 ? 
          <ul className="discussions-list">{discussions.map(d => <li key={d.id}>{d.message}</li>)}</ul> :
          <div className="empty-state">No discussions available for this assignment</div>;
      case 'questions':
        return questions.length > 0 ? (
          <ul className="questions-list">
            {questions.map(q => (
              <li key={q.id} className="question-item">
                <div className="question-header">
                  <strong>{q.Question || q.question}</strong>
                  <span className="question-points">{q.Points || q.points} points</span>
                </div>
                <div className="question-type">Type: {q.Type || q.type}</div>
                {q.Options && (
                  <div className="question-options">
                    <p>Options:</p>
                    <ul>
                      {q.Options.map((option: string, index: number) => (
                        <li key={index}>{option}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </li>
            ))}
          </ul>
        ) : (
          <div className="empty-state">No questions available for this assignment</div>
        );
      default:
        return (
          <div className="assignment-details-content">
            <div className="assignment-meta-card">
              <div className="meta-item">
                <div className="meta-label">Course</div>
                <div className="meta-value">{assignment.CourseName}</div>
              </div>
              <div className="meta-item">
                <div className="meta-label">Created by</div>
                <div className="meta-value">{assignment.CreatedBy}</div>
              </div>
              <div className="meta-item">
                <div className="meta-label">Due date</div>
                <div className="meta-value">{new Date(assignment.DueDate).toLocaleString()}</div>
              </div>
              <div className="meta-item">
                <div className="meta-label">Points</div>
                <div className="meta-value">{assignment.Points}</div>
              </div>
            </div>
            
            <div className="assignment-description-card">
              <h3>Description</h3>
              <div className="description-content">
                {assignment.Description}
              </div>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="assignment-detail-container">
      <div className="assignment-detail">
        <h2>{assignment.Title}</h2>
        <div className="tabs">
          {['details', 'attachments', 'discussions', 'questions'].map(tab => (
            <button
            key={tab}
            onClick={() => setActiveTab(tab as TabType)}
            className={activeTab === tab ? 'active' : ''}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      <div className="tab-content">
        {renderTabContent()}
      </div>
    </div>
    </div>
  );
};
