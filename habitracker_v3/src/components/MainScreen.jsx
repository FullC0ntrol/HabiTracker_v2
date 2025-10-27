// MainScreen.jsx
import { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Dumbbell, ClipboardList, Activity, Leaf, UserCircle, ArrowLeft } from 'lucide-react';
import Plan from './menu/Plan';
import Exercises from './menu/Exercises';
import Habit from './menu/Habit';
import Account from './menu/Account';

const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const monthNames = ['January','February','March','April','May','June','July','August','September','October','November','December'];

export default function MainScreen() {
  const [currentDate, setCurrentDate] = useState(new Date());
  // Hardcode przykładowych dni treningowych (tylko do wyglądu, bez DB)
  const [workoutDays] = useState(new Set(['2025-10-05', '2025-10-12', '2025-10-19', '2025-10-26']));
  const [showMenu, setShowMenu] = useState(false);
  const [view, setView] = useState('calendar'); // 'calendar' | 'plan' | 'exercises' | 'habits' | 'account'

  // menuItems z akcjami nawigacji
  const menuItems = [
    { icon: UserCircle,   label: 'Account',   color: 'rose',    delay: '150ms', onClick: () => setView('account') },
    { icon: Leaf,         label: 'Habits',    color: 'emerald', delay: '100ms', onClick: () => setView('habits') },
    { icon: Activity,     label: 'Exercises', color: 'amber',   delay: '50ms',  onClick: () => setView('exercises') },
    { icon: ClipboardList,label: 'Plan',      color: 'cyan',    delay: '0ms',   onClick: () => setView('plan') },
  ];

  // --- hover intent (anty-migotanie) ---
  const hoverZoneRef = useRef(null);
  const openT = useRef(null);
  const closeT = useRef(null);

  const openWithIntent = () => {
    if (closeT.current) { clearTimeout(closeT.current); closeT.current = null; }
    if (!showMenu) {
      openT.current = setTimeout(() => setShowMenu(true), 60);
    }
  };
  const closeWithIntent = () => {
    if (openT.current) { clearTimeout(openT.current); openT.current = null; }
    closeT.current = setTimeout(() => setShowMenu(false), 180);
  };

  useEffect(() => {
    const onDown = (e) => {
      if (hoverZoneRef.current && !hoverZoneRef.current.contains(e.target)) setShowMenu(false);
    };
    const onKey = (e) => { if (e.key === 'Escape') setShowMenu(false); };
    document.addEventListener('pointerdown', onDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('pointerdown', onDown);
      document.removeEventListener('keydown', onKey);
      if (openT.current) clearTimeout(openT.current);
      if (closeT.current) clearTimeout(closeT.current);
    };
  }, [showMenu]);

  const { daysInMonth, startingDayOfWeek } = useMemo(() => {
    const y = currentDate.getFullYear();
    const m = currentDate.getMonth();
    const first = new Date(y, m, 1);
    const last  = new Date(y, m + 1, 0);
    return { daysInMonth: last.getDate(), startingDayOfWeek: first.getDay() };
  }, [currentDate]);

  const handleMonthChange = useCallback((offset) => {
    setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() + offset));
  }, []);

  const isWorkoutDay = useCallback((day) => {
    if (!day) return false;
    const d = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return workoutDays.has(d);
  }, [currentDate, workoutDays]);

  const calendarDays = useMemo(() => {
    const days = [];
    for (let i = 0; i < startingDayOfWeek; i++) days.push(null);
    for (let d = 1; d <= daysInMonth; d++) days.push(d);
    return days;
  }, [daysInMonth, startingDayOfWeek]);

  // --- pozycje menu: na boki, z korektą pod główny przycisk ---
  const getMenuStyle = (index, open) => {
    const baseSpacing = 90;
    const centerIndex = 1.5;
    const mainW = 80;   // w-20
    const gap = 16;
    const shift = mainW / 2 + gap; // 56

    let x = (index - centerIndex) * baseSpacing;
    x += index < centerIndex ? -shift : +shift;
    const y = -15;

    const closed = 'translate(-50%, -50%)';
    const opened = `translate(calc(-50% + ${x}px), calc(-50% + ${y}px))`;

    return {
      transform: open ? opened : closed,
      opacity: open ? 1 : 0,
      transition: `transform 300ms cubic-bezier(.2,.8,.2,1) ${menuItems[index].delay}, opacity 220ms ease ${menuItems[index].delay}`,
      pointerEvents: open ? 'auto' : 'none',
    };
  };

  const today = new Date();

  // Tytuł w headerze zależny od widoku
  const headerTitle = {
    calendar: `${monthNames[currentDate.getMonth()]} ${currentDate.getFullYear()}`,
    plan: 'Plan',
    exercises: 'Exercises',
    habits: 'Habits',
    account: 'Account',
  }[view];

  const isCalendar = view === 'calendar';

  return (
    <div className="min-h-screen w-full bg-mesh flex flex-col relative overflow-hidden">
      {/* tła */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl animate-pulse-slow" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '2s' }} />
      </div>

      <div className="relative z-10 flex flex-col h-screen">
        {/* Header */}
        <div className="glass-strong border-b border-white/10 px-6 py-6 flex items-center justify-between animate-slide-up rounded-b-[40px] shadow-2xl">
          {isCalendar ? (
            <>
              <button onClick={() => handleMonthChange(-1)} className="w-10 h-10 rounded-xl glass flex items-center justify-center hover:bg-white/10 hover:scale-105 transition-all duration-200 border border-transparent hover:border-cyan-400/30">
                <ChevronLeft className="w-5 h-5 text-cyan-400" />
              </button>
              <h2 className="text-3xl font-extrabold text-white tracking-wider">
                {headerTitle}
              </h2>
              <button onClick={() => handleMonthChange(1)} className="w-10 h-10 rounded-xl glass flex items-center justify-center hover:bg-white/10 hover:scale-105 transition-all duration-200 border border-transparent hover:border-cyan-400/30">
                <ChevronRight className="w-5 h-5 text-cyan-400" />
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => setView('calendar')}
                className="w-10 h-10 rounded-xl glass flex items-center justify-center hover:bg-white/10 hover:scale-105 transition-all duration-200 border border-transparent hover:border-cyan-400/30"
                aria-label="Back"
              >
                <ArrowLeft className="w-5 h-5 text-cyan-400" />
              </button>
              <h2 className="text-3xl font-extrabold text-white tracking-wider">
                {headerTitle}
              </h2>
              <div className="w-10 h-10" /> {/* placeholder dla symetrii */}
            </>
          )}
        </div>

        {/* CONTENT */}
        <div className="flex-1 flex flex-col p-4 sm:p-6 overflow-hidden">
          {isCalendar ? (
            <div className="flex-1 flex flex-col animate-slide-up">
              {/* nagłówki dni */}
              <div className="grid grid-cols-7 gap-2 mb-2 sm:mb-4">
                {weekDays.map((d) => (
                  <div key={d} className="text-center text-sm font-semibold text-cyan-400 py-2 uppercase tracking-widest border-b border-cyan-400/30">
                    {d}
                  </div>
                ))}
              </div>

              {/* siatka dni */}
              <div className="grid grid-cols-7 gap-2 flex-1">
                {calendarDays.map((day, index) => {
                  const isCurrentDay = day && day === today.getDate() && currentDate.getMonth() === today.getMonth() && currentDate.getFullYear() === today.getFullYear();
                  const training = isWorkoutDay(day);
                  return (
                    <div
                      key={index}
                      className={`relative rounded-2xl sm:rounded-3xl flex items-center justify-center p-1 sm:p-2 ${day ? 'cursor-pointer' : 'pointer-events-none'} transition-all duration-300 transform-gpu ${day ? 'hover:scale-[1.03] active:scale-[0.98]' : ''}`}
                    >
                      {day && (
                        <div className={`w-full h-full flex flex-col items-center justify-center p-1 rounded-2xl glass-light-hover ${
                          training
                            ? 'bg-gradient-to-br from-amber-500/30 to-amber-600/30 glow-amber border border-amber-400/30 shadow-xl'
                            : isCurrentDay
                              ? 'bg-cyan-500/30 border border-cyan-400/50 glow-cyan'
                              : 'bg-white/5 border border-white/10'
                        }`}>
                          <span className={`font-bold text-lg sm:text-xl ${training || isCurrentDay ? 'text-white' : 'text-gray-200'}`}>{day}</span>
                          {training && <Dumbbell className="w-3 h-3 text-amber-300 mt-0.5 animate-pulse" fill="currentColor" strokeWidth={0} />}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="flex-1 overflow-auto">
              {view === 'plan' && <Plan />}
              {view === 'exercises' && <Exercises />}
              {view === 'habits' && <Habit />}
              {view === 'account' && <Account />}
            </div>
          )}
        </div>

        {/* DOCK / MENU — pokazujemy tylko na widoku kalendarza */}
        {isCalendar && (
          <div className="relative pb-8 flex justify-center items-end animate-slide-up z-20" style={{ animationDelay: '200ms' }}>
            <div
              ref={hoverZoneRef}
              onMouseEnter={openWithIntent}
              onMouseLeave={closeWithIntent}
              className="relative w-[420px] max-w-full h-28 flex items-center justify-center"
            >
              {/* Opcje */}
              {menuItems.map((item, index) => {
                const Icon = item.icon;
                const style = getMenuStyle(index, showMenu);
                return (
                  <button
                    key={item.label}
                    style={style}
                    className="absolute left-1/2 top-1/2 w-14 h-14 rounded-2xl glass-strong flex items-center justify-center hover:scale-110 active:scale-95 transition-all duration-300 ease-out z-40"
                    onClick={() => { item.onClick(); setShowMenu(false); }}
                    aria-label={item.label}
                    title={item.label}
                  >
                    <Icon className={`w-6 h-6 text-${item.color}-400`} strokeWidth={2} />
                  </button>
                );
              })}

              {/* Główny przycisk */}
              <button
                onClick={() => setShowMenu(v => !v)}
                className={`relative z-30 w-20 h-20 rounded-full bg-gradient-to-br from-cyan-500 to-cyan-600 flex items-center justify-center transition-all duration-300 glow-cyan shadow-2xl ${showMenu ? 'rotate-45 scale-105' : 'hover:scale-110 animate-pulse-slow'}`}
                aria-expanded={showMenu}
                aria-label="Toggle main menu"
              >
                <Dumbbell className="w-10 h-10 text-white" strokeWidth={2.5} />
              </button>

              {/* Niewidzialna poduszka hover */}
              <div className="absolute inset-x-0 -top-4 -bottom-2" />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
