// MainScreen.jsx
import { useState, useMemo, useCallback, useRef, useEffect } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Dumbbell,
  ClipboardList,
  Activity,
  Leaf,
  UserCircle,
  ArrowLeft,
  CheckCircle2,
  X,
} from "lucide-react";
import Plan from "./menu/Plan";
import Exercises from "./menu/Exercises";
import Habit from "./menu/Habit";
import Account from "./menu/Account";
import { API_BASE } from "../lib/api";
import { authHeaders } from "../lib/authHeaders";

/* ====================== utils ====================== */
const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const monthNames = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const toISO = (d) =>
  new Date(d.getTime() - d.getTimezoneOffset() * 60000)
    .toISOString()
    .slice(0, 10);

/* ================== particle effect ================= */
function ParticleBurst({ trigger }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    if (!trigger) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    let raf;
    const w = (canvas.width = 180);
    const h = (canvas.height = 60);

    const particles = Array.from({ length: 32 }).map(() => ({
      x: w / 2 + (Math.random() - 0.5) * 6,
      y: h / 2,
      vx: (Math.random() - 0.5) * 2.4,
      vy: -Math.random() * 2.6 - 0.8,
      life: 60 + Math.random() * 10,
      age: 0,
      r: 1.5 + Math.random() * 2.5,
    }));

    function step() {
      ctx.clearRect(0, 0, w, h);
      particles.forEach((p) => {
        p.age++;
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.05; // gravity
        const alpha = Math.max(0, 1 - p.age / p.life);
        ctx.globalAlpha = alpha;
        ctx.fillStyle = "#22d3ee"; // cyan
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fill();
      });
      ctx.globalAlpha = 1;
      if (particles.some((p) => p.age < p.life))
        raf = requestAnimationFrame(step);
    }
    step();
    return () => cancelAnimationFrame(raf);
  }, [trigger]);

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none absolute inset-y-0 right-0 translate-x-8 sm:translate-x-10"
      style={{ width: 180, height: 60 }}
    />
  );
}

/* =================== main screen ==================== */
export default function MainScreen() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [showMenu, setShowMenu] = useState(false);
  const [view, setView] = useState("calendar"); // 'calendar' | 'plan' | 'exercises' | 'habits' | 'account'

  // calendar data
  const [workoutSet, setWorkoutSet] = useState(() => new Set());
  const [habitsDoneSet, setHabitsDoneSet] = useState(() => new Set());
  const [habits, setHabits] = useState([]);
  const [entriesByDate, setEntriesByDate] = useState({});
  const [dayModal, setDayModal] = useState({ open: false, date: null });

  // "Trenuj dziś" particle trigger
  const [burstKey, setBurstKey] = useState(0);

  const menuItems = [
    {
      icon: UserCircle,
      label: "Account",
      color: "rose",
      delay: "150ms",
      onClick: () => setView("account"),
    },
    {
      icon: Leaf,
      label: "Habits",
      color: "emerald",
      delay: "100ms",
      onClick: () => setView("habits"),
    },
    {
      icon: Activity,
      label: "Exercises",
      color: "amber",
      delay: "50ms",
      onClick: () => setView("exercises"),
    },
    {
      icon: ClipboardList,
      label: "Plan",
      color: "cyan",
      delay: "0ms",
      onClick: () => setView("plan"),
    },
  ];

  // hover intent
  const hoverZoneRef = useRef(null);
  const openT = useRef(null);
  const closeT = useRef(null);
  const openWithIntent = () => {
    if (closeT.current) {
      clearTimeout(closeT.current);
      closeT.current = null;
    }
    if (!showMenu) openT.current = setTimeout(() => setShowMenu(true), 60);
  };
  const closeWithIntent = () => {
    if (openT.current) {
      clearTimeout(openT.current);
      openT.current = null;
    }
    closeT.current = setTimeout(() => setShowMenu(false), 180);
  };
  useEffect(() => {
    const onDown = (e) => {
      if (hoverZoneRef.current && !hoverZoneRef.current.contains(e.target))
        setShowMenu(false);
    };
    const onKey = (e) => {
      if (e.key === "Escape") setShowMenu(false);
    };
    document.addEventListener("pointerdown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onDown);
      document.removeEventListener("keydown", onKey);
      if (openT.current) clearTimeout(openT.current);
      if (closeT.current) clearTimeout(closeT.current);
    };
  }, [showMenu]);

  // month helpers
  const monthRange = useMemo(() => {
    const y = currentDate.getFullYear();
    const m = currentDate.getMonth();
    const first = new Date(y, m, 1);
    const last = new Date(y, m + 1, 0);
    return { first, last };
  }, [currentDate]);

  const { daysInMonth, startingDayOfWeek } = useMemo(() => {
    const y = currentDate.getFullYear();
    const m = currentDate.getMonth();
    const first = new Date(y, m, 1);
    const last = new Date(y, m + 1, 0);
    return { daysInMonth: last.getDate(), startingDayOfWeek: first.getDay() };
  }, [currentDate]);

  const calendarDays = useMemo(() => {
    const days = [];
    for (let i = 0; i < startingDayOfWeek; i++) days.push(null);
    for (let d = 1; d <= daysInMonth; d++) days.push(d);
    return days;
  }, [daysInMonth, startingDayOfWeek]);

  const handleMonthChange = useCallback((offset) => {
    setCurrentDate(
      (prev) => new Date(prev.getFullYear(), prev.getMonth() + offset)
    );
  }, []);

  // load month data
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const from = toISO(monthRange.first);
        const to = toISO(monthRange.last);
        const [sRes, hRes, eRes] = await Promise.all([
          fetch(`${API_BASE}/api/workouts/sessions?from=${from}&to=${to}`, {
            headers: authHeaders(false),
          }),
          fetch(`${API_BASE}/api/habits`, { headers: authHeaders(false) }),
          fetch(`${API_BASE}/api/habits/entries?from=${from}&to=${to}`, {
            headers: authHeaders(false),
          }),
        ]);
        const [sessions, habitsData, entries] = await Promise.all([
          sRes.ok ? sRes.json() : [],
          hRes.ok ? hRes.json() : [],
          eRes.ok ? eRes.json() : [],
        ]);
        if (cancelled) return;
        const wSet = new Set(sessions.map((s) => s.date));
        setWorkoutSet(wSet);

        const byDate = {};
        for (const ent of entries) {
          const d = ent.date;
          if (!byDate[d]) byDate[d] = {};
          byDate[d][ent.habit_id] =
            (byDate[d][ent.habit_id] || 0) + (ent.value || 0);
        }
        setEntriesByDate(byDate);
        setHabits(habitsData);

        const hDone = new Set();
        if (habitsData.length > 0) {
          Object.entries(byDate).forEach(([date, map]) => {
            const allDone = habitsData.every((h) => (map[h.id] || 0) >= 1);
            if (allDone) hDone.add(date);
          });
        }
        setHabitsDoneSet(hDone);
      } catch {
        setWorkoutSet(new Set());
        setHabitsDoneSet(new Set());
        setEntriesByDate({});
        setHabits([]);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [monthRange]);

  // status helpers
  const dateKey = (y, m, d) =>
    `${y}-${String(m + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;

  const dayStatus = (y, m, d) => {
    const key = dateKey(y, m, d);
    const workout = workoutSet.has(key);
    const habitsAll = habitsDoneSet.has(key);
    return { workout, habitsAll, key };
  };

  const today = new Date();

  const dayClasses = ({ workout, habitsAll, isCurrentDay }) => {
    if (workout && habitsAll)
      return "bg-gradient-to-br from-emerald-500/35 to-amber-500/35 border border-emerald-400/40 shadow-xl ring-2 ring-cyan-400/40";
    if (workout)
      return "bg-gradient-to-br from-amber-500/30 to-amber-600/30 border border-amber-400/30 shadow-lg";
    if (habitsAll)
      return "bg-gradient-to-br from-emerald-500/25 to-emerald-600/25 border border-emerald-400/30 shadow-lg";
    if (isCurrentDay) return "bg-cyan-500/25 border border-cyan-400/40";
    return "bg-white/5 border border-white/10";
  };

  // szybki toggle treningu po dacie (Shift+klik)
  const toggleWorkoutByDate = async (dateISO) => {
    const has = workoutSet.has(dateISO);
    // optimistic
    setWorkoutSet((prev) => {
      const s = new Set(prev);
      has ? s.delete(dateISO) : s.add(dateISO);
      return s;
    });
    try {
      const url = `${API_BASE}/api/workouts/sessions` + (has ? `?date=${dateISO}` : "");
      const res = await fetch(url, {
        method: has ? "DELETE" : "POST",
        headers: authHeaders(true),
        body: has ? null : JSON.stringify({ date: dateISO }),
      });
      if (!res.ok) throw new Error("session toggle failed");
    } catch (e) {
      // rollback
      setWorkoutSet((prev) => {
        const s = new Set(prev);
        has ? s.add(dateISO) : s.delete(dateISO);
        return s;
      });
    }
  };

  // header (nowy, minimalistyczny)
  const HeaderBar = () => {
    const isCal = view === "calendar";
    return (
      <div className="px-4 pt-4">
        <div
          className={`rounded-2xl border border-white/10 bg-white/[0.04] backdrop-blur-md ${
            isCal ? "px-3 py-3" : "px-2 py-2"
          } shadow-lg relative overflow-hidden`}
        >
          {isCal ? (
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleMonthChange(-1)}
                  className="w-9 h-9 rounded-xl glass flex items-center justify-center hover:bg-white/10 transition-all border border-transparent hover:border-cyan-400/30"
                >
                  <ChevronLeft className="w-5 h-5 text-cyan-400" />
                </button>
                <div className="text-xl font-bold tracking-tight">
                  <span className="bg-clip-text text-transparent bg-gradient-to-r from-cyan-300 to-cyan-500">
                    {monthNames[currentDate.getMonth()]}{" "}
                    {currentDate.getFullYear()}
                  </span>
                </div>
                <button
                  onClick={() => handleMonthChange(1)}
                  className="w-9 h-9 rounded-xl glass flex items-center justify-center hover:bg-white/10 transition-all border border-transparent hover:border-cyan-400/30"
                >
                  <ChevronRight className="w-5 h-5 text-cyan-400" />
                </button>
              </div>

              {/* CTA: Trenuj dziś + particles */}
              <div className="relative">
                <button
                  onClick={async () => {
                    // optimistic toggle „dzisiaj”
                    const key = toISO(new Date());
                    const has = workoutSet.has(key);
                    const next = new Set(workoutSet);
                    has ? next.delete(key) : next.add(key);
                    setWorkoutSet(next);
                    setBurstKey((k) => k + 1);

                    // backend
                    try {
                      const url =
                        `${API_BASE}/api/workouts/sessions` +
                        (has ? `?date=${key}` : "");
                      const res = await fetch(url, {
                        method: has ? "DELETE" : "POST",
                        headers: authHeaders(true),
                        body: has ? null : JSON.stringify({ date: key }),
                      });
                      if (!res.ok) throw new Error("session toggle failed");
                    } catch (e) {
                      // rollback
                      const rollback = new Set(workoutSet);
                      has ? rollback.add(key) : rollback.delete(key);
                      setWorkoutSet(rollback);
                    }
                  }}
                  className="inline-flex items-center gap-2 rounded-xl px-4 py-2 bg-gradient-to-r from-cyan-600 to-cyan-700 hover:from-cyan-500 hover:to-cyan-600 font-semibold shadow-lg"
                >
                  <Dumbbell className="w-5 h-5" />
                  Trenuj dziś
                </button>
                <ParticleBurst trigger={burstKey} />
              </div>
            </div>
          ) : null}
        </div>
      </div>
    );
  };

  // menu positions
  const getMenuStyle = (index, open) => {
    const baseSpacing = 90;
    const centerIndex = 1.5;
    const mainW = 80;
    const gap = 16;
    const shift = mainW / 2 + gap;
    let x = (index - centerIndex) * baseSpacing;
    x += index < centerIndex ? -shift : +shift;
    const y = -15;
    const closed = "translate(-50%, -50%)";
    const opened = `translate(calc(-50% + ${x}px), calc(-50% + ${y}px))`;
    return {
      transform: open ? opened : closed,
      opacity: open ? 1 : 0,
      transition: `transform 300ms cubic-bezier(.2,.8,.2,1) ${menuItems[index].delay}, opacity 220ms ease ${menuItems[index].delay}`,
      pointerEvents: open ? "auto" : "none",
    };
  };

  // kliknięcie dnia: modal lub szybki toggle na Shift
  const onDayClick = (d, evt) => {
    if (!d) return;
    const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), d);
    const key = toISO(date);
    if (evt?.shiftKey) {
      toggleWorkoutByDate(key);
      return;
    }
    setDayModal({ open: true, date });
  };

  const selectedKey =
    dayModal.open && dayModal.date ? toISO(dayModal.date) : null;
  const selectedWorkout = selectedKey ? workoutSet.has(selectedKey) : false;
  const selectedHabitsMap = selectedKey ? entriesByDate[selectedKey] || {} : {};

  return (
    <div className="min-h-screen w-full bg-mesh flex flex-col relative overflow-hidden">
      {/* tła */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl animate-pulse-slow" />
        <div
          className="absolute bottom-0 right-1/4 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl animate-pulse-slow"
          style={{ animationDelay: "2s" }}
        />
      </div>

      <div className="relative z-10 flex flex-col h-screen">
        {/* Header + globalny back */}
        <HeaderBar />

        {/* Globalny przycisk Wróć (bez tła), tylko poza kalendarzem */}
        {view !== "calendar" && (
          <button
            onClick={() => setView("calendar")}
            aria-label="Wróć"
            className="fixed top-4 left-4 z-[9999] p-2 bg-transparent rounded-md
                       hover:opacity-80 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 transition"
          >
            <ArrowLeft className="w-6 h-6 text-cyan-400" />
          </button>
        )}

        {/* CONTENT */}
        <div className="flex-1 flex flex-col p-4 sm:p-6 overflow-hidden">
          {view === "calendar" ? (
            <div className="flex-1 flex flex-col">
              {/* nagłówki dni */}
              <div className="grid grid-cols-7 gap-2 mb-2 sm:mb-4">
                {weekDays.map((d) => (
                  <div
                    key={d}
                    className="text-center text-sm font-semibold text-cyan-400 py-2 uppercase tracking-widest border-b border-cyan-400/30"
                  >
                    {d}
                  </div>
                ))}
              </div>

              {/* siatka dni */}
              <div className="grid grid-cols-7 gap-2 flex-1">
                {calendarDays.map((day, index) => {
                  const isCurrentDay =
                    day &&
                    day === today.getDate() &&
                    currentDate.getMonth() === today.getMonth() &&
                    currentDate.getFullYear() === today.getFullYear();

                  const y = currentDate.getFullYear();
                  const m = currentDate.getMonth();
                  const status = day
                    ? dayStatus(y, m, day)
                    : { workout: false, habitsAll: false };

                  return (
                    <button
                      key={index}
                      onClick={(e) => onDayClick(day, e)}
                      disabled={!day}
                      className={`relative rounded-2xl sm:rounded-3xl flex items-center justify-center p-1 sm:p-2 transition-all duration-300 transform-gpu ${
                        day
                          ? "hover:scale-[1.02] active:scale-[0.98]"
                          : "pointer-events-none opacity-40"
                      }`}
                      title="Klik: szczegóły • Shift+klik: szybkie oznaczenie treningu"
                    >
                      {day && (
                        <div
                          className={`w-full h-full flex flex-col items-center justify-center p-1 rounded-2xl ${dayClasses(
                            { ...status, isCurrentDay }
                          )}`}
                        >
                          <span
                            className={`font-bold text-lg sm:text-xl ${
                              status.workout || status.habitsAll || isCurrentDay
                                ? "text-white"
                                : "text-gray-200"
                            }`}
                          >
                            {day}
                          </span>
                          <div className="flex gap-1 mt-1">
                            {status.workout && (
                              <Dumbbell
                                className="w-3.5 h-3.5 text-amber-300"
                                strokeWidth={2}
                              />
                            )}
                            {status.habitsAll && (
                              <CheckCircle2
                                className="w-3.5 h-3.5 text-emerald-300"
                                strokeWidth={2}
                              />
                            )}
                          </div>
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>

              <p className="mt-2 text-[11px] text-white/60">
                Tip: <kbd className="px-1 rounded bg-white/10">Shift</kbd> + klik dnia = szybkie oznaczenie treningu
              </p>
            </div>
          ) : (
            <div className="flex-1 overflow-auto">
              {view === "plan" && <Plan />}
              {view === "exercises" && <Exercises />}
              {view === "habits" && <Habit />}
              {view === "account" && <Account />}
            </div>
          )}
        </div>

        {/* DOCK / MENU — tylko na kalendarzu */}
        {view === "calendar" && (
          <div className="relative pb-8 flex justify-center items-end z-20">
            <div
              ref={hoverZoneRef}
              onMouseEnter={openWithIntent}
              onMouseLeave={closeWithIntent}
              className="relative w-[420px] max-w-full h-28 flex items-center justify-center"
            >
              {menuItems.map((item, index) => {
                const Icon = item.icon;
                const style = getMenuStyle(index, showMenu);
                return (
                  <button
                    key={item.label}
                    style={style}
                    className="absolute left-1/2 top-1/2 w-14 h-14 rounded-2xl glass-strong flex items-center justify-center hover:scale-110 active:scale-95 transition-all duration-300 ease-out z-40"
                    onClick={() => {
                      item.onClick();
                      setShowMenu(false);
                    }}
                    aria-label={item.label}
                    title={item.label}
                  >
                    <Icon
                      className={`w-6 h-6 text-${item.color}-400`}
                      strokeWidth={2}
                    />
                  </button>
                );
              })}
              <button
                onClick={() => setShowMenu((v) => !v)}
                className={`relative z-30 w-20 h-20 rounded-full bg-gradient-to-br from-cyan-500 to-cyan-600 flex items-center justify-center transition-all duration-300 shadow-2xl ${
                  showMenu
                    ? "rotate-45 scale-105"
                    : "hover:scale-110 animate-pulse-slow"
                }`}
                aria-expanded={showMenu}
                aria-label="Toggle main menu"
              >
                <Dumbbell className="w-10 h-10 text-white" strokeWidth={2.5} />
              </button>
              <div className="absolute inset-x-0 -top-4 -bottom-2" />
            </div>
          </div>
        )}
      </div>

      {/* Modal dnia — nowy wygląd z toggle'ami i zapisem */}
      {dayModal.open && selectedKey && (
        <DayDetailsModal
          dateStr={selectedKey}
          onClose={() => setDayModal({ open: false, date: null })}
          workoutDone={selectedWorkout}
          setWorkoutSet={setWorkoutSet}
          habits={habits}
          entriesMap={selectedHabitsMap}
          setEntriesByDate={setEntriesByDate}
        />
      )}
    </div>
  );
}

/* =================== day details modal =================== */
function DayDetailsModal({
  dateStr,
  onClose,
  workoutDone,
  setWorkoutSet,
  habits,
  entriesMap,
  setEntriesByDate,
}) {
  const pretty = new Date(dateStr + "T00:00:00");
  const [localWorkout, setLocalWorkout] = useState(workoutDone);
  const [saving, setSaving] = useState(false);
  const [localMap, setLocalMap] = useState(() => ({ ...entriesMap })); // {habitId: value}

  const allDone =
    habits.length > 0 ? habits.every((h) => (localMap[h.id] || 0) >= 1) : false;

  const toggleWorkout = async () => {
    const next = !localWorkout;
    setLocalWorkout(next);
    // optimistic calendar set
    setWorkoutSet((prev) => {
      const s = new Set(prev);
      next ? s.add(dateStr) : s.delete(dateStr);
      return s;
    });
    // backend
    try {
      const url =
        `${API_BASE}/api/workouts/sessions` + (next ? "" : `?date=${dateStr}`);
      const res = await fetch(url, {
        method: next ? "POST" : "DELETE",
        headers: authHeaders(true),
        body: next ? JSON.stringify({ date: dateStr }) : null,
      });
      if (!res.ok) throw new Error("toggle workout failed");
    } catch {
      // rollback
      setLocalWorkout(!next);
      setWorkoutSet((prev) => {
        const s = new Set(prev);
        next ? s.delete(dateStr) : s.add(dateStr);
        return s;
      });
    }
  };

  const toggleHabit = async (habitId) => {
    const current = localMap[habitId] || 0;
    const nextVal = current >= 1 ? 0 : 1;
    setLocalMap((m) => ({ ...m, [habitId]: nextVal }));
    // optimistic entriesByDate
    setEntriesByDate((prev) => {
      const copy = { ...prev };
      copy[dateStr] = { ...(copy[dateStr] || {}), [habitId]: nextVal };
      return copy;
    });
    // backend
    try {
      const res = await fetch(`${API_BASE}/api/habits/${habitId}/entries`, {
        method: "POST",
        headers: authHeaders(true),
        body: JSON.stringify({ date: dateStr, value: nextVal }),
      });
      if (!res.ok) throw new Error("toggle habit failed");
    } catch {
      // rollback
      setLocalMap((m) => ({ ...m, [habitId]: current }));
      setEntriesByDate((prev) => {
        const copy = { ...prev };
        copy[dateStr] = { ...(copy[dateStr] || {}), [habitId]: current };
        return copy;
      });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 p-3">
      <div className="w-full sm:max-w-xl rounded-2xl border border-white/10 bg-[#0c1122]/95 backdrop-blur-xl shadow-2xl overflow-hidden">
        {/* top bar */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
          <div className="flex flex-col">
            <span className="text-sm text-gray-400">Details for</span>
            <span className="font-bold text-lg">
              {pretty.toLocaleDateString(undefined, {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-white/10"
          >
            <X className="w-5 h-5 text-gray-300" />
          </button>
        </div>

        {/* content */}
        <div className="p-4 space-y-6">
          {/* summary chips */}
          <div className="flex flex-wrap gap-2">
            <Chip
              ok={localWorkout}
              icon={<Dumbbell className="w-4 h-4" />}
              text="Workout"
            />
            <Chip
              ok={allDone}
              icon={<CheckCircle2 className="w-4 h-4" />}
              text="All habits"
            />
          </div>

          {/* workout toggle */}
          <section className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-semibold">Training</div>
                <div className="text-sm text-gray-400">
                  {localWorkout ? "Marked as trained." : "Not trained yet."}
                </div>
              </div>
              <button
                onClick={toggleWorkout}
                className={`px-4 py-2 rounded-xl font-semibold border ${
                  localWorkout
                    ? "bg-emerald-500/20 text-emerald-200 border-emerald-400/30"
                    : "bg-white/10 text-gray-200 border-white/15 hover:bg-white/15"
                }`}
              >
                {localWorkout ? "Unmark" : "Mark done"}
              </button>
            </div>
          </section>

          {/* habits toggles */}
          <section className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
            <div className="font-semibold mb-3">Habits</div>
            {habits.length === 0 ? (
              <p className="text-gray-400">No habits defined.</p>
            ) : (
              <ul className="space-y-2">
                {habits.map((h) => {
                  const done = (localMap[h.id] || 0) >= 1;
                  return (
                    <li
                      key={h.id}
                      className="flex items-center justify-between rounded-lg border border-white/10 bg-white/[0.02] px-3 py-2"
                    >
                      <span className="font-medium">{h.name}</span>
                      <button
                        onClick={() => toggleHabit(h.id)}
                        className={`px-3 py-1.5 rounded-lg text-sm font-semibold border ${
                          done
                            ? "bg-emerald-500/20 text-emerald-200 border-emerald-400/30"
                            : "bg-white/10 text-gray-200 border-white/15 hover:bg-white/15"
                        }`}
                      >
                        {done ? "done" : "not yet"}
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </section>
        </div>

        {/* bottom actions */}
        <div className="px-4 py-3 border-t border-white/10 flex justify-end">
          <button
            onClick={onClose}
            disabled={saving}
            className="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 font-semibold disabled:opacity-60"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

function Chip({ ok, icon, text }) {
  return (
    <span
      className={`inline-flex items-center gap-2 text-[12px] px-2.5 py-1 rounded-full border ${
        ok
          ? "bg-emerald-500/20 text-emerald-200 border-emerald-400/30"
          : "bg-white/10 text-gray-300 border-white/15"
      }`}
    >
      {icon}
      {text}
    </span>
  );
}
