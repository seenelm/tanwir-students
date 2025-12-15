import React, { useEffect, useState } from 'react';
import { AttendanceService } from '../../services/attendance/service/AttendanceService';
import { ClassSession, StudentAttendanceSummary, AttendanceRecord } from '../../services/attendance/types/attendance';
import { AuthService, UserRole } from '../../services/auth';
import './CourseAttendance.css';

interface CourseAttendanceProps {
  courseId: string;
  enrolledStudents: any[];
}

export const CourseAttendance: React.FC<CourseAttendanceProps> = ({ courseId, enrolledStudents }) => {
  const [sessions, setSessions] = useState<ClassSession[]>([]);
  const [attendanceSummary, setAttendanceSummary] = useState<StudentAttendanceSummary[]>([]);
  const [selectedSession, setSelectedSession] = useState<ClassSession | null>(null);
  const [sessionAttendance, setSessionAttendance] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [showAddSession, setShowAddSession] = useState(false);
  const [newSessionDate, setNewSessionDate] = useState('');
  const [newSessionTopic, setNewSessionTopic] = useState('');
  const [newSessionDescription, setNewSessionDescription] = useState('');
  const [view, setView] = useState<'summary' | 'sessions'>('summary');
  const [activeSessions, setActiveSessions] = useState<ClassSession[]>([]);
  const [markedSessionIds, setMarkedSessionIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    const authService = AuthService.getInstance();
    const user = authService.getCurrentUser();
    
    if (user) {
      setCurrentUserId(user.uid);
      authService.getUserRole().then(role => {
        setUserRole(role);
      });
    }

    loadData();
  }, [courseId, enrolledStudents]);

  // Reload data when currentUserId changes to check marked sessions
  useEffect(() => {
    if (currentUserId) {
      console.log('Current user ID set, reloading data to check marked sessions');
      loadData();
    }
  }, [currentUserId]);

  const loadData = async () => {
    setLoading(true);
    try {
      const attendanceService = AttendanceService.getInstance();
      
      console.log('Loading attendance data for course:', courseId);
      
      // Load sessions
      const sessionsData = await attendanceService.getClassSessions(courseId);
      console.log('Sessions loaded:', sessionsData);
      setSessions(sessionsData);
  
      // Load attendance summary
      const summary = await attendanceService.getAttendanceSummary(courseId, enrolledStudents);
      console.log('Attendance summary loaded:', summary);
      setAttendanceSummary(summary);
  
      // Check for active sessions (plural)
      const active = await attendanceService.getActiveSessions(courseId);
      console.log('Active sessions:', active);
      setActiveSessions(active);

      // Check which active sessions current user has already marked
      if (active.length > 0 && currentUserId) {
        const marked = new Set<string>();
        for (const session of active) {
          const attendanceRecords = await attendanceService.getAttendanceForSession(session.Id);
          const hasMarked = attendanceRecords.some(record => record.StudentId === currentUserId);
          if (hasMarked) {
            marked.add(session.Id);
          }
        }
        setMarkedSessionIds(marked);
        console.log('User has marked sessions:', Array.from(marked));
      } else {
        setMarkedSessionIds(new Set());
      }
    } catch (error) {
      console.error('Error loading attendance data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadSessionAttendance = async (session: ClassSession) => {
    try {
      const attendanceService = AttendanceService.getInstance();
      const records = await attendanceService.getAttendanceForSession(session.Id);
      setSessionAttendance(records);
      setSelectedSession(session);
    } catch (error) {
      console.error('Error loading session attendance:', error);
    }
  };

  const handleAddSession = async () => {
    if (!newSessionDate || !currentUserId) return;

    try {
      const attendanceService = AttendanceService.getInstance();
      await attendanceService.createClassSession(
        courseId,
        new Date(newSessionDate),
        newSessionTopic,
        newSessionDescription,
        currentUserId
      );

      // Reset form
      setNewSessionDate('');
      setNewSessionTopic('');
      setNewSessionDescription('');
      setShowAddSession(false);

      // Reload data
      await loadData();
    } catch (error) {
      console.error('Error creating class session:', error);
      alert('Failed to create class session');
    }
  };

  const handleMarkAttendance = async (
    studentId: string,
    studentName: string,
    status: 'present' | 'absent' | 'late' | 'excused'
  ) => {
    if (!selectedSession || !currentUserId) return;

    try {
      const attendanceService = AttendanceService.getInstance();
      await attendanceService.markAttendance(
        courseId,
        selectedSession.Id,
        studentId,
        studentName,
        status,
        currentUserId
      );

      // Reload session attendance
      await loadSessionAttendance(selectedSession);
      await loadData(); // Reload summary
    } catch (error) {
      console.error('Error marking attendance:', error);
      alert('Failed to mark attendance');
    }
  };

  const handleOpenSession = async (session: ClassSession) => {
    try {
      const attendanceService = AttendanceService.getInstance();
      await attendanceService.openAttendanceSession(session.Id);
      await loadData(); // Reload to update active sessions
      alert('Attendance session opened! Students can now mark themselves present.');
    } catch (error) {
      console.error('Error opening session:', error);
      alert('Failed to open attendance session');
    }
  };

  const handleCloseSession = async (session: ClassSession) => {
    try {
      const attendanceService = AttendanceService.getInstance();
      await attendanceService.closeAttendanceSession(session.Id);
      await loadData(); // Reload to update active sessions
      alert('Attendance session closed.');
    } catch (error) {
      console.error('Error closing session:', error);
      alert('Failed to close attendance session');
    }
  };

  const handleMarkSessionPresent = async (session: ClassSession) => {
    console.log('handleMarkSessionPresent called for session:', session.Id);
    console.log('Current user ID:', currentUserId);
    console.log('Already marked?', markedSessionIds.has(session.Id));
    
    if (!currentUserId || markedSessionIds.has(session.Id)) {
      console.log('Returning early - no user ID or already marked');
      return;
    }

    try {
      const attendanceService = AttendanceService.getInstance();
      const currentStudent = enrolledStudents.find(s => 
        (s.uid || s.id || s.studentId) === currentUserId
      );
      
      console.log('Current student found:', currentStudent);
      
      if (!currentStudent) {
        console.log('No current student found');
        return;
      }

      const studentName = getDisplayName(currentStudent);
      console.log('Marking attendance for:', studentName);
      
      const result = await attendanceService.studentMarkPresent(
        courseId,
        session.Id,
        currentUserId,
        studentName
      );

      console.log('Mark attendance result:', result);

      if (result.success) {
        await loadData(); // Reload to update marked sessions
      }
    } catch (error) {
      console.error('Error marking attendance:', error);
    }
  };

  const getStudentAttendanceStatus = (studentId: string): string => {
    const record = sessionAttendance.find(r => r.StudentId === studentId);
    return record ? record.Status : 'unmarked';
  };

  const getDisplayName = (student: any): string => {
    if (student.studentInfo) {
      const info = student.studentInfo;
      if (info.firstName && info.lastName) {
        return `${info.firstName} ${info.lastName}`;
      } else if (info.firstName) {
        return info.firstName;
      } else if (info.lastName) {
        return info.lastName;
      } else if (info.name) {
        return info.name;
      }
    }
    
    if (student.email && !student.email.includes('ID:') && !student.uid?.includes(student.email)) {
      return student.email;
    }
    
    if (student.FirstName || student.LastName) {
      return `${student.FirstName || ''} ${student.LastName || ''}`.trim();
    }
    
    if (student.displayName) {
      return student.displayName;
    }
    
    if (student.uid && student.uid.includes('@') && !student.uid.includes('ID:')) {
      return student.uid;
    }
    
    return 'Unknown';
  };

  const formatDate = (timestamp: any): string => {
    if (!timestamp) return 'N/A';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  if (loading) {
    return <div className="loading">Loading attendance data...</div>;
  }

  // Debug logging
  console.log('CourseAttendance Debug:', {
    userRole,
    activeSessions,
    shouldShowBanner: userRole !== 'admin' && activeSessions.length > 0,
    currentUserId,
    sessionsCount: sessions.length,
    markedSessionIds: Array.from(markedSessionIds)
  });

  return (
    <div className="course-attendance">
      <div className="attendance-header">
        <h3>Course Attendance</h3>
        <div className="view-toggle">
          <button 
            className={view === 'summary' ? 'active' : ''} 
            onClick={() => setView('summary')}
          >
            Summary
          </button>
          <button 
            className={view === 'sessions' ? 'active' : ''} 
            onClick={() => setView('sessions')}
          >
            Sessions
          </button>
        </div>
      </div>

      {/* Student Self-Mark Section */}
      {userRole !== 'admin' && activeSessions.length > 0 && (
        <div className="student-self-mark">
          <h4>Open Attendance Sessions</h4>
          <div className="active-sessions-list">
            {activeSessions.map(session => {
              const isMarked = markedSessionIds.has(session.Id);
              return (
                <div key={session.Id} className="active-session-item">
                  <div className="session-info">
                    <div className="session-topic">{session.Topic || 'Class Session'}</div>
                    <div className="session-date">{formatDate(session.Date)}</div>
                  </div>
                  {isMarked ? (
                    <button className="btn-marked" disabled>
                      Marked Present
                    </button>
                  ) : (
                    <button 
                      className="btn-mark-present" 
                      onClick={() => handleMarkSessionPresent(session)}
                    >
                      Mark Present
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {view === 'summary' && (
        <div className="attendance-summary">
          <h4>Student Attendance Summary</h4>
          {attendanceSummary.length > 0 ? (
            <div className="table-scroll-container">
              <table className="summary-table">
                <thead>
                  <tr>
                    <th>Student Name</th>
                    <th>Total Classes</th>
                    <th>Present</th>
                    <th>Absent</th>
                    <th>Late</th>
                    <th>Excused</th>
                    <th>Attendance Rate</th>
                  </tr>
                </thead>
                <tbody>
                  {attendanceSummary.map(summary => (
                    <tr key={summary.StudentId}>
                      <td>{summary.StudentName}</td>
                      <td>{summary.TotalClasses}</td>
                      <td className="status-present">{summary.Present}</td>
                      <td className="status-absent">{summary.Absent}</td>
                      <td className="status-late">{summary.Late}</td>
                      <td className="status-excused">{summary.Excused}</td>
                      <td>
                        <span className={`rate ${summary.AttendanceRate >= 80 ? 'good' : summary.AttendanceRate >= 60 ? 'warning' : 'poor'}`}>
                          {summary.AttendanceRate}%
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="empty">No attendance data available yet.</p>
          )}
        </div>
      )}

      {view === 'sessions' && (
        <div className="attendance-sessions">
          {userRole === 'admin' && (
            <div className="add-session-section">
              {!showAddSession ? (
                <button className="add-session-btn" onClick={() => setShowAddSession(true)}>
                  + Add Class Session
                </button>
              ) : (
                <div className="add-session-form">
                  <h4>New Class Session</h4>
                  <div className="form-group">
                    <label>Date & Time:</label>
                    <input
                      type="datetime-local"
                      value={newSessionDate}
                      onChange={(e) => setNewSessionDate(e.target.value)}
                    />
                  </div>
                  <div className="form-group">
                    <label>Topic:</label>
                    <input
                      type="text"
                      value={newSessionTopic}
                      onChange={(e) => setNewSessionTopic(e.target.value)}
                      placeholder="e.g., Introduction to Islamic History"
                    />
                  </div>
                  <div className="form-group">
                    <label>Description:</label>
                    <textarea
                      value={newSessionDescription}
                      onChange={(e) => setNewSessionDescription(e.target.value)}
                      placeholder="Optional description..."
                      rows={3}
                    />
                  </div>
                  <div className="form-actions">
                    <button className="btn-primary" onClick={handleAddSession}>
                      Create Session
                    </button>
                    <button className="btn-secondary" onClick={() => setShowAddSession(false)}>
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          <div className="sessions-list">
            <h4>Class Sessions ({sessions.length})</h4>
            {sessions.length > 0 ? (
              <div className="sessions-grid">
                {sessions.map(session => (
                  <div 
                    key={session.Id} 
                    className={`session-card ${selectedSession?.Id === session.Id ? 'selected' : ''} ${session.IsActive ? 'active-session' : ''}`}
                    onClick={() => loadSessionAttendance(session)}
                  >
                    <div className="session-date">{formatDate(session.Date)}</div>
                    <div className="session-topic">{session.Topic || 'Class Session'}</div>
                    {session.Description && (
                      <div className="session-description">{session.Description}</div>
                    )}
                    {session.IsActive && (
                      <div className="session-status-badge active">🟢 Open for Attendance</div>
                    )}
                    {userRole === 'admin' && (
                      <div className="session-actions" onClick={(e) => e.stopPropagation()}>
                        {session.IsActive ? (
                          <button 
                            className="btn-close-session"
                            onClick={() => handleCloseSession(session)}
                          >
                            Close Session
                          </button>
                        ) : (
                          <button 
                            className="btn-open-session"
                            onClick={() => handleOpenSession(session)}
                          >
                            Open Session
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="empty">No class sessions created yet.</p>
            )}
          </div>

          {selectedSession && userRole === 'admin' && (
            <div className="session-attendance">
              <h4>Mark Attendance - {formatDate(selectedSession.Date)}</h4>
              <table className="attendance-table">
                <thead>
                  <tr>
                    <th>Student Name</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {enrolledStudents.map(student => {
                    const studentId = student.uid || student.id || student.studentId;
                    const studentName = getDisplayName(student);
                    const status = getStudentAttendanceStatus(studentId);

                    return (
                      <tr key={studentId}>
                        <td>{studentName}</td>
                        <td>
                          <span className={`status-badge status-${status}`}>
                            {status.charAt(0).toUpperCase() + status.slice(1)}
                          </span>
                        </td>
                        <td className="action-buttons">
                          <button
                            className={`btn-status ${status === 'present' ? 'active' : ''}`}
                            onClick={() => handleMarkAttendance(studentId, studentName, 'present')}
                          >
                            Present
                          </button>
                          <button
                            className={`btn-status ${status === 'absent' ? 'active' : ''}`}
                            onClick={() => handleMarkAttendance(studentId, studentName, 'absent')}
                          >
                            Absent
                          </button>
                          <button
                            className={`btn-status ${status === 'late' ? 'active' : ''}`}
                            onClick={() => handleMarkAttendance(studentId, studentName, 'late')}
                          >
                            Late
                          </button>
                          <button
                            className={`btn-status ${status === 'excused' ? 'active' : ''}`}
                            onClick={() => handleMarkAttendance(studentId, studentName, 'excused')}
                          >
                            Excused
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {selectedSession && userRole !== 'admin' && (
            <div className="student-session-view">
              <h4>Session Details - {formatDate(selectedSession.Date)}</h4>
              {selectedSession.IsActive ? (
                <div className="student-active-session">
                  <p>This attendance session is currently open. Use the "Mark Myself Present" button above to mark your attendance.</p>
                </div>
              ) : (
                <p>This attendance session is closed. Contact your instructor if you need to update your attendance.</p>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
