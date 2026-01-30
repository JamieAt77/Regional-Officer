import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, 
  Users, 
  Calendar, 
  FileText, 
  Hospital,
  Bell,
  Plus,
  Clock,
  CheckCircle,
  AlertTriangle,
  Download,
  Mail,
  Phone,
  File,
  X,
  Save,
  Send,
  Search
} from 'lucide-react';
import { jsPDF } from 'jspdf';
import { saveAs } from 'file-saver';

// Initial data storage
const INITIAL_HOSPITALS = [
  {
    id: 1,
    name: 'Frimley Health NHS Foundation Trust',
    workplace: 'Wexham Park Hospital',
    address: 'Wexham Street, Wexham, Slough, Berkshire, SL2 4HL',
    contact: '01753 633000',
    email: 'info@frimleyhealth.nhs.uk',
    documents: []
  },
  {
    id: 2,
    name: 'Dartford and Gravesham NHS Trust',
    workplace: 'Darent Valley Hospital',
    address: 'Darenth Wood Road, Dartford, Kent, DA2 8DA',
    contact: '01322 428100',
    email: 'info@dgt.nhs.uk',
    documents: []
  },
  {
    id: 3,
    name: 'Medway NHS Foundation Trust',
    workplace: 'Medway Maritime Hospital',
    address: 'Windmill Road, Gillingham, Kent, ME7 5NY',
    contact: '01634 830000',
    email: 'info@medway.nhs.uk',
    documents: []
  }
];

// Main App Component
function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [cases, setCases] = useState([]);
  const [hospitals, setHospitals] = useState(INITIAL_HOSPITALS);
  const [meetings, setMeetings] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [teamUpdates, setTeamUpdates] = useState([]);
  const [selectedCase, setSelectedCase] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('');

  // Load data from localStorage on mount
  useEffect(() => {
    const savedAuth = localStorage.getItem('ro_auth');
    const savedCases = localStorage.getItem('ro_cases');
    const savedHospitals = localStorage.getItem('ro_hospitals');
    const savedMeetings = localStorage.getItem('ro_meetings');
    const savedDocs = localStorage.getItem('ro_documents');
    const savedUpdates = localStorage.getItem('ro_updates');

    if (savedAuth === 'true') setIsAuthenticated(true);
    if (savedCases) setCases(JSON.parse(savedCases));
    if (savedHospitals) setHospitals(JSON.parse(savedHospitals));
    if (savedMeetings) setMeetings(JSON.parse(savedMeetings));
    if (savedDocs) setDocuments(JSON.parse(savedDocs));
    if (savedUpdates) setTeamUpdates(JSON.parse(savedUpdates));
  }, []);

  // Save data to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('ro_cases', JSON.stringify(cases));
  }, [cases]);

  useEffect(() => {
    localStorage.setItem('ro_hospitals', JSON.stringify(hospitals));
  }, [hospitals]);

  useEffect(() => {
    localStorage.setItem('ro_meetings', JSON.stringify(meetings));
  }, [meetings]);

  useEffect(() => {
    localStorage.setItem('ro_documents', JSON.stringify(documents));
  }, [documents]);

  useEffect(() => {
    localStorage.setItem('ro_updates', JSON.stringify(teamUpdates));
  }, [teamUpdates]);

  const handleLogin = (e) => {
    e.preventDefault();
    // Simple password check (in production, use proper auth)
    const password = e.target.password.value;
    if (password === 'nhsro2024') {
      setIsAuthenticated(true);
      localStorage.setItem('ro_auth', 'true');
    } else {
      alert('Invalid password');
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem('ro_auth');
  };

  const parseMemberEmail = (emailText) => {
    const member = {
      id: Date.now(),
      memberNumber: emailText.match(/Member:\s*(\d+)/)?.[1] || '',
      name: emailText.match(/Member:[\s\S]*?-\s*(.+?)(?:\n|$)/)?.[1]?.trim() || '',
      joinDate: emailText.match(/Join date:\s*(.+)/)?.[1] || '',
      employer: emailText.match(/Employer Name:\s*(.+)/)?.[1] || '',
      workplace: emailText.match(/Workplace Name:\s*(.+)/)?.[1] || '',
      address: emailText.match(/Workplace Address:\s*([\s\S]*?)Post Code:/)?.[1]?.trim() || '',
      postcode: emailText.match(/Post Code:\s*(.+)/)?.[1] || '',
      jobTitle: emailText.match(/Job Title:\s*(.+)/)?.[1] || '',
      email: emailText.match(/Email Addresses:\s*(.+)/)?.[1] || '',
      phone: emailText.match(/Telephone:\s*(.+)/)?.[1] || '',
      issue: emailText.match(/Issue Details:\s*([\s\S]+)/)?.[1]?.trim() || '',
      createdDate: new Date().toISOString(),
      status: 'new',
      priority: 'high',
      caseType: 'Member Assist',
      deadline: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
    };

    setCases([member, ...cases]);
    setShowModal(false);
    alert('Member assist case created successfully!');
  };

  const generateLegalRunForm = (caseItem) => {
    const doc = new jsPDF();
    
    // Header
    doc.setFontSize(20);
    doc.setTextColor(0, 94, 184);
    doc.text('Legal Run Form', 105, 20, { align: 'center' });
    
    // Member Details
    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    doc.text('Member Details:', 20, 40);
    doc.setFontSize(10);
    doc.text(`Member Number: ${caseItem.memberNumber}`, 20, 50);
    doc.text(`Name: ${caseItem.name}`, 20, 58);
    doc.text(`Employer: ${caseItem.employer}`, 20, 66);
    doc.text(`Workplace: ${caseItem.workplace}`, 20, 74);
    doc.text(`Job Title: ${caseItem.jobTitle}`, 20, 82);
    doc.text(`Email: ${caseItem.email}`, 20, 90);
    doc.text(`Phone: ${caseItem.phone}`, 20, 98);
    
    // Case Information
    doc.setFontSize(12);
    doc.text('Case Information:', 20, 115);
    doc.setFontSize(10);
    doc.text(`Case Type: ${caseItem.caseType}`, 20, 125);
    doc.text(`Status: ${caseItem.status}`, 20, 133);
    doc.text(`Priority: ${caseItem.priority}`, 20, 141);
    doc.text(`Date Received: ${new Date(caseItem.createdDate).toLocaleDateString()}`, 20, 149);
    
    // Issue Details
    doc.setFontSize(12);
    doc.text('Issue Details:', 20, 170);
    doc.setFontSize(10);
    const splitIssue = doc.splitTextToSize(caseItem.issue, 170);
    doc.text(splitIssue, 20, 180);
    
    // Regional Officer Notes
    doc.setFontSize(12);
    doc.text('Regional Officer Notes:', 20, 220);
    doc.setFontSize(10);
    doc.text('Please provide legal advice for this case.', 20, 230);
    
    // Footer
    doc.setFontSize(8);
    doc.setTextColor(128, 128, 128);
    doc.text('Generated by Regional Officer Case Management System', 105, 280, { align: 'center' });
    doc.text(new Date().toLocaleDateString(), 105, 286, { align: 'center' });
    
    doc.save(`Legal_Run_Form_${caseItem.memberNumber}.pdf`);
  };

  const calculateLimitationDate = (dismissalDate) => {
    const dismissal = new Date(dismissalDate);
    const limitationDate = new Date(dismissal);
    limitationDate.setMonth(limitationDate.getMonth() + 3);
    return limitationDate.toLocaleDateString();
  };

  const generateAdviceLetter = (caseItem) => {
    const doc = new jsPDF();
    
    // Header
    doc.setFontSize(16);
    doc.setTextColor(0, 94, 184);
    doc.text('Advice Letter', 105, 20, { align: 'center' });
    
    // Date
    doc.setFontSize(11);
    doc.setTextColor(0, 0, 0);
    doc.text(new Date().toLocaleDateString(), 180, 35);
    
    // Member Details
    doc.setFontSize(12);
    doc.text(`${caseItem.name}`, 20, 50);
    doc.text(`${caseItem.address}`, 20, 58);
    doc.text(caseItem.postcode, 20, 66);
    
    // Salutation
    doc.text(`Dear ${caseItem.name.split(' ')[0]},`, 20, 85);
    
    // Letter Content
    doc.setFontSize(11);
    const letterContent = `Thank you for contacting Unite in Health regarding your recent situation at ${caseItem.workplace}.

Based on the information provided, I am writing to provide you with the following advice and guidance:

${caseItem.issue}

Important Legal Notice:
Please note that you have a strict time limit of 3 months from the date of dismissal to bring a claim to the Employment Tribunal. This is known as the "limitation date".

If you believe you have been unfairly dismissed or have suffered any other detriment, you must ensure any claim is submitted to ACAS for Early Conciliation within this time limit.

If you have any questions or require further assistance, please do not hesitate to contact me.

Yours sincerely,

Regional Officer
Unite in Health`;
    
    const splitContent = doc.splitTextToSize(letterContent, 170);
    doc.text(splitContent, 20, 100);
    
    // Limitation Date
    doc.setFontSize(10);
    doc.setTextColor(220, 53, 69);
    doc.text(`Limitation Date: ${calculateLimitationDate(caseItem.createdDate)}`, 20, 250);
    
    doc.save(`Advice_Letter_${caseItem.memberNumber}.pdf`);
  };

  const updateCaseStatus = (caseId, newStatus) => {
    setCases(cases.map(c => c.id === caseId ? { ...c, status: newStatus } : c));
  };

  const addTeamUpdate = (update) => {
    const newUpdate = {
      id: Date.now(),
      ...update,
      createdAt: new Date().toISOString()
    };
    setTeamUpdates([newUpdate, ...teamUpdates]);
    setShowModal(false);
  };

  const addMeeting = (meeting) => {
    const newMeeting = {
      id: Date.now(),
      ...meeting
    };
    setMeetings([...meetings, newMeeting]);
    setShowModal(false);
  };

  const getDeadlineStatus = (deadline) => {
    const now = new Date();
    const deadlineDate = new Date(deadline);
    const hoursUntilDeadline = (deadlineDate - now) / (1000 * 60 * 60);
    
    if (hoursUntilDeadline < 0) return { status: 'overdue', label: 'Overdue' };
    if (hoursUntilDeadline < 12) return { status: 'warning', label: `${Math.round(hoursUntilDeadline)}h left` };
    return { status: 'normal', label: `${Math.round(hoursUntilDeadline)}h left` };
  };

  // Login Screen
  if (!isAuthenticated) {
    return (
      <div className="login-container">
        <div className="login-box">
          <h1>Regional Officer System</h1>
          <p>Secure Case Management</p>
          <form className="login-form" onSubmit={handleLogin}>
            <div className="form-group">
              <label>Password</label>
              <input type="password" name="password" required />
            </div>
            <button type="submit" className="btn-primary">Login</button>
          </form>
        </div>
      </div>
    );
  }

  // Dashboard Component
  const Dashboard = () => {
    const urgentCases = cases.filter(c => c.status === 'new' || getDeadlineStatus(c.deadline).status !== 'normal');
    const activeCases = cases.filter(c => c.status === 'in-progress').length;
    const resolvedCases = cases.filter(c => c.status === 'resolved').length;

    return (
      <div>
        <h2>Dashboard</h2>
        
        {/* Stats Cards */}
        <div className="stats-grid">
          <div className="stat-card warning">
            <h3>Urgent Cases</h3>
            <div className="value">{urgentCases.length}</div>
          </div>
          <div className="stat-card">
            <h3>Active Cases</h3>
            <div className="value">{activeCases}</div>
          </div>
          <div className="stat-card success">
            <h3>Resolved</h3>
            <div className="value">{resolvedCases}</div>
          </div>
          <div className="stat-card">
            <h3>Total Cases</h3>
            <div className="value">{cases.length}</div>
          </div>
        </div>

        {/* Urgent Cases Section */}
        {urgentCases.length > 0 && (
          <div className="urgent-section">
            <h2><AlertTriangle /> Urgent Cases Requiring Attention</h2>
            {urgentCases.map(caseItem => (
              <div key={caseItem.id} className="case-card urgent">
                <h3>{caseItem.name} - {caseItem.memberNumber}</h3>
                <div className="case-info">
                  <div>
                    <strong>Employer:</strong>
                    <span>{caseItem.employer}</span>
                  </div>
                  <div>
                    <strong>Workplace:</strong>
                    <span>{caseItem.workplace}</span>
                  </div>
                  <div>
                    <strong>Case Type:</strong>
                    <span>{caseItem.caseType}</span>
                  </div>
                  <div>
                    <strong>Phone:</strong>
                    <span>{caseItem.phone}</span>
                  </div>
                </div>
                <p><strong>Issue:</strong> {caseItem.issue.substring(0, 200)}...</p>
                <div className={`deadline ${getDeadlineStatus(caseItem.deadline).status}`}>
                  <Clock /> {getDeadlineStatus(caseItem.deadline).label}
                </div>
                <div className="case-actions">
                  <button 
                    className="btn-primary btn-sm"
                    onClick={() => {
                      setSelectedCase(caseItem);
                      setModalType('viewCase');
                      setShowModal(true);
                    }}
                  >
                    View Details
                  </button>
                  <button 
                    className="btn-success btn-sm"
                    onClick={() => updateCaseStatus(caseItem.id, 'in-progress')}
                  >
                    Mark as In Progress
                  </button>
                  <button 
                    className="btn-primary btn-sm"
                    onClick={() => {
                      setSelectedCase(caseItem);
                      setModalType('teamUpdate');
                      setShowModal(true);
                    }}
                  >
                    Add Team Update
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Recent Cases */}
        <h2>All Cases</h2>
        {cases.map(caseItem => (
          <div key={caseItem.id} className="case-card">
            <h3>{caseItem.name} - {caseItem.memberNumber}</h3>
            <div className="case-info">
              <div>
                <strong>Employer:</strong>
                <span>{caseItem.employer}</span>
              </div>
              <div>
                <strong>Workplace:</strong>
                <span>{caseItem.workplace}</span>
              </div>
              <div>
                <strong>Case Type:</strong>
                <span>{caseItem.caseType}</span>
              </div>
              <div>
                <strong>Status:</strong>
                <span className={`status-badge ${caseItem.status}`}>{caseItem.status}</span>
              </div>
            </div>
            <p><strong>Issue:</strong> {caseItem.issue.substring(0, 200)}...</p>
            <div className="case-actions">
              <button 
                className="btn-primary btn-sm"
                onClick={() => {
                  setSelectedCase(caseItem);
                  setModalType('viewCase');
                  setShowModal(true);
                }}
              >
                View Details
              </button>
              <button 
                className="btn-secondary btn-sm"
                onClick={() => generateLegalRunForm(caseItem)}
              >
                <Download /> Legal Run Form
              </button>
              <button 
                className="btn-secondary btn-sm"
                onClick={() => generateAdviceLetter(caseItem)}
              >
                <File /> Advice Letter
              </button>
            </div>
          </div>
        ))}

        {cases.length === 0 && (
          <div className="case-card">
            <p>No cases yet. Add a new member assist to get started.</p>
            <button 
              className="btn-primary"
              onClick={() => {
                setModalType('newCase');
                setShowModal(true);
              }}
            >
              <Plus /> Add Member Assist
            </button>
          </div>
        )}
      </div>
    );
  };

  // Hospitals Component
  const Hospitals = () => {
    return (
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <h2>Hospitals</h2>
          <button 
            className="btn-primary"
            onClick={() => {
              setModalType('newHospital');
              setShowModal(true);
            }}
          >
            <Plus /> Add Hospital
          </button>
        </div>

        {hospitals.map(hospital => (
          <div key={hospital.id} className="hospital-card">
            <h3><Hospital /> {hospital.name}</h3>
            <div className="hospital-details">
              <div>
                <strong>Workplace:</strong>
                <span>{hospital.workplace}</span>
              </div>
              <div>
                <strong>Address:</strong>
                <span>{hospital.address}</span>
              </div>
              <div>
                <strong>Phone:</strong>
                <span>{hospital.contact}</span>
              </div>
              <div>
                <strong>Email:</strong>
                <span>{hospital.email}</span>
              </div>
            </div>
            <div className="case-actions">
              <button className="btn-primary btn-sm">
                <File /> View Documents ({hospital.documents?.length || 0})
              </button>
              <button className="btn-secondary btn-sm">
                <Mail /> Contact
              </button>
              <button className="btn-secondary btn-sm">
                <Phone /> Call
              </button>
            </div>
          </div>
        ))}
      </div>
    );
  };

  // Calendar Component
  const Calendar = () => {
    return (
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <h2>Meetings & Calendar</h2>
          <button 
            className="btn-primary"
            onClick={() => {
              setModalType('newMeeting');
              setShowModal(true);
            }}
          >
            <Plus /> Add Meeting
          </button>
        </div>

        {meetings.length === 0 ? (
          <div className="case-card">
            <p>No meetings scheduled.</p>
          </div>
        ) : (
          meetings.map(meeting => (
            <div key={meeting.id} className="case-card">
              <h3><Calendar /> {meeting.title}</h3>
              <div className="case-info">
                <div>
                  <strong>Date:</strong>
                  <span>{new Date(meeting.date).toLocaleDateString()}</span>
                </div>
                <div>
                  <strong>Time:</strong>
                  <span>{meeting.time}</span>
                </div>
                <div>
                  <strong>Location:</strong>
                  <span>{meeting.location}</span>
                </div>
                <div>
                  <strong>Type:</strong>
                  <span>{meeting.type}</span>
                </div>
              </div>
              {meeting.notes && (
                <p><strong>Notes:</strong> {meeting.notes}</p>
              )}
            </div>
          ))
        )}
      </div>
    );
  };

  // Documents Component
  const Documents = () => {
    return (
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <h2>Documents & Templates</h2>
          <button 
            className="btn-primary"
            onClick={() => {
              setModalType('newDocument');
              setShowModal(true);
            }}
          >
            <Plus /> Add Document
          </button>
        </div>

        {/* Templates Section */}
        <div className="hospital-card">
          <h3>Templates</h3>
          <div className="document-card">
            <div className="document-info">
              <h4>Legal Run Form Template</h4>
              <p>Use when requesting legal advice for cases</p>
            </div>
            <button className="btn-secondary btn-sm">
              <Download /> Download
            </button>
          </div>
          <div className="document-card">
            <div className="document-info">
              <h4>Advice Letter Template</h4>
              <p>Standard advice letter with limitation date</p>
            </div>
            <button className="btn-secondary btn-sm">
              <Download /> Download
            </button>
          </div>
        </div>

        {/* Case Documents */}
        <div className="hospital-card">
          <h3>Case Documents</h3>
          {documents.length === 0 ? (
            <p>No documents uploaded yet.</p>
          ) : (
            documents.map(doc => (
              <div key={doc.id} className="document-card">
                <div className="document-info">
                  <h4>{doc.name}</h4>
                  <p>Case: {doc.caseId} | Uploaded: {new Date(doc.uploadedAt).toLocaleDateString()}</p>
                </div>
                <div className="document-actions">
                  <button className="btn-secondary btn-sm">
                    <Download /> Download
                  </button>
                  <button className="btn-danger btn-sm">
                    <X /> Delete
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    );
  };

  // Team Updates Component
  const TeamUpdates = () => {
    return (
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <h2>Team Updates</h2>
          <button 
            className="btn-primary"
            onClick={() => {
              setModalType('teamUpdate');
              setSelectedCase(null);
              setShowModal(true);
            }}
          >
            <Plus /> Add Update
          </button>
        </div>

        {teamUpdates.length === 0 ? (
          <div className="case-card">
            <p>No team updates yet.</p>
          </div>
        ) : (
          teamUpdates.map(update => (
            <div key={update.id} className="update-card">
              <div className="update-header">
                <h4>{update.title}</h4>
                <span className="status-badge new">{update.type}</span>
              </div>
              <div className="update-content">
                {update.content}
              </div>
              <div className="update-meta">
                {update.caseId && `Case: ${update.caseId} | `}
                Posted: {new Date(update.createdAt).toLocaleString()}
              </div>
            </div>
          ))
        )}
      </div>
    );
  };

  // Modal Component
  const Modal = () => {
    if (!showModal) return null;

    return (
      <div className="modal-overlay" onClick={() => setShowModal(false)}>
        <div className="modal-content" onClick={e => e.stopPropagation()}>
          <div className="modal-header">
            <h2>
              {modalType === 'newCase' && 'Add Member Assist'}
              {modalType === 'viewCase' && 'Case Details'}
              {modalType === 'newMeeting' && 'Add Meeting'}
              {modalType === 'newHospital' && 'Add Hospital'}
              {modalType === 'teamUpdate' && 'Add Team Update'}
            </h2>
            <button className="close-modal" onClick={() => setShowModal(false)}>
              <X />
            </button>
          </div>

          {/* New Case Modal */}
          {modalType === 'newCase' && (
            <form onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.target);
              const newCase = {
                id: Date.now(),
                memberNumber: formData.get('memberNumber'),
                name: formData.get('name'),
                joinDate: formData.get('joinDate'),
                employer: formData.get('employer'),
                workplace: formData.get('workplace'),
                address: formData.get('address'),
                postcode: formData.get('postcode'),
                jobTitle: formData.get('jobTitle'),
                email: formData.get('email'),
                phone: formData.get('phone'),
                issue: formData.get('issue'),
                caseType: formData.get('caseType'),
                createdDate: new Date().toISOString(),
                status: 'new',
                priority: 'high',
                deadline: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
              };
              setCases([newCase, ...cases]);
              setShowModal(false);
            }}>
              <div className="form-group">
                <label>Member Number</label>
                <input name="memberNumber" required />
              </div>
              <div className="form-group">
                <label>Name</label>
                <input name="name" required />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Employer</label>
                  <input name="employer" required />
                </div>
                <div className="form-group">
                  <label>Workplace</label>
                  <input name="workplace" required />
                </div>
              </div>
              <div className="form-group">
                <label>Address</label>
                <textarea name="address" rows="2" />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Postcode</label>
                  <input name="postcode" />
                </div>
                <div className="form-group">
                  <label>Job Title</label>
                  <input name="jobTitle" />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Email</label>
                  <input name="email" type="email" />
                </div>
                <div className="form-group">
                  <label>Phone</label>
                  <input name="phone" />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Case Type</label>
                  <select name="caseType">
                    <option value="Member Assist">Member Assist</option>
                    <option value="Disciplinary">Disciplinary</option>
                    <option value="Grievance">Grievance</option>
                    <option value="Appeal">Appeal</option>
                    <option value="ET1">ET1</option>
                    <option value="Legal Advice">Legal Advice</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Join Date</label>
                  <input name="joinDate" type="date" />
                </div>
              </div>
              <div className="form-group">
                <label>Issue Details</label>
                <textarea name="issue" rows="4" required />
              </div>
              <button type="submit" className="btn-primary">Create Case</button>
            </form>
          )}

          {/* View Case Modal */}
          {modalType === 'viewCase' && selectedCase && (
            <div>
              <div className="case-info" style={{ marginBottom: '1rem' }}>
                <div>
                  <strong>Member:</strong>
                  <span>{selectedCase.name}</span>
                </div>
                <div>
                  <strong>Number:</strong>
                  <span>{selectedCase.memberNumber}</span>
                </div>
                <div>
                  <strong>Employer:</strong>
                  <span>{selectedCase.employer}</span>
                </div>
                <div>
                  <strong>Workplace:</strong>
                  <span>{selectedCase.workplace}</span>
                </div>
              </div>
              <div style={{ marginBottom: '1rem' }}>
                <strong>Issue:</strong>
                <p>{selectedCase.issue}</p>
              </div>
              <div style={{ marginBottom: '1rem' }}>
                <strong>Deadline:</strong>
                <span className={`deadline ${getDeadlineStatus(selectedCase.deadline).status}`}>
                  {getDeadlineStatus(selectedCase.deadline).label}
                </span>
              </div>
              <div className="case-actions">
                <button 
                  className="btn-primary"
                  onClick={() => generateLegalRunForm(selectedCase)}
                >
                  <Download /> Generate Legal Run Form
                </button>
                <button 
                  className="btn-primary"
                  onClick={() => generateAdviceLetter(selectedCase)}
                >
                  <File /> Generate Advice Letter
                </button>
                <button 
                  className="btn-success"
                  onClick={() => updateCaseStatus(selectedCase.id, 'resolved')}
                >
                  <CheckCircle /> Mark Resolved
                </button>
              </div>
            </div>
          )}

          {/* New Meeting Modal */}
          {modalType === 'newMeeting' && (
            <form onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.target);
              const newMeeting = {
                title: formData.get('title'),
                date: formData.get('date'),
                time: formData.get('time'),
                location: formData.get('location'),
                type: formData.get('type'),
                notes: formData.get('notes')
              };
              addMeeting(newMeeting);
            }}>
              <div className="form-group">
                <label>Meeting Title</label>
                <input name="title" required />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Date</label>
                  <input name="date" type="date" required />
                </div>
                <div className="form-group">
                  <label>Time</label>
                  <input name="time" type="time" required />
                </div>
              </div>
              <div className="form-group">
                <label>Location</label>
                <input name="location" required />
              </div>
              <div className="form-group">
                <label>Type</label>
                <select name="type">
                  <option value="Branch Meeting">Branch Meeting</option>
                  <option value="Hospital Meeting">Hospital Meeting</option>
                  <option value="Member Meeting">Member Meeting</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div className="form-group">
                <label>Notes</label>
                <textarea name="notes" rows="3" />
              </div>
              <button type="submit" className="btn-primary">Add Meeting</button>
            </form>
          )}

          {/* Team Update Modal */}
          {modalType === 'teamUpdate' && (
            <form onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.target);
              const update = {
                title: formData.get('title'),
                type: formData.get('type'),
                content: formData.get('content'),
                caseId: selectedCase?.id
              };
              addTeamUpdate(update);
            }}>
              <div className="form-group">
                <label>Update Title</label>
                <input name="title" required />
              </div>
              <div className="form-group">
                <label>Type</label>
                <select name="type">
                  <option value="Member Update">Member Update</option>
                  <option value="Case Progress">Case Progress</option>
                  <option value="Legal Request">Legal Request</option>
                  <option value="General">General</option>
                </select>
              </div>
              <div className="form-group">
                <label>Update Content</label>
                <textarea name="content" rows="4" required />
              </div>
              <button type="submit" className="btn-primary">Post Update</button>
            </form>
          )}

          {/* New Hospital Modal */}
          {modalType === 'newHospital' && (
            <form onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.target);
              const newHospital = {
                id: Date.now(),
                name: formData.get('name'),
                workplace: formData.get('workplace'),
                address: formData.get('address'),
                contact: formData.get('contact'),
                email: formData.get('email'),
                documents: []
              };
              setHospitals([...hospitals, newHospital]);
              setShowModal(false);
            }}>
              <div className="form-group">
                <label>Trust Name</label>
                <input name="name" required />
              </div>
              <div className="form-group">
                <label>Workplace/Hospital Name</label>
                <input name="workplace" required />
              </div>
              <div className="form-group">
                <label>Address</label>
                <textarea name="address" rows="3" required />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Contact Phone</label>
                  <input name="contact" />
                </div>
                <div className="form-group">
                  <label>Email</label>
                  <input name="email" type="email" />
                </div>
              </div>
              <button type="submit" className="btn-primary">Add Hospital</button>
            </form>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="app">
      <div className="dashboard-container">
        {/* Sidebar */}
        <aside className="sidebar">
          <div className="sidebar-header">
            <h2>Regional Officer</h2>
            <p>Case Management System</p>
          </div>
          
          <button 
            className={`nav-button ${currentPage === 'dashboard' ? 'active' : ''}`}
            onClick={() => setCurrentPage('dashboard')}
          >
            <LayoutDashboard /> Dashboard
          </button>
          <button 
            className={`nav-button ${currentPage === 'cases' ? 'active' : ''}`}
            onClick={() => setCurrentPage('dashboard')}
          >
            <Users /> Cases ({cases.filter(c => c.status === 'new' || c.status === 'in-progress').length})
          </button>
          <button 
            className={`nav-button ${currentPage === 'hospitals' ? 'active' : ''}`}
            onClick={() => setCurrentPage('hospitals')}
          >
            <Hospital /> Hospitals
          </button>
          <button 
            className={`nav-button ${currentPage === 'calendar' ? 'active' : ''}`}
            onClick={() => setCurrentPage('calendar')}
          >
            <Calendar /> Meetings
          </button>
          <button 
            className={`nav-button ${currentPage === 'documents' ? 'active' : ''}`}
            onClick={() => setCurrentPage('documents')}
          >
            <FileText /> Documents
          </button>
          <button 
            className={`nav-button ${currentPage === 'updates' ? 'active' : ''}`}
            onClick={() => setCurrentPage('updates')}
          >
            <Bell /> Team Updates
          </button>

          <div style={{ marginTop: 'auto' }}>
            <button className="nav-button" onClick={handleLogout}>
              <X /> Logout
            </button>
          </div>
        </aside>

        {/* Main Content */}
        <main className="main-content">
          {currentPage === 'dashboard' && <Dashboard />}
          {currentPage === 'hospitals' && <Hospitals />}
          {currentPage === 'calendar' && <Calendar />}
          {currentPage === 'documents' && <Documents />}
          {currentPage === 'updates' && <TeamUpdates />}
        </main>
      </div>

      {/* Modal */}
      <Modal />
    </div>
  );
}

export default App;