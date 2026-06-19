import { InternshipDomain, FAQItem } from './types';

export const INTERNSHIP_DOMAINS: InternshipDomain[] = [
  {
    id: 'building_construction',
    title: 'Building Construction',
    category: 'Hardware',
    shortDesc: 'Explore modern structural design, foundation systems, project estimators, and material selection paradigms for real-world concrete and steel structures.',
    iconName: 'Blocks',
    durationWeeks: [4, 8, 12],
    targetDegrees: ['B.Tech', 'Diploma'],
    skills: ['Structural Estimations', 'Foundation Calculus', 'Material Strength Analysis', 'Project Management'],
    toolsAndTech: ['MS Project', 'P6 Primavera', 'STAAD.Pro', 'Concrete Mix Calibration'],
    gradient: 'from-amber-600 via-orange-600 to-red-700',
    phases: [
      {
        title: 'Structural Material Diagnostics',
        description: 'Establish structural load factors, examine concrete mix design ratios, and evaluate material stress capacities.',
        deliverables: ['Concrete compressive strength analysis matrix', 'Standard concrete mix design calculations record']
      },
      {
        title: 'Foundation & Estimate Calculus',
        description: 'Model shallow and deep footings weight tolerances, estimate structural material volumes and project bills.',
        deliverables: ['Quantity Takeoff Spreadsheet and estimation sheet', 'Structural slab reinforcement layout schematic']
      },
      {
        title: 'Capstone Construction Project Schedule',
        description: 'Synthesize project management phases, schedule critical path progress timelines, and assess site safety checklists.',
        deliverables: ['Primavera / MS Project execution timeline build', 'Construction site quality assurance audit checklist']
      }
    ]
  },
  {
    id: 'autocad',
    title: 'AutoCAD',
    category: 'Design',
    shortDesc: 'Master 2D drafting and 3D modeling of mechanical parts, architectural floor plans, plumbing pipelines, and machine components.',
    iconName: 'Layers',
    durationWeeks: [4, 8, 12],
    targetDegrees: ['B.Tech', 'Diploma'],
    skills: ['2D Geometric Drafting', 'Isometric Projections', 'Architectural Layout Planning', 'Orthographic Projection Models'],
    toolsAndTech: ['Autodesk AutoCAD', 'CAD coordinate helpers', 'Standard Layer libraries', 'Plotting & Sheet Sets'],
    gradient: 'from-red-500 via-rose-600 to-pink-700',
    phases: [
      {
        title: '2D Coordinate & Isometric Drafts',
        description: 'Understand absolute, relative polar coordinates, command shortcuts, layers, hatch parameters, and engineering notation.',
        deliverables: ['Precision mechanical part engineering draft drawing', 'Custom architectural layers and styles template']
      },
      {
        title: '3D Modeling & Sectional Projections',
        description: 'Extrude 2D drafts into solid 3D solids, perform Boolean join subtracts, and generate orthographic layouts.',
        deliverables: ['3D parametric block model design files', 'Sectional views details diagram and documentation']
      },
      {
        title: 'Capstone Architectural Floor Plan',
        description: 'Draw complete floor layouts showing doors, windows, elevations, annotations, schedules, and plot styles.',
        deliverables: ['Comprehensive multi-story 2BHK architectural floor blueprint', 'Finished CAD drawing set exported to standard formats']
      }
    ]
  },
  {
    id: 'web_development',
    title: 'Web Development',
    category: 'Tech',
    shortDesc: 'Create fast, responsive web systems using structural modern HTML, CSS, JavaScript engines, adaptive layouts, and web components.',
    iconName: 'CodeXml',
    durationWeeks: [4, 8, 12],
    targetDegrees: ['B.Tech', 'Diploma', 'BCA', 'B.Sc'],
    skills: ['Semantic DOM Structure', 'Advanced Flexbox and CSS Grids', 'Dynamic Core JavaScript', 'Responsive Styling & Layouts'],
    toolsAndTech: ['HTML5', 'CSS3', 'JavaScript ES6+', 'Tailwind CSS', 'Vite compiler', 'Git control'],
    gradient: 'from-cyan-500 via-blue-600 to-indigo-700',
    phases: [
      {
        title: 'Semantic Layouts and CSS Styling',
        description: 'Author standards-compliant HTML forms and master Tailwind responsive classes, shadows, borders, and margins.',
        deliverables: ['Pixel-perfect product sales page build', 'Active responsive administration grid dashboard']
      },
      {
        title: 'Asynchronous Logic & DOM control',
        description: 'Bind actions to user events, manipulate list nodes dynamically, parse JSON, and handle API responses.',
        deliverables: ['Static stateful listing app with live search options', 'Remote API data integration script']
      },
      {
        title: 'Capstone High Performance Web App',
        description: 'Coordinate UI paths, optimize bundle build weights, structure static deployment pipelines, and verify responsiveness.',
        deliverables: ['Finished web product directory application', 'Production build speed benchmark evaluation sheet']
      }
    ]
  },
  {
    id: 'python_programming',
    title: 'Python Programming',
    category: 'Tech',
    shortDesc: 'Learn object-oriented programming, file operations, algorithmic puzzles, data parsers, and automation script engines in Python.',
    iconName: 'Brain',
    durationWeeks: [4, 8, 12],
    targetDegrees: ['B.Tech', 'BCA', 'B.Sc', 'Diploma', 'MBA'],
    skills: ['OOP Design Patterns', 'File Input/Output Engines', 'Algorithm Complexity Analysis', 'Excel and API Automation'],
    toolsAndTech: ['Python 3+', 'Pipenv environments', 'Jupyter Lab', 'Pandas datasets', 'OpenPyXL excel tools', 'Requests SDK'],
    gradient: 'from-yellow-500 via-green-600 to-teal-700',
    phases: [
      {
        title: 'Algorithmic Data Structures',
        description: 'Master list comprehensions, dictionary indexing, error try/except blocks, string manipulations, and file system reads.',
        deliverables: ['Optimized custom CSV data parser script', 'Automated system directories backup tool']
      },
      {
        title: 'OOP Architectures & Command Lines',
        description: 'Compose robust class inheritance models, custom decorators, and process CLI input prompts with structural validation.',
        deliverables: ['Interactive terminal bank application program outline', 'Automated data log generator and text analyzer']
      },
      {
        title: 'Capstone File & Data Pipeline',
        description: 'Sync multiple Excel workbooks, parse structured remote APIs, create charts, and send automated notifications.',
        deliverables: ['Comprehensive multi-format report compiler system', 'System automated test logs showing data validation']
      }
    ]
  },
  {
    id: 'data_science',
    title: 'Data Science',
    category: 'Tech',
    shortDesc: 'Extract deep knowledge from complex datasets, write statistical regression/classification algorithms, and deploy predictive engines.',
    iconName: 'BarChart4',
    durationWeeks: [4, 8, 12],
    targetDegrees: ['B.Tech', 'BCA', 'B.Sc', 'MBA'],
    skills: ['Exploratory Statistical Audits', 'Feature Engineering Matrices', 'Regression & RandomForest Modeling', 'Interactive Data Dashboards'],
    toolsAndTech: ['Python', 'Pandas', 'NumPy', 'Scikit-Learn', 'Matplotlib & Seaborn', 'Tableau desktop tools'],
    gradient: 'from-rose-500 via-purple-600 to-indigo-700',
    phases: [
      {
        title: 'Data Cleaning & Exploratory Analysis',
        description: 'Impute missing values, remove outlier records, normalize distributions, and generate Pearson correlation matrices.',
        deliverables: ['Comprehensive Exploratory Data Analysis Jupyter Notebook', 'Custom distribution charts showing data insights']
      },
      {
        title: 'Predictive Modeling & Tuning',
        description: 'Split datasets into train/test, build regression models, evaluate performance metrics, and optimize parameters.',
        deliverables: ['Calibrated random forest classifier algorithm', 'Model accuracy scorecard with MSE / ROC metrics']
      },
      {
        title: 'Capstone Insights BI Dashboard',
        description: 'Integrate dynamic filters, compile feature importance logs, and write executive summary business proposals.',
        deliverables: ['Fully functional analytical dashboard mockup', 'Executive-level summary of actionable predictive insights']
      }
    ]
  },
  {
    id: 'revit',
    title: 'Revit',
    category: 'Design',
    shortDesc: 'Construct rich Building Information Modeling (BIM) mockups, coordinate structural coordinates, and design architectural assets.',
    iconName: 'Layers',
    durationWeeks: [4, 8, 12],
    targetDegrees: ['B.Tech', 'Diploma'],
    skills: ['Parametric Family Design', 'Structural Level Modeling', 'BIM Interoperability', 'Material Schedule Audit'],
    toolsAndTech: ['Autodesk Revit', 'BIM parameters', 'Enscape renderer', 'Material schedules lists'],
    gradient: 'from-sky-400 via-blue-500 to-indigo-600',
    phases: [
      {
        title: 'Levels, Walls, and basic layouts',
        description: 'Model floor configurations, specify wall structural composite layers, modify doors and windows parametric parameters.',
        deliverables: ['Finished 3D architectural shell prototype design', 'Custom component families collection catalog']
      },
      {
        title: 'BIM Schedules, Sheets, & MEP checks',
        description: 'Design ceiling layers, coordinate electrical lighting nodes, generate quantity takeoffs schedules, and run clash checkings.',
        deliverables: ['Calculated structural schedules tables sheets', 'Integrated MEP HVAC / Plumbing routing plan']
      },
      {
        title: 'Capstone Professional BIM Rendering',
        description: 'Apply realistic exterior materials, configure atmospheric background lights, set camera flythrough walk frames.',
        deliverables: ['Complete BIM construction drawings sheet document', 'Exterior scene rendered walkthrough scenes and animation frames']
      }
    ]
  },
  {
    id: 'full_stack',
    title: 'Full Stack Development',
    category: 'Tech',
    shortDesc: 'Create robust client-side React views coupled with performant Express server nodes, token authorization, and database persistence.',
    iconName: 'CodeXml',
    durationWeeks: [4, 8, 12],
    targetDegrees: ['B.Tech', 'Diploma', 'BCA', 'B.Sc'],
    skills: ['React Virtual DOM', 'Asynchronous API Gateways', 'Relational/Non-relational Schemas', 'JWT Token Authentication'],
    toolsAndTech: ['React.js', 'Node.js', 'Express.js', 'MongoDB / SQL', 'TypeScript', 'Tailwind CSS'],
    gradient: 'from-emerald-400 via-teal-600 to-cyan-700',
    phases: [
      {
        title: 'Responsive Frontend Framework State',
        description: 'Harness state lifecycle callbacks, custom React hooks, prop validations, and fluid responsive grid layers.',
        deliverables: ['Single page dashboard view with search filters', 'Local persistent state-driven tracker catalog']
      },
      {
        title: 'REST API & Secure Database Operations',
        description: 'Build backend routes, configure schemas with field restrictions, sanitize input data, and encrypt passwords.',
        deliverables: ['JSON database modeling files', 'Complete API server routing registry showing active CRUD controls']
      },
      {
        title: 'Capstone Full Stack Deployment',
        description: 'Deploy assets, secure route protection parameters, configure environment variables, and verify latency profiles.',
        deliverables: ['Deployed full-stack app on a live host server', 'System benchmark and API performance validation sheet']
      }
    ]
  },
  {
    id: 'core_java',
    title: 'Java Development',
    category: 'Tech',
    shortDesc: 'Build robust backends, multithreaded queues, object collections API, and Spring Boot microservice architectures.',
    iconName: 'Layers',
    durationWeeks: [4, 8, 12],
    targetDegrees: ['B.Tech', 'BCA', 'B.Sc'],
    skills: ['Java Collections Pipeline', 'JVM Heap Management', 'Spring Boot API Routing', 'Hibernate & JPA Persistence'],
    toolsAndTech: ['Java 17+', 'Spring Boot framework', 'Hibernate ORM', 'Maven Builds tools', 'PostgreSQL SQL', 'JUnit Engine'],
    gradient: 'from-orange-500 via-rose-600 to-indigo-700',
    phases: [
      {
        title: 'OOP & Concurrent Collection Libraries',
        description: 'Master hash map parameters, array resizing limits, concurrent thread queues, and clean object memory design.',
        deliverables: ['Thread-safe consumer matching queue processor script', 'Comprehensive logic test cases dataset built in JUnit']
      },
      {
        title: 'Spring Framework REST Pipelines',
        description: 'Implement MVC controllers, establish relational maps, handle parameter mapping exceptions, and configure filters.',
        deliverables: ['Secure Spring Boot microservice with complete data layers', 'Database schema migration and validation file']
      },
      {
        title: 'Capstone Enterprise API Registry',
        description: 'Draft decouplers, rate limits, request handlers, cache parameters, and secure transaction limits.',
        deliverables: ['Fully functional enterprise data service pipeline', 'Performance profiling metrics worksheet showing latency logs']
      }
    ]
  },
  {
    id: 'electric_vehicle',
    title: 'Electric Vehicle',
    category: 'Hardware',
    shortDesc: 'Study battery management, brushless motors, regenerative braking schedules, and power electronics configurations for EVs.',
    iconName: 'Cpu',
    durationWeeks: [4, 8, 12],
    targetDegrees: ['B.Tech', 'Diploma'],
    skills: ['Battery Cell Balancing', 'BMS Modeling and Safety', 'BLDC Motor Speed speed', 'Kinetic Energy Recov. Models'],
    toolsAndTech: ['MATLAB Sim', 'BMS Hardware', 'BLDC Motors configs', 'Battery Packs Systems'],
    gradient: 'from-green-500 via-emerald-600 to-teal-700',
    phases: [
      {
        title: 'EV Battery Pack Cell Simulation',
        description: 'Explore lithium cell thermodynamic behaviors, cooling schedules, state-of-charge tracking levels, and overcharge safety.',
        deliverables: ['Thermodynamic battery degradation mock calculations', 'Cell matching and balancing logic simulator program']
      },
      {
        title: 'BLDC Vector Torque & Speed',
        description: 'Understand brushless current components, rotational speed profiles under load changes, and regenerative braking metrics.',
        deliverables: ['Brushless motor rotational current simulation file', 'Dynamic braking regeneration efficiency mapping chart']
      },
      {
        title: 'Capstone Complete EV Power System',
        description: 'Assemble complete BMS feedback routines, battery temperature alarms, and drive cycle energy usage charts.',
        deliverables: ['System-level electrical connection schematics', 'Vehicle drive-cycle simulation power consumption worksheet']
      }
    ]
  },
  {
    id: 'solidworks',
    title: 'SolidWorks',
    category: 'Design',
    shortDesc: 'Develop 3D parametric physical models, run mechanical motion analyses, load simulations, and detailed engineering drafts.',
    iconName: 'Wrench',
    durationWeeks: [4, 8, 12],
    targetDegrees: ['B.Tech', 'Diploma'],
    skills: ['Parametric Feature Design', 'Kinematic Assembly Simulation', 'Stress/Load Finite Elements Analysis', 'Technical Sheet Drafting'],
    toolsAndTech: ['DS SolidWorks', 'FEA Simulation tools', 'Assembly relations', 'Drafting standards'],
    gradient: 'from-blue-500 via-indigo-600 to-sky-700',
    phases: [
      {
        title: 'Part Modeling & Sketches Design',
        description: 'Create fully defined mechanical sketches and master boss-extrude, cut-revolve, shell, fillets, and chamfer features.',
        deliverables: ['3D parametric engine valve solid part design', 'Sketches portfolio with correct constraints and tolerances']
      },
      {
        title: 'Mates & Assembly Kinematic Structures',
        description: 'Learn coincident, concentric, distance mates, mechanical slider-crank joints, and examine collisions.',
        deliverables: ['Slider-crank rotational assembly design draft', 'Clash analysis report with interference corrections logs']
      },
      {
        title: 'Capstone FEA Loading Validation',
        description: 'Apply simulated steel weights, mesh geometries, measure stress Von Mises factors, and safety margins.',
        deliverables: ['Structural loading FEA analysis sheet report', 'Standard orthographic blueprint sheet exported with dimensions']
      }
    ]
  },
  {
    id: 'ic_engine',
    title: 'IC Engine',
    category: 'Hardware',
    shortDesc: 'Analyze thermodynamic cycle boundaries, multi-cylinder configurations, air-fuel mixture dynamics, and emission profiles.',
    iconName: 'Settings',
    durationWeeks: [4, 8, 12],
    targetDegrees: ['B.Tech', 'Diploma'],
    skills: ['Otto & Diesel Cycle Calculus', 'Valve Timing Layout Optimization', 'Air-Fuel Induction Schedules', 'Exhaust Emission Auditing'],
    toolsAndTech: ['Thermodynamics', 'Engine Simulators', 'Combustion analyzers', 'CFD basics'],
    gradient: 'from-orange-600 via-red-650 to-amber-700',
    phases: [
      {
        title: 'Indicated Thermal Cycle Efficiency',
        description: 'Analyze thermodynamic gas equations, compression rates, combustion start phases, and calculate engine work output.',
        deliverables: ['Ideal Otto/Diesel cycle PV-diagram calculation sheets', 'Indicated thermal efficiency performance comparison checklist']
      },
      {
        title: 'Multi-cylinder Valve Balance Diagrams',
        description: 'Optimize air-fuel intake timing overlaps, fuel injectors firing patterns, and cooling channel thermal constraints.',
        deliverables: ['Drawn rotational valve timing mechanical diagram', 'Thermal dissipation capacity requirement worksheet']
      },
      {
        title: 'Capstone Engine Performance Audit',
        description: 'Examine brake horse power, torque outputs, frictional losses, fuel consumption, and emission safety tests.',
        deliverables: ['Actual output performance curves analytical charts', 'Exhaust emissions and particulate matter containment system draft']
      }
    ]
  }
];

export const FAQS: FAQItem[] = [
  {
    question: 'How do college credentials tie into the selection matrix?',
    answer: 'Invigo Infotech aligns every applicant with their respective tier structure. B.Tech, Diploma, BCA, B.Sc, and MBA students are sorted automatically into domain clusters that optimize practical learning. We coordinate with colleges for direct academic credits upon verification.'
  },
  {
    question: 'Are these internships virtual (remote) or hybrid?',
    answer: 'All initial technical simulations (Phase I) and advanced structural builds (Phase II) occur within our online metaverse console. Phase III (Capstone Launch) includes live team sessions, and can be compiled as fully remote or hybrid depending on node coordinates.'
  },
  {
    question: 'How do we verify our achievements and certifications?',
    answer: 'Every graduate candidate is issued a cryptographic, verifiable certificate anchored to the Invigo Blockchain. This hash can be verified by recruiters anywhere, providing absolute proof of completion, score records, and project assets.'
  },
  {
    question: 'What happens immediately after we complete the enrollment wizard?',
    answer: 'An automated offer matrix evaluates your academic inputs. In 5-10 seconds, a futuristic digital offer with a unique candidate ID (e.g. INV-2026-X8A4D) is synthesized. You can download this admission letter and access your student dashboard immediately.'
  },
  {
    question: 'Can I switch my domain halfway through the internship?',
    answer: 'Because each program uses highly specific, structured physical/logical nodes and mentor hours, domain allocation is locked once Phase I is initialized. We advise reviewing all 16 domains before final enrollment.'
  }
];

export const TESTIMONIALS = [
  {
    name: 'Vikram Aditya Sharma',
    college: 'Delhi Technological University (DTU)',
    degree: 'B.Tech - Computer Science',
    domain: 'Quantum AI & Deep Learning',
    content: 'Building custom convolutional networks and deploying real-time AI agents on the cloud was mind-blowing. The mentor framework at Invigo Infotech is outstanding!',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?fit=crop&w=150&h=150'
  },
  {
    name: 'Ananya Deshmukh',
    college: 'Sardar Patel College of Engineering',
    degree: 'B.Tech - Electronics',
    domain: 'Internet of Things & Smart Systems',
    content: 'We integrated sensory ESP8266 matrices with remote server dashboards using MQTT. For secondary electronics engineers, the curriculum is pristine!',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?fit=crop&w=150&h=150'
  },
  {
    name: 'Rohan Mehra',
    college: 'Nirma University',
    degree: 'MBA - Business Operations',
    domain: 'FinTech & Strategic Finance',
    content: 'The corporate capstone simulated a venture capital seed investment roundtable. This gave me direct operations portfolio experience that helped me secure my dream banking offer.',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?fit=crop&w=150&h=150'
  },
  {
    name: 'Pooja Kashyap',
    college: 'Government Polytechnic Mumbai',
    degree: 'Diploma - Information Technology',
    domain: 'Full-Stack Cyber Engineering',
    content: 'As a Diploma student, finding rigorous practical internships is hard. Invigo provided a step-by-step roadmap from standard CSS grids up to deployed production database engines.',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?fit=crop&w=150&h=150'
  }
];
