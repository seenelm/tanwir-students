import React, { useEffect, useState } from 'react';
import { AuthService, AuthorizedUser } from '../../services/auth';
import '../../styles/students.css';

// Define Firestore timestamp interface
interface FirestoreTimestamp {
  seconds: number;
  nanoseconds: number;
  toDate?: () => Date;
}

// Update the interface to handle Firestore timestamp
interface StudentWithDetails extends Omit<AuthorizedUser, 'CreatedAt'> {
  CreatedAt?: Date | FirestoreTimestamp;
  created?: Date | FirestoreTimestamp;
  createdAt?: Date | FirestoreTimestamp; // Additional possible field name
  studentInfo?: {
    firstName?: string;
    lastName?: string;
    email?: string;
    phone?: string;
    gender?: string;
    age?: string;
    studentType?: string;
    password?: string;
    [key: string]: any;
  };
  courses?: Array<{
    courseId?: string;
    courseName?: string;
    courseType?: string;
    createdOn?: string;
    orderNumber?: string;
    metadata?: {
      lastUpdated?: string;
      orderNumber?: string;
      [key: string]: any;
    };
    guidanceDetails?: {
      imageUrl?: string;
      module?: string;
      plan?: string;
      section?: string;
      status?: string;
      [key: string]: any;
    };
    placementInfo?: {
      arabicProficiency?: string;
      interestReason?: string;
      level?: string;
      listeningAbility?: string;
      plan?: string;
      previousTopics?: string;
      readingAbility?: string;
      section?: string;
      studiedIslamicSciences?: string;
      writingAbility?: string;
      [key: string]: any;
    };
    [key: string]: any;
  }>;
}

export const Students: React.FC = () => {
  const [students, setStudents] = useState<StudentWithDetails[]>([]);
  const [filteredStudents, setFilteredStudents] = useState<StudentWithDetails[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedStudent, setSelectedStudent] = useState<StudentWithDetails | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>('');

  useEffect(() => {
    const fetchStudents = async () => {
      setLoading(true);
      try {
        const authService = AuthService.getInstance();
        const allUsers = await authService.getAllUsers();
        console.log('Raw users data:', allUsers);
        // Filter out admin users, only keep students
        const onlyStudents = allUsers.filter(user => user.Role !== 'admin');
        setStudents(onlyStudents as StudentWithDetails[]);
        setFilteredStudents(onlyStudents as StudentWithDetails[]);
        setError(null);
      } catch (err) {
        console.error('Error fetching students:', err);
        setError('Failed to load students. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchStudents();
  }, []);

  // Filter students when search term changes
  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredStudents(students);
      return;
    }

    const searchTermLower = searchTerm.toLowerCase();
    const filtered = students.filter(student => {
      const name = getDisplayName(student).toLowerCase();
      const email = getEmail(student).toLowerCase();
      const courses = getCoursesString(student).toLowerCase();
      
      return name.includes(searchTermLower) || 
             email.includes(searchTermLower) || 
             courses.includes(searchTermLower);
    });
    
    setFilteredStudents(filtered);
  }, [searchTerm, students]);

  const handleViewDetails = (student: StudentWithDetails) => {
    console.log('Selected student details:', student);
    setSelectedStudent(student);
  };

  const handleCloseDetails = () => {
    setSelectedStudent(null);
  };

  // Helper function to get display name
  const getDisplayName = (student: StudentWithDetails) => {
    // Try to get name from studentInfo first
    if (student.studentInfo) {
      const info = student.studentInfo;
      if (info.firstName || info.lastName) {
        return `${info.firstName || ''} ${info.lastName || ''}`.trim();
      }
    }
    // Fall back to FirstName/LastName
    return `${student.FirstName || ''} ${student.LastName || ''}`.trim() || 'Unknown';
  };

  // Helper function to get email
  const getEmail = (student: StudentWithDetails) => {
    if (student.studentInfo && student.studentInfo.email) {
      return student.studentInfo.email;
    }
    return student.email || 'N/A';
  };

  // Helper function to get course names as a comma-separated string
  const getCoursesString = (student: StudentWithDetails) => {
    if (!student.courses || student.courses.length === 0) {
      return 'Not enrolled';
    }
    
    return student.courses
      .map(course => course.courseName || 'Unnamed Course')
      .join(', ');
  };

  // Helper function to get course section
  const getCourseSection = (course: any) => {
    if (course.section) return course.section;
    if (course.guidanceDetails?.section) return course.guidanceDetails.section;
    if (course.placementInfo?.section) return course.placementInfo.section;
    return 'N/A';
  };

  // Helper function to get course plan
  const getCoursePlan = (course: any) => {
    if (course.plan) return course.plan;
    if (course.guidanceDetails?.plan) return course.guidanceDetails.plan;
    if (course.placementInfo?.plan) return course.placementInfo.plan;
    return 'N/A';
  };

  // Helper function to get course status
  const getCourseStatus = (course: any) => {
    if (course.status) return course.status;
    if (course.guidanceDetails?.status) return course.guidanceDetails.status;
    return 'pending';
  };

  // Helper function to get role display
  const getRoleDisplay = (role?: string) => {
    if (role === 'admin') {
      return 'Admin';
    }
    return 'Student';
  };

  // Helper function to get role class
  const getRoleClass = (role?: string) => {
    if (role === 'admin') {
      return 'admin';
    }
    return 'student';
  };

  return (
    <div className="students-container">
      
      {!selectedStudent && (
        <>
          <div className="search-container">
            <input
              type="text"
              placeholder="Search by name, email, or course..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
            {searchTerm && (
              <button 
                className="clear-search" 
                onClick={() => setSearchTerm('')}
                aria-label="Clear search"
              >
                ×
              </button>
            )}
          </div>
          
          {loading ? (
            <div className="loading">Loading students...</div>
          ) : error ? (
            <div className="error">{error}</div>
          ) : filteredStudents.length === 0 ? (
            <div className="no-students">
              {searchTerm ? 'No students match your search.' : 'No students found.'}
            </div>
          ) : (
            <div className="students-list">
              <div className="table-scroll-container">
                <table>
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Email</th>
                      <th>Courses</th>
                      <th>Role</th>
                      <th>Created</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredStudents.map((student) => (
                      <tr key={student.uid}>
                        <td>{getDisplayName(student)}</td>
                        <td>{getEmail(student)}</td>
                        <td className="courses-cell">{getCoursesString(student)}</td>
                        <td className={`role-text ${getRoleClass(student.Role)}`}>
                          {getRoleDisplay(student.Role)}
                        </td>
                        <td>
                          {student.createdAt instanceof Date 
                            ? student.createdAt.toLocaleDateString() 
                            : student.createdAt && 'seconds' in student.createdAt
                              ? new Date(student.createdAt.seconds * 1000).toLocaleDateString()
                              : student.created instanceof Date 
                                ? student.created.toLocaleDateString() 
                                : student.created && 'seconds' in student.created
                                  ? new Date(student.created.seconds * 1000).toLocaleDateString()
                                  : student.CreatedAt instanceof Date 
                                    ? student.CreatedAt.toLocaleDateString() 
                                    : student.CreatedAt && 'seconds' in student.CreatedAt
                                      ? new Date(student.CreatedAt.seconds * 1000).toLocaleDateString()
                                      : 'N/A'}
                        </td>
                        <td>
                          <button 
                            className="view-button"
                            onClick={() => handleViewDetails(student)}
                          >
                            View Details
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}

      {selectedStudent && (
        <div className="student-detail-content">
          <div className="detail-header">
            <h3>{getDisplayName(selectedStudent)}</h3>
            <button 
              className="back-button" 
              onClick={handleCloseDetails}
              aria-label="Back to students list"
            >
              Back to Students
            </button>
          </div>
          <div className="detail-content">
            <div className="detail-grid">
              <div className="detail-section">
                <h4>Personal Information</h4>
                {selectedStudent.studentInfo ? (
                  <>
                    <div className="detail-item">
                      <span className="label">Email:</span>
                      <span>{getEmail(selectedStudent)}</span>
                    </div>
                    <div className="detail-item">
                      <span className="label">Phone:</span>
                      <span>{selectedStudent.studentInfo.phone || 'N/A'}</span>
                    </div>
                    <div className="detail-item">
                      <span className="label">Gender:</span>
                      <span>{selectedStudent.studentInfo.gender || 'N/A'}</span>
                    </div>
                    <div className="detail-item">
                      <span className="label">Age:</span>
                      <span>{selectedStudent.studentInfo.age || 'N/A'}</span>
                    </div>
                    <div className="detail-item">
                      <span className="label">Student Type:</span>
                      <span>{selectedStudent.studentInfo.studentType || 'N/A'}</span>
                    </div>
                  </>
                ) : (
                  <div className="no-info">No personal information available</div>
                )}
                <div className="detail-item">
                  <span className="label">Role:</span>
                  <span className={`role-text ${getRoleClass(selectedStudent.Role)}`}>
                    {getRoleDisplay(selectedStudent.Role)}
                  </span>
                </div>
              </div>

              <div className="detail-section">
                <h4>Enrolled Courses</h4>
                {selectedStudent.courses && Array.isArray(selectedStudent.courses) && selectedStudent.courses.length > 0 ? (
                  <div className="courses-list">
                    {selectedStudent.courses.map((course, index) => (
                      <div key={course.courseId || index} className="course-item">
                        <h5>{course.courseName || 'Unnamed Course'}</h5>
                        <div className="course-details">
                          <div className="detail-item">
                            <span className="label">Type:</span>
                            <span>{course.courseType || 'N/A'}</span>
                          </div>
                          <div className="detail-item">
                            <span className="label">Section:</span>
                            <span>{getCourseSection(course)}</span>
                          </div>
                          <div className="detail-item">
                            <span className="label">Plan:</span>
                            <span>{getCoursePlan(course)}</span>
                          </div>
                          <div className="detail-item">
                            <span className="label">Status:</span>
                            <span className={`status-text ${getCourseStatus(course)}`}>
                              {getCourseStatus(course).charAt(0).toUpperCase() + getCourseStatus(course).slice(1)}
                            </span>
                          </div>
                          {course.createdOn && (
                            <div className="detail-item">
                              <span className="label">Created:</span>
                              <span>{new Date(course.createdOn).toLocaleDateString()}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="no-courses">No courses enrolled</div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
