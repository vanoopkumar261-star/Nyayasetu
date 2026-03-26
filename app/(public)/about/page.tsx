'use client';

import React from 'react';
import { Scale, Heart, ShieldCheck, Cpu, Code2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export default function AboutPage() {
  const { t } = useTranslation();

  return (
    <div className="bg-white min-h-screen py-24">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center mb-20 animate-fade-in-up">
          <div className="w-20 h-20 bg-indigo-600 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-xl rotate-3">
            <Scale className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-gray-900 tracking-tight mb-6">{t('about.title')}</h1>
          <p className="text-xl text-gray-500 max-w-2xl mx-auto leading-relaxed">
            {t('about.subtitle')}
          </p>
        </div>

        <div className="space-y-24">
          
          {/* the problem */}
          <section className="flex flex-col md:flex-row gap-12 items-start">
            <div className="w-16 h-16 bg-rose-100 rounded-2xl flex items-center justify-center flex-shrink-0">
              <ShieldCheck className="w-8 h-8 text-rose-600" />
            </div>
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-6">{t('about.problem')}</h2>
              <div className="prose prose-lg text-gray-600">
                <p className="mb-4">
                  {t('about.problemDesc1')}
                </p>
                <ul className="list-disc pl-5 space-y-2 mb-4">
                  <li><strong>{t('about.problemLi1').split(':')[0]}:</strong> {t('about.problemLi1').split(':')[1] || t('about.problemLi1')}</li>
                  <li><strong>{t('about.problemLi2').split(':')[0]}:</strong> {t('about.problemLi2').split(':')[1] || t('about.problemLi2')}</li>
                </ul>
              </div>
            </div>
          </section>

          {/* the solution */}
          <section className="flex flex-col md:flex-row gap-12 items-start">
            <div className="w-16 h-16 bg-indigo-100 rounded-2xl flex items-center justify-center flex-shrink-0">
              <Scale className="w-8 h-8 text-indigo-600" />
            </div>
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-6">{t('about.solution')}</h2>
              <div className="prose prose-lg text-gray-600">
                <p className="mb-4">
                  {t('about.solutionDesc1')}
                </p>
                <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100 space-y-6">
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">{t('about.solution1Title')}</h3>
                    <p>{t('about.solution1Desc')}</p>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">{t('about.solution2Title')}</h3>
                    <p>{t('about.solution2Desc')}</p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* tech stack */}
          <section className="flex flex-col md:flex-row gap-12 items-start">
            <div className="w-16 h-16 bg-purple-100 rounded-2xl flex items-center justify-center flex-shrink-0">
              <Cpu className="w-8 h-8 text-purple-600" />
            </div>
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-6">{t('about.tech')}</h2>
              <div className="prose prose-lg text-gray-600">
                <p className="mb-4">{t('about.techDesc')}</p>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="bg-white border border-gray-200 rounded-xl p-4 flex items-center gap-3">
                    <Code2 className="w-5 h-5 text-gray-400" />
                    <span className="font-medium text-gray-900">Next.js 14 (App Router)</span>
                  </div>
                  <div className="bg-white border border-gray-200 rounded-xl p-4 flex items-center gap-3">
                    <Code2 className="w-5 h-5 text-gray-400" />
                    <span className="font-medium text-gray-900">TypeScript (Strict)</span>
                  </div>
                  <div className="bg-white border border-gray-200 rounded-xl p-4 flex items-center gap-3">
                    <Code2 className="w-5 h-5 text-gray-400" />
                    <span className="font-medium text-gray-900">Tailwind CSS</span>
                  </div>
                  <div className="bg-white border border-gray-200 rounded-xl p-4 flex items-center gap-3">
                    <Code2 className="w-5 h-5 text-gray-400" />
                    <span className="font-medium text-gray-900">Supabase (PostgreSQL)</span>
                  </div>
                </div>
              </div>
            </div>
          </section>

        </div>

        {/* Disclaimer */}
        <div className="mt-24 bg-rose-50 border border-rose-100 rounded-2xl p-8 text-center max-w-2xl mx-auto">
          <Heart className="w-8 h-8 text-rose-500 mx-auto mb-4" />
          <p className="text-rose-900 font-medium">
            <strong>{t('about.disclaimer').split(':')[0]}:</strong> {t('about.disclaimer').split(':')[1] || t('about.disclaimer')}
          </p>
        </div>

      </div>
    </div>
  );
}
