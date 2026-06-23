const fs = require('fs');
const path = 'p:/Invigo/InvigoInfotech/src/components/AdminPanel.tsx';
let code = fs.readFileSync(path, 'utf8');

// Add User to imports if not present
if (!code.includes('User,')) {
    code = code.replace(/Users,/, 'Users, User,');
}

// 1. Inject state
const stateInjection = `const [editStartDate, setEditStartDate] = useState('');
  const [editTrainingMode, setEditTrainingMode] = useState('');
  const [viewingStudent, setViewingStudent] = useState<EnrollmentState | null>(null);`;
code = code.replace(/const \[editStartDate, setEditStartDate\] = useState\(''\);\s*const \[editTrainingMode, setEditTrainingMode\] = useState\(''\);/, stateInjection);

// 2. Inject handler functions
const bulkVerifyMatch = "const handleBulkVerifyPayments = async () => {";
const newFunctions = `const handleExportCSV = () => {
    let csv = "Candidate ID,Full Name,Email,Phone,Domain,Registration No,College,Degree,Year,Status,Payment Status,Amount Paid\\n";
    filteredEnrollments.forEach(e => {
      csv += \`"\${e.candidateId}","\${e.fullName}","\${e.email}","\${e.phone || ''}","\${e.domainId}","\${e.registrationNo || ''}","\${e.collegeName}","\${e.degree}","\${e.currentYear}","\${e.status}","\${e.paymentStatus}","\${e.amountPaid || 0}"\\n\`;
    });
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = \`invigo_enrollments_\${new Date().toISOString().split('T')[0]}.csv\`;
    a.click();
    addLog(\`Exported \${filteredEnrollments.length} enrollments to CSV\`, 'user');
  };

  const handleGenerateBulkEmail = () => {
    const emails = filteredEnrollments.map(e => e.email).filter(Boolean).join(',');
    window.open(\`mailto:?bcc=\${emails}\`);
    addLog(\`Opened email client for \${filteredEnrollments.length} recipients\`, 'communication');
  };

  const handleBulkVerifyPayments = async () => {`;
code = code.replace(bulkVerifyMatch, newFunctions);

// 3. Inject Export Button in Users Section Header
const bulkActionsDivStart = `<div className="flex flex-wrap items-center gap-2 mb-4">`;
const injectedButtons = `<div className="flex flex-wrap items-center justify-between w-full mb-4">
                <div className="flex flex-wrap items-center gap-2">`;
code = code.replace(bulkActionsDivStart, injectedButtons);

// end of bulk actions div injection
const endOfBulkActions = `Bulk Delete
                </button>
                {selectedIds.length > 0 && (
                  <span className="self-center text-[10px] text-slate-500 font-mono">{selectedIds.length} selected</span>
                )}
              </div>`;
const newEndOfBulkActions = `Bulk Delete
                </button>
                {selectedIds.length > 0 && (
                  <span className="self-center text-[10px] text-slate-500 font-mono">{selectedIds.length} selected</span>
                )}
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleExportCSV}
                  className="px-3.5 py-2 rounded-xl text-xs font-bold transition-all border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 active:scale-95 shadow-sm flex items-center gap-1.5 cursor-pointer"
                >
                  <Download className="h-3.5 w-3.5" />
                  Export CSV
                </button>
              </div>
            </div>`;
code = code.replace(endOfBulkActions, newEndOfBulkActions);

// 4. Inject View button in User table rows
const actionButtons = `onClick={() => setEditingEnrollment(enrollment)}
                              className="h-8 w-8 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-500 hover:text-blue-600 hover:bg-blue-50 transition-colors shadow-xs"
                              title="Edit User"
                            >
                              <Edit3 className="h-4 w-4" />
                            </button>`;
const newActionButtons = `onClick={() => setViewingStudent(enrollment)}
                              className="h-8 w-8 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 transition-colors shadow-xs"
                              title="View Profile"
                            >
                              <Eye className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => setEditingEnrollment(enrollment)}
                              className="h-8 w-8 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-500 hover:text-blue-600 hover:bg-blue-50 transition-colors shadow-xs"
                              title="Edit User"
                            >
                              <Edit3 className="h-4 w-4" />
                            </button>`;
code = code.replace(actionButtons, newActionButtons);

// 5. Inject Viewer Modal at bottom of AdminPanel return
const bottomDivRegex = /<\/div>\s*<\/div>\s*\);\s*}\s*$/;
const modalCode = `      {/* View Student Modal */}
      <AnimatePresence>
        {viewingStudent && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm overflow-y-auto"
            onClick={() => setViewingStudent(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
              onClick={e => e.stopPropagation()}
              className="bg-white rounded-[2rem] shadow-2xl w-full max-w-2xl overflow-hidden border border-slate-200 my-8"
            >
              <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center">
                    <User className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-800 leading-tight">{viewingStudent.fullName}</h3>
                    <p className="text-xs text-slate-500 font-mono">{viewingStudent.candidateId}</p>
                  </div>
                </div>
                <button onClick={() => setViewingStudent(null)} className="h-8 w-8 rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 flex items-center justify-center transition-colors">
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="p-6 space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Email</span>
                    <p className="text-sm font-medium text-slate-800">{viewingStudent.email}</p>
                  </div>
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Phone</span>
                    <p className="text-sm font-medium text-slate-800">{viewingStudent.phone || 'N/A'}</p>
                  </div>
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">College</span>
                    <p className="text-sm font-medium text-slate-800">{viewingStudent.collegeName || 'N/A'}</p>
                  </div>
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Domain</span>
                    <p className="text-sm font-medium text-slate-800">{getDomainTitle(viewingStudent.domainId)}</p>
                  </div>
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Payment Status</span>
                    <p className="text-sm font-medium text-slate-800 capitalize">{viewingStudent.paymentStatus || 'Pending'}</p>
                  </div>
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Status</span>
                    <p className="text-sm font-medium text-slate-800 capitalize">{viewingStudent.status || 'Pending'}</p>
                  </div>
                </div>
              </div>
              <div className="p-6 border-t border-slate-100 bg-slate-50 flex justify-end">
                <button onClick={() => setViewingStudent(null)} className="px-6 py-2.5 bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold rounded-xl text-sm transition-colors">
                  Close
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  </div>
  );
}`;
code = code.replace(bottomDivRegex, modalCode);

// Analytics and Communication features
const dashboardSection = `<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">`;
const analyticsDashboard = `
              {/* Analytics Section */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-sm">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 rounded-lg bg-green-50 text-green-600">
                      <CreditCard className="h-4 w-4" />
                    </div>
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Revenue</span>
                  </div>
                  <h3 className="text-2xl font-black text-slate-800">
                    ₹{allEnrollments.filter(e => e.paymentVerified).reduce((acc, curr) => acc + (Number(curr.amountPaid) || 0), 0).toLocaleString('en-IN')}
                  </h3>
                </div>
                
                <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-sm">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 rounded-lg bg-indigo-50 text-indigo-600">
                      <Globe className="h-4 w-4" />
                    </div>
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Top Domain</span>
                  </div>
                  <h3 className="text-xl font-bold text-slate-800 truncate">
                    {(() => {
                      const counts = allEnrollments.reduce((acc, curr) => {
                        acc[curr.domainId] = (acc[curr.domainId] || 0) + 1;
                        return acc;
                      }, {} as Record<string, number>);
                      const top = Object.entries(counts).sort((a, b) => b[1] - a[1])[0];
                      return top ? getDomainTitle(top[0]) : 'N/A';
                    })()}
                  </h3>
                </div>

                <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-sm">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 rounded-lg bg-blue-50 text-blue-600">
                      <Activity className="h-4 w-4" />
                    </div>
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Active Students</span>
                  </div>
                  <h3 className="text-2xl font-black text-slate-800">
                    {allEnrollments.filter(e => e.status === 'In Progress').length}
                  </h3>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">`;
code = code.replace(dashboardSection, analyticsDashboard);


// Communication Section Upgrade
const commSection = `placeholder="Type your announcement or message here..."`;
const commInjection = `placeholder="Type your announcement or message here..."`;

const bulkCommButton = `<button
                        onClick={handleSendCommunication}
                        disabled={!commSubject || !commMessage}
                        className="w-full sm:w-auto px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer"
                      >
                        <Send className="h-4 w-4" />
                        Broadcast Message
                      </button>`;
const bulkCommInjection = `<button
                        onClick={handleSendCommunication}
                        disabled={!commSubject || !commMessage}
                        className="w-full sm:w-auto px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer"
                      >
                        <Send className="h-4 w-4" />
                        Broadcast Message
                      </button>
                      <button
                        onClick={handleGenerateBulkEmail}
                        className="w-full sm:w-auto px-6 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-sm transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer"
                        title="Generates an email with all filtered users BCC'd"
                      >
                        <Mail className="h-4 w-4" />
                        Open Email Client (BCC All)
                      </button>`;
code = code.replace(bulkCommButton, bulkCommInjection);

fs.writeFileSync(path, code);
console.log('Features injected successfully.');
