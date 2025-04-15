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
  const [tabData, setTabData] = useState<any[]>([]);
  const [tabLoading, setTabLoading] = useState(false);
  const service = AssignmentService.getInstance();

  useEffect(() => {
    if (!assignmentId) return;
    const fetchAssignment = async () => {
      const result = await service.getAssignmentById(assignmentId);
      setAssignment(result);
      setLoading(false);
    };
    fetchAssignment();
  }, [assignmentId]);

  useEffect(() => {
    if (!assignmentId || activeTab === 'details') return;
    const fetchTabData = async () => {
      setTabLoading(true);
      try {
        let data = [];
        switch (activeTab) {
          case 'attachments':
            data = await service.getAttachments(assignmentId);
            break;
          case 'discussions':
            data = await service.getDiscussions(assignmentId);
            break;
          case 'questions':
            data = await service.getQuestions(assignmentId);
            break;
        }
        setTabData(data);
      } catch (error) {
        console.error(`Error loading ${activeTab}:`, error);
      } finally {
        setTabLoading(false);
      }
    };
    fetchTabData();
  }, [activeTab, assignmentId]);

  const renderContent = () => {
    if (tabLoading) return <p className="loading">Loading {activeTab}...</p>;

    if (activeTab === 'details' && assignment) {
      return (
        <div className="details">
          <div className="meta">
            <p><strong>Course:</strong> {assignment.CourseName}</p>
            <p><strong>Created By:</strong> {assignment.CreatedBy}</p>
            <p><strong>Due:</strong> {new Date(assignment.DueDate).toLocaleString()}</p>
            <p><strong>Points:</strong> {assignment.Points}</p>
          </div>
          <div className="description">
            <h3>Description</h3>
            <p>{assignment.Description}</p>
          </div>
        </div>
      );
    }

    if (tabData.length === 0) {
      return <p className="empty">No {activeTab} available.</p>;
    }

    return (
      <ul className="data-list">
        {tabData.map((item: any, index: number) => {
          if (activeTab === 'questions') {
            return (
              <li key={item.id || index}>
                <strong>{item.Question || item.question}</strong> ({item.Points || item.points} pts)
                <div>Type: {item.Type || item.type}</div>
                {item.Options && (
                  <ul className="options">
                    {item.Options.map((opt: string, i: number) => <li key={i}>{opt}</li>)}
                  </ul>
                )}
              </li>
            );
          }
          return <li key={item.id || index}>{item.name || item.message}</li>;
        })}
      </ul>
    );
  };

  if (loading) return <div>Loading assignment...</div>;
  if (!assignment) return <div>Assignment not found</div>;

  return (
    <div className="assignment-container">
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
      {renderContent()}
    </div>
  );
};
