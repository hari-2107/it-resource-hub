export const YEAR_SEMESTERS = {
  '1st Year': [1, 2],
  '2nd Year': [3, 4],
  '3rd Year': [5, 6],
  '4th Year': [7, 8]
};

export const getSemestersForYear = (year) => {
  return YEAR_SEMESTERS[year] || [1, 2, 3, 4, 5, 6, 7, 8];
};

export const INITIAL_SUBJECTS = [
  { id: 'sub-1', year: '1st Year', semester: 1, name: 'Programming in C' },
  { id: 'sub-2', year: '1st Year', semester: 1, name: 'Engineering Mathematics-I' },
  { id: 'sub-3', year: '1st Year', semester: 2, name: 'Data Structures & Algorithms' },
  { id: 'sub-4', year: '1st Year', semester: 2, name: 'Object Oriented Programming (Java)' },
  { id: 'sub-5', year: '2nd Year', semester: 3, name: 'Database Management Systems (DBMS)' },
  { id: 'sub-6', year: '2nd Year', semester: 3, name: 'Computer Networks' },
  { id: 'sub-7', year: '2nd Year', semester: 4, name: 'Operating Systems' },
  { id: 'sub-8', year: '2nd Year', semester: 4, name: 'Web Technologies' },
  { id: 'sub-9', year: '3rd Year', semester: 5, name: 'FSWD (Full Stack Web Development)' },
  { id: 'sub-10', year: '3rd Year', semester: 5, name: 'ESIOT (Embedded Systems & IoT)' },
  { id: 'sub-11', year: '3rd Year', semester: 5, name: 'STA (Software Testing & Automation)' },
  { id: 'sub-12', year: '3rd Year', semester: 5, name: 'BDA (Big Data Analytics)' },
  { id: 'sub-13', year: '3rd Year', semester: 5, name: 'CN (Computer Networks)' },
  { id: 'sub-14', year: '3rd Year', semester: 5, name: 'DC (Distributed Computing)' },
  { id: 'sub-15', year: '3rd Year', semester: 5, name: 'CE (Communication English)' },
  { id: 'sub-16', year: '3rd Year', semester: 5, name: 'ADS (Advanced Data Structures)' },
  { id: 'sub-17', year: '3rd Year', semester: 6, name: 'Machine Learning' },
  { id: 'sub-18', year: '3rd Year', semester: 6, name: 'Cloud Computing' },
  { id: 'sub-19', year: '4th Year', semester: 7, name: 'Information & Network Security' },
  { id: 'sub-20', year: '4th Year', semester: 8, name: 'Deep Learning & Neural Networks' }
];

export const INITIAL_MATERIALS = [
  {
    id: 'mat-1',
    subjectId: 'sub-5',
    subjectName: 'Database Management Systems (DBMS)',
    year: '2nd Year',
    semester: 3,
    category: 'Notes',
    title: 'Relational Algebra & Normalization Complete Master Guide',
    fileUrl: 'https://raw.githubusercontent.com/mozilla/pdf.js/ba2edeae/web/compressed.tracemonkey-pldi-09.pdf',
    fileName: 'DBMS_Normalization_Notes_Unit3.pdf',
    fileSize: '2.4 MB',
    uploadDate: '2026-07-15',
    uploadTime: '10:30 AM',
    updatedDate: '2026-07-20',
    updatedTime: '04:15 PM',
    downloadCount: 142,
    viewCount: 285,
    viewedBy: ['Alex Morgan', 'Rahul Sharma', 'Priya Patel', 'Siddharth V', 'Kavya S', 'Divya M'],
    description: 'Detailed hand-written & typed notes covering 1NF, 2NF, 3NF, BCNF with step-by-step solved questions.'
  },
  {
    id: 'mat-2',
    subjectId: 'sub-5',
    subjectName: 'Database Management Systems (DBMS)',
    year: '2nd Year',
    semester: 3,
    category: 'Lab Manuals',
    title: 'Oracle 19c & MySQL Hands-on SQL Lab Workbook',
    fileUrl: 'https://raw.githubusercontent.com/mozilla/pdf.js/ba2edeae/web/compressed.tracemonkey-pldi-09.pdf',
    fileName: 'DBMS_Lab_Manual_2026.pdf',
    fileSize: '4.1 MB',
    uploadDate: '2026-07-10',
    uploadTime: '09:15 AM',
    updatedDate: '2026-07-18',
    updatedTime: '02:00 PM',
    downloadCount: 98,
    viewCount: 194,
    viewedBy: ['Alex Morgan', 'Rahul Sharma', 'Anish R', 'Divya M'],
    description: 'Includes 12 practical experiments with queries, expected outputs, and triggers/procedures.'
  },
  {
    id: 'mat-3',
    subjectId: 'sub-3',
    subjectName: 'Data Structures & Algorithms',
    year: '1st Year',
    semester: 2,
    category: 'PPTs',
    title: 'Trees, Graphs & Dynamic Programming Lecture Slides',
    fileUrl: 'https://raw.githubusercontent.com/mozilla/pdf.js/ba2edeae/web/compressed.tracemonkey-pldi-09.pdf',
    fileName: 'DSA_Trees_Graphs_Slides.pdf',
    fileSize: '5.8 MB',
    uploadDate: '2026-07-02',
    uploadTime: '11:45 AM',
    updatedDate: '2026-07-02',
    updatedTime: '11:45 AM',
    downloadCount: 230,
    viewCount: 412,
    viewedBy: ['Alex Morgan', 'Priya Patel', 'Siddharth V', 'Kavya S', 'Anish R'],
    description: 'Visual presentations explaining AVL Trees, Red-Black Trees, Dijkstra Algorithm, and Knapsack problems.'
  },
  {
    id: 'mat-4',
    subjectId: 'sub-10',
    subjectName: 'Artificial Intelligence',
    year: '3rd Year',
    semester: 5,
    category: 'Question Banks',
    title: 'AI Mid-Term & End-Term Solved Question Bank (2022-2025)',
    fileUrl: 'https://raw.githubusercontent.com/mozilla/pdf.js/ba2edeae/web/compressed.tracemonkey-pldi-09.pdf',
    fileName: 'AI_Solved_Question_Bank.pdf',
    fileSize: '3.2 MB',
    uploadDate: '2026-06-25',
    uploadTime: '03:20 PM',
    updatedDate: '2026-07-01',
    updatedTime: '05:10 PM',
    downloadCount: 310,
    viewCount: 520,
    viewedBy: ['Alex Morgan', 'Rahul Sharma', 'Priya Patel', 'Siddharth V', 'Divya M'],
    description: 'Collection of 150+ short & long answers covering A* Search, Heuristics, Alpha-Beta Pruning, and Expert Systems.'
  },
  {
    id: 'mat-5',
    subjectId: 'sub-10',
    subjectName: 'Artificial Intelligence',
    year: '3rd Year',
    semester: 5,
    category: 'Previous Year Papers',
    title: 'University End Semester Exam Papers (2020 to 2025)',
    fileUrl: 'https://raw.githubusercontent.com/mozilla/pdf.js/ba2edeae/web/compressed.tracemonkey-pldi-09.pdf',
    fileName: 'AI_PYQ_Bundle_2020-2025.pdf',
    fileSize: '6.5 MB',
    uploadDate: '2026-06-20',
    updatedDate: '2026-06-20',
    downloadCount: 415,
    viewCount: 680,
    viewedBy: ['Alex Morgan', 'Rahul Sharma', 'Priya Patel', 'Anish R', 'Kavya S'],
    description: 'Official university question papers for the past 5 years with marking schemes.'
  },
  {
    id: 'mat-6',
    subjectId: 'sub-9',
    subjectName: 'Software Engineering',
    year: '3rd Year',
    semester: 5,
    category: 'Syllabus',
    title: 'IT Dept Software Engineering Curriculum & Scheme 2026',
    fileUrl: 'https://raw.githubusercontent.com/mozilla/pdf.js/ba2edeae/web/compressed.tracemonkey-pldi-09.pdf',
    fileName: 'SE_Curriculum_Scheme_2026.pdf',
    fileSize: '1.1 MB',
    uploadDate: '2026-07-01',
    updatedDate: '2026-07-01',
    downloadCount: 85,
    viewCount: 160,
    viewedBy: ['Alex Morgan', 'Siddharth V', 'Divya M'],
    description: 'Unit-wise syllabus breakdown, recommended textbooks, and evaluation scheme.'
  },
  {
    id: 'mat-7',
    subjectId: 'sub-12',
    subjectName: 'Machine Learning',
    year: '3rd Year',
    semester: 6,
    category: 'Notes',
    title: 'Supervised vs Unsupervised ML Algorithms Cheatsheet',
    fileUrl: 'https://raw.githubusercontent.com/mozilla/pdf.js/ba2edeae/web/compressed.tracemonkey-pldi-09.pdf',
    fileName: 'ML_Algorithms_Cheatsheet.pdf',
    fileSize: '1.8 MB',
    uploadDate: '2026-07-12',
    updatedDate: '2026-07-14',
    downloadCount: 188,
    viewCount: 310,
    viewedBy: ['Alex Morgan', 'Priya Patel', 'Kavya S', 'Anish R'],
    description: 'Quick revision formulas, decision trees, SVMs, neural net backpropagation math.'
  },
  {
    id: 'mat-8',
    subjectId: 'sub-8',
    subjectName: 'Web Technologies',
    year: '2nd Year',
    semester: 4,
    category: 'Assignments',
    title: 'MERN Stack & REST API Project Assignment Specifications',
    fileUrl: 'https://raw.githubusercontent.com/mozilla/pdf.js/ba2edeae/web/compressed.tracemonkey-pldi-09.pdf',
    fileName: 'WebTech_Assignment_2_MERN.pdf',
    fileSize: '950 KB',
    uploadDate: '2026-07-19',
    updatedDate: '2026-07-19',
    downloadCount: 160,
    viewCount: 290,
    viewedBy: ['Alex Morgan', 'Rahul Sharma', 'Siddharth V'],
    description: 'Submission guidelines, rubric, and sample code boilerplate for REST API assignment.'
  }
];

export const INITIAL_AI_TOOLS = [
  {
    id: 'tool-1',
    name: 'GitHub Copilot',
    category: 'Coding',
    pricing: 'Freemium',
    description: 'AI pair programmer that auto-completes code, writes unit tests, and explains complex algorithms right inside your IDE.',
    logoUrl: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/github/github-original.svg',
    websiteUrl: 'https://github.com/features/copilot',
    featured: true,
    addedDate: '2026-07-20',
    addedTime: '09:30 AM',
    tags: ['IDE', 'Code Generation', 'Autocomplete']
  },
  {
    id: 'tool-2',
    name: 'ChatGPT',
    category: 'Coding',
    pricing: 'Free',
    description: 'Versatile conversational AI for code debugging, conceptual explanations, math derivation, and study planning.',
    logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/0/04/ChatGPT_logo.svg',
    websiteUrl: 'https://chatgpt.com',
    featured: true,
    addedDate: '2026-07-18',
    addedTime: '11:15 AM',
    tags: ['General AI', 'Debugging', 'Tutoring']
  },
  {
    id: 'tool-3',
    name: 'Claude 3.5 Sonnet',
    category: 'Writing',
    pricing: 'Freemium',
    description: 'Advanced AI with exceptional technical writing, code generation, and deep PDF document synthesis capability.',
    logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/7/70/Anthropic_logo.svg',
    websiteUrl: 'https://claude.ai',
    featured: true,
    addedDate: '2026-07-19',
    addedTime: '02:40 PM',
    tags: ['Document Synthesis', 'Writing', 'Code']
  },
  {
    id: 'tool-4',
    name: 'Perplexity AI',
    category: 'Research',
    pricing: 'Free',
    description: 'Conversational answer engine with direct citations and real-time academic source tracking for research papers.',
    logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/1/1d/Perplexity_AI_logo.svg',
    websiteUrl: 'https://perplexity.ai',
    featured: true,
    addedDate: '2026-07-15',
    addedTime: '04:10 PM',
    tags: ['Citations', 'Academic Search', 'Fact-checking']
  },
  {
    id: 'tool-5',
    name: 'Overleaf + Writefull AI',
    category: 'Research',
    pricing: 'Freemium',
    description: 'Collaborative LaTeX editor integrated with automated language checking and reference formatting for academic papers.',
    logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/e/ed/Overleaf_logo.svg',
    websiteUrl: 'https://www.overleaf.com',
    featured: false,
    tags: ['LaTeX', 'Research Papers', 'Publishing']
  },
  {
    id: 'tool-6',
    name: 'Phind',
    category: 'Coding',
    pricing: 'Free',
    description: 'Search engine optimized specifically for developers, providing immediate code examples and documentation answers.',
    logoUrl: 'https://www.phind.com/favicon.ico',
    websiteUrl: 'https://www.phind.com',
    featured: false,
    tags: ['Search Engine', 'Developer Q&A']
  },
  {
    id: 'tool-7',
    name: 'Resume.io',
    category: 'Resume/Career',
    pricing: 'Freemium',
    description: 'ATS-friendly resume builder with AI suggestions tailored for IT internships, software development, and tech roles.',
    logoUrl: 'https://resume.io/favicon.ico',
    websiteUrl: 'https://resume.io',
    featured: true,
    tags: ['ATS Resume', 'Portfolio', 'Internship']
  },
  {
    id: 'tool-8',
    name: 'Canva Magic Studio',
    category: 'Design',
    pricing: 'Freemium',
    description: 'Create presentation slides, project posters, diagrams, and UI wireframes effortlessly with generative AI tools.',
    logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/0/08/Canva_icon_2021.svg',
    websiteUrl: 'https://www.canva.com',
    featured: false,
    tags: ['Slides', 'Diagrams', 'UI Design']
  },
  {
    id: 'tool-9',
    name: 'Notion AI',
    category: 'Productivity',
    pricing: 'Paid',
    description: 'Connected workspace tool for organizing lecture notes, task boards, syllabus tracking, and automated summaries.',
    logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/e/e9/Notion-logo.svg',
    websiteUrl: 'https://www.notion.so',
    featured: false,
    tags: ['Note Taking', 'Task Planner', 'Database']
  },
  {
    id: 'tool-10',
    name: 'Consensus',
    category: 'Research',
    pricing: 'Free',
    description: 'AI search engine that extracts insights directly from peer-reviewed scientific literature to support technical writing.',
    logoUrl: 'https://consensus.app/favicon.ico',
    websiteUrl: 'https://consensus.app',
    featured: false,
    tags: ['Scientific Papers', 'Peer-Reviewed']
  }
];

export const INITIAL_ANNOUNCEMENTS = [
  {
    id: 'ann-special-1',
    title: '✨ Special Announcement: Department Excellence Award & 100% Campus Placements Drive',
    description: 'Hearty Congratulations IT Department! Our department has achieved top placement metrics. Exclusive drive scheduled with 18 LPA dream packages starting next week!',
    date: '2026-07-28',
    time: '09:00 AM',
    category: 'Special Announcement',
    priority: 'Special',
    isPinned: true,
    author: 'Head of Department / IT Council',
    viewCount: 340,
    viewedBy: ['Alex Morgan', 'Rahul Sharma', 'Priya Patel', 'Siddharth V', 'Kavya S', 'Anish R', 'Divya M', 'Admin']
  },
  {
    id: 'ann-1',
    title: '🚨 Mid-Semester Examination Schedule Announced (Fall 2026)',
    description: 'The IT Department Mid-Sem examinations will commence from August 10th, 2026. Detailed seating arrangement and subject dates have been published on the notice board. Please clear all pending lab records.',
    date: '2026-07-22',
    time: '10:00 AM',
    category: 'Exam Alert',
    priority: 'High',
    author: 'Prof. Sarah Jenkins (HOD)',
    viewCount: 154,
    viewedBy: ['Alex Morgan', 'Rahul Sharma', 'Priya Patel', 'Siddharth V', 'Kavya S', 'Anish R', 'Divya M', 'Admin']
  },
  {
    id: 'ann-2',
    title: '💻 Hackathon 2026: "AI for Sustainable Campus Solutions"',
    description: 'Registration is now open for the annual 24-hour inter-departmental Hackathon! Cash prizes up to $2,500. Team size: 2-4 students. Registration deadline: August 5th.',
    date: '2026-07-20',
    time: '02:30 PM',
    category: 'Events',
    priority: 'Medium',
    author: 'IT Club & Student Council',
    viewCount: 218,
    viewedBy: ['Alex Morgan', 'Rahul Sharma', 'Priya Patel', 'Siddharth V', 'Kavya S', 'Anish R']
  },
  {
    id: 'ann-3',
    title: '📢 Mandatory Guest Lecture on Cloud Architecture & Kubernetes',
    description: 'Senior Cloud Solutions Architect from AWS will deliver a hands-on technical workshop on August 2nd at 11:00 AM in Auditorium B. Open to 3rd & 4th Year IT students.',
    date: '2026-07-18',
    time: '09:45 AM',
    category: 'Workshop',
    priority: 'Medium',
    author: 'Training & Placement Cell',
    viewCount: 189,
    viewedBy: ['Alex Morgan', 'Rahul Sharma', 'Priya Patel', 'Divya M', 'Kavya S']
  },
  {
    id: 'ann-4',
    title: '📚 Updated PYQs and Lab Workbooks Uploaded to Resource Hub',
    description: 'Semester 5 DBMS & Artificial Intelligence question banks have been refreshed with 2025 solved exam papers. Check the Materials Library to download.',
    date: '2026-07-15',
    time: '01:15 PM',
    category: 'Academic',
    priority: 'Low',
    author: 'Department Admin',
    viewCount: 132,
    viewedBy: ['Alex Morgan', 'Rahul Sharma', 'Priya Patel', 'Anish R']
  }
];

export const CLASS_SECTIONS_PER_YEAR = {
  '1st Year': ['IT-1A', 'IT-1B', 'IT-1C', 'IT-A', 'IT-B', 'IT-C'],
  '2nd Year': ['IT-2A', 'IT-2B', 'IT-2C', 'IT-A', 'IT-B', 'IT-C'],
  '3rd Year': ['IT-3A', 'IT-3B', 'IT-3C', 'IT-A', 'IT-B', 'IT-C'],
  '4th Year': ['IT-4A', 'IT-4B', 'IT-4C', 'IT-A', 'IT-B', 'IT-C']
};

export const INITIAL_TIMETABLES = [
  {
    id: 'tt-1',
    type: 'class',
    status: 'active',
    year: '3rd Year',
    semester: 5,
    classSection: 'IT-A',
    classroom: 'MBIII ANX301',
    college: 'V.S.B. Engineering College, Karur',
    effectiveDate: '13.07.2026',
    updatedDate: '2026-07-13',
    schedule: {
      Monday: [
        { time: '09:15 - 10:00 AM', period: 'I', span: 1, subject: 'FSWD', fullName: 'Full Stack Web Development', room: 'MBIII ANX301', teacher: 'Mr. N. Vinayakaswamy [NV]', type: 'Theory' },
        { time: '10:00 - 10:45 AM', period: 'II', span: 1, subject: 'ESIOT', fullName: 'Embedded Systems & IoT', room: 'MBIII ANX301', teacher: 'Mrs. K. Gayathri [KG]', type: 'Theory' },
        { time: '11:00 - 11:45 AM', period: 'III', span: 1, subject: 'STA', fullName: 'Software Testing & Automation', room: 'MBIII ANX301', teacher: 'Ms. M.S. Parkavi [MSP]', type: 'Theory' },
        { time: '11:45 - 12:30 PM', period: 'IV', span: 1, subject: 'BDA', fullName: 'Big Data Analytics', room: 'MBIII ANX301', teacher: 'Mrs. M. Banila [MB]', type: 'Theory' },
        { time: '01:20 - 02:50 PM', period: 'V & VI', span: 2, subject: 'CE', fullName: 'Communication English', room: 'MBIII ANX301', teacher: 'Ms. S.M. Sobana [SMS]', type: 'Theory' },
        { time: '03:05 - 04:30 PM', period: 'VII & VIII', span: 2, subject: 'ESIOT LAB', fullName: 'Embedded Systems & IoT Lab', room: 'IoT Lab', teacher: 'Mrs. K. Gayathri [KG]', type: 'Lab' }
      ],
      Tuesday: [
        { time: '09:15 - 10:45 AM', period: 'I & II', span: 2, subject: 'FSWD LAB/WD', fullName: 'Full Stack Web Dev Laboratory', room: 'Web Tech Lab', teacher: 'Mr. N. Vinayakaswamy [NV]', type: 'Placement' },
        { time: '11:00 - 12:30 PM', period: 'III & IV', span: 2, subject: 'FSWD LAB/WD', fullName: 'Full Stack Web Dev Laboratory', room: 'Web Tech Lab', teacher: 'Mr. N. Vinayakaswamy [NV]', type: 'Placement' },
        { time: '01:20 - 02:05 PM', period: 'V', span: 1, subject: 'STA', fullName: 'Software Testing & Automation', room: 'MBIII ANX301', teacher: 'Ms. M.S. Parkavi [MSP]', type: 'Theory' },
        { time: '02:05 - 02:50 PM', period: 'VI', span: 1, subject: 'CN', fullName: 'Computer Networks', room: 'MBIII ANX301', teacher: 'Mr. D. Vengaimarban [DV]', type: 'Theory' },
        { time: '03:05 - 03:50 PM', period: 'VII', span: 1, subject: 'DC', fullName: 'Distributed Computing', room: 'MBIII ANX301', teacher: 'Ms. S.M. Sobana [SMS]', type: 'Theory' },
        { time: '03:50 - 04:30 PM', period: 'VIII', span: 1, subject: 'BDA', fullName: 'Big Data Analytics', room: 'MBIII ANX301', teacher: 'Mrs. M. Banila [MB]', type: 'Theory' }
      ],
      Wednesday: [
        { time: '09:15 - 10:00 AM', period: 'I', span: 1, subject: 'ESIOT', fullName: 'Embedded Systems & IoT', room: 'MBIII ANX301', teacher: 'Mrs. K. Gayathri [KG]', type: 'Theory' },
        { time: '10:00 - 10:45 AM', period: 'II', span: 1, subject: 'BDA', fullName: 'Big Data Analytics', room: 'MBIII ANX301', teacher: 'Mrs. M. Banila [MB]', type: 'Theory' },
        { time: '11:00 - 11:45 AM', period: 'III', span: 1, subject: 'STA', fullName: 'Software Testing & Automation', room: 'MBIII ANX301', teacher: 'Ms. M.S. Parkavi [MSP]', type: 'Theory' },
        { time: '11:45 - 12:30 PM', period: 'IV', span: 1, subject: 'CN', fullName: 'Computer Networks', room: 'MBIII ANX301', teacher: 'Mr. D. Vengaimarban [DV]', type: 'Theory' },
        { time: '01:20 - 02:05 PM', period: 'V', span: 1, subject: 'FSWD', fullName: 'Full Stack Web Development', room: 'MBIII ANX301', teacher: 'Mr. N. Vinayakaswamy [NV]', type: 'Theory' },
        { time: '02:05 - 02:50 PM', period: 'VI', span: 1, subject: 'DC', fullName: 'Distributed Computing', room: 'MBIII ANX301', teacher: 'Ms. S.M. Sobana [SMS]', type: 'Theory' },
        { time: '03:05 - 04:30 PM', period: 'VII & VIII', span: 2, subject: 'STA LAB', fullName: 'Software Testing & Automation Lab', room: 'Testing Lab', teacher: 'Ms. M.S. Parkavi [MSP]', type: 'Lab' }
      ],
      Thursday: [
        { time: '09:15 - 10:45 AM', period: 'I & II', span: 2, subject: 'ADS', fullName: 'Advanced Data Structures', room: 'MBIII ANX301', teacher: 'Ms. S.M. Sobana [SMS]', type: 'Placement' },
        { time: '11:00 - 12:30 PM', period: 'III & IV', span: 2, subject: 'ADS', fullName: 'Advanced Data Structures', room: 'MBIII ANX301', teacher: 'Ms. S.M. Sobana [SMS]', type: 'Placement' },
        { time: '01:20 - 02:05 PM', period: 'V', span: 1, subject: 'DC', fullName: 'Distributed Computing', room: 'MBIII ANX301', teacher: 'Ms. S.M. Sobana [SMS]', type: 'Theory' },
        { time: '02:05 - 02:50 PM', period: 'VI', span: 1, subject: 'FSWD', fullName: 'Full Stack Web Development', room: 'MBIII ANX301', teacher: 'Mr. N. Vinayakaswamy [NV]', type: 'Theory' },
        { time: '03:05 - 04:30 PM', period: 'VII & VIII', span: 2, subject: 'PROJECT', fullName: 'Mini Project Work', room: 'MBIII ANX301', teacher: 'Ms. S.M. Sobana [SMS]', type: 'Project' }
      ],
      Friday: [
        { time: '09:15 - 10:45 AM', period: 'I & II', span: 2, subject: 'APTI', fullName: 'Aptitude Training', room: 'MBIII ANX301', teacher: 'Ms. S.M. Sobana [SMS]', type: 'Placement' },
        { time: '11:00 - 12:30 PM', period: 'III & IV', span: 2, subject: 'APTI', fullName: 'Aptitude Training', room: 'MBIII ANX301', teacher: 'Ms. S.M. Sobana [SMS]', type: 'Placement' },
        { time: '01:20 - 02:05 PM', period: 'V', span: 1, subject: 'FSWD', fullName: 'Full Stack Web Development', room: 'MBIII ANX301', teacher: 'Mr. N. Vinayakaswamy [NV]', type: 'Theory' },
        { time: '02:05 - 02:50 PM', period: 'VI', span: 1, subject: 'DC', fullName: 'Distributed Computing', room: 'MBIII ANX301', teacher: 'Ms. S.M. Sobana [SMS]', type: 'Theory' },
        { time: '03:05 - 04:30 PM', period: 'VII & VIII', span: 2, subject: 'CN LAB', fullName: 'Computer Networks Lab', room: 'Networks Lab', teacher: 'Mr. D. Vengaimarban [DV]', type: 'Lab' }
      ],
      Saturday: [
        { time: '09:15 - 10:45 AM', period: 'I & II', span: 2, subject: 'CE', fullName: 'Communication English', room: 'MBIII ANX301', teacher: 'Ms. S.M. Sobana [SMS]', type: 'Theory' },
        { time: '11:00 - 11:45 AM', period: 'III', span: 1, subject: 'ESIOT', fullName: 'Embedded Systems & IoT', room: 'MBIII ANX301', teacher: 'Mrs. K. Gayathri [KG]', type: 'Theory' },
        { time: '11:45 - 12:30 PM', period: 'IV', span: 1, subject: 'CN', fullName: 'Computer Networks', room: 'MBIII ANX301', teacher: 'Mr. D. Vengaimarban [DV]', type: 'Theory' },
        { time: '01:20 - 02:50 PM', period: 'V & VI', span: 2, subject: 'FSWD', fullName: 'Full Stack Web Development', room: 'MBIII ANX301', teacher: 'Mr. N. Vinayakaswamy [NV]', type: 'Theory' },
        { time: '03:05 - 04:30 PM', period: 'VII & VIII', span: 2, subject: 'BDA LAB', fullName: 'Big Data Analytics Lab', room: 'Big Data Lab', teacher: 'Mrs. M. Banila [MB]', type: 'Lab' }
      ]
    }
  },
  {
    id: 'tt-1b',
    type: 'class',
    status: 'active',
    year: '3rd Year',
    semester: 5,
    classSection: 'IT-3A',
    classroom: 'MBIII ANX301',
    college: 'V.S.B. Engineering College, Karur',
    effectiveDate: '13.07.2026',
    updatedDate: '2026-07-13',
    schedule: {
      Monday: [
        { time: '09:15 - 10:00 AM', period: 'I', span: 1, subject: 'FSWD', fullName: 'Full Stack Web Development', room: 'MBIII ANX301', teacher: 'Mr. N. Vinayakaswamy [NV]', type: 'Theory' },
        { time: '10:00 - 10:45 AM', period: 'II', span: 1, subject: 'ESIOT', fullName: 'Embedded Systems & IoT', room: 'MBIII ANX301', teacher: 'Mrs. K. Gayathri [KG]', type: 'Theory' },
        { time: '11:00 - 11:45 AM', period: 'III', span: 1, subject: 'STA', fullName: 'Software Testing & Automation', room: 'MBIII ANX301', teacher: 'Ms. M.S. Parkavi [MSP]', type: 'Theory' },
        { time: '11:45 - 12:30 PM', period: 'IV', span: 1, subject: 'BDA', fullName: 'Big Data Analytics', room: 'MBIII ANX301', teacher: 'Mrs. M. Banila [MB]', type: 'Theory' },
        { time: '01:20 - 02:50 PM', period: 'V & VI', span: 2, subject: 'CE', fullName: 'Communication English', room: 'MBIII ANX301', teacher: 'Ms. S.M. Sobana [SMS]', type: 'Theory' },
        { time: '03:05 - 04:30 PM', period: 'VII & VIII', span: 2, subject: 'ESIOT LAB', fullName: 'Embedded Systems & IoT Lab', room: 'IoT Lab', teacher: 'Mrs. K. Gayathri [KG]', type: 'Lab' }
      ],
      Tuesday: [
        { time: '09:15 - 10:45 AM', period: 'I & II', span: 2, subject: 'FSWD LAB/WD', fullName: 'Full Stack Web Dev Laboratory', room: 'Web Tech Lab', teacher: 'Mr. N. Vinayakaswamy [NV]', type: 'Placement' },
        { time: '11:00 - 12:30 PM', period: 'III & IV', span: 2, subject: 'FSWD LAB/WD', fullName: 'Full Stack Web Dev Laboratory', room: 'Web Tech Lab', teacher: 'Mr. N. Vinayakaswamy [NV]', type: 'Placement' },
        { time: '01:20 - 02:05 PM', period: 'V', span: 1, subject: 'STA', fullName: 'Software Testing & Automation', room: 'MBIII ANX301', teacher: 'Ms. M.S. Parkavi [MSP]', type: 'Theory' },
        { time: '02:05 - 02:50 PM', period: 'VI', span: 1, subject: 'CN', fullName: 'Computer Networks', room: 'MBIII ANX301', teacher: 'Mr. D. Vengaimarban [DV]', type: 'Theory' },
        { time: '03:05 - 03:50 PM', period: 'VII', span: 1, subject: 'DC', fullName: 'Distributed Computing', room: 'MBIII ANX301', teacher: 'Ms. S.M. Sobana [SMS]', type: 'Theory' },
        { time: '03:50 - 04:30 PM', period: 'VIII', span: 1, subject: 'BDA', fullName: 'Big Data Analytics', room: 'MBIII ANX301', teacher: 'Mrs. M. Banila [MB]', type: 'Theory' }
      ],
      Wednesday: [
        { time: '09:15 - 10:00 AM', period: 'I', span: 1, subject: 'ESIOT', fullName: 'Embedded Systems & IoT', room: 'MBIII ANX301', teacher: 'Mrs. K. Gayathri [KG]', type: 'Theory' },
        { time: '10:00 - 10:45 AM', period: 'II', span: 1, subject: 'BDA', fullName: 'Big Data Analytics', room: 'MBIII ANX301', teacher: 'Mrs. M. Banila [MB]', type: 'Theory' },
        { time: '11:00 - 11:45 AM', period: 'III', span: 1, subject: 'STA', fullName: 'Software Testing & Automation', room: 'MBIII ANX301', teacher: 'Ms. M.S. Parkavi [MSP]', type: 'Theory' },
        { time: '11:45 - 12:30 PM', period: 'IV', span: 1, subject: 'CN', fullName: 'Computer Networks', room: 'MBIII ANX301', teacher: 'Mr. D. Vengaimarban [DV]', type: 'Theory' },
        { time: '01:20 - 02:05 PM', period: 'V', span: 1, subject: 'FSWD', fullName: 'Full Stack Web Development', room: 'MBIII ANX301', teacher: 'Mr. N. Vinayakaswamy [NV]', type: 'Theory' },
        { time: '02:05 - 02:50 PM', period: 'VI', span: 1, subject: 'DC', fullName: 'Distributed Computing', room: 'MBIII ANX301', teacher: 'Ms. S.M. Sobana [SMS]', type: 'Theory' },
        { time: '03:05 - 04:30 PM', period: 'VII & VIII', span: 2, subject: 'STA LAB', fullName: 'Software Testing & Automation Lab', room: 'Testing Lab', teacher: 'Ms. M.S. Parkavi [MSP]', type: 'Lab' }
      ],
      Thursday: [
        { time: '09:15 - 10:45 AM', period: 'I & II', span: 2, subject: 'ADS', fullName: 'Advanced Data Structures', room: 'MBIII ANX301', teacher: 'Ms. S.M. Sobana [SMS]', type: 'Placement' },
        { time: '11:00 - 12:30 PM', period: 'III & IV', span: 2, subject: 'ADS', fullName: 'Advanced Data Structures', room: 'MBIII ANX301', teacher: 'Ms. S.M. Sobana [SMS]', type: 'Placement' },
        { time: '01:20 - 02:05 PM', period: 'V', span: 1, subject: 'DC', fullName: 'Distributed Computing', room: 'MBIII ANX301', teacher: 'Ms. S.M. Sobana [SMS]', type: 'Theory' },
        { time: '02:05 - 02:50 PM', period: 'VI', span: 1, subject: 'FSWD', fullName: 'Full Stack Web Development', room: 'MBIII ANX301', teacher: 'Mr. N. Vinayakaswamy [NV]', type: 'Theory' },
        { time: '03:05 - 04:30 PM', period: 'VII & VIII', span: 2, subject: 'PROJECT', fullName: 'Mini Project Work', room: 'MBIII ANX301', teacher: 'Ms. S.M. Sobana [SMS]', type: 'Project' }
      ],
      Friday: [
        { time: '09:15 - 10:45 AM', period: 'I & II', span: 2, subject: 'APTI', fullName: 'Aptitude Training', room: 'MBIII ANX301', teacher: 'Ms. S.M. Sobana [SMS]', type: 'Placement' },
        { time: '11:00 - 12:30 PM', period: 'III & IV', span: 2, subject: 'APTI', fullName: 'Aptitude Training', room: 'MBIII ANX301', teacher: 'Ms. S.M. Sobana [SMS]', type: 'Placement' },
        { time: '01:20 - 02:05 PM', period: 'V', span: 1, subject: 'FSWD', fullName: 'Full Stack Web Development', room: 'MBIII ANX301', teacher: 'Mr. N. Vinayakaswamy [NV]', type: 'Theory' },
        { time: '02:05 - 02:50 PM', period: 'VI', span: 1, subject: 'DC', fullName: 'Distributed Computing', room: 'MBIII ANX301', teacher: 'Ms. S.M. Sobana [SMS]', type: 'Theory' },
        { time: '03:05 - 04:30 PM', period: 'VII & VIII', span: 2, subject: 'CN LAB', fullName: 'Computer Networks Lab', room: 'Networks Lab', teacher: 'Mr. D. Vengaimarban [DV]', type: 'Lab' }
      ],
      Saturday: [
        { time: '09:15 - 10:45 AM', period: 'I & II', span: 2, subject: 'CE', fullName: 'Communication English', room: 'MBIII ANX301', teacher: 'Ms. S.M. Sobana [SMS]', type: 'Placement' },
        { time: '11:00 - 11:45 AM', period: 'III', span: 1, subject: 'ESIOT', fullName: 'Embedded Systems & IoT', room: 'MBIII ANX301', teacher: 'Mrs. K. Gayathri [KG]', type: 'Theory' },
        { time: '11:45 - 12:30 PM', period: 'IV', span: 1, subject: 'CN', fullName: 'Computer Networks', room: 'MBIII ANX301', teacher: 'Mr. D. Vengaimarban [DV]', type: 'Theory' },
        { time: '01:20 - 02:50 PM', period: 'V & VI', span: 2, subject: 'FSWD', fullName: 'Full Stack Web Development', room: 'MBIII ANX301', teacher: 'Mr. N. Vinayakaswamy [NV]', type: 'Theory' },
        { time: '03:05 - 04:30 PM', period: 'VII & VIII', span: 2, subject: 'BDA LAB', fullName: 'Big Data Analytics Lab', room: 'Big Data Lab', teacher: 'Mrs. M. Banila [MB]', type: 'Lab' }
      ]
    }
  },
  {
    id: 'tt-int-1',
    type: 'internal',
    status: 'active',
    internalName: 'Internal 1',
    title: 'Continuous Assessment Test 1 (CAT-1) Schedule',
    year: '3rd Year',
    semester: 5,
    classSection: 'IT-A',
    college: 'V.S.B. Engineering College, Karur',
    effectiveDate: '2026-08-01',
    updatedDate: '2026-07-28',
    examEntries: [
      {
        id: 'e1',
        subject: 'Full Stack Web Development',
        subjectCode: 'CS8591',
        examDate: '2026-08-05',
        day: 'Wednesday',
        startTime: '09:30 AM',
        endTime: '11:00 AM',
        hall: 'MBIII ANX301',
        syllabus: 'Unit I (HTML5/CSS3/React) & Unit II (Node.js)'
      },
      {
        id: 'e2',
        subject: 'Embedded Systems & IoT',
        subjectCode: 'IT3501',
        examDate: '2026-08-06',
        day: 'Thursday',
        startTime: '09:30 AM',
        endTime: '11:00 AM',
        hall: 'MBIII ANX301',
        syllabus: 'Unit I (ARM Architecture) & Unit II (Sensors)'
      },
      {
        id: 'e3',
        subject: 'Software Testing & Automation',
        subjectCode: 'IT3502',
        examDate: '2026-08-07',
        day: 'Friday',
        startTime: '09:30 AM',
        endTime: '11:00 AM',
        hall: 'MBIII ANX301',
        syllabus: 'Unit I (Black-box Testing) & Unit II (Selenium)'
      },
      {
        id: 'e4',
        subject: 'Big Data Analytics',
        subjectCode: 'IT3503',
        examDate: '2026-08-08',
        day: 'Saturday',
        startTime: '09:30 AM',
        endTime: '11:00 AM',
        hall: 'MBIII ANX301',
        syllabus: 'Unit I (Hadoop Ecosystem) & Unit II (MapReduce)'
      },
      {
        id: 'e5',
        subject: 'Computer Networks',
        subjectCode: 'CS8592',
        examDate: '2026-08-10',
        day: 'Monday',
        startTime: '09:30 AM',
        endTime: '11:00 AM',
        hall: 'MBIII ANX301',
        syllabus: 'Unit I (Physical Layer) & Unit II (Data Link Layer)'
      }
    ]
  },
  {
    id: 'tt-sem-1',
    type: 'semester',
    status: 'active',
    title: 'Anna University End-Semester Examinations (Nov/Dec 2026)',
    regulation: 'R2021',
    year: '3rd Year',
    semester: 5,
    classSection: 'IT-A',
    college: 'V.S.B. Engineering College, Karur',
    effectiveDate: '2026-11-01',
    updatedDate: '2026-07-28',
    examEntries: [
      {
        id: 's1',
        subject: 'Full Stack Web Development',
        subjectCode: 'CS8591',
        examDate: '2026-11-18',
        day: 'Wednesday',
        startTime: '09:30 AM',
        endTime: '12:30 PM',
        session: 'FN',
        regulation: 'R2021'
      },
      {
        id: 's2',
        subject: 'Embedded Systems & IoT',
        subjectCode: 'IT3501',
        examDate: '2026-11-20',
        day: 'Friday',
        startTime: '09:30 AM',
        endTime: '12:30 PM',
        session: 'FN',
        regulation: 'R2021'
      },
      {
        id: 's3',
        subject: 'Software Testing & Automation',
        subjectCode: 'IT3502',
        examDate: '2026-11-23',
        day: 'Monday',
        startTime: '09:30 AM',
        endTime: '12:30 PM',
        session: 'FN',
        regulation: 'R2021'
      },
      {
        id: 's4',
        subject: 'Big Data Analytics',
        subjectCode: 'IT3503',
        examDate: '2026-11-25',
        day: 'Wednesday',
        startTime: '09:30 AM',
        endTime: '12:30 PM',
        session: 'FN',
        regulation: 'R2021'
      },
      {
        id: 's5',
        subject: 'Computer Networks',
        subjectCode: 'CS8592',
        examDate: '2026-11-27',
        day: 'Friday',
        startTime: '09:30 AM',
        endTime: '12:30 PM',
        session: 'FN',
        regulation: 'R2021'
      }
    ]
  },
  {
    id: 'tt-2',
    year: '3rd Year',
    semester: 5,
    classSection: 'IT-3B',
    updatedDate: '2026-07-15',
    schedule: {
      Monday: [
        { time: '09:00 - 11:00 AM', subject: 'AI Practical Lab', room: 'Lab 2', teacher: 'Prof. Jenkins', type: 'Lab' },
        { time: '11:15 - 12:15 PM', subject: 'DBMS Lecture', room: 'Room 303', teacher: 'Dr. Ramesh', type: 'Theory' },
        { time: '02:00 - 03:00 PM', subject: 'Software Engineering', room: 'Room 303', teacher: 'Prof. Miller', type: 'Theory' }
      ],
      Tuesday: [
        { time: '09:00 - 10:00 AM', subject: 'DAA Lecture', room: 'Room 303', teacher: 'Dr. Gupta', type: 'Theory' },
        { time: '10:00 - 11:00 AM', subject: 'Software Engineering', room: 'Room 303', teacher: 'Prof. Miller', type: 'Theory' },
        { time: '11:15 - 01:15 PM', subject: 'Placement Communication & Resume', room: 'Placement Hall', teacher: 'HR Trainer', type: 'Placement' }
      ],
      Wednesday: [
        { time: '09:00 - 11:00 AM', subject: 'Web Tech Lab', room: 'Lab 4', teacher: 'Prof. Davis', type: 'Lab' },
        { time: '11:15 - 12:15 PM', subject: 'DBMS', room: 'Room 303', teacher: 'Dr. Ramesh', type: 'Theory' }
      ],
      Thursday: [
        { time: '09:00 - 10:00 AM', subject: 'Artificial Intelligence', room: 'Room 303', teacher: 'Prof. Jenkins', type: 'Theory' },
        { time: '10:00 - 12:00 PM', subject: 'DBMS Practical Lab', room: 'Lab 3', teacher: 'Dr. Ramesh', type: 'Lab' }
      ],
      Friday: [
        { time: '09:00 - 11:00 AM', subject: 'Competitive Coding Placement Class', room: 'Lab 1', teacher: 'Guest Lead', type: 'Placement' },
        { time: '11:15 - 12:15 PM', subject: 'DAA', room: 'Room 303', teacher: 'Dr. Gupta', type: 'Theory' }
      ]
    }
  },
  {
    id: 'tt-3',
    year: '2nd Year',
    semester: 3,
    classSection: 'IT-B',
    updatedDate: '2026-07-10',
    schedule: {
      Monday: [
        { time: '09:00 - 10:00 AM', subject: 'Computer Networks', room: 'Room 201', teacher: 'Prof. Adams', type: 'Theory' },
        { time: '10:00 - 11:00 AM', subject: 'DBMS', room: 'Room 201', teacher: 'Dr. Ramesh', type: 'Theory' },
        { time: '11:15 - 01:15 PM', subject: 'Networks Lab', room: 'Lab 5', teacher: 'Prof. Adams', type: 'Lab' }
      ],
      Tuesday: [
        { time: '09:00 - 11:00 AM', subject: 'C++ OOP Lab', room: 'Lab 1', teacher: 'Prof. Clark', type: 'Lab' },
        { time: '11:15 - 12:15 PM', subject: 'Discrete Maths', room: 'Room 201', teacher: 'Dr. Sharma', type: 'Theory' }
      ],
      Wednesday: [
        { time: '09:00 - 10:00 AM', subject: 'DBMS', room: 'Room 201', teacher: 'Dr. Ramesh', type: 'Theory' },
        { time: '10:00 - 12:00 PM', subject: 'Digital Logic Lab', room: 'Hardware Lab', teacher: 'Prof. Taylor', type: 'Lab' }
      ],
      Thursday: [
        { time: '09:00 - 10:00 AM', subject: 'Computer Networks', room: 'Room 201', teacher: 'Prof. Adams', type: 'Theory' },
        { time: '10:00 - 11:00 AM', subject: 'Discrete Maths', room: 'Room 201', teacher: 'Dr. Sharma', type: 'Theory' }
      ],
      Friday: [
        { time: '09:00 - 11:00 AM', subject: 'DBMS Lab', room: 'Lab 3', teacher: 'Dr. Ramesh', type: 'Lab' }
      ]
    }
  }
];

export const DEMO_USERS = {
  student: {
    uid: 'demo-student-123',
    name: 'Alex Morgan',
    email: 'student@it.edu',
    role: 'student',
    year: '3rd Year',
    semester: 5,
    classSection: 'IT-A',
    registeredDate: '2026-01-15'
  },
  admin: {
    uid: 'demo-admin-999',
    name: 'Admin',
    email: 'admin@it.edu',
    role: 'admin',
    year: '4th Year',
    semester: 7,
    classSection: 'Administrator',
    registeredDate: '2025-08-01'
  }
};

export const INITIAL_SUGGESTIONS = [
  {
    id: 'sug-1',
    userId: 'demo-student-123',
    userName: 'Alex Morgan',
    userEmail: 'student@it.edu',
    type: 'material',
    title: 'Distributed Systems Fault Tolerance Notes',
    description: 'Detailed study notes covering Paxos, Raft consensus, and Byzantine Fault Tolerance for Sem 5 DC.',
    link: 'https://example.com/dc-fault-tolerance.pdf',
    status: 'pending',
    submittedAt: '2026-07-24'
  },
  {
    id: 'sug-2',
    userId: 'demo-student-123',
    userName: 'Priya Patel',
    userEmail: 'priya@it.edu',
    type: 'aiTool',
    title: 'Excalidraw AI',
    description: 'Great online collaborative whiteboard with AI text-to-diagram for system architecture drawings.',
    link: 'https://excalidraw.com',
    status: 'pending',
    submittedAt: '2026-07-23'
  }
];

export const INITIAL_REPORTS = [
  {
    id: 'rep-1',
    userId: 'demo-student-123',
    userName: 'Rahul Sharma',
    userEmail: 'rahul@it.edu',
    materialId: 'mat-1',
    materialTitle: 'Relational Algebra & Normalization Complete Master Guide',
    issueType: 'outdated',
    note: 'Page 14 contains an old syllabus reference instead of current schema.',
    status: 'open',
    reportedAt: '2026-07-24'
  }
];

export const INITIAL_PLACEMENT_COMPANIES = [
  {
    id: 'comp-1',
    companyName: 'Google',
    logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/2/2f/Google_2015_logo.svg',
    eligibilityCriteria: 'B.Tech IT / CSE with no active backlogs',
    cgpaCutoff: 8.5,
    driveDate: '2026-09-15',
    description: 'Software Engineering & Cloud Systems hiring drive for 2027 graduating batch.'
  },
  {
    id: 'comp-2',
    companyName: 'TCS Digital / Ninja',
    logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/b/b1/Tata_Consultancy_Services_Logo.svg',
    eligibilityCriteria: 'All IT & Circuit branches, >60% in X/XII/Graduation',
    cgpaCutoff: 6.5,
    driveDate: '2026-08-28',
    description: 'Mass recruitment drive offering System Engineer and Digital Innovator roles.'
  },
  {
    id: 'comp-3',
    companyName: 'Amazon',
    logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/a/a9/Amazon_logo.svg',
    eligibilityCriteria: 'Strong Data Structures, Algorithms & System Design fundamentals',
    cgpaCutoff: 7.5,
    driveDate: '2026-10-02',
    description: 'Software Development Engineer (SDE-1) campus recruitment.'
  },
  {
    id: 'comp-4',
    companyName: 'Infosys (Specialist Programmer)',
    logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/9/95/Infosys_logo.svg',
    eligibilityCriteria: 'B.Tech IT/CSE/ECE with hands-on Competitive Programming skills',
    cgpaCutoff: 7.0,
    driveDate: '2026-09-01',
    description: 'Power Programmer & Specialist Software Engineer drive.'
  }
];

export const INITIAL_INTERVIEW_EXPERIENCES = [
  {
    id: 'exp-1',
    companyId: 'comp-1',
    companyName: 'Google',
    studentName: 'Alex Morgan',
    isAnonymous: false,
    role: 'Software Engineering Intern',
    rounds: [
      { roundName: 'Online Coding Round', description: '2 LeetCode Medium/Hard questions on Graphs (DFS) and Dynamic Programming.' },
      { roundName: 'Technical Round 1', description: 'Deep dive into Binary Trees, HashMaps, and Space Complexity optimization.' },
      { roundName: 'Technical Round 2 + Googleness', description: 'System design for URL Shortener + Behavioral scenario questions.' }
    ],
    overallTips: 'Focus heavily on writing clean code and talking out loud while solving algorithmic problems.',
    submittedAt: '2026-07-20',
    approved: true
  },
  {
    id: 'exp-2',
    companyId: 'comp-2',
    companyName: 'TCS Digital / Ninja',
    studentName: 'Anonymous IT Student',
    isAnonymous: true,
    role: 'Digital System Engineer',
    rounds: [
      { roundName: 'Aptitude & Coding Test', description: 'Quantitative aptitude, verbal reasoning, and 2 SQL + Array coding questions.' },
      { roundName: 'TR + HR Combined', description: 'Questions on DBMS indexing, OOPs concepts in Java/C++, and final year project architecture.' }
    ],
    overallTips: 'Revise SQL queries, normalization, and basic OOP principles thoroughly.',
    submittedAt: '2026-07-22',
    approved: true
  }
];

export const INITIAL_PLACEMENT_RESOURCES = [
  {
    id: 'res-1',
    title: 'Striver 75 Blind DSA Sheet',
    category: 'Aptitude & DSA',
    url: 'https://takeuforward.org/strivers-a2zdsa-setter/',
    description: 'Curated list of 75 essential Data Structures & Algorithms problems for tech interviews.'
  },
  {
    id: 'res-2',
    title: 'IndiaBIX Quantitative Aptitude Practice',
    category: 'Aptitude & DSA',
    url: 'https://www.indiabix.com/',
    description: 'Topic-wise practice questions for campus placement aptitude screening tests.'
  },
  {
    id: 'res-3',
    title: 'CS Primer: Operating Systems & Computer Networks Cheatsheet',
    category: 'Core CS Prep',
    url: 'https://roadmap.sh/computer-science',
    description: 'Quick revision cards covering process scheduling, TCP/IP, and SQL queries.'
  }
];

export const INITIAL_EVENTS = [
  {
    id: 'evt-1',
    title: '🚀 Smart India Hackathon 2026 (Internal Screening)',
    bannerImageUrl: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=1200&q=80',
    type: 'Hackathon',
    level: 'National',
    organizer: 'Ministry of Education & IT Dept',
    description: 'Annual national innovation competition where student teams build AI/IoT software and hardware prototypes for real-world municipal problems.',
    prizeDetails: '🏆 $3,000 Cash Prize + Direct Incubation Support',
    registrationLink: 'https://sih.gov.in',
    startDate: '2026-08-01',
    endDate: '2026-08-03',
    registrationDeadline: '2026-07-30',
    createdAt: '2026-07-20'
  },
  {
    id: 'evt-2',
    title: '⚡ Web3 & Cloud Architecture Workshop',
    bannerImageUrl: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=1200&q=80',
    type: 'Workshop',
    level: 'Internal',
    organizer: 'AWS & IT Student Club',
    description: 'Hands-on intensive bootcamp on containerizing microservices with Docker & deploying serverless architectures on AWS Lambda.',
    prizeDetails: '📜 Certificate of Completion + AWS Credits',
    registrationLink: 'https://example.com/aws-workshop',
    startDate: '2026-07-28',
    endDate: '2026-07-29',
    registrationDeadline: '2026-07-27',
    createdAt: '2026-07-21'
  },
  {
    id: 'evt-3',
    title: '💡 Inter-College Algorithmic CodeSprint 2026',
    bannerImageUrl: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=1200&q=80',
    type: 'Competition',
    level: 'National',
    organizer: 'CodeChef College Chapter',
    description: '3-hour competitive programming speed contest featuring dynamic programming and graph theory challenges.',
    prizeDetails: '🎁 $1,200 Cash Pool + Tech Swag',
    registrationLink: 'https://codechef.com',
    startDate: '2026-06-10',
    endDate: '2026-06-10',
    registrationDeadline: '2026-06-08',
    createdAt: '2026-06-01'
  }
];

export const INITIAL_BROADCASTS = [
  {
    id: 'bcast-1',
    title: '✨ Diwali Special Grand Hackathon 2026',
    message: 'Celebrate Diwali with Code! Join the 48-Hour National AI & Cloud Hackathon with cash prizes up to ₹1,50,000 & direct interview fast-tracks!',
    bannerImageUrl: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=1200&q=80',
    linkUrl: 'https://hackathon.itdept.edu',
    linkLabel: 'Register Now 🚀',
    isSkippable: true,
    autoCloseSeconds: 10,
    isFestivalMode: true,
    animationType: 'confetti',
    isActive: true,
    createdAt: '2026-07-28T10:00:00.000Z',
    createdBy: 'HOD / IT Department'
  }
];

export const INITIAL_THIS_OR_THAT = [
  {
    id: 'tot-1',
    date: new Date().toISOString().split('T')[0],
    question: 'Which backend tech stack do you prefer for high-scale web apps?',
    optionA: 'Node.js / Express 🚀',
    optionB: 'Python / FastAPI 🐍',
    votesA: 48,
    votesB: 36,
    category: 'Backend Dev',
    createdAt: '2026-07-29'
  },
  {
    id: 'tot-2',
    date: '2026-07-28',
    question: 'Frontend Styling Philosophy:',
    optionA: 'Tailwind CSS Utility-First 🎨',
    optionB: 'Vanilla CSS / Custom Modules 💎',
    votesA: 72,
    votesB: 28,
    category: 'UI Engineering',
    createdAt: '2026-07-28'
  },
  {
    id: 'tot-3',
    date: '2026-07-27',
    question: 'Ideal Database Choice for Social Media Platforms:',
    optionA: 'PostgreSQL Relational 🐘',
    optionB: 'MongoDB Document NoSQL 🍃',
    votesA: 55,
    votesB: 45,
    category: 'Database',
    createdAt: '2026-07-27'
  }
];

export const INITIAL_IT_FACTS = [
  {
    id: 'fact-1',
    fact: 'The first computer bug was an actual real moth trapped inside a Harvard Mark II relay in 1947 by Grace Hopper\'s team.',
    category: 'Computer History'
  },
  {
    id: 'fact-2',
    fact: 'Over 90% of the world\'s currency exists purely as digital data on secure banking servers, rather than physical banknotes or coins.',
    category: 'Fintech & Security'
  },
  {
    id: 'fact-3',
    fact: 'Java was originally named "Oak", named after an oak tree standing outside creator James Gosling\'s office window.',
    category: 'Programming Languages'
  },
  {
    id: 'fact-4',
    fact: 'Linux operating systems power 100% of the top 500 fastest supercomputers in the world today.',
    category: 'Operating Systems'
  },
  {
    id: 'fact-5',
    fact: 'The QWERTY keyboard layout was created in 1873 to deliberately slow down typists and prevent mechanical typewriter jams!',
    category: 'Hardware'
  }
];

export const INITIAL_LEADERBOARD_USERS = [
  { id: 'usr-1', uid: 'u1', name: 'Alex Morgan', classSection: 'IT-A', funPoints: 1420, streak: 14, equippedBorder: 'cyber_neon', equippedTitleId: 'title_code_architect', equippedAvatarBgId: 'bg_indigo', unlockedBorderIds: ['default', 'cyber_neon'], unlockedTitleIds: ['title_novice', 'title_code_architect'], unlockedAvatarBgIds: ['bg_slate', 'bg_indigo'], role: 'student' },
  { id: 'usr-2', uid: 'u2', name: 'Priya Sharma', classSection: 'IT-B', funPoints: 1280, streak: 11, equippedBorder: 'golden_legend', equippedTitleId: 'title_quiz_master', equippedAvatarBgId: 'bg_emerald', unlockedBorderIds: ['default', 'cyber_neon', 'golden_legend'], unlockedTitleIds: ['title_novice', 'title_quiz_master'], unlockedAvatarBgIds: ['bg_slate', 'bg_emerald'], role: 'student' },
  { id: 'usr-3', uid: 'u3', name: 'Rahul Verma', classSection: 'IT-A', funPoints: 1150, streak: 8, equippedBorder: 'emerald_shield', equippedTitleId: 'title_bug_hunter', equippedAvatarBgId: 'bg_amber', unlockedBorderIds: ['default', 'emerald_shield'], unlockedTitleIds: ['title_novice', 'title_bug_hunter'], unlockedAvatarBgIds: ['bg_slate', 'bg_amber'], role: 'student' },
  { id: 'usr-4', uid: 'u4', name: 'Karthik Raja', classSection: 'IT-C', funPoints: 1040, streak: 7, equippedBorder: 'quantum_violet', equippedTitleId: 'title_algorithm_boss', equippedAvatarBgId: 'bg_sunset', unlockedBorderIds: ['default', 'quantum_violet'], unlockedTitleIds: ['title_novice', 'title_algorithm_boss'], unlockedAvatarBgIds: ['bg_slate', 'bg_sunset'], role: 'student' },
  { id: 'usr-5', uid: 'u5', name: 'Sneha Patel', classSection: 'IT-B', funPoints: 980, streak: 6, equippedBorder: 'crimson_master', equippedTitleId: 'title_cyber_hero', equippedAvatarBgId: 'bg_galaxy', unlockedBorderIds: ['default', 'crimson_master'], unlockedTitleIds: ['title_novice', 'title_cyber_hero'], unlockedAvatarBgIds: ['bg_slate', 'bg_galaxy'], role: 'student' },
  { id: 'usr-6', uid: 'u6', name: 'Vikas Kumar', classSection: 'IT-C', funPoints: 890, streak: 5, equippedBorder: 'default', equippedTitleId: 'title_novice', equippedAvatarBgId: 'bg_slate', unlockedBorderIds: ['default'], unlockedTitleIds: ['title_novice'], unlockedAvatarBgIds: ['bg_slate'], role: 'student' },
  { id: 'usr-7', uid: 'u7', name: 'Ananya Reddy', classSection: 'IT-A', funPoints: 810, streak: 4, equippedBorder: 'default', equippedTitleId: 'title_novice', equippedAvatarBgId: 'bg_slate', unlockedBorderIds: ['default'], unlockedTitleIds: ['title_novice'], unlockedAvatarBgIds: ['bg_slate'], role: 'student' },
  { id: 'usr-8', uid: 'u8', name: 'Gokul Krishna', classSection: 'IT-B', funPoints: 750, streak: 3, equippedBorder: 'default', equippedTitleId: 'title_novice', equippedAvatarBgId: 'bg_slate', unlockedBorderIds: ['default'], unlockedTitleIds: ['title_novice'], unlockedAvatarBgIds: ['bg_slate'], role: 'student' }
];


