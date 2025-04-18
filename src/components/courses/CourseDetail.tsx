import React, { useEffect, useState } from 'react';
import { CourseService } from '../../services/courses/service/CourseService';
import { Course } from '../../services/courses/types/course';
import { usePage } from '../../context/PageContext';
import { AuthService, UserRole } from '../../services/auth';
import { AssignmentService } from '../../services/assignments/service/AssignmentService';

// Syllabus data structure
interface SyllabusSemester {
  name: string;
  courses: string[];
}

interface SyllabusData {
  title: string;
  overview?: string[];
  audience?: string[];
  semesters?: SyllabusSemester[];
}

type TabType = 'overview' | 'syllabus' | 'grades';

interface StudentGrade {
  assignmentId: string;
  assignmentTitle: string;
  score: number;
  totalPoints: number;
  submittedAt: Date;
}

interface StudentGrades {
  studentId: string;
  studentName: string;
  grades: StudentGrade[];
}

export const CourseDetail: React.FC = () => {
  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const [studentGrades, setStudentGrades] = useState<StudentGrade[]>([]);
  const [allStudentGrades, setAllStudentGrades] = useState<StudentGrades[]>([]);
  const [gradesLoading, setGradesLoading] = useState(false);
  const [expandedStudentId, setExpandedStudentId] = useState<string | null>(null);
  const { courseId } = usePage();
  
  useEffect(() => {
    const courseService = CourseService.getInstance();
    const authService = AuthService.getInstance();
  
    const fetchCourseDetail = async () => {
      if (!courseId) return;
  
      setLoading(true);
  
      // First try from cache
      let fetchedCourse = courseService.getCourseById(courseId);
  
      if (!fetchedCourse) {
        // If not found in cache, fetch all and retry
        await courseService.getCourses(); // This will fill the cache
        fetchedCourse = courseService.getCourseById(courseId);
      }
  
      setCourse(fetchedCourse ?? null);
      
      // Get user role
      const role = await authService.getUserRole();
      setUserRole(role);
      
      setLoading(false);
    };
  
    fetchCourseDetail();
  }, [courseId]);
  
  useEffect(() => {
    // Fetch grades data when the grades tab is active and we have course data
    if (activeTab === 'grades' && course && userRole) {
      fetchGradesData();
    }
  }, [activeTab, course, userRole]);
  
  const fetchGradesData = async () => {
    if (!course || !userRole) return;
    
    setGradesLoading(true);
    
    try {
      const authService = AuthService.getInstance();
      const assignmentService = AssignmentService.getInstance();
      
      // Get all assignments for this course
      const assignments = await assignmentService.getAssignments();
      const courseAssignments = assignments.filter(a => a.CourseId === course.Id);
      
      if (userRole === 'student') {
        // For students, fetch only their own grades
        const currentUser = authService.getCurrentUser();
        if (currentUser) {
          // This is a placeholder - in a real implementation, you would fetch the student's grades
          // from a studentAssignments collection or similar
          const mockStudentGrades: StudentGrade[] = courseAssignments.map(assignment => ({
            assignmentId: assignment.AssignmentId,
            assignmentTitle: assignment.Title,
            score: Math.floor(Math.random() * assignment.Points), // Mock data
            totalPoints: assignment.Points,
            submittedAt: new Date(Date.now() - Math.random() * 604800000) // Random date within the last week
          }));
          
          setStudentGrades(mockStudentGrades);
        }
      } else if (userRole === 'admin') {
        // For admins, fetch grades for all enrolled students
        if (course.Enrollments && course.Enrollments.length > 0) {
          // Log the entire enrollments array to inspect its structure
          console.log('All enrollments:', JSON.stringify(course.Enrollments));
          
          // This is a placeholder - in a real implementation, you would fetch grades for all students
          const mockAllStudentGrades: StudentGrades[] = course.Enrollments.map((enrollment, index) => {
            // Log each enrollment object to see its structure
            console.log(`Enrollment ${index} full object:`, enrollment);
            
            // Create a unique ID using the index if EnrolleeId is not available
            const studentId = `student-${index}`;
            
            return {
              studentId: studentId,
              studentName: enrollment.Name,
              grades: courseAssignments.map(assignment => ({
                assignmentId: assignment.AssignmentId,
                assignmentTitle: assignment.Title,
                score: Math.floor(Math.random() * assignment.Points), // Mock data
                totalPoints: assignment.Points,
                submittedAt: new Date(Date.now() - Math.random() * 604800000) // Random date within the last week
              }))
            };
          });
          
          console.log('All student grades with IDs:', mockAllStudentGrades.map(s => ({ id: s.studentId, name: s.studentName })));
          setAllStudentGrades(mockAllStudentGrades);
        }
      }
    } catch (error) {
      console.error('Error fetching grades data:', error);
    } finally {
      setGradesLoading(false);
    }
  };
  
  const toggleStudentExpand = (studentId: string) => {
    console.log('Toggling student:', studentId, 'Current expanded:', expandedStudentId);
    // If the student is already expanded, close it
    // Otherwise, open this student and close any others
    setExpandedStudentId(prevId => prevId === studentId ? null : studentId);
  };
  
  const renderContent = () => {
    if (activeTab === 'overview' && course) {
      return (
        <div className="course-overview">
          <div className="course-description">
            <h3>About this course</h3>
            <p>{course.Description}</p>
          </div>
          
          <div className="course-instructor">
            <h3>Instructor</h3>
            <p>{course.CreatedBy}</p>
          </div>
          
          <div className="course-students">
            <h3>Enrolled Students</h3>
            {course.Enrollments && course.Enrollments.length > 0 ? (
              <ul className="students-list">
                {course.Enrollments.map((enrollment, index) => {
                  return (
                    <li key={index}>
                      {enrollment.Name || `Student ${index + 1}`}
                      <span style={{ fontSize: '0.8em', color: 'gray', marginLeft: '5px' }}>
                        (ID: {enrollment.EnrolleeId || 'unknown'})
                      </span>
                    </li>
                  );
                })}
              </ul>
            ) : (
              <p className="empty">No students enrolled yet.</p>
            )}
          </div>
        </div>
      );
    }
    
    if (activeTab === 'syllabus') {
      return (
        <div className="course-syllabus">
  <h3>Course Syllabus</h3>
  {course?.Syllabus ? (
    (() => {
      let syllabus: SyllabusData;
      try {
        syllabus = JSON.parse(course.Syllabus) as SyllabusData;
      } catch (err) {
        return <p className="error">Invalid syllabus format.</p>;
      }

      return (
        <div className="syllabus-content">
          {syllabus.overview && (
            <>
              <h5>Overview</h5>
              <ul>
                {syllabus.overview.map((item: string, index: number) => (
                  <li key={`overview-${index}`}>{item}</li>
                ))}
              </ul>
            </>
          )}

          {syllabus.audience && (
            <>
              <h5>Who is this for?</h5>
              <ul>
                {syllabus.audience.map((item: string, index: number) => (
                  <li key={`audience-${index}`}>{item}</li>
                ))}
              </ul>
            </>
          )}

          {syllabus.semesters && (
            <>
              <h5>Semesters</h5>
              {syllabus.semesters.map((sem: SyllabusSemester, i: number) => (
                <div key={`semester-${i}`}>
                  <strong>{sem.name}</strong>
                  <ul>
                    {sem.courses.map((course: string, j: number) => (
                      <li key={`course-${j}`}>{course}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </>
          )}
        </div>
      );
    })()
  ) : (
    <p className="empty">No syllabus content available for this course.</p>
  )}
</div>

      );
    }
    
    if (activeTab === 'grades') {
      if (gradesLoading) {
        return <p className="loading">Loading grades...</p>;
      }
      
      if (userRole === 'student') {
        return (
          <div className="student-grades">
            <h3>Your Grades</h3>
            {studentGrades.length > 0 ? (
              <div className="grades-table-container">
                <table className="grades-table">
                  <thead>
                    <tr>
                      <th>Assignment</th>
                      <th>Score</th>
                      <th>Percentage</th>
                      <th>Submitted</th>
                    </tr>
                  </thead>
                  <tbody>
                    {studentGrades.map((grade, index) => (
                      <tr key={index}>
                        <td>{grade.assignmentTitle}</td>
                        <td>{grade.score} / {grade.totalPoints}</td>
                        <td>{Math.round((grade.score / grade.totalPoints) * 100)}%</td>
                        <td>{grade.submittedAt.toLocaleDateString()}</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr>
                      <td><strong>Total</strong></td>
                      <td>
                        <strong>
                          {studentGrades.reduce((sum, grade) => sum + grade.score, 0)} / 
                          {studentGrades.reduce((sum, grade) => sum + grade.totalPoints, 0)}
                        </strong>
                      </td>
                      <td>
                        <strong>
                          {Math.round(
                            (studentGrades.reduce((sum, grade) => sum + grade.score, 0) / 
                             studentGrades.reduce((sum, grade) => sum + grade.totalPoints, 0)) * 100
                          )}%
                        </strong>
                      </td>
                      <td></td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            ) : (
              <p className="empty">No grades available yet.</p>
            )}
          </div>
        );
      } else if (userRole === 'admin') {
        return (
          <div className="admin-grades">
            <h3>Student Grades</h3>
            {allStudentGrades.length > 0 ? (
              <div className="student-grades-list">
                {allStudentGrades.map((student) => {
                  console.log('Rendering student:', student.studentName, 'ID:', student.studentId, 'Expanded:', expandedStudentId === student.studentId);
                  return (
                    <div key={student.studentId} className="student-grades-item">
                      <div 
                        className="student-header" 
                        onClick={() => toggleStudentExpand(student.studentId)}
                      >
                        <h4>{student.studentName}</h4>
                        <span className={`expand-icon ${expandedStudentId === student.studentId ? 'expanded' : ''}`}>
                          {expandedStudentId === student.studentId ? '▼' : '►'}
                        </span>
                      </div>
                      
                      {expandedStudentId === student.studentId && (
                        <div className="grades-table-container">
                          <table className="grades-table">
                            <thead>
                              <tr>
                                <th>Assignment</th>
                                <th>Score</th>
                                <th>Percentage</th>
                                <th>Submitted</th>
                              </tr>
                            </thead>
                            <tbody>
                              {student.grades.map((grade, index) => (
                                <tr key={index}>
                                  <td>{grade.assignmentTitle}</td>
                                  <td>{grade.score} / {grade.totalPoints}</td>
                                  <td>{Math.round((grade.score / grade.totalPoints) * 100)}%</td>
                                  <td>{grade.submittedAt.toLocaleDateString()}</td>
                                </tr>
                              ))}
                            </tbody>
                            <tfoot>
                              <tr>
                                <td><strong>Total</strong></td>
                                <td>
                                  <strong>
                                    {student.grades.reduce((sum, grade) => sum + grade.score, 0)} / 
                                    {student.grades.reduce((sum, grade) => sum + grade.totalPoints, 0)}
                                  </strong>
                                </td>
                                <td>
                                  <strong>
                                    {Math.round(
                                      (student.grades.reduce((sum, grade) => sum + grade.score, 0) / 
                                       student.grades.reduce((sum, grade) => sum + grade.totalPoints, 0)) * 100
                                    )}%
                                  </strong>
                                </td>
                                <td></td>
                              </tr>
                            </tfoot>
                          </table>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="empty">No student grades available yet.</p>
            )}
          </div>
        );
      } else {
        return <p className="empty">You don't have permission to view grades.</p>;
      }
    }
    
    return null;
  };
  
  if (loading) {
    return <div className="loading">Loading course details...</div>;
  }
  
  if (!course) {
    return <div className="error">Course not found</div>;
  }
  
  return (
    <div className="course-detail">
      <div className="course-header">
        <h2>{course.Name}</h2>
        <div className="course-meta">
          <span className="level">Level: {course.Level}</span>
          <span className="enrollment">Students: {course.Enrollments.length}</span>
        </div>
      </div>
      
      <div className="tabs">
        {['overview', 'syllabus', 'grades'].map(tab => (
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