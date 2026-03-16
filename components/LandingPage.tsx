import React from 'react';
import { Activity, Brain, Heart, Shield, Utensils, Zap, ChevronRight, Star } from 'lucide-react';
import { useTheme } from './ThemeProvider';

interface LandingPageProps {
  onGetStarted: () => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ onGetStarted }) => {
  const { theme } = useTheme();

  const features = [
    {
      icon: <Activity size={24} className="text-emerald-500" />,
      title: 'BMI & WHtR Analysis',
      desc: 'Dual-metric health assessment beyond standard BMI — get a complete picture of your metabolic health.',
    },
    {
      icon: <Brain size={24} className="text-blue-500" />,
      title: 'AI Nutrition Engine',
      desc: 'Powered by Gemini AI to craft precise meal plans aligned to your body, lifestyle, and goals.',
    },
    {
      icon: <Utensils size={24} className="text-orange-500" />,
      title: 'Personalised Meal Plans',
      desc: '7-day meal plans and curated recipes tailored to your cuisine preference and favourite foods.',
    },
    {
      icon: <Shield size={24} className="text-rose-500" />,
      title: 'Medical Condition Aware',
      desc: 'Supports Diabetic, Hypothyroidism, Metabolic Syndrome, and Obesity-specific dietary needs.',
    },
  ];

  const stats = [
    { value: '4+', label: 'Medical Filters' },
    { value: '7', label: 'Day Meal Plans' },
    { value: '8', label: 'AI Recipes/Session' },
    { value: '∞', label: 'Consultations' },
  ];

  const conditions = [
    { icon: '🩸', label: 'Diabetic' },
    { icon: '⚖️', label: 'Obesity / Overweight' },
    { icon: '🦋', label: 'Hypothyroidism' },
    { icon: '💊', label: 'Metabolic Syndrome' },
  ];

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-slate-900 transition-colors duration-300">

      {/* Hero */}
      <section className="relative overflow-hidden min-h-screen flex flex-col items-center justify-center px-6 py-24">
        {/* Ambient blobs */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-40 -left-40 w-[600px] h-[600px] bg-emerald-400/20 dark:bg-emerald-600/10 rounded-full blur-[120px]" />
          <div className="absolute -bottom-40 -right-40 w-[600px] h-[600px] bg-blue-400/20 dark:bg-blue-600/10 rounded-full blur-[120px]" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-orange-400/10 dark:bg-orange-600/5 rounded-full blur-[100px]" />
        </div>

        <div className="relative z-10 max-w-4xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm mb-8">
            <Star size={12} className="text-emerald-500 fill-emerald-500" />
            <span className="text-[11px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest">AI-Powered Nutrition Guide</span>
            <Star size={12} className="text-emerald-500 fill-emerald-500" />
          </div>

          {/* Headline */}
          <h1 className="text-5xl md:text-7xl font-black text-slate-900 dark:text-white tracking-tight leading-[1.05] mb-6">
            Your Personal<br />
            <span className="bg-gradient-to-r from-emerald-500 to-teal-400 bg-clip-text text-transparent">
              Health Blueprint
            </span>
          </h1>

          <p className="text-lg md:text-xl text-slate-500 dark:text-slate-400 font-medium max-w-2xl mx-auto leading-relaxed mb-10">
            NutriTrack AI analyses your <span className="text-slate-800 dark:text-slate-200 font-bold">BMI & WHtR</span> to deliver Gemini-powered,
            medically-aware nutrition plans — personalised to your body, goals and tastes.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={onGetStarted}
              className="group px-10 py-5 rounded-2xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-black text-lg shadow-2xl hover:scale-[1.03] transition-all duration-200 flex items-center gap-3"
            >
              Get Started Free
              <ChevronRight size={22} className="group-hover:translate-x-1 transition-transform" />
            </button>
            <div className="flex items-center gap-2 text-sm text-slate-400 dark:text-slate-500 font-medium">
              <Zap size={14} className="text-emerald-500" />
              No sign-up required
            </div>
          </div>
        </div>

        {/* Stats bar */}
        <div className="relative z-10 mt-20 grid grid-cols-2 md:grid-cols-4 gap-4 w-full max-w-3xl mx-auto">
          {stats.map(s => (
            <div key={s.label} className="bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-2xl p-6 text-center shadow-sm">
              <div className="text-4xl font-black text-emerald-500 mb-1">{s.value}</div>
              <div className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="py-24 px-6 bg-white dark:bg-slate-800/50">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-black text-slate-900 dark:text-white mb-3 tracking-tight">
              Everything You Need
            </h2>
            <p className="text-slate-500 dark:text-slate-400 font-medium">Science-backed. AI-driven. Completely personalised.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {features.map(f => (
              <div key={f.title} className="p-8 bg-slate-50 dark:bg-slate-800 rounded-3xl border border-slate-100 dark:border-slate-700 hover:shadow-lg transition-all">
                <div className="w-12 h-12 rounded-2xl bg-white dark:bg-slate-700 flex items-center justify-center mb-5 shadow-sm">
                  {f.icon}
                </div>
                <h3 className="text-lg font-black text-slate-800 dark:text-white mb-2">{f.title}</h3>
                <p className="text-slate-500 dark:text-slate-400 font-medium text-sm leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Medical conditions */}
      <section className="py-24 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <span className="inline-block px-4 py-1.5 bg-rose-50 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400 text-[10px] font-black uppercase tracking-widest rounded-full mb-4">
            Medical-Aware
          </span>
          <h2 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight mb-4">
            Designed for Your Condition
          </h2>
          <p className="text-slate-500 dark:text-slate-400 font-medium mb-12 max-w-xl mx-auto">
            Our AI is trained to adapt meal plans around specific health conditions — not just generic advice.
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {conditions.map(c => (
              <div key={c.label} className="bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-2xl p-6 text-center shadow-sm hover:shadow-md hover:-translate-y-1 transition-all">
                <div className="text-4xl mb-3">{c.icon}</div>
                <div className="text-sm font-black text-slate-700 dark:text-slate-200 leading-tight">{c.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-6">
        <div className="max-w-3xl mx-auto bg-slate-900 dark:bg-white rounded-[3rem] p-14 text-center shadow-2xl relative overflow-hidden">
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute -top-20 -right-20 w-60 h-60 bg-emerald-500/20 rounded-full blur-[80px]" />
          </div>
          <Heart size={36} className="text-emerald-500 mx-auto mb-6" />
          <h2 className="text-4xl font-black text-white dark:text-slate-900 mb-4 tracking-tight">
            Ready to Transform<br />Your Health?
          </h2>
          <p className="text-slate-400 dark:text-slate-600 mb-10 font-medium">
            Takes just 2 minutes. No account needed.
          </p>
          <button
            onClick={onGetStarted}
            className="group px-10 py-5 rounded-2xl bg-emerald-500 text-white font-black text-lg shadow-xl hover:bg-emerald-400 hover:scale-[1.03] transition-all flex items-center gap-3 mx-auto"
          >
            Start My Free Plan
            <ChevronRight size={22} className="group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 text-center border-t border-slate-100 dark:border-slate-800">
        <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.2em]">
          NutriTrack AI · Academic Excellence Project Team B16 · Non-Medical Application
        </p>
      </footer>
    </div>
  );
};

export default LandingPage;
