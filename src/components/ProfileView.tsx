import React, { useState } from 'react';
import { User, Save, Loader2, Building, GraduationCap, Phone, Hash } from 'lucide-react';
import { db } from '../firebase';
import { doc, setDoc, collection, query, where, getDocs, writeBatch } from 'firebase/firestore';
import { StudentUser } from '../types';

interface ProfileViewProps {
  currentUser: StudentUser;
  setCurrentTab?: (tab: string) => void;
}

export default function ProfileView({ currentUser }: ProfileViewProps) {
  const [isSaving, setIsSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  const [formData, setFormData] = useState({
    fullName: currentUser.fullName || '',
    phone: currentUser.phone || '',
    collegeName: currentUser.collegeName || '',
    degree: currentUser.degree || 'B.Tech',
    fieldOfStudy: currentUser.fieldOfStudy || '',
    currentYear: currentUser.currentYear || '',
    passingYear: currentUser.passingYear || '',
    registrationNo: currentUser.registrationNo || '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setSuccessMsg('');
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSuccessMsg('');

    try {
      // 1. Update the central students collection
      const studentId = currentUser.id || (currentUser as any).uid;
      const studentRef = doc(db, 'students', studentId);
      await setDoc(studentRef, { ...formData }, { merge: true });

      // 2. Batch update all enrollments for this user so certificates/offer letters update globally
      const userEmail = (currentUser.email || '').toLowerCase();
      const enrollmentsQuery = query(collection(db, 'enrollments'), where('email', '==', userEmail));
      const snap = await getDocs(enrollmentsQuery);
      
      const batch = writeBatch(db);
      snap.forEach((d) => {
        batch.update(d.ref, { ...formData });
      });
      await batch.commit();

      setSuccessMsg('Profile updated successfully across all your enrollments!');
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Failed to update profile: ' + (error instanceof Error ? error.message : 'Please try again.'));
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-[85vh] bg-slate-50 py-12 px-4 sm:px-6 lg:px-8 flex justify-center">
      <div className="max-w-4xl w-full">
        {/* Header section */}
        <div className="mb-8 md:flex md:items-center md:justify-between">
          <div className="flex-1 min-w-0">
            <h2 className="text-3xl font-extrabold text-slate-900 sm:text-4xl tracking-tight flex items-center gap-3">
              <User className="h-10 w-10 text-blue-600 bg-blue-100 p-2 rounded-2xl" />
              My Global Profile
            </h2>
            <p className="mt-2 text-sm text-slate-500 max-w-2xl">
              Changes made here will instantly sync and reflect on all your active internships, offer letters, and completion certificates.
            </p>
          </div>
        </div>

        {/* Profile Form Card */}
        <div className="bg-white shadow-xl shadow-slate-200/40 rounded-3xl overflow-hidden border border-slate-200/60">
          <form onSubmit={handleSave}>
            <div className="px-6 py-8 sm:p-10 space-y-8">
              
              <div className="grid grid-cols-1 gap-y-6 gap-x-8 sm:grid-cols-2">
                {/* Full Name */}
                <div className="sm:col-span-2">
                  <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 mb-1.5">
                    <User className="h-4 w-4 text-blue-500" /> Full Legal Name
                  </label>
                  <input
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleChange}
                    required
                    className="block w-full rounded-xl border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm py-3 px-4 bg-slate-50"
                    placeholder="E.g. John Doe"
                  />
                  <p className="text-xs text-slate-400 mt-1.5">This name will be printed exactly as-is on your certificates.</p>
                </div>

                {/* Phone */}
                <div>
                  <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 mb-1.5">
                    <Phone className="h-4 w-4 text-green-500" /> Phone Number (WhatsApp)
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    required
                    className="block w-full rounded-xl border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm py-3 px-4 bg-slate-50"
                  />
                </div>

                {/* Registration No */}
                <div>
                  <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 mb-1.5">
                    <Hash className="h-4 w-4 text-purple-500" /> College Registration / Roll No.
                  </label>
                  <input
                    type="text"
                    name="registrationNo"
                    value={formData.registrationNo}
                    onChange={handleChange}
                    className="block w-full rounded-xl border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm py-3 px-4 bg-slate-50"
                  />
                </div>

                {/* College Name */}
                <div className="sm:col-span-2">
                  <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 mb-1.5">
                    <Building className="h-4 w-4 text-indigo-500" /> College / University Name
                  </label>
                  <input
                    type="text"
                    name="collegeName"
                    value={formData.collegeName}
                    onChange={handleChange}
                    required
                    className="block w-full rounded-xl border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm py-3 px-4 bg-slate-50"
                  />
                </div>

                {/* Degree */}
                <div>
                  <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 mb-1.5">
                    <GraduationCap className="h-4 w-4 text-amber-500" /> Degree Program
                  </label>
                  <select
                    name="degree"
                    value={formData.degree}
                    onChange={handleChange}
                    className="block w-full rounded-xl border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm py-3 px-4 bg-slate-50"
                  >
                    <option value="B.Tech">B.Tech</option>
                    <option value="Diploma">Diploma</option>
                    <option value="BCA">BCA</option>
                    <option value="B.Sc">B.Sc</option>
                    <option value="MBA">MBA</option>
                    <option value="BA">BA</option>
                    <option value="B.Com">B.Com</option>
                  </select>
                </div>

                {/* Field of Study */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                    Field of Study / Branch
                  </label>
                  <input
                    type="text"
                    name="fieldOfStudy"
                    value={formData.fieldOfStudy}
                    onChange={handleChange}
                    required
                    placeholder="e.g. Computer Science"
                    className="block w-full rounded-xl border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm py-3 px-4 bg-slate-50"
                  />
                </div>

                {/* Current Year */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                    Current Year
                  </label>
                  <select
                    name="currentYear"
                    value={formData.currentYear}
                    onChange={handleChange}
                    required
                    className="block w-full rounded-xl border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm py-3 px-4 bg-slate-50"
                  >
                    <option value="">Select Year</option>
                    <option value="1st Year">1st Year</option>
                    <option value="2nd Year">2nd Year</option>
                    <option value="3rd Year">3rd Year</option>
                    <option value="4th Year">4th Year</option>
                    <option value="Graduated">Graduated</option>
                  </select>
                </div>

                {/* Passing Year */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                    Expected Passing Year
                  </label>
                  <input
                    type="text"
                    name="passingYear"
                    value={formData.passingYear}
                    onChange={handleChange}
                    required
                    placeholder="e.g. 2026"
                    className="block w-full rounded-xl border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm py-3 px-4 bg-slate-50"
                  />
                </div>

              </div>
            </div>

            {/* Form Actions */}
            <div className="bg-slate-50/50 px-6 py-6 sm:px-10 border-t border-slate-200/60 flex items-center justify-between">
              <div>
                {successMsg && (
                  <span className="text-sm font-bold text-green-600 flex items-center gap-1.5">
                    <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse"></div>
                    {successMsg}
                  </span>
                )}
              </div>
              <button
                type="submit"
                disabled={isSaving}
                className="inline-flex justify-center items-center gap-2 rounded-full border border-transparent bg-blue-600 py-3 px-8 text-sm font-bold text-white shadow-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-70 transition-all active:scale-95"
              >
                {isSaving ? <Loader2 className="h-5 w-5 animate-spin" /> : <Save className="h-5 w-5" />}
                {isSaving ? 'Syncing...' : 'Save & Sync Globally'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
