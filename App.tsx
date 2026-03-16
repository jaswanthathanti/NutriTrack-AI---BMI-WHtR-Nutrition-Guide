import React, { useState, useMemo, useRef, useCallback } from 'react';
import { 
  UserData, 
  HealthMetrics, 
  Recipe, 
  Gender, 
  ExerciseFrequency, 
  ActivityLevel,
  HealthGoal, 
  DietaryPreference,
  MedicalCondition
} from './types';
import { DEFAULT_USER_DATA, BMI_CATEGORIES, WHTR_CATEGORIES, MEDICAL_CONDITIONS } from './constants';
import { calculateMetrics, getAIRecommendations } from './services/nutritionService';
import StepProgress from './components/StepProgress';
import HealthChart from './components/HealthChart';
import LandingPage from './components/LandingPage';
import { useTheme } from './components/ThemeProvider';
import { 
  Activity, 
  User, 
  Utensils, 
  ArrowRight, 
  ArrowLeft, 
  ThumbsUp, 
  ThumbsDown,
  Info,
  Calendar,
  Heart,
  Target,
  Dumbbell,
  Scale,
  Clock,
  Flame,
  Leaf,
  Sparkles,
  Zap,
  Armchair,
  Footprints,
  Scale as ScaleIcon,
  BicepsFlexed,
  Sun,
  Moon,
  Download,
  X,
  ChefHat,
  ListChecks,
} from 'lucide-react';

// ─── Utility: download a DOM node as PNG ────────────────────────────────────
async function downloadCard(el: HTMLElement, name: string) {
  const html2canvas = (await import('html2canvas')).default;
  const canvas = await html2canvas(el, { scale: 2, backgroundColor: null, useCORS: true });
  const link = document.createElement('a');
  link.download = `${name.replace(/\s+/g, '-')}-recipe.png`;
  link.href = canvas.toDataURL('image/png');
  link.click();
}

// ─── Recipe detail modal ─────────────────────────────────────────────────────
const RecipeModal: React.FC<{ recipe: Recipe; onClose: () => void }> = ({ recipe, onClose }) => {
  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-lg bg-white dark:bg-slate-800 rounded-[2rem] shadow-2xl overflow-hidden animate-slideUp max-h-[90vh] flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        {/* Image */}
        <div className="relative h-48 shrink-0 overflow-hidden">
          <img
            src={`https://loremflickr.com/600/300/food,recipe,dish,${encodeURIComponent(recipe.name)}/all`}
            alt={recipe.name}
            className="w-full h-full object-cover"
            onError={e => { (e.target as HTMLImageElement).src = `https://loremflickr.com/600/300/healthy,food,meal/all`; }}
            crossOrigin="anonymous"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          <h3 className="absolute bottom-4 left-6 right-12 text-white font-black text-2xl leading-tight drop-shadow-lg">{recipe.name}</h3>
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-9 h-9 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white hover:bg-white/40 transition-all"
          >
            <X size={18} />
          </button>
        </div>

        {/* Macros bar */}
        <div className="grid grid-cols-4 gap-2 px-6 py-4 bg-slate-50 dark:bg-slate-900/50 shrink-0">
          {[
            { label: 'Cals', val: recipe.calories, color: 'text-orange-500' },
            { label: 'Protein', val: `${recipe.protein}g`, color: 'text-emerald-500' },
            { label: 'Fat', val: `${recipe.fat}g`, color: 'text-rose-500' },
            { label: 'Fiber', val: `${recipe.fiber}g`, color: 'text-sky-500' },
          ].map(s => (
            <div key={s.label} className="text-center">
              <div className={`text-lg font-black ${s.color}`}>{s.val}</div>
              <div className="text-[9px] text-slate-400 uppercase font-black tracking-wider">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Scrollable content */}
        <div className="overflow-y-auto flex-1 px-6 py-5 space-y-6">
          {/* Ingredients */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <ListChecks size={16} className="text-emerald-500" />
              <h4 className="text-sm font-black text-slate-700 dark:text-slate-200 uppercase tracking-wider">Ingredients</h4>
            </div>
            <ul className="space-y-2">
              {(recipe.ingredients || []).map((ing, i) => (
                <li key={i} className="flex items-start gap-2.5 text-sm text-slate-600 dark:text-slate-300 font-medium">
                  <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" />
                  {ing}
                </li>
              ))}
            </ul>
          </div>

          {/* Steps */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <ChefHat size={16} className="text-orange-500" />
              <h4 className="text-sm font-black text-slate-700 dark:text-slate-200 uppercase tracking-wider">Preparation</h4>
            </div>
            <ol className="space-y-3">
              {(recipe.steps || []).map((step, i) => (
                <li key={i} className="flex items-start gap-3">
                  <span className="shrink-0 w-6 h-6 rounded-full bg-slate-900 dark:bg-emerald-600 text-white text-[10px] font-black flex items-center justify-center mt-0.5">
                    {i + 1}
                  </span>
                  <p className="text-sm text-slate-600 dark:text-slate-300 font-medium leading-relaxed">{step}</p>
                </li>
              ))}
            </ol>
          </div>

          {/* Explanation */}
          <div className="bg-emerald-50 dark:bg-emerald-900/20 rounded-2xl p-4 border border-emerald-100 dark:border-emerald-800">
            <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-400 font-black text-[10px] mb-1 uppercase tracking-wider">
              <Sparkles size={12} /> Why This Recipe?
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed italic">"{recipe.explanation}"</p>
          </div>
        </div>
      </div>
    </div>
  );
};

// ─── Recipe Card ─────────────────────────────────────────────────────────────
const RecipeCard: React.FC<{ recipe: Recipe; onOpenModal: (r: Recipe) => void }> = ({ recipe, onOpenModal }) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const imgQuery = encodeURIComponent(recipe.name + ' food dish');

  const handleDownload = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (cardRef.current) await downloadCard(cardRef.current, recipe.name);
  };

  return (
    <div
      ref={cardRef}
      className="bg-white dark:bg-slate-800 rounded-[2rem] overflow-hidden shadow-sm border border-slate-100 dark:border-slate-700 hover:shadow-xl transition-all duration-300 flex flex-col h-full group"
    >
      {/* Recipe image */}
      <div className="relative h-44 overflow-hidden shrink-0">
        <img
          src={`https://loremflickr.com/400/250/food,recipe,meal,${imgQuery}/all`}
          alt={recipe.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          onError={e => { (e.target as HTMLImageElement).src = `https://loremflickr.com/400/250/healthy,food,meal/all`; }}
          crossOrigin="anonymous"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
        {/* Download button */}
        <button
          onClick={handleDownload}
          title="Download recipe card"
          className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/80 dark:bg-slate-900/80 backdrop-blur-md flex items-center justify-center shadow hover:bg-white dark:hover:bg-slate-900 transition-all opacity-0 group-hover:opacity-100"
        >
          <Download size={14} className="text-slate-700 dark:text-slate-200" />
        </button>
      </div>

      <div className="p-5 flex-1 flex flex-col">
        {/* Tags row */}
        <div className="flex justify-between items-start mb-3">
          <div className="flex gap-1.5">
            <span className={`text-[9px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full ${
              recipe.mealType === 'Dinner' ? 'bg-indigo-50 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400' : 
              recipe.mealType === 'Breakfast' ? 'bg-orange-50 dark:bg-orange-900/40 text-orange-600 dark:text-orange-400' : 
              'bg-emerald-50 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400'
            }`}>
              {recipe.mealType}
            </span>
            <span className="text-[9px] font-black uppercase tracking-wider bg-slate-50 dark:bg-slate-700 text-slate-500 dark:text-slate-400 px-2.5 py-1 rounded-full">
              {recipe.difficulty}
            </span>
          </div>
          <span className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">{recipe.cuisine}</span>
        </div>

        {/* Name */}
        <h4 className="text-lg font-black text-slate-800 dark:text-white mb-1.5 leading-tight">{recipe.name}</h4>
        <div className="flex items-center gap-1.5 text-[11px] text-slate-400 dark:text-slate-500 font-bold mb-4">
          <Clock size={13} className="opacity-70" /> {recipe.timeInMins} mins
        </div>

        {/* Macros */}
        <div className="grid grid-cols-4 gap-1.5 mb-4">
          {[
            { label: 'Cals', val: recipe.calories, color: 'text-orange-600 dark:text-orange-400' },
            { label: 'Prot', val: `${recipe.protein}g`, color: 'text-emerald-600 dark:text-emerald-400' },
            { label: 'Fat', val: `${recipe.fat}g`, color: 'text-rose-600 dark:text-rose-400' },
            { label: 'Fiber', val: `${recipe.fiber}g`, color: 'text-sky-600 dark:text-sky-400' },
          ].map(stat => (
            <div key={stat.label} className="bg-slate-50 dark:bg-slate-700/50 rounded-xl p-2 text-center">
              <div className="text-[8px] text-slate-400 dark:text-slate-500 uppercase font-black mb-0.5">{stat.label}</div>
              <div className={`text-[11px] font-black ${stat.color}`}>{stat.val}</div>
            </div>
          ))}
        </div>

        {/* View Recipe button */}
        <button
          onClick={() => onOpenModal(recipe)}
          className="mt-auto w-full py-3 rounded-2xl bg-slate-900 dark:bg-emerald-600 text-white text-xs font-black uppercase tracking-wider hover:bg-slate-700 dark:hover:bg-emerald-500 transition-all flex items-center justify-center gap-2"
        >
          <ChefHat size={14} /> View Recipe
        </button>
      </div>
    </div>
  );
};

// ─── Step props ───────────────────────────────────────────────────────────────
interface StepProps {
  userData: UserData;
  updateField: (field: keyof UserData, value: any) => void;
  handleNext?: () => void;
  handlePrev?: () => void;
  loading?: boolean;
  generateReport?: () => void | Promise<void>;
}

// ─── Step 1: Health Info ──────────────────────────────────────────────────────
const Step1_HealthInfo: React.FC<StepProps> = ({ userData, updateField, handleNext }) => (
  <div className="animate-slideUp max-w-2xl mx-auto">
    <div className="text-center mb-10">
      <div className="inline-flex items-center justify-center w-16 h-16 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 rounded-2xl mb-4 rotate-3">
        <Heart size={32} />
      </div>
      <h2 className="text-3xl font-black text-slate-800 dark:text-white tracking-tight">Body Measurements</h2>
      <p className="text-slate-500 dark:text-slate-400 font-medium">Precision data for a precision nutrition plan</p>
    </div>
    
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
      {[
        { label: 'Height (cm)', field: 'height', placeholder: 'e.g., 170' },
        { label: 'Weight (kg)', field: 'weight', placeholder: 'e.g., 65' },
        { label: 'Waist (cm)', field: 'waist', placeholder: 'e.g., 80' },
        { label: 'Age (years)', field: 'age', placeholder: 'e.g., 25' }
      ].map(item => (
        <div key={item.field} className="group">
          <label className="block text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-2 ml-1">{item.label}</label>
          <input 
            type="text" 
            inputMode="numeric"
            placeholder={item.placeholder}
            className="w-full bg-slate-50 dark:bg-slate-700 border-2 border-slate-100 dark:border-slate-600 rounded-2xl p-5 focus:ring-0 focus:border-emerald-500 outline-none transition-all text-slate-900 dark:text-white font-bold text-lg placeholder:text-slate-200 dark:placeholder:text-slate-500"
            value={userData[item.field as keyof UserData] ?? ''}
            onChange={(e) => updateField(item.field as keyof UserData, e.target.value)} 
          />
        </div>
      ))}
    </div>

    <div className="mb-12">
      <label className="block text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-4 ml-1">Gender</label>
      <div className="flex gap-4">
        {[Gender.Male, Gender.Female].map(g => (
          <button 
            key={g} 
            onClick={() => updateField('gender', g)}
            className={`flex-1 py-4 rounded-2xl font-bold border-2 transition-all flex items-center justify-center gap-3 ${
              userData.gender === g 
                ? 'bg-emerald-600 border-emerald-600 text-white shadow-lg shadow-emerald-200' 
                : 'bg-white dark:bg-slate-700 border-slate-100 dark:border-slate-600 text-slate-400 dark:text-slate-300 hover:border-slate-200'
            }`}
          >
            {g === Gender.Male ? <User size={20} /> : <Heart size={20} />}
            {g}
          </button>
        ))}
      </div>
    </div>

    <button onClick={handleNext} className="w-full bg-slate-900 dark:bg-emerald-600 text-white py-5 rounded-2xl font-black text-lg flex items-center justify-center gap-3 hover:bg-slate-800 dark:hover:bg-emerald-500 transition-all shadow-xl">
      Next Step <ArrowRight size={22} />
    </button>
  </div>
);

// ─── Step 2: Lifestyle ────────────────────────────────────────────────────────
const Step2_Lifestyle: React.FC<StepProps> = ({ userData, updateField, handleNext, handlePrev }) => (
  <div className="animate-slideUp max-w-4xl mx-auto">
    <div className="text-center mb-10">
      <div className="inline-flex items-center justify-center w-12 h-12 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 rounded-full mb-4 shadow-sm">
        <Activity size={24} />
      </div>
      <h2 className="text-3xl font-bold text-slate-800 dark:text-white tracking-tight">Lifestyle & Activity</h2>
      <p className="text-slate-500 dark:text-slate-400 font-medium mt-1">Tell us about your daily routine and fitness goals</p>
    </div>

    <div className="space-y-10">
      <section>
        <label className="block text-sm font-semibold text-slate-800 dark:text-slate-200 mb-4">How often do you exercise?</label>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { val: ExerciseFrequency.Rare, icon: <User className="text-orange-400" />, label: 'Rare', desc: '0-1x/week' },
            { val: ExerciseFrequency.Weekly, icon: <Activity className="text-orange-500" />, label: 'Weekly', desc: '2-3x/week' },
            { val: ExerciseFrequency.Regular, icon: <Dumbbell className="text-indigo-500" />, label: 'Regular', desc: '4+/week' }
          ].map(item => (
            <button 
              key={item.val} 
              onClick={() => updateField('exercise', item.val)} 
              className={`p-6 rounded-2xl border-2 transition-all flex flex-col items-center justify-center gap-1 group ${
                userData.exercise === item.val 
                  ? 'border-emerald-600 bg-emerald-50/30 dark:bg-emerald-900/20' 
                  : 'border-slate-100 dark:border-slate-600 bg-slate-100/50 dark:bg-slate-700/50 hover:border-slate-200'
              }`}
            >
              <div className="mb-2 transition-transform group-hover:scale-110">{item.icon}</div>
              <div className="font-bold text-slate-800 dark:text-white text-sm">{item.label}</div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">{item.desc}</div>
            </button>
          ))}
        </div>
      </section>

      <section>
        <label className="block text-sm font-semibold text-slate-800 dark:text-slate-200 mb-4">Daily Routine</label>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { val: ActivityLevel.Sedentary, icon: <Armchair className="text-slate-500" />, label: 'Sedentary', desc: 'Mostly sitting' },
            { val: ActivityLevel.Moderate, icon: <Footprints className="text-orange-400" />, label: 'Moderate', desc: 'Some movement' },
            { val: ActivityLevel.Active, icon: <Zap className="text-orange-500" />, label: 'Active', desc: 'Always moving' }
          ].map(item => (
            <button 
              key={item.val} 
              onClick={() => updateField('activity', item.val)} 
              className={`p-6 rounded-2xl border-2 transition-all flex flex-col items-center justify-center gap-1 group ${
                userData.activity === item.val 
                  ? 'border-emerald-600 bg-emerald-50/30 dark:bg-emerald-900/20' 
                  : 'border-slate-100 dark:border-slate-600 bg-slate-100/50 dark:bg-slate-700/50 hover:border-slate-200'
              }`}
            >
              <div className="mb-2 transition-transform group-hover:scale-110">{item.icon}</div>
              <div className="font-bold text-slate-800 dark:text-white text-sm">{item.label}</div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">{item.desc}</div>
            </button>
          ))}
        </div>
      </section>

      <section>
        <div className="flex items-center gap-2 mb-4">
          <Target size={18} className="text-slate-600 dark:text-slate-400" />
          <label className="text-sm font-semibold text-slate-800 dark:text-slate-200">Your Goal</label>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { val: HealthGoal.WeightLoss, icon: <Target className="text-rose-500" />, label: 'Weight Loss', desc: 'Reduce body fat' },
            { val: HealthGoal.MuscleGain, icon: <BicepsFlexed className="text-amber-500" />, label: 'Muscle Gain', desc: 'Build strength' },
            { val: HealthGoal.Maintenance, icon: <ScaleIcon className="text-orange-400" />, label: 'Maintenance', desc: 'Stay healthy' }
          ].map(item => (
            <button 
              key={item.val} 
              onClick={() => updateField('goal', item.val)} 
              className={`p-6 rounded-2xl border-2 transition-all flex flex-col items-center justify-center gap-1 group ${
                userData.goal === item.val 
                  ? 'border-emerald-600 bg-emerald-50/30 dark:bg-emerald-900/20' 
                  : 'border-slate-100 dark:border-slate-600 bg-slate-100/50 dark:bg-slate-700/50 hover:border-slate-200'
              }`}
            >
              <div className="mb-2 transition-transform group-hover:scale-110">{item.icon}</div>
              <div className="font-bold text-slate-800 dark:text-white text-sm">{item.label}</div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">{item.desc}</div>
            </button>
          ))}
        </div>
      </section>
    </div>

    <div className="flex gap-4 mt-12">
      <button 
        onClick={handlePrev} 
        className="flex-1 bg-white dark:bg-slate-700 text-slate-600 dark:text-slate-200 py-4 rounded-xl font-bold border border-slate-200 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-600 transition-all flex items-center justify-center gap-2"
      >
        <ArrowLeft size={18} /> Back
      </button>
      <button 
        onClick={handleNext} 
        className="flex-[1.5] bg-emerald-600 text-white py-4 rounded-xl font-bold shadow-lg hover:bg-emerald-700 transition-all flex items-center justify-center gap-2"
      >
        Continue <ArrowRight size={18} />
      </button>
    </div>
  </div>
);

// ─── Step 3: Preferences + Medical Conditions ─────────────────────────────────
const Step3_Preferences: React.FC<StepProps> = ({ userData, updateField, generateReport, handlePrev, loading }) => {
  const toggleCondition = (val: MedicalCondition) => {
    if (val === MedicalCondition.None) {
      updateField('medicalConditions', []);
      return;
    }
    const current: MedicalCondition[] = userData.medicalConditions || [];
    const filtered = current.filter(c => c !== MedicalCondition.None);
    if (filtered.includes(val)) {
      updateField('medicalConditions', filtered.filter(c => c !== val));
    } else {
      updateField('medicalConditions', [...filtered, val]);
    }
  };

  const isSelected = (val: MedicalCondition) => {
    if (val === MedicalCondition.None) {
      return (userData.medicalConditions || []).length === 0;
    }
    return (userData.medicalConditions || []).includes(val);
  };

  return (
    <div className="animate-slideUp max-w-3xl mx-auto">
      <div className="text-center mb-10">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-orange-50 dark:bg-orange-900/30 text-orange-600 rounded-2xl mb-4 rotate-6">
          <Utensils size={32} />
        </div>
        <h2 className="text-3xl font-black text-slate-800 dark:text-white tracking-tight">Taste & Diet</h2>
        <p className="text-slate-500 dark:text-slate-400 font-medium">Health is easier when it tastes good</p>
      </div>

      <div className="space-y-10">
        {/* Must-include foods */}
        <section>
          <label className="text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-4 ml-1 flex items-center gap-2">
            <Sparkles size={16} className="text-orange-500" /> Must-Include Foods
          </label>
          <div className="relative mt-4">
            <input 
              type="text" 
              placeholder="e.g., Avocado, Paneer, Salmon, Sweet Potato..."
              className="w-full bg-slate-50 dark:bg-slate-700 border-2 border-slate-100 dark:border-slate-600 rounded-3xl p-6 focus:ring-0 focus:border-orange-500 outline-none text-slate-900 dark:text-white font-bold text-lg transition-all shadow-inner" 
              value={userData.favFood} 
              onChange={(e) => updateField('favFood', e.target.value)} 
            />
            <div className="mt-4 p-4 bg-orange-50 dark:bg-orange-900/20 rounded-2xl border border-orange-100 dark:border-orange-800 flex items-start gap-3">
              <Info size={16} className="text-orange-600 dark:text-orange-400 mt-0.5 shrink-0" />
              <p className="text-xs text-orange-800 dark:text-orange-300 font-medium italic leading-relaxed">
                <strong>Demo Logic:</strong> Our AI will cross-reference these ingredients with your BMI/WHtR needs to find healthy recipes you'll actually love.
              </p>
            </div>
          </div>
        </section>

        {/* Cuisine & Dietary */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <section>
            <label className="block text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-6 ml-1">Regional Cuisine</label>
            <div className="grid grid-cols-2 gap-3">
              {['Indian', 'Continental', 'Mediterranean', 'Regional'].map(c => (
                <button key={c} onClick={() => updateField('cuisine', c)} className={`p-4 rounded-2xl border-2 text-center transition-all ${userData.cuisine === c ? 'border-orange-600 bg-orange-50 dark:bg-orange-900/30 font-black' : 'border-slate-100 dark:border-slate-600 bg-white dark:bg-slate-700 hover:border-slate-200'}`}>
                  <div className="text-xs text-slate-800 dark:text-slate-200">{c}</div>
                </button>
              ))}
            </div>
          </section>

          <section>
            <label className="block text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-6 ml-1">Dietary Restriction</label>
            <div className="space-y-3">
              {[
                { val: DietaryPreference.Veg, icon: <Leaf className="text-emerald-500" />, sub: 'Pure Plant-Based' },
                { val: DietaryPreference.NonVeg, icon: <Flame size={18} className="text-rose-500" />, sub: 'Include Proteins' }
              ].map(item => (
                <button key={item.val} onClick={() => updateField('dietary', item.val)} className={`w-full p-4 flex items-center gap-4 rounded-2xl border-2 transition-all ${userData.dietary === item.val ? 'border-slate-900 dark:border-emerald-500 bg-slate-900 dark:bg-emerald-600 text-white shadow-lg' : 'border-slate-100 dark:border-slate-600 bg-white dark:bg-slate-700 hover:border-slate-200'}`}>
                  <div className="w-10 h-10 flex items-center justify-center bg-white dark:bg-slate-600 rounded-xl shadow-sm shrink-0">{item.icon}</div>
                  <div className="text-left">
                    <div className={`font-black text-sm ${userData.dietary === item.val ? 'text-white' : 'text-slate-800 dark:text-white'}`}>{item.val}</div>
                    <div className="text-[10px] text-slate-400 dark:text-slate-400">{item.sub}</div>
                  </div>
                </button>
              ))}
            </div>
          </section>
        </div>

        {/* Medical Conditions */}
        <section>
          <div className="flex items-center gap-2 mb-6 ml-1">
            <span className="text-xl">🏥</span>
            <label className="text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest">Medical Conditions <span className="text-slate-300 dark:text-slate-600 font-semibold normal-case">(select all that apply)</span></label>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {MEDICAL_CONDITIONS.map(cond => {
              const selected = isSelected(cond.value);
              return (
                <button
                  key={cond.value}
                  onClick={() => toggleCondition(cond.value)}
                  className={`p-4 rounded-2xl border-2 text-left transition-all flex items-start gap-3 ${
                    selected
                      ? 'border-rose-500 bg-rose-50 dark:bg-rose-900/20'
                      : 'border-slate-100 dark:border-slate-600 bg-white dark:bg-slate-700 hover:border-slate-200'
                  }`}
                >
                  <span className="text-2xl shrink-0 mt-0.5">{cond.icon}</span>
                  <div>
                    <div className={`text-sm font-black ${selected ? 'text-rose-700 dark:text-rose-300' : 'text-slate-800 dark:text-white'}`}>{cond.label}</div>
                    <div className="text-[10px] text-slate-400 dark:text-slate-400 font-medium">{cond.desc}</div>
                  </div>
                </button>
              );
            })}
          </div>
          {(userData.medicalConditions || []).length > 0 && (userData.medicalConditions || [])[0] !== MedicalCondition.None && (
            <p className="mt-3 text-xs text-rose-600 dark:text-rose-400 font-bold flex items-center gap-1.5">
              <Info size={12} /> AI will adapt recipes to your selected medical condition(s).
            </p>
          )}
        </section>
      </div>

      <div className="flex gap-4 mt-16">
        <button onClick={handlePrev} className="flex-1 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-200 py-5 rounded-2xl font-black text-lg border border-slate-200 dark:border-slate-600 hover:bg-slate-200 dark:hover:bg-slate-600 transition-all">
          Back
        </button>
        <button onClick={generateReport} disabled={loading} className="flex-[2] bg-slate-900 dark:bg-emerald-600 text-white py-5 rounded-2xl font-black text-lg shadow-xl hover:bg-slate-800 dark:hover:bg-emerald-500 transition-all flex items-center justify-center gap-3 disabled:opacity-50">
          {loading ? (
            <>
              <div className="w-6 h-6 border-4 border-white/30 border-t-white rounded-full animate-spin" />
              Generating Plan...
            </>
          ) : (
            <>Build My Dashboard <ArrowRight size={22} /></>
          )}
        </button>
      </div>
    </div>
  );
};

// ─── Dashboard ────────────────────────────────────────────────────────────────
const Dashboard: React.FC<{ 
  aiData: any; 
  metrics: HealthMetrics; 
  userData: UserData; 
  setStep: (s: number) => void;
  feedback: boolean | null;
  setFeedback: (f: boolean) => void;
  onOpenModal: (r: Recipe) => void;
}> = ({ aiData, metrics, userData, setStep, feedback, setFeedback, onOpenModal }) => (
  <div className="animate-slideUp max-w-6xl mx-auto space-y-16 pb-20">
    {/* Hero banner */}
    <div className="bg-slate-900 dark:bg-slate-800 text-white rounded-[3rem] p-10 md:p-14 relative overflow-hidden shadow-2xl">
      <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 blur-[100px] rounded-full -mr-20 -mt-20" />
      <div className="relative z-10 flex flex-col md:flex-row gap-10 items-center">
        <div className="flex-1 space-y-6">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] font-black uppercase tracking-[0.2em]">
            <Sparkles size={14} /> AI Health Analysis
          </div>
          <h1 className="text-4xl md:text-6xl font-black tracking-tight leading-[1.1]">
            Your Performance <br/><span className="text-emerald-400">Blueprint.</span>
          </h1>
          <p className="text-slate-400 text-lg font-medium leading-relaxed max-w-xl">
            Based on your BMI of {metrics.bmi.toFixed(1)} and Waist-to-Height ratio of {metrics.whtr.toFixed(2)}, we've synthesized a nutrition strategy to reach <span className="text-white font-bold">{userData.goal}</span>.
          </p>
        </div>
        <div className="w-full md:w-auto grid grid-cols-2 gap-4">
          <div className="bg-white/5 backdrop-blur-md border border-white/10 p-6 rounded-3xl text-center">
             <div className="text-4xl font-black text-emerald-400 mb-1">{metrics.dailyCalories}</div>
             <div className="text-[10px] font-black uppercase tracking-widest text-slate-500">Daily Target (kcal)</div>
          </div>
          <div className="bg-white/5 backdrop-blur-md border border-white/10 p-6 rounded-3xl text-center">
             <div className="text-4xl font-black text-blue-400 mb-1">{metrics.metabolicAge}</div>
             <div className="text-[10px] font-black uppercase tracking-widest text-slate-500">Metabolic Age</div>
          </div>
        </div>
      </div>
    </div>

    {/* Metrics row */}
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="bg-white dark:bg-slate-800 p-8 rounded-[2.5rem] border border-slate-100 dark:border-slate-700 shadow-sm flex flex-col items-center justify-center text-center relative">
        <div className="absolute top-6 left-6 text-slate-200 dark:text-slate-700"><Scale size={48} strokeWidth={1}/></div>
        <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6">BMI Assessment</div>
        <div className="text-6xl font-black text-slate-900 dark:text-white mb-2">{metrics.bmi.toFixed(1)}</div>
        <div className={`px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest ${
          metrics.bmiCategory === 'Normal' ? 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400' : 'bg-rose-50 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400'
        }`}>
          {metrics.bmiCategory}
        </div>
      </div>

      <div className="bg-white dark:bg-slate-800 p-8 rounded-[2.5rem] border border-slate-100 dark:border-slate-700 shadow-sm flex flex-col items-center justify-center text-center relative">
        <div className="absolute top-6 left-6 text-slate-200 dark:text-slate-700"><Activity size={48} strokeWidth={1}/></div>
        <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6">WHtR Assessment</div>
        <div className="text-6xl font-black text-slate-900 dark:text-white mb-2">{metrics.whtr.toFixed(2)}</div>
        <div className={`px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest ${
          metrics.whtrCategory === 'Low' ? 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400' : 'bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400'
        }`}>
          {metrics.whtrCategory} Risk
        </div>
      </div>

      <div className="bg-white dark:bg-slate-800 p-8 rounded-[2.5rem] border border-slate-100 dark:border-slate-700 shadow-sm flex flex-col">
        <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 px-2">Macronutrient Target</div>
        <div className="flex-1 min-h-[180px]">
          <HealthChart macros={metrics.macros} />
        </div>
      </div>
    </div>

    {/* Signature dishes */}
    <section className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="text-3xl font-black text-slate-800 dark:text-white tracking-tight flex items-center gap-3">
            <Sparkles className="text-orange-500" size={28} /> AI-Recommended Signature Dishes
          </h2>
          <p className="text-slate-500 dark:text-slate-400 font-medium mt-1">
            Engineered using <span className="text-orange-600 dark:text-orange-400 font-bold">{userData.favFood || 'your unique tastes'}</span> & clinical data.
          </p>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {aiData?.bestForYou.map((r: any, i: number) => (
          <RecipeCard key={i} recipe={r} onOpenModal={onOpenModal} />
        ))}
      </div>
    </section>

    {/* Quick recipes */}
    <section className="space-y-8">
      <div className="flex items-center gap-3">
        <Zap className="text-blue-500" size={28} />
        <h2 className="text-3xl font-black text-slate-800 dark:text-white tracking-tight">Rapid Fuel (Under 30 mins)</h2>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {aiData?.readyIn30.map((r: any, i: number) => (
          <RecipeCard key={i+10} recipe={r} onOpenModal={onOpenModal} />
        ))}
      </div>
    </section>

    {/* Weekly plan */}
    <section className="space-y-8">
      <div className="flex items-center gap-3">
        <Calendar className="text-emerald-600" size={28} />
        <h2 className="text-3xl font-black text-slate-800 dark:text-white tracking-tight">Full 7-Day Protocol</h2>
      </div>
      <div className="grid grid-cols-1 gap-4">
        {aiData?.weeklyPlan.map((day: any, i: number) => (
          <div key={i} className="bg-white dark:bg-slate-800 rounded-[2rem] border border-slate-100 dark:border-slate-700 p-8 flex flex-col lg:flex-row gap-8 items-center transition-all hover:border-slate-300 dark:hover:border-slate-500 group shadow-sm">
            <div className="lg:w-48 text-center shrink-0">
              <div className="text-2xl font-black text-slate-900 dark:text-white">{day.dayName}</div>
              <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1 bg-slate-50 dark:bg-slate-700 rounded-full px-3 py-1 inline-block">{day.totalCalories} KCAL</div>
            </div>
            
            <div className="flex-1 grid grid-cols-2 md:grid-cols-4 gap-10 w-full relative">
               {[
                 {l:'Breakfast', v:day.breakfast, c:'bg-orange-500'},
                 {l:'Lunch', v:day.lunch, c:'bg-emerald-500'},
                 {l:'Snack', v:day.snack, c:'bg-blue-500'},
                 {l:'Dinner', v:day.dinner, c:'bg-indigo-500'}
               ].map(m=>(
                 <div key={m.l} className="relative z-10 flex flex-col items-center md:items-start">
                   <div className="flex items-center gap-2 mb-2">
                     <div className={`w-3 h-3 rounded-full ${m.c} shadow-sm`} />
                     <span className="text-[9px] text-slate-400 font-black uppercase tracking-widest">{m.l}</span>
                   </div>
                   <div className="text-sm font-bold text-slate-800 dark:text-slate-200 leading-tight">{m.v}</div>
                 </div>
               ))}
            </div>
          </div>
        ))}
      </div>
    </section>

    {/* Feedback & restart */}
    <div className="flex flex-col items-center gap-10 py-16">
      <div className="bg-white dark:bg-slate-800 rounded-[3rem] p-10 md:p-14 text-center border border-slate-100 dark:border-slate-700 shadow-sm max-w-2xl w-full">
         <h3 className="text-2xl font-black text-slate-800 dark:text-white mb-2">How's your plan looking?</h3>
         <p className="text-slate-400 dark:text-slate-500 font-medium mb-10">Your feedback helps tune the AI logic for future sessions.</p>
         <div className="flex flex-wrap justify-center gap-4">
            <button onClick={() => setFeedback(true)} className={`px-10 py-4 rounded-2xl font-black transition-all flex items-center gap-3 border ${feedback === true ? 'bg-emerald-600 border-emerald-600 text-white shadow-xl scale-105' : 'bg-white dark:bg-slate-700 border-slate-200 dark:border-slate-600 text-slate-700 dark:text-white hover:border-emerald-500'}`}>
              <ThumbsUp size={22}/> Looks Great!
            </button>
            <button onClick={() => setFeedback(false)} className={`px-10 py-4 rounded-2xl font-black transition-all flex items-center gap-3 border ${feedback === false ? 'bg-rose-600 border-rose-600 text-white shadow-xl scale-105' : 'bg-white dark:bg-slate-700 border-slate-200 dark:border-slate-600 text-slate-700 dark:text-white hover:border-rose-500'}`}>
              <ThumbsDown size={22}/> Need Edits
            </button>
         </div>
      </div>
      
      <button onClick={() => setStep(0)} className="bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-12 py-5 rounded-[2rem] font-black text-lg hover:bg-slate-800 dark:hover:bg-slate-100 transition-all flex items-center gap-4 shadow-2xl group">
         <Activity size={24} className="group-hover:rotate-12 transition-transform"/> Start New Consultation
      </button>
    </div>
  </div>
);

// ─── Root App ─────────────────────────────────────────────────────────────────
const App: React.FC = () => {
  const [step, setStep] = useState(0); // 0 = landing
  const [userData, setUserData] = useState<UserData>(DEFAULT_USER_DATA);
  const [aiData, setAiData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState<boolean | null>(null);
  const [modalRecipe, setModalRecipe] = useState<Recipe | null>(null);
  const { theme, toggleTheme } = useTheme();

  const metrics = useMemo(() => calculateMetrics(userData), [userData]);

  const handleNext = () => setStep(prev => Math.min(prev + 1, 4));
  const handlePrev = () => setStep(prev => Math.max(prev - 1, 1));

  const generateReport = async () => {
    setLoading(true);
    try {
      const data = await getAIRecommendations(userData, metrics);
      setAiData(data);
      setStep(4);
    } catch (error) {
      console.error("AI Error:", error);
      alert("AI Service unreachable. Showing sample data for demo.");
      setAiData({
        bestForYou: [{
          name: "Tailored Salad", mealType: "Lunch", difficulty: "easy", cuisine: "Indian",
          timeInMins: 15, calories: 250, protein: 12, fat: 8, carbs: 35, fiber: 10,
          tags: ["AI Generated"], explanation: "High fiber content supports digestive stability.",
          ingredients: ["100g mixed greens", "50g cherry tomatoes", "1 tbsp olive oil", "Salt & pepper to taste"],
          steps: ["Wash greens and tomatoes.", "Combine in a bowl.", "Drizzle with olive oil.", "Season and serve."]
        }],
        readyIn30: [{
          name: "Quick Grain Bowl", mealType: "Dinner", difficulty: "easy", cuisine: "Indian",
          timeInMins: 20, calories: 350, protein: 18, fat: 12, carbs: 45, fiber: 8,
          tags: ["30 Mins"], explanation: "Balanced macros help with health optimization.",
          ingredients: ["1 cup cooked quinoa", "100g chickpeas", "1 tbsp tahini", "Lemon juice"],
          steps: ["Cook quinoa as per packet.", "Heat chickpeas in pan.", "Combine in bowl.", "Drizzle tahini and lemon."]
        }],
        weeklyPlan: [{ dayName: "Monday", breakfast: "Oats", lunch: "Lentils", snack: "Nuts", dinner: "Veg Stir Fry", totalCalories: 1500, protein: 50, fiber: 30 }]
      });
      setStep(4);
    } finally {
      setLoading(false);
    }
  };

  const updateField = (field: keyof UserData, value: any) => {
    setUserData(prev => ({ ...prev, [field]: value }));
  };

  // ── Landing page ──
  if (step === 0) {
    return (
      <>
        {/* Theme toggle on landing */}
        <div className="fixed top-6 right-6 z-50">
          <button
            onClick={toggleTheme}
            className="w-11 h-11 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 shadow-lg flex items-center justify-center hover:scale-110 transition-all"
            title="Toggle dark / light mode"
          >
            {theme === 'dark' ? <Sun size={18} className="text-yellow-400" /> : <Moon size={18} className="text-slate-600" />}
          </button>
        </div>
        <LandingPage onGetStarted={() => setStep(1)} />
      </>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-slate-900 transition-colors duration-300">
      {/* Header */}
      <header className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl border-b border-slate-100 dark:border-slate-700 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <button onClick={() => setStep(0)} className="flex items-center gap-3 hover:opacity-80 transition-opacity">
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-emerald-200 rotate-3">
              <img src="/logo.svg" alt="NutriTrack Logo" className="w-8 h-8" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-slate-900 dark:text-white leading-none tracking-tight">Nutri<span className="text-emerald-600">Track</span></h1>
              <p className="text-[11px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">BMI & WHtR Precision Guide</p>
            </div>
          </button>

          <div className="flex items-center gap-3">
            <div className="hidden md:flex items-center gap-2 px-4 py-2 bg-slate-50 dark:bg-slate-700 rounded-xl border border-slate-100 dark:border-slate-600">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[11px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-wider">AI Engine Online</span>
            </div>
            {/* Dark mode toggle */}
            <button
              onClick={toggleTheme}
              className="w-11 h-11 rounded-2xl bg-slate-50 dark:bg-slate-700 border border-slate-100 dark:border-slate-600 flex items-center justify-center hover:bg-slate-100 dark:hover:bg-slate-600 transition-all"
              title="Toggle dark / light mode"
            >
              {theme === 'dark' ? <Sun size={18} className="text-yellow-400" /> : <Moon size={18} className="text-slate-500" />}
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-10 px-6">
        {step < 4 && (
          <div className="mb-10">
            <StepProgress currentStep={step} />
          </div>
        )}
        
        <div className="relative">
          <div className={`${step < 4 ? 'bg-white dark:bg-slate-800 rounded-[3.5rem] shadow-2xl p-10 md:p-16 border border-slate-100 dark:border-slate-700' : ''} relative overflow-hidden transition-all duration-500`}>
             {step < 4 && (
               <div className="absolute top-0 left-0 h-1.5 bg-slate-100 dark:bg-slate-700 w-full overflow-hidden">
                 <div className="h-full bg-emerald-600 transition-all duration-1000 ease-out" style={{ width: `${((step - 1) / 3) * 100}%` }} />
               </div>
             )}
             {step === 1 && <Step1_HealthInfo userData={userData} updateField={updateField} handleNext={handleNext} />}
             {step === 2 && <Step2_Lifestyle userData={userData} updateField={updateField} handleNext={handleNext} handlePrev={handlePrev} />}
             {step === 3 && <Step3_Preferences userData={userData} updateField={updateField} generateReport={generateReport} handlePrev={handlePrev} loading={loading} />}
             {step === 4 && <Dashboard aiData={aiData} metrics={metrics} userData={userData} setStep={setStep} feedback={feedback} setFeedback={setFeedback} onOpenModal={setModalRecipe} />}
          </div>
        </div>
        
        {loading && (
          <div className="fixed inset-0 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md z-[100] flex flex-col items-center justify-center p-8 text-center animate-fadeIn">
            <div className="relative">
              <div className="w-24 h-24 border-8 border-slate-100 dark:border-slate-700 border-t-emerald-600 rounded-full animate-spin" />
              <div className="absolute inset-0 flex items-center justify-center">
                 <Sparkles className="text-emerald-600 animate-pulse" size={24} />
              </div>
            </div>
            <h3 className="text-3xl font-black text-slate-900 dark:text-white mt-10 mb-4 tracking-tight">Synthesizing Nutritional Intelligence</h3>
            <p className="text-slate-500 dark:text-slate-400 max-w-sm text-lg font-medium leading-relaxed">
              Matching your preferences with your biological needs...
            </p>
          </div>
        )}
      </main>

      <footer className="mt-20 mb-12 text-center px-6 border-t border-slate-100 dark:border-slate-700 pt-12 max-w-4xl mx-auto">
        <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.2em] mb-3">Academic Excellence Project Team B16</p>
        <div className="flex justify-center gap-6 text-[10px] text-slate-400 font-bold uppercase tracking-widest bg-slate-50 dark:bg-slate-800 py-3 rounded-full border border-slate-100 dark:border-slate-700 px-8 inline-flex">
          <span>Non-Medical Application</span>
          <span className="opacity-30">|</span>
          <span>Privacy Focused Processing</span>
        </div>
      </footer>

      {/* Recipe modal */}
      {modalRecipe && (
        <RecipeModal recipe={modalRecipe} onClose={() => setModalRecipe(null)} />
      )}
    </div>
  );
};

export default App;