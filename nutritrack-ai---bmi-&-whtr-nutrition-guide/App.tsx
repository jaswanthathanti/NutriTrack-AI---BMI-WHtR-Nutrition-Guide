import React, { useState, useMemo } from 'react';
import { 
  UserData, 
  HealthMetrics, 
  Recipe, 
  Gender, 
  ExerciseFrequency, 
  ActivityLevel,
  HealthGoal, 
  DietaryPreference 
} from './types';
import { DEFAULT_USER_DATA, BMI_CATEGORIES, WHTR_CATEGORIES } from './constants';
import { calculateMetrics, getAIRecommendations } from './services/nutritionService';
import StepProgress from './components/StepProgress';
import HealthChart from './components/HealthChart';
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
  BicepsFlexed
} from 'lucide-react';

interface StepProps {
  userData: UserData;
  updateField: (field: keyof UserData, value: any) => void;
  // handleNext is optional because it is not used by Step 3 (which uses generateReport instead)
  handleNext?: () => void;
  handlePrev?: () => void;
  loading?: boolean;
  // generateReport is optional because it is only used by Step 3
  generateReport?: () => void | Promise<void>;
}

const RecipeCard: React.FC<{ recipe: Recipe }> = ({ recipe }) => (
  <div className="bg-white rounded-[2rem] overflow-hidden shadow-sm border border-slate-100 hover:shadow-xl transition-all duration-300 group flex flex-col h-full">
    <div className="p-7 flex-1">
      <div className="flex justify-between items-start mb-5">
        <div className="flex gap-2">
          <span className={`text-[9px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full ${
            recipe.mealType === 'Dinner' ? 'bg-indigo-50 text-indigo-600' : 
            recipe.mealType === 'Breakfast' ? 'bg-orange-50 text-orange-600' : 
            'bg-emerald-50 text-emerald-600'
          }`}>
            {recipe.mealType}
          </span>
          <span className="text-[9px] font-black uppercase tracking-wider bg-slate-50 text-slate-500 px-2.5 py-1 rounded-full">
            {recipe.difficulty}
          </span>
        </div>
        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{recipe.cuisine}</span>
      </div>
      
      <h4 className="text-xl font-bold text-slate-800 mb-2 group-hover:text-emerald-600 transition-colors leading-tight">
        {recipe.name}
      </h4>
      <div className="flex items-center gap-1.5 text-[11px] text-slate-400 font-bold mb-6">
        <Clock size={14} className="opacity-70" /> {recipe.timeInMins} mins
      </div>

      <div className="grid grid-cols-4 gap-2 mb-6">
        {[
          { label: 'Cals', val: recipe.calories, color: 'text-orange-600' },
          { label: 'Prot', val: `${recipe.protein}g`, color: 'text-emerald-600' },
          { label: 'Fat', val: `${recipe.fat}g`, color: 'text-rose-600' },
          { label: 'Fiber', val: `${recipe.fiber}g`, color: 'text-sky-600' }
        ].map(stat => (
          <div key={stat.label} className="bg-slate-50/80 rounded-2xl p-2.5 text-center border border-slate-100/50">
            <div className="text-[8px] text-slate-400 uppercase font-black mb-0.5">{stat.label}</div>
            <div className={`text-[12px] font-black ${stat.color}`}>{stat.val}</div>
          </div>
        ))}
      </div>

      <div className="space-y-3">
        <div className="flex flex-wrap gap-1.5">
          {recipe.tags.slice(0, 3).map(tag => (
            <span key={tag} className="text-[9px] font-bold bg-white text-slate-600 border border-slate-200 px-2 py-0.5 rounded-lg shadow-sm">
              #{tag}
            </span>
          ))}
        </div>
        
        <div className="bg-emerald-50/40 p-4 rounded-2xl border border-emerald-100/50 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-2 opacity-10">
            <Sparkles size={32} className="text-emerald-600" />
          </div>
          <div className="flex items-center gap-2 text-emerald-700 font-black text-[10px] mb-1 uppercase tracking-wider">
            <Info size={12} strokeWidth={3} /> Recommendation Logic
          </div>
          <p className="text-[11px] text-slate-600 leading-relaxed font-medium italic">
            "{recipe.explanation}"
          </p>
        </div>
      </div>
    </div>
  </div>
);

const Step1_HealthInfo: React.FC<StepProps> = ({ userData, updateField, handleNext }) => (
  <div className="animate-slideUp max-w-2xl mx-auto">
    <div className="text-center mb-10">
      <div className="inline-flex items-center justify-center w-16 h-16 bg-emerald-50 text-emerald-600 rounded-2xl mb-4 rotate-3">
        <Heart size={32} />
      </div>
      <h2 className="text-3xl font-black text-slate-800 tracking-tight">Body Measurements</h2>
      <p className="text-slate-500 font-medium">Precision data for a precision nutrition plan</p>
    </div>
    
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
      {[
        { label: 'Height (cm)', field: 'height', placeholder: 'e.g., 170' },
        { label: 'Weight (kg)', field: 'weight', placeholder: 'e.g., 65' },
        { label: 'Waist (cm)', field: 'waist', placeholder: 'e.g., 80' },
        { label: 'Age (years)', field: 'age', placeholder: 'e.g., 25' }
      ].map(item => (
        <div key={item.field} className="group">
          <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2 ml-1">{item.label}</label>
          <input 
            type="text" 
            inputMode="numeric"
            placeholder={item.placeholder}
            className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl p-5 focus:ring-0 focus:border-emerald-500 outline-none transition-all text-slate-900 font-bold text-lg placeholder:text-slate-200"
            value={userData[item.field as keyof UserData] ?? ''}
            onChange={(e) => updateField(item.field as keyof UserData, e.target.value)} 
          />
        </div>
      ))}
    </div>

    <div className="mb-12">
      <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-4 ml-1">Gender</label>
      <div className="flex gap-4">
        {[Gender.Male, Gender.Female].map(g => (
          <button 
            key={g} 
            onClick={() => updateField('gender', g)}
            className={`flex-1 py-4 rounded-2xl font-bold border-2 transition-all flex items-center justify-center gap-3 ${
              userData.gender === g 
                ? 'bg-emerald-600 border-emerald-600 text-white shadow-lg shadow-emerald-200' 
                : 'bg-white border-slate-100 text-slate-400 hover:border-slate-200'
            }`}
          >
            {g === Gender.Male ? <User size={20} /> : <Heart size={20} />}
            {g}
          </button>
        ))}
      </div>
    </div>

    <button onClick={handleNext} className="w-full bg-slate-900 text-white py-5 rounded-2xl font-black text-lg flex items-center justify-center gap-3 hover:bg-slate-800 transition-all shadow-xl">
      Next Step <ArrowRight size={22} />
    </button>
  </div>
);

const Step2_Lifestyle: React.FC<StepProps> = ({ userData, updateField, handleNext, handlePrev }) => (
  <div className="animate-slideUp max-w-4xl mx-auto">
    <div className="text-center mb-10">
      <div className="inline-flex items-center justify-center w-12 h-12 bg-emerald-50 text-emerald-600 rounded-full mb-4 shadow-sm">
        <Activity size={24} />
      </div>
      <h2 className="text-3xl font-bold text-slate-800 tracking-tight">Lifestyle & Activity</h2>
      <p className="text-slate-500 font-medium mt-1">Tell us about your daily routine and fitness goals</p>
    </div>

    <div className="space-y-10">
      <section>
        <label className="block text-sm font-semibold text-slate-800 mb-4">How often do you exercise?</label>
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
                  ? 'border-emerald-600 bg-emerald-50/30' 
                  : 'border-slate-100 bg-slate-100/50 hover:border-slate-200'
              }`}
            >
              <div className="mb-2 transition-transform group-hover:scale-110">{item.icon}</div>
              <div className="font-bold text-slate-800 text-sm">{item.label}</div>
              <div className="text-[11px] text-slate-500 font-medium">{item.desc}</div>
            </button>
          ))}
        </div>
      </section>

      <section>
        <label className="block text-sm font-semibold text-slate-800 mb-4">Daily Routine</label>
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
                  ? 'border-emerald-600 bg-emerald-50/30' 
                  : 'border-slate-100 bg-slate-100/50 hover:border-slate-200'
              }`}
            >
              <div className="mb-2 transition-transform group-hover:scale-110">{item.icon}</div>
              <div className="font-bold text-slate-800 text-sm">{item.label}</div>
              <div className="text-[11px] text-slate-500 font-medium">{item.desc}</div>
            </button>
          ))}
        </div>
      </section>

      <section>
        <div className="flex items-center gap-2 mb-4">
          <Target size={18} className="text-slate-600" />
          <label className="text-sm font-semibold text-slate-800">Your Goal</label>
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
                  ? 'border-emerald-600 bg-emerald-50/30' 
                  : 'border-slate-100 bg-slate-100/50 hover:border-slate-200'
              }`}
            >
              <div className="mb-2 transition-transform group-hover:scale-110">{item.icon}</div>
              <div className="font-bold text-slate-800 text-sm">{item.label}</div>
              <div className="text-[11px] text-slate-500 font-medium">{item.desc}</div>
            </button>
          ))}
        </div>
      </section>
    </div>

    <div className="flex gap-4 mt-12">
      <button 
        onClick={handlePrev} 
        className="flex-1 bg-white text-slate-600 py-4 rounded-xl font-bold border border-slate-200 hover:bg-slate-50 transition-all flex items-center justify-center gap-2"
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

const Step3_Preferences: React.FC<StepProps> = ({ userData, updateField, generateReport, handlePrev, loading }) => (
  <div className="animate-slideUp max-w-3xl mx-auto">
    <div className="text-center mb-10">
      <div className="inline-flex items-center justify-center w-16 h-16 bg-orange-50 text-orange-600 rounded-2xl mb-4 rotate-6">
        <Utensils size={32} />
      </div>
      <h2 className="text-3xl font-black text-slate-800 tracking-tight">Taste & Diet</h2>
      <p className="text-slate-500 font-medium">Health is easier when it tastes good</p>
    </div>

    <div className="space-y-12">
      <section>
        <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-4 ml-1 flex items-center gap-2">
          <Sparkles size={16} className="text-orange-500" /> Must-Include Foods
        </label>
        <div className="relative">
          <input 
            type="text" 
            placeholder="e.g., Avocado, Paneer, Salmon, Sweet Potato..."
            className="w-full bg-slate-50 border-2 border-slate-100 rounded-3xl p-6 focus:ring-0 focus:border-orange-500 outline-none text-slate-900 font-bold text-lg transition-all shadow-inner" 
            value={userData.favFood} 
            onChange={(e) => updateField('favFood', e.target.value)} 
          />
          <div className="mt-4 p-4 bg-orange-50/50 rounded-2xl border border-orange-100 flex items-start gap-3">
            <Info size={16} className="text-orange-600 mt-0.5 shrink-0" />
            <p className="text-xs text-orange-800 font-medium italic leading-relaxed">
              <strong>Demo Logic:</strong> Our AI will cross-reference these ingredients with your BMI/WHtR needs to find healthy recipes you'll actually love.
            </p>
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <section>
          <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-6 ml-1">Regional Cuisine</label>
          <div className="grid grid-cols-2 gap-3">
            {['Indian', 'Continental', 'Mediterranean', 'Regional'].map(c => (
              <button key={c} onClick={() => updateField('cuisine', c)} className={`p-4 rounded-2xl border-2 text-center transition-all ${userData.cuisine === c ? 'border-orange-600 bg-orange-50 font-black' : 'border-slate-100 bg-white hover:border-slate-200'}`}>
                <div className="text-xs text-slate-800">{c}</div>
              </button>
            ))}
          </div>
        </section>

        <section>
          <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-6 ml-1">Dietary Restriction</label>
          <div className="space-y-3">
            {[
              { val: DietaryPreference.Veg, icon: <Leaf className="text-emerald-500" />, sub: 'Pure Plant-Based' },
              { val: DietaryPreference.NonVeg, icon: <Flame size={18} className="text-rose-500" />, sub: 'Include Proteins' }
            ].map(item => (
              <button key={item.val} onClick={() => updateField('dietary', item.val)} className={`w-full p-4 flex items-center gap-4 rounded-2xl border-2 transition-all ${userData.dietary === item.val ? 'border-slate-900 bg-slate-900 text-white shadow-lg' : 'border-slate-100 bg-white hover:border-slate-200'}`}>
                <div className="w-10 h-10 flex items-center justify-center bg-white rounded-xl shadow-sm shrink-0">{item.icon}</div>
                <div className="text-left">
                  <div className={`font-black text-sm ${userData.dietary === item.val ? 'text-white' : 'text-slate-800'}`}>{item.val}</div>
                  <div className="text-[10px] text-slate-400">{item.sub}</div>
                </div>
              </button>
            ))}
          </div>
        </section>
      </div>
    </div>

    <div className="flex gap-4 mt-16">
      <button onClick={handlePrev} className="flex-1 bg-slate-100 text-slate-600 py-5 rounded-2xl font-black text-lg border border-slate-200 hover:bg-slate-200 transition-all">
        Back
      </button>
      <button onClick={generateReport} disabled={loading} className="flex-[2] bg-slate-900 text-white py-5 rounded-2xl font-black text-lg shadow-xl hover:bg-slate-800 transition-all flex items-center justify-center gap-3 disabled:opacity-50">
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

const Dashboard: React.FC<{ 
  aiData: any; 
  metrics: HealthMetrics; 
  userData: UserData; 
  setStep: (s: number) => void;
  feedback: boolean | null;
  setFeedback: (f: boolean) => void;
}> = ({ aiData, metrics, userData, setStep, feedback, setFeedback }) => (
  <div className="animate-slideUp max-w-6xl mx-auto space-y-16 pb-20">
    <div className="bg-slate-900 text-white rounded-[3rem] p-10 md:p-14 relative overflow-hidden shadow-2xl">
      <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 blur-[100px] rounded-full -mr-20 -mt-20"></div>
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

    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm flex flex-col items-center justify-center text-center relative">
        <div className="absolute top-6 left-6 text-slate-200"><Scale size={48} strokeWidth={1}/></div>
        <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6">BMI Assessment</div>
        <div className="text-6xl font-black text-slate-900 mb-2">{metrics.bmi.toFixed(1)}</div>
        <div className={`px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest ${
          metrics.bmiCategory === 'Normal' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'
        }`}>
          {metrics.bmiCategory}
        </div>
      </div>

      <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm flex flex-col items-center justify-center text-center relative">
        <div className="absolute top-6 left-6 text-slate-200"><Activity size={48} strokeWidth={1}/></div>
        <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6">WHtR Assessment</div>
        <div className="text-6xl font-black text-slate-900 mb-2">{metrics.whtr.toFixed(2)}</div>
        <div className={`px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest ${
          metrics.whtrCategory === 'Low' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'
        }`}>
          {metrics.whtrCategory} Risk
        </div>
      </div>

      <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm flex flex-col">
        <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 px-2">Macronutrient Target</div>
        <div className="flex-1 min-h-[180px]">
          <HealthChart macros={metrics.macros} />
        </div>
      </div>
    </div>

    <section className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="text-3xl font-black text-slate-800 tracking-tight flex items-center gap-3">
            <Sparkles className="text-orange-500" size={28} /> AI-Recommended Signature Dishes
          </h2>
          <p className="text-slate-500 font-medium mt-1">
            Engineered using <span className="text-orange-600 font-bold">{userData.favFood || 'your unique tastes'}</span> & clinical data.
          </p>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {aiData?.bestForYou.map((r: any, i: number) => (
          <RecipeCard key={i} recipe={r} />
        ))}
      </div>
    </section>

    <section className="space-y-8">
      <div className="flex items-center gap-3">
        <Zap className="text-blue-500" size={28} />
        <h2 className="text-3xl font-black text-slate-800 tracking-tight">Rapid Fuel (Under 30 mins)</h2>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {aiData?.readyIn30.map((r: any, i: number) => (
          <RecipeCard key={i+10} recipe={r} />
        ))}
      </div>
    </section>

    <section className="space-y-8">
      <div className="flex items-center gap-3">
        <Calendar className="text-emerald-600" size={28} />
        <h2 className="text-3xl font-black text-slate-800 tracking-tight">Full 7-Day Protocol</h2>
      </div>
      <div className="grid grid-cols-1 gap-4">
        {aiData?.weeklyPlan.map((day: any, i: number) => (
          <div key={i} className="bg-white rounded-[2rem] border border-slate-100 p-8 flex flex-col lg:flex-row gap-8 items-center transition-all hover:border-slate-300 group shadow-sm">
            <div className="lg:w-48 text-center shrink-0">
              <div className="text-2xl font-black text-slate-900">{day.dayName}</div>
              <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1 bg-slate-50 rounded-full px-3 py-1 inline-block">{day.totalCalories} KCAL</div>
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
                   <div className="text-sm font-bold text-slate-800 leading-tight">{m.v}</div>
                 </div>
               ))}
            </div>
          </div>
        ))}
      </div>
    </section>

    <div className="flex flex-col items-center gap-10 py-16">
      <div className="bg-white rounded-[3rem] p-10 md:p-14 text-center border border-slate-100 shadow-sm max-w-2xl w-full">
         <h3 className="text-2xl font-black text-slate-800 mb-2">How's your plan looking?</h3>
         <p className="text-slate-400 font-medium mb-10">Your feedback helps tune the AI logic for future sessions.</p>
         <div className="flex flex-wrap justify-center gap-4">
            <button onClick={() => setFeedback(true)} className={`px-10 py-4 rounded-2xl font-black transition-all flex items-center gap-3 border ${feedback === true ? 'bg-emerald-600 border-emerald-600 text-white shadow-xl scale-105' : 'bg-white border-slate-200 text-slate-700 hover:border-emerald-500'}`}>
              <ThumbsUp size={22}/> Looks Great!
            </button>
            <button onClick={() => setFeedback(false)} className={`px-10 py-4 rounded-2xl font-black transition-all flex items-center gap-3 border ${feedback === false ? 'bg-rose-600 border-rose-600 text-white shadow-xl scale-105' : 'bg-white border-slate-200 text-slate-700 hover:border-rose-500'}`}>
              <ThumbsDown size={22}/> Need Edits
            </button>
         </div>
      </div>
      
      <button onClick={() => setStep(1)} className="bg-slate-900 text-white px-12 py-5 rounded-[2rem] font-black text-lg hover:bg-slate-800 transition-all flex items-center gap-4 shadow-2xl group">
         <Activity size={24} className="group-hover:rotate-12 transition-transform"/> Start New Consultation
      </button>
    </div>
  </div>
);

const App: React.FC = () => {
  const [step, setStep] = useState(1);
  const [userData, setUserData] = useState<UserData>(DEFAULT_USER_DATA);
  const [aiData, setAiData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState<boolean | null>(null);

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
        bestForYou: [{ name: "Tailored Salad", mealType: "Lunch", difficulty: "easy", cuisine: "Indian", timeInMins: 15, calories: 250, protein: 12, fat: 8, carbs: 35, fiber: 10, tags: ["AI Generated"], explanation: "High fiber content supports digestive stability." }],
        readyIn30: [{ name: "Quick Grain Bowl", mealType: "Dinner", difficulty: "easy", cuisine: "Indian", timeInMins: 20, calories: 350, protein: 18, fat: 12, carbs: 45, fiber: 8, tags: ["30 Mins"], explanation: "Balanced macros help with health optimization." }],
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

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <header className="bg-white/80 backdrop-blur-xl border-b border-slate-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-emerald-600 w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-emerald-200 rotate-3">
              <Leaf size={28} strokeWidth={2.5} />
            </div>
            <div>
              <h1 className="text-2xl font-black text-slate-900 leading-none tracking-tight">Nutri<span className="text-emerald-600">Track</span></h1>
              <p className="text-[11px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">BMI & WHtR Precision Guide</p>
            </div>
          </div>
          <div className="hidden md:flex items-center gap-2 px-4 py-2 bg-slate-50 rounded-xl border border-slate-100">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[11px] font-black text-slate-500 uppercase tracking-wider">AI Engine Online</span>
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
          <div className={`${step < 4 ? 'bg-white rounded-[3.5rem] shadow-2xl p-10 md:p-16 border border-slate-100' : ''} relative overflow-hidden transition-all duration-500`}>
             {step < 4 && (
               <div className="absolute top-0 left-0 h-1.5 bg-slate-100 w-full overflow-hidden">
                 <div className="h-full bg-emerald-600 transition-all duration-1000 ease-out" style={{ width: `${(step / 3) * 100}%` }} />
               </div>
             )}
             {step === 1 && <Step1_HealthInfo userData={userData} updateField={updateField} handleNext={handleNext} />}
             {step === 2 && <Step2_Lifestyle userData={userData} updateField={updateField} handleNext={handleNext} handlePrev={handlePrev} />}
             {step === 3 && <Step3_Preferences userData={userData} updateField={updateField} generateReport={generateReport} handlePrev={handlePrev} loading={loading} />}
             {step === 4 && <Dashboard aiData={aiData} metrics={metrics} userData={userData} setStep={setStep} feedback={feedback} setFeedback={setFeedback} />}
          </div>
        </div>
        
        {loading && (
          <div className="fixed inset-0 bg-white/95 backdrop-blur-md z-[100] flex flex-col items-center justify-center p-8 text-center animate-fadeIn">
            <div className="relative">
              <div className="w-24 h-24 border-8 border-slate-100 border-t-emerald-600 rounded-full animate-spin"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                 <Sparkles className="text-emerald-600 animate-pulse" size={24} />
              </div>
            </div>
            <h3 className="text-3xl font-black text-slate-900 mt-10 mb-4 tracking-tight">Synthesizing Nutritional Intelligence</h3>
            <p className="text-slate-500 max-w-sm text-lg font-medium leading-relaxed">
              Matching your preferences with your biological needs...
            </p>
          </div>
        )}
      </main>

      <footer className="mt-20 mb-12 text-center px-6 border-t border-slate-100 pt-12 max-w-4xl mx-auto">
        <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.2em] mb-3">Academic Excellence Project Team B16</p>
        <div className="flex justify-center gap-6 text-[10px] text-slate-400 font-bold uppercase tracking-widest bg-slate-50 py-3 rounded-full border border-slate-100 px-8 inline-flex">
          <span>Non-Medical Application</span>
          <span className="opacity-30">|</span>
          <span>Privacy Focused Processing</span>
        </div>
      </footer>
    </div>
  );
};

export default App;