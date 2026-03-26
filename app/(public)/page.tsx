'use client';

import React from 'react';
import Link from 'next/link';
import { Search, Sparkles, MapPin, ArrowRight, ShieldCheck, FileText, CheckCircle2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export default function LandingPage() {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col w-full animate-fadeIn">
      {/* SECTION 1: HERO */}
      <section className="relative pt-20 pb-32 overflow-hidden bg-gray-50">
        <div className="absolute inset-0 z-0 opacity-5 pointer-events-none" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0 100h100v-20L80 70 60 80 40 60 20 75 0 65v35z' fill='%234F46E5' fill-rule='evenodd'/%3E%3C/svg%3E")`,
          backgroundSize: '100px 100px'
        }} />
        <div className="absolute top-0 right-0 w-1/2 h-full bg-indigo-50/50 clip-path-hero" />
        
        <div className="relative z-10 max-w-6xl mx-auto px-4 py-8 sm:px-6 lg:px-8 text-center pt-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-100 text-indigo-700 text-sm font-semibold tracking-wide mb-8 animate-fade-in-up">
            <Sparkles className="w-4 h-4" /> {t('landing.badge')}
          </div>
          
          <h1 className="text-5xl md:text-7xl font-extrabold text-gray-900 tracking-tight mb-8 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
            {t('landing.headline')} <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">{t('landing.headlineHighlight')}</span>
          </h1>
          
          <p className="text-xl text-gray-600 mb-12 max-w-3xl mx-auto leading-relaxed animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
            {t('landing.subline')}
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6 animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
            <Link 
              href="/schemes" 
              className="w-full sm:w-auto px-8 py-4 rounded-md bg-slate-800 text-white font-bold text-lg hover:bg-slate-700 transition-all hover:shadow-xl hover:-translate-y-1 flex items-center justify-center gap-2"
            >
              <Search className="w-5 h-5" /> {t('landing.exploreSchemes')}
            </Link>
            <Link 
              href="/complaints/file" 
              className="w-full sm:w-auto px-8 py-4 rounded-md bg-white border border-slate-200 text-slate-900 font-bold text-lg hover:border-indigo-700 hover:text-indigo-700 transition-all hover:shadow-md flex items-center justify-center gap-2"
            >
              <MapPin className="w-5 h-5" /> {t('landing.fileComplaint')}
            </Link>
          </div>
        </div>
      </section>

      {/* SECTION 2: PROBLEM STATEMENT */}
      <section className="py-24 bg-white relative -mt-10 rounded-t-[3rem] shadow-[0_-10px_40px_-15px_rgba(0,0,0,0.1)] z-20">
        <div className="max-w-6xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">{t('landing.problemTitle')}</h2>
            <p className="text-lg text-gray-500 max-w-2xl mx-auto">{t('landing.problemSubtitle')}</p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-orange-50 rounded-3xl p-8 border border-orange-100 relative overflow-hidden group hover:shadow-lg transition-all">
              <div className="absolute top-0 right-0 w-32 h-32 bg-orange-200 rounded-bl-full opacity-20 group-hover:scale-110 transition-transform" />
              <FileText className="w-12 h-12 text-orange-500 mb-6" />
              <h3 className="text-2xl font-bold text-gray-900 mb-4">{t('landing.missingSchemes')}</h3>
              <p className="text-gray-600 leading-relaxed text-lg">
                {t('landing.missingSchemesDesc')}
              </p>
            </div>

            <div className="bg-red-50 rounded-3xl p-8 border border-red-100 relative overflow-hidden group hover:shadow-lg transition-all">
              <div className="absolute top-0 right-0 w-32 h-32 bg-red-200 rounded-bl-full opacity-20 group-hover:scale-110 transition-transform" />
              <AlertTriangleIcon className="w-12 h-12 text-red-500 mb-6" />
              <h3 className="text-2xl font-bold text-gray-900 mb-4">{t('landing.lostComplaints')}</h3>
              <p className="text-gray-600 leading-relaxed text-lg">
                {t('landing.lostComplaintsDesc')}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 3: HOW IT WORKS */}
      <section className="py-24 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-black text-gray-900 mb-4 tracking-tight">{t('landing.howItWorks')}</h2>
            <p className="text-xl text-gray-500">{t('landing.howItWorksSub')}</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 sm:gap-12 relative">
            <div className="hidden md:block absolute top-12 left-1/6 right-1/6 h-0.5 bg-gray-200 z-0" />
            
            <div className="relative z-10 flex flex-col items-center text-center">
              <div className="w-24 h-24 bg-white rounded-full border-4 border-indigo-100 flex items-center justify-center shadow-lg mb-6 text-3xl font-black text-indigo-600">1</div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">{t('landing.step1')}</h3>
              <p className="text-gray-600 leading-relaxed">{t('landing.step1Desc')}</p>
            </div>
            
            <div className="relative z-10 flex flex-col items-center text-center">
              <div className="w-24 h-24 bg-white rounded-full border-4 border-purple-100 flex items-center justify-center shadow-lg mb-6 text-3xl font-black text-purple-600">2</div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">{t('landing.step2')}</h3>
              <p className="text-gray-600 leading-relaxed">{t('landing.step2Desc')}</p>
            </div>
            
            <div className="relative z-10 flex flex-col items-center text-center">
              <div className="w-24 h-24 bg-white rounded-full border-4 border-green-100 flex items-center justify-center shadow-lg mb-6 text-3xl font-black text-green-600">3</div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">{t('landing.step3')}</h3>
              <p className="text-gray-600 leading-relaxed">{t('landing.step3Desc')}</p>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 4: FEATURE HIGHLIGHTS */}
      <section className="py-24 bg-white overflow-hidden">
        <div className="max-w-6xl mx-auto px-4 py-8 sm:px-6 lg:px-8 space-y-32">
          
          {/* Highlight 1 */}
          <div className="flex flex-col md:flex-row items-center gap-12 lg:gap-24">
            <div className="flex-1 space-y-6">
              <div className="w-16 h-16 bg-indigo-100 rounded-2xl flex items-center justify-center">
                <Search className="w-8 h-8 text-indigo-600" />
              </div>
              <h2 className="text-4xl font-bold text-gray-900 tracking-tight">{t('landing.feat1Title')}</h2>
              <p className="text-xl text-gray-600 leading-relaxed">
                {t('landing.feat1Desc')}
              </p>
              <ul className="space-y-4 pt-4">
                <li className="flex items-center gap-3 text-lg text-gray-700 font-medium">
                  <CheckCircle2 className="w-6 h-6 text-indigo-500 flex-shrink-0" /> Filter by demographics instantly
                </li>
                <li className="flex items-center gap-3 text-lg text-gray-700 font-medium">
                  <CheckCircle2 className="w-6 h-6 text-indigo-500 flex-shrink-0" /> Detailed eligibility criteria
                </li>
                <li className="flex items-center gap-3 text-lg text-gray-700 font-medium">
                  <CheckCircle2 className="w-6 h-6 text-indigo-500 flex-shrink-0" /> Direct application guides
                </li>
              </ul>
            </div>
            <div className="flex-1 w-full bg-indigo-50 rounded-3xl p-8 border border-indigo-100 shadow-xl relative min-h-[400px]">
              {/* Abstract UI representation */}
              <div className="absolute inset-8 bg-white rounded-2xl shadow-sm border border-indigo-100 p-6 flex flex-col gap-4">
                <div className="w-1/3 h-4 bg-gray-200 rounded-full mb-4" />
                <div className="flex gap-4">
                  <div className="w-full h-24 bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-xl" />
                  <div className="w-full h-24 bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl" />
                </div>
                <div className="w-full h-32 bg-gray-50 rounded-xl mt-auto" />
              </div>
            </div>
          </div>

          {/* Highlight 2 */}
          <div className="flex flex-col md:flex-row-reverse items-center gap-12 lg:gap-24">
            <div className="flex-1 space-y-6">
              <div className="w-16 h-16 bg-rose-100 rounded-2xl flex items-center justify-center">
                <ShieldCheck className="w-8 h-8 text-rose-600" />
              </div>
              <h2 className="text-4xl font-bold text-gray-900 tracking-tight">{t('landing.feat2Title')}</h2>
              <p className="text-xl text-gray-600 leading-relaxed">
                {t('landing.feat2Desc')}
              </p>
              <ul className="space-y-4 pt-4">
                <li className="flex items-center gap-3 text-lg text-gray-700 font-medium">
                  <CheckCircle2 className="w-6 h-6 text-rose-500 flex-shrink-0" /> OTP Verified Submissions
                </li>
                <li className="flex items-center gap-3 text-lg text-gray-700 font-medium">
                  <CheckCircle2 className="w-6 h-6 text-rose-500 flex-shrink-0" /> Live SLA Countdown Timers
                </li>
                <li className="flex items-center gap-3 text-lg text-gray-700 font-medium">
                  <CheckCircle2 className="w-6 h-6 text-rose-500 flex-shrink-0" /> Auto-Escalation to Supervisors
                </li>
              </ul>
            </div>
            <div className="flex-1 w-full bg-rose-50 rounded-3xl p-8 border border-rose-100 shadow-xl relative min-h-[400px]">
              {/* Abstract UI representation */}
              <div className="absolute inset-8 bg-white rounded-2xl shadow-sm border border-rose-100 p-6 flex flex-col gap-6">
                <div className="w-full h-12 bg-gray-100 rounded-xl flex items-center px-4 justify-between">
                  <div className="w-24 h-4 bg-gray-300 rounded-full" />
                  <div className="w-16 h-6 bg-green-100 rounded-full" />
                </div>
                <div className="space-y-4 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-300 before:to-transparent">
                  <div className="flex items-center justify-between pl-12 relative">
                    <div className="absolute left-3 w-4 h-4 rounded-full border-4 border-white bg-green-500 shadow" />
                    <div className="w-full h-16 bg-gray-50 rounded-xl border border-gray-100" />
                  </div>
                  <div className="flex items-center justify-between pl-12 relative">
                    <div className="absolute left-3 w-4 h-4 rounded-full border-4 border-white bg-blue-500 shadow" />
                    <div className="w-full h-16 bg-gray-50 rounded-xl border border-gray-100" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Highlight 3 */}
          <div className="flex flex-col md:flex-row items-center gap-12 lg:gap-24">
            <div className="flex-1 space-y-6">
              <div className="w-16 h-16 bg-purple-100 rounded-2xl flex items-center justify-center">
                <Sparkles className="w-8 h-8 text-purple-600" />
              </div>
              <h2 className="text-4xl font-bold text-gray-900 tracking-tight">{t('landing.feat3Title')}</h2>
              <p className="text-xl text-gray-600 leading-relaxed">
                {t('landing.feat3Desc')}
              </p>
              <ul className="space-y-4 pt-4">
                <li className="flex items-center gap-3 text-lg text-gray-700 font-medium">
                  <CheckCircle2 className="w-6 h-6 text-purple-500 flex-shrink-0" /> English & Hindi Support
                </li>
                <li className="flex items-center gap-3 text-lg text-gray-700 font-medium">
                  <CheckCircle2 className="w-6 h-6 text-purple-500 flex-shrink-0" /> Always online 24/7
                </li>
                <li className="flex items-center gap-3 text-lg text-gray-700 font-medium">
                  <CheckCircle2 className="w-6 h-6 text-purple-500 flex-shrink-0" /> Easy starter questions
                </li>
              </ul>
            </div>
            <div className="flex-1 w-full bg-purple-50 rounded-3xl p-8 border border-purple-100 shadow-xl relative min-h-[400px]">
              {/* Abstract UI representation */}
              <div className="absolute inset-8 bg-white rounded-2xl shadow-sm border border-purple-100 p-6 flex flex-col gap-4">
                <div className="flex gap-3 justify-end">
                  <div className="w-3/4 h-16 bg-indigo-600 rounded-t-2xl rounded-bl-2xl opacity-90" />
                </div>
                <div className="flex gap-3">
                  <div className="w-3/4 h-24 bg-gray-100 rounded-t-2xl rounded-br-2xl border border-gray-200" />
                </div>
                <div className="flex gap-3 justify-end mt-auto">
                   <div className="w-1/2 h-12 bg-indigo-600 rounded-t-2xl rounded-bl-2xl opacity-90" />
                </div>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* SECTION 5: STATS STRIP */}
      <section className="bg-gray-900 border-y border-gray-800 py-16">
        <div className="max-w-6xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 divide-x-0 md:divide-x divide-gray-800">
            <div className="text-center px-4">
              <p className="text-5xl font-black text-white mb-2">15+</p>
              <p className="text-lg font-medium text-indigo-400">{t('landing.statsListed')}</p>
            </div>
            <div className="text-center px-4">
              <p className="text-5xl font-black text-white mb-2">7</p>
              <p className="text-lg font-medium text-rose-400">{t('landing.statsDepts')}</p>
            </div>
            <div className="text-center px-4">
              <p className="text-5xl font-black text-white mb-2">24/7</p>
              <p className="text-lg font-medium text-emerald-400">{t('landing.statsTracking')}</p>
            </div>
            <div className="text-center px-4">
              <p className="text-5xl font-black text-white mb-2">100%</p>
              <p className="text-lg font-medium text-purple-400">{t('landing.statsAi')}</p>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 6: ROLE CARDS */}
      <section className="py-24 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">{t('landing.rolesTitle')}</h2>
            <p className="text-lg text-gray-500">{t('landing.rolesSub')}</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white rounded-xl p-8 border border-slate-200 shadow-sm hover:shadow-md hover:border-indigo-300 transition-all">
              <div className="w-14 h-14 bg-indigo-100 rounded-full flex items-center justify-center mb-6">
                <span className="text-2xl">👤</span>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">{t('landing.roleCitizen')}</h3>
              <p className="text-gray-600 mb-8 min-h-[80px]">{t('landing.roleCitizenDesc')}</p>
              <Link href="/schemes" className="w-full flex items-center justify-center py-3 bg-slate-800 text-white rounded-md font-bold hover:bg-indigo-700 transition-colors">
                {t('landing.getStarted')}
              </Link>
            </div>

            <div className="bg-white rounded-xl p-8 border border-slate-200 shadow-sm hover:shadow-md hover:border-indigo-300 transition-all">
              <div className="w-14 h-14 bg-orange-100 rounded-full flex items-center justify-center mb-6">
                <span className="text-2xl">👷</span>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">{t('landing.roleOfficer')}</h3>
              <p className="text-gray-600 mb-8 min-h-[80px]">{t('landing.roleOfficerDesc')}</p>
              <Link href="/login" className="w-full flex items-center justify-center py-3 bg-white border-2 border-gray-900 text-gray-900 rounded-xl font-bold hover:bg-gray-50 transition-colors">
                {t('nav.login')}
              </Link>
            </div>

            <div className="bg-white rounded-xl p-8 border border-slate-200 shadow-sm hover:shadow-md hover:border-indigo-300 transition-all">
              <div className="w-14 h-14 bg-emerald-100 rounded-full flex items-center justify-center mb-6">
                <span className="text-2xl">📊</span>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">{t('landing.roleSupervisor')}</h3>
              <p className="text-gray-600 mb-8 min-h-[80px]">{t('landing.roleSupervisorDesc')}</p>
              <Link href="/login" className="w-full flex items-center justify-center py-3 bg-slate-100 border border-slate-200 text-slate-800 rounded-md font-bold hover:bg-indigo-700 hover:text-white transition-colors">
                {t('nav.login')}
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 7: FINAL CTA BANNER */}
      <section className="py-24 bg-gradient-to-br from-indigo-900 to-purple-900 text-center px-4">
        <div className="max-w-3xl mx-auto space-y-8">
          <h2 className="text-4xl md:text-5xl font-black text-white tracking-tight">{t('landing.ctaTitle')}</h2>
          <p className="text-xl text-indigo-200 font-medium">{t('landing.ctaSub')}</p>
          <div className="pt-4 flex justify-center">
            <Link 
              href="/complaints/file" 
              className="px-10 py-5 rounded-2xl bg-white text-indigo-900 font-black text-xl hover:bg-indigo-50 transition-all hover:shadow-[0_0_40px_-5px_rgba(255,255,255,0.3)] hover:-translate-y-1 flex items-center gap-3"
            >
              {t('landing.ctaButton')} <ArrowRight className="w-6 h-6" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

// Needed icon for problem statement 
function AlertTriangleIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
      <path d="M12 9v4" />
      <path d="M12 17h.01" />
    </svg>
  )
}
