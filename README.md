# Regional Officer Case Management System

A secure web-based case management system for union regional officers to track member assists, cases, meetings, and documents.

## Features

### 📊 Dashboard
- Overview of all cases with statistics
- Urgent cases with 24-hour deadline alerts
- Visual deadline countdowns (overdue, warning, normal)
- Quick access to all active cases

### 👥 Case Management
- Member assist tracking with automatic 24-hour deadline
- Case types: Disciplinary, Grievance, Appeal, ET1, Legal Advice
- Case status tracking (new, in-progress, resolved, closed)
- Full case details and notes

### 📋 Document Generation
- **Legal Run Form**: Auto-generate PDF for legal team requests
- **Advice Letter**: Generate advice letters with limitation date calculator
- Professional formatting with all case details

### 🏥 Hospital Management
- Track all assigned hospitals
- Hospital contact information
- Link documents to specific hospitals
- Quick access to hospital policies

### 📅 Meeting Calendar
- Schedule branch meetings
- Meeting types: Branch, Hospital, Member, Other
- Meeting notes and attendees
- Calendar view of upcoming meetings

### 📄 Documents & Templates
- Upload and store case documents
- Template library (Legal Run Form, Advice Letter)
- Secure document storage
- Easy download and management

### 🔔 Team Updates
- Quick feedback to team
- Update types: Member Update, Case Progress, Legal Request, General
- Timestamped updates
- Link updates to specific cases

## Security

- **Password Protected**: Simple authentication (password: `nhsro2024`)
- **Local Storage**: All data stored locally in browser
- **Private Access**: Only you can access your data
- **No Cloud Database**: Complete data privacy

## Getting Started

### Local Development
```bash
npm install
npm run dev
```

### Build for Production
```bash
npm run build
```

## Usage

### Login
1. Visit the application
2. Enter password: `nhsro2024`
3. Access the dashboard

### Adding a Member Assist
1. Click "Add Member Assist" on dashboard
2. Fill in member details
3. Add issue description
4. Case automatically created with 24-hour deadline

### Generating Legal Run Form
1. Open a case
2. Click "Generate Legal Run Form"
3. PDF automatically downloads
4. Send to legal team

### Adding Team Update
1. Click "Team Updates" in sidebar
2. Click "Add Update"
3. Enter title, type, and content
4. Update posted with timestamp

### Managing Meetings
1. Navigate to "Meetings"
2. Click "Add Meeting"
3. Enter meeting details
4. Meeting added to calendar

## Technical Stack

- **Frontend**: React 18 with Vite
- **Styling**: Custom CSS with NHS colors
- **PDF Generation**: jsPDF
- **File Handling**: file-saver
- **Icons**: Lucide React
- **Date Handling**: date-fns
- **Hosting**: Render (Static Site)
- **Storage**: LocalStorage (Client-side)

## Deployment

This application is deployed on Render and automatically builds from GitHub.

## Future Enhancements

- Supabase integration for cloud storage
- Advanced calendar integration
- Email notifications for deadlines
- Document templates editor
- Export case reports
- Mobile app version

## Data Privacy

All data is stored locally in your browser. No data is sent to any server except the Render hosting platform. Your cases, documents, and information remain completely private.

## Support

For issues or questions, contact the development team.