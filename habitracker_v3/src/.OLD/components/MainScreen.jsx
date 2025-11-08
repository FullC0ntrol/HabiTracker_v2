// MainScreen.jsx — kalendarz mieści się w ekranie bez scrolla, dynamiczny pomiar nagłówka i Docka
import {
  useState,
  useMemo,
  useCallback,
  useEffect,
  useRef,
  useLayoutEffect,
} from "react";
import Plan from "./menu/Plan";
import Exercises from "./menu/Exercises";
import Habit from "./menu/Habit";
import Account from "./menu/Account";
import { API_BASE } from "../lib/api";
import { authHeaders } from "../lib/authHeaders";
import { Calendar } from "./calendar/Calendar";
import { MenuDock } from "./calendar/MenuDock";
import { DayDetailsModal } from "./calendar/DayDetailsModal";
import { toISO, monthNames } from "../utils/dateUtils";
import {
  Settings,
  Target,
  Dumbbell,
  CalendarCheck,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { FloatingBackButton } from "./shared/FloatingBackButton";
import WorkoutScreen from "./workout/WorkoutScreen";
import { HabitSidebar } from "./calendar/HabitSidebar";

export default function MainScreen() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState("calendar");
  const [showMenu, setShowMenu] = useState(false);

  const [workoutSet, setWorkoutSet] = useState(() => new Set());
  const [habitsDoneSet, setHabitsDoneSet] = useState(() => new Set());
  const [habits, setHabits] = useState([]);
  const [entriesByDate, setEntriesByDate] = useState({});
  const [dayModal, setDayModal] = useState({ open: false, date: null });

  // Sidebar nawyków (drawer)
  const [showHabits, setShowHabits] = useState(false);

  // --- siatka miesiąca ---
  const { daysInMonth, startingDayOfWeek } = useMemo(() => {
    const y = currentDate.getFullYear();
    const m = currentDate.getMonth();
    const first = new Date(y, m, 1);
    const last = new Date(y, m + 1, 0);
    // JS: 0 = niedziela -> przesuwamy, by poniedziałek był pierwszy
    const start = (first.getDay() + 6) % 7; // 0=Mon ... 6=Sun
    return { daysInMonth: last.getDate(), startingDayOfWeek: start };
  }, [currentDate]);

  const calendarDays = useMemo(() => {
    const days = [];
    for (let i = 0; i < startingDayOfWeek; i++) days.push(null);
    for (let d = 1; d <= daysInMonth; d++) days.push(d);
    // dopełnij do 42 komórek
    while (days.length < 42) days.push(null);
    return days;
  }, [daysInMonth, startingDayOfWeek]);

  const today = new Date();
  const todayISO = toISO(today);

  const handleMonthChange = useCallback((offset) => {
    setCurrentDate(
      (prev) => new Date(prev.getFullYear(), prev.getMonth() + offset, 1)
    );
  }, []);

  const headerRef = useRef(null);
  const dockRef = useRef(null);
  const [headerH, setHeaderH] = useState(0);
  const [dockH, setDockH] = useState(0);

  // dynamiczny pomiar wysokości nagłówka i Docka
  useLayoutEffect(() => {
    const ro = new ResizeObserver((entries) => {
      for (const entry of entries) {
        if (entry.target === headerRef.current)
          setHeaderH(entry.contentRect.height);
        if (entry.target === dockRef.current)
          setDockH(entry.contentRect.height);
      }
    });
    if (headerRef.current) ro.observe(headerRef.current);
    if (dockRef.current) ro.observe(dockRef.current);
    // initial values
    if (headerRef.current)
      setHeaderH(headerRef.current.getBoundingClientRect().height);
    if (dockRef.current)
      setDockH(dockRef.current.getBoundingClientRect().height);
    return () => ro.disconnect();
  }, []);

  // pionowe „inne” odstępy kontenera
  const OTHER_V_SPACING = 24 + 8; // 40px

  // Header miesiąca z przyciskiem otwierającym panel nawyków
  const MonthHeader = ({ currentDate }) => (
    <div ref={headerRef} className="flex items-center justify-between pb-4">
      <button
        onClick={() => handleMonthChange(-1)}
        className="w-11 h-11 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 hover:border-cyan-400/30 transition-colors grid place-items-center shadow focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400/60"
        title="Poprzedni miesiąc"
      >
        <ChevronLeft className="w-6 h-6 text-cyan-300" />
      </button>

      <span className="text-2xl sm:text-4xl font-extrabold tracking-tight bg-clip-text text-transparent bg-linear-to-r from-cyan-300 to-cyan-500 drop-shadow text-center">
        {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
      </span>

      <div className="flex items-center gap-2">
        <button
          onClick={() => setShowHabits(true)}
          className="w-11 h-11 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 hover:border-emerald-400/30 transition-colors grid place-items-center shadow focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400/60"
          title="Nawyki na dziś"
        >
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
        </button>
        <button
          onClick={() => handleMonthChange(1)}
          className="w-11 h-11 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 hover:border-cyan-400/30 transition-colors grid place-items-center shadow focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400/60"
          title="Następny miesiąc"
        >
          <ChevronRight className="w-6 h-6 text-cyan-300" />
        </button>
      </div>
    </div>
  );

  // zakres miesiąca do fetcha
  const monthRange = useMemo(() => {
    const y = currentDate.getFullYear();
    const m = currentDate.getMonth();
    return { first: new Date(y, m, 1), last: new Date(y, m + 1, 0) };
  }, [currentDate]);

  // fetch danych miesiąca
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const from = toISO(monthRange.first);
        const to = toISO(monthRange.last);

        const [dRes, hRes, eRes] = await Promise.all([
          fetch(`${API_BASE}/api/workouts/days?from=${from}&to=${to}`, {
            headers: authHeaders(false),
          }),
          fetch(`${API_BASE}/api/habits`, { headers: authHeaders(false) }),
          fetch(`${API_BASE}/api/habits/entries?from=${from}&to=${to}`, {
            headers: authHeaders(false),
          }),
        ]);

        const daysPayload = dRes.ok ? await dRes.json() : [];
        const habitsData = hRes.ok ? await hRes.json() : [];
        const entries = eRes.ok ? await eRes.json() : [];

        if (cancelled) return;

        const workoutDates = Array.isArray(daysPayload)
          ? daysPayload
              .map((d) => (typeof d === "string" ? d : d?.date))
              .filter(Boolean)
          : [];

        setWorkoutSet(new Set(workoutDates));
        setHabits(habitsData);

        const byDate = {};
        for (const ent of entries) {
          const d = ent.date;
          (byDate[d] ??= {})[ent.habit_id] =
            (byDate[d]?.[ent.habit_id] || 0) + (ent.value || 0);
        }
        setEntriesByDate(byDate);

        const hDone = new Set();
        if (habitsData.length) {
          Object.entries(byDate).forEach(([date, map]) => {
            if (habitsData.every((h) => (map[h.id] || 0) >= 1)) hDone.add(date);
          });
        }
        setHabitsDoneSet(hDone);
      } catch {
        if (cancelled) return;
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

  // toggle treningu
  const toggleWorkoutByDate = async (dateISO) => {
    const has = workoutSet.has(dateISO);
    setWorkoutSet((prev) => {
      const s = new Set(prev);
      has ? s.delete(dateISO) : s.add(dateISO);
      return s;
    });
    try {
      const url =
        `${API_BASE}/api/workouts/sessions` + (has ? `?date=${dateISO}` : "");
      const res = await fetch(url, {
        method: has ? "DELETE" : "POST",
        headers: authHeaders(true),
        body: has ? null : JSON.stringify({ date: dateISO }),
      });
      if (!res.ok) throw new Error("session toggle failed");
    } catch {
      setWorkoutSet((prev) => {
        const s = new Set(prev);
        has ? s.add(dateISO) : s.delete(dateISO);
        return s;
      });
    }
  };

  // klik dnia
  const onDayClick = (dateOrNumber, evt) => {
    const date =
      dateOrNumber instanceof Date
        ? dateOrNumber
        : new Date(
            currentDate.getFullYear(),
            currentDate.getMonth(),
            Number(dateOrNumber)
          );

    const key = toISO(date);
    if (evt?.shiftKey) return toggleWorkoutByDate(key);
    setDayModal({ open: true, date });
  };

  const selectedKey =
    dayModal.open && dayModal.date ? toISO(dayModal.date) : null;

  // wysokość kontenera kalendarza: 100vh - header - dock - inne odstępy
  const calendarContainerStyle =
    view === "calendar"
      ? {
          height: `calc(100svh - ${headerH + dockH + OTHER_V_SPACING}px)`,
        }
      : {};

  // +1 / -1 dla nawyku „na dziś” (optymistycznie)
  const incrementHabitToday = async (habitId, delta = 1) => {
    const prevMap = entriesByDate[todayISO] || {};
    const current = prevMap[habitId] || 0;
    const next = Math.max(0, current + delta);

    // optimistic
    setEntriesByDate((m) => ({
      ...m,
      [todayISO]: { ...(m[todayISO] || {}), [habitId]: next },
    }));

    try {
      const res = await fetch(`${API_BASE}/api/habits/${habitId}/entries`, {
        method: "POST",
        headers: authHeaders(true),
        body: JSON.stringify({ date: todayISO, value: next }),
      });
      if (!res.ok) throw new Error("habit entry failed");
    // eslint-disable-next-line no-unused-vars
    } catch (e) {
      // rollback
      setEntriesByDate((m) => ({
        ...m,
        [todayISO]: { ...(m[todayISO] || {}), [habitId]: current },
      }));
    }
  };

  return (
    <div className="min-h-screen w-full bg-mesh flex flex-col">
      {view !== "calendar" && (
        <FloatingBackButton onBack={() => setView("calendar")} />
      )}

      {/* W widoku kalendarza blokujemy scroll strony, w innych widokach pozwalamy scrollować */}
      <main
        className={
          view === "calendar"
            ? "flex-1 overflow-hidden"
            : "flex-1 overflow-y-auto pb-40 sm:pb-48"
        }
      >
        {view === "calendar" ? (
          <div className="mx-auto w-full max-w-6xl px-4 sm:px-6 pt-6">
            <MonthHeader currentDate={currentDate} />
            <div className="pt-2" style={calendarContainerStyle}>
              <Calendar
                className="h-full"
                calendarDays={calendarDays}
                currentDate={currentDate}
                today={today}
                workoutSet={workoutSet}
                habitsDoneSet={habitsDoneSet}
                onDayClick={onDayClick}
              />
            </div>
          </div>
        ) : (
          <div className="mx-auto w-full max-w-6xl px-4 sm:px-6 py-4">
            {view === "plan" && <Plan />}
            {view === "exercises" && <Exercises />}
            {view === "habits" && <Habit />}
            {view === "account" && <Account />}
          </div>
        )}
        {view === "workout" && (
          <WorkoutScreen onExit={() => setView("calendar")} />
        )}
      </main>

      {view === "calendar" && (
        <div
          ref={dockRef}
          className="fixed inset-x-0 bottom-0 z-40 border-t border-white/10 bg-black/40 backdrop-blur supports-backdrop-filter:bg-black/30"
        >
          <div className="px-4 py-3">
            <MenuDock
              showMenu={showMenu}
              setShowMenu={setShowMenu}
              onMainAction={() => setView("workout")}
              menuItems={[
                {
                  label: "Account",
                  color: "rose",
                  icon: Settings,
                  onClick: () => setView("account"),
                },
                {
                  label: "Habits",
                  color: "emerald",
                  icon: Target,
                  onClick: () => setView("habits"),
                },
                {
                  label: "Exercises",
                  color: "amber",
                  icon: Dumbbell,
                  onClick: () => setView("exercises"),
                },
                {
                  label: "Plan",
                  color: "cyan",
                  icon: CalendarCheck,
                  onClick: () => setView("plan"),
                },
              ]}
            />
          </div>
        </div>
      )}

      {/* Modal szczegółów dnia */}
      {dayModal.open && selectedKey && (
        <DayDetailsModal
          dateStr={selectedKey}
          onClose={() => setDayModal({ open: false, date: null })}
          workoutDone={workoutSet.has(selectedKey)}
          setWorkoutSet={setWorkoutSet}
          habits={habits}
          entriesMap={entriesByDate[selectedKey] || {}}
          setEntriesByDate={setEntriesByDate}
        />
      )}

      {/* Sidebar nawyków (drawer) */}
      <HabitSidebar
        open={showHabits}
        onClose={() => setShowHabits(false)}
        todayISO={todayISO}
        habits={habits}
        todayCounts={entriesByDate[todayISO] || {}}
        onIncrement={(habitId, delta) => incrementHabitToday(habitId, delta)}
      />
    </div>
  );
}
