const fs = require('fs');
const path = require('path');

const domains = [
  "Staad Pro", "Ansys", "Embedded System", "Internet of Things", "Renewable Energy", 
  "Plc Programming", "MATLAB", "Accounting, Tally & GST", "AI Ethics", "Arabic AI", 
  "Archaeology", "Biomedical Research", "Buddhist Studies & Heritage", "Climate & Carbon", 
  "Clinical Counseling", "Corporate Legal", "Cyber Security", "Digital Archives", 
  "Digital Marketing (DM)", "ESG Research", "Ethnographic Field Research", 
  "Financial Mathematics & Stock Market (FinMath)", "Food Technology & FMCG", 
  "Genetics, Biotech & Zoology", "GIS Analysis", "Herbal & Ayurvedic Product Development", 
  "Heritage Conservation", "Hindi Journalism", "Hindi Content Writing & AI", 
  "Historical Content, SEO & Blogging", "HR Operations (HR Ops)", "Human Rights", 
  "Maithili AI", "Mental Health", "Microfinance", "Music Production", "Organic Farming", 
  "Personal Finance", "Pharma & Drug Chemistry", "Political Journalism", "Public Health", 
  "Renewable Energy System", "Sales", "Sanskrit", "Scriptwriting", "Solar Energy PV", 
  "Spoken English", "Urdu"
];

function toId(name) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/_$/, '').replace(/^_/, '');
}

const dataTsPath = path.join(__dirname, 'src', 'data.ts');
let dataTs = fs.readFileSync(dataTsPath, 'utf8');

const newDomains = [];
const colors = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#6366f1', '#8b5cf6', '#ec4899', '#14b8a6'];

function generateSvg(name, dest, index) {
  const color = colors[index % colors.length];
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="600" height="400" viewBox="0 0 600 400">
    <rect width="600" height="400" fill="${color}" />
    <text x="300" y="200" font-family="system-ui, sans-serif" font-size="36" font-weight="bold" fill="white" text-anchor="middle" dominant-baseline="middle">
      ${name.replace(/&/g, '&amp;')}
    </text>
  </svg>`;
  fs.writeFileSync(dest, svg);
}

async function processDomains() {
  let count = 0;
  for (const name of domains) {
    const id = toId(name);
    
    if (dataTs.includes(`id: '${id}'`)) {
      console.log(`Domain ${name} already exists. Skipping.`);
      continue;
    }
    
    const imageUrl = `/domain_${id}.svg`;
    const imagePath = path.join(__dirname, 'public', `domain_${id}.svg`);
    
    console.log(`Generating SVG for ${name}...`);
    generateSvg(name, imagePath, count++);
    
    const domainObj = `  {
    id: '${id}',
    title: '${name}',
    category: 'Specialized',
    shortDesc: 'Comprehensive internship program in ${name} covering advanced concepts and practical applications.',
    iconName: 'BookOpen',
    durationWeeks: [4, 8, 12],
    targetDegrees: ['B.Tech', 'B.Sc', 'BA', 'B.Com', 'MBA', 'Diploma'],
    targetBranches: ['General'],
    skills: ['${name} Principles', 'Industry Best Practices', 'Project Management'],
    toolsAndTech: ['Standard Industry Tools', 'Modern Frameworks'],
    gradient: 'from-slate-700 via-slate-800 to-slate-900',
    imageUrl: '${imageUrl}',
    phases: [
      { title: 'Foundations of ${name}', description: 'Introduction to core concepts and methodologies.', deliverables: ['Initial concept map', 'Foundational assessment'] },
      { title: 'Advanced Applications', description: 'Deep dive into practical scenarios and complex problem solving.', deliverables: ['Case study analysis', 'Mid-term project'] },
      { title: 'Capstone Project', description: 'Real-world application of learned skills in a comprehensive project.', deliverables: ['Final project presentation', 'Comprehensive report'] }
    ]
  }`;
    newDomains.push(domainObj);
  }

  if (newDomains.length > 0) {
    const searchStr = 'export const INTERNSHIP_DOMAINS: InternshipDomain[] = [';
    const startIndex = dataTs.indexOf(searchStr);
    
    if (startIndex !== -1) {
      const rest = dataTs.slice(startIndex);
      const match = rest.match(/\n\];/);
      
      if (match) {
        const insertPos = startIndex + match.index;
        const insertStr = ',\n' + newDomains.join(',\n');
        dataTs = dataTs.slice(0, insertPos) + insertStr + dataTs.slice(insertPos);
        
        fs.writeFileSync(dataTsPath, dataTs);
        console.log(`Successfully added ${newDomains.length} domains to data.ts`);
      } else {
        console.error("Could not find the end of INTERNSHIP_DOMAINS array.");
      }
    } else {
      console.error("Could not find INTERNSHIP_DOMAINS declaration.");
    }
  } else {
    console.log("No new domains to add.");
  }
}

processDomains().catch(console.error);
