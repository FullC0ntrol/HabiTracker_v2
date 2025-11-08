/* eslint-disable no-unused-vars */
import { useState, useRef, useLayoutEffect, useEffect } from "react";
import { Calendar } from "../features/calendar/components/Calendar";
import { CalendarHeader } from "../features/calendar/components/CalendarHeader";
import { MenuDock } from "../features/calendar/components/MenuDock";
import { DayDetailsModal } from "../features/calendar/components/DayDetailsModal";
import { FloatingBackButton } from "../shared/ui/FloatingBackButton";
import { useCalendarData } from "../features/calendar/hooks/useCalendarData";
import { useHabits } from "../features/habits/hooks/useHabits";
import { useQuickDayActions } from "../features/calendar/hooks/useQuickDayActions";
import ExercisesPage from "../features/exercises/components/ExercisesPage";
import HabitsPage from "../features/habits/components/HabitsPage";
import PlanPage from "../features/plans/components/PlanPage";
import WorkoutScreen from "../features/workout/components/WorkoutScreen";
import { HabitSidebar } from "../features/habits/components/HabitSidebar";
import { plansService } from "../features/plans/services/plans.service";
import { toISO } from "../shared/utils/dateUtils";
import { LogOut, Target, Dumbbell, CalendarCheck } from "lucide-react";
import logout from "../features/auth/components/LogoutButton";

export default function Dashboard() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState({ name: "calendar", plan: null });
  const [dayModal, setDayModal] = useState({ open: false, date: null });
  const [showMenu, setShowMenu] = useState(false);

  const {
    workoutSet: baseWorkoutSet,
    habitsDoneSet,
    entriesByDate,
  } = useCalendarData(currentDate);
  const [workoutSet, setWorkoutSet] = useState(new Set(baseWorkoutSet));
  const [localEntriesByDate, setLocalEntriesByDate] = useState(entriesByDate);

  useEffect(() => {
    setWorkoutSet(new Set(baseWorkoutSet));
    setLocalEntriesByDate(entriesByDate);
  }, [baseWorkoutSet, entriesByDate]);

  const { habits, todayCounts, todayISO, incrementHabit } = useHabits();
  const [openHabits, setOpenHabits] = useState(false);

  const headerRef = useRef(null);
  const dockRef = useRef(null);
  const [headerH, setHeaderH] = useState(0);
  const [dockH, setDockH] = useState(0);
  const [isMeasured, setIsMeasured] = useState(false);

  const [activePlan, setActivePlan] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const plan = await plansService.getActive();
        setActivePlan(plan);
      } catch {
        console.warn("Brak aktywnego planu w bazie");
      }
    })();
  }, []);

  useLayoutEffect(() => {
    if (!isMeasured && headerRef.current && dockRef.current) {
      setHeaderH(headerRef.current.offsetHeight);
      setDockH(dockRef.current.offsetHeight);
      setIsMeasured(true);
    }

    const ro = new ResizeObserver(([entry]) => {
      if (entry.target === headerRef.current)
        setHeaderH(entry.contentRect.height);
      if (entry.target === dockRef.current) setDockH(entry.contentRect.height);
    });

    if (headerRef.current) ro.observe(headerRef.current);
    if (dockRef.current) ro.observe(dockRef.current);
    return () => ro.disconnect();
  }, [isMeasured]);

  const OTHER_V_SPACING = 40;
  const calendarContainerStyle =
    view.name === "calendar"
      ? { height: `calc(100svh - ${headerH + dockH + OTHER_V_SPACING}px)` }
      : {};
  const hasMeasured = (headerH > 0 && dockH > 0) || isMeasured;

  const { onDayClick, menuElement } = useQuickDayActions({
    onQuickToggle: (type, dateISO) => {
      if (type === "workout") {
        setWorkoutSet((prev) => {
          const next = new Set(prev);
          next.has(dateISO) ? next.delete(dateISO) : next.add(dateISO);
          return next;
        });
      } else if (type === "habit") {
        setLocalEntriesByDate((prev) => {
          const copy = { ...prev };
          const entry = copy[dateISO] || {};
          copy[dateISO] = { ...entry, habitDone: !entry.habitDone };
          return copy;
        });
      }
    },
    onDayClick: (dateISO) =>
      setDayModal({ open: true, date: new Date(dateISO) }),
  });

  const handleLogout = () => {
    localStorage.removeItem("token");
    sessionStorage.clear();
    window.location.href = "/login";
  };

  return (
    <div className="min-h-screen w-full bg-mesh flex flex-col">
      {view.name !== "calendar" && (
        <FloatingBackButton onBack={() => setView({ name: "calendar" })} />
      )}

      <main
        className={
          view.name === "calendar"
            ? "flex-1 overflow-hidden"
            : "flex-1 overflow-y-auto pb-40 sm:pb-48"
        }
      >
        {view.name === "calendar" && (
          <div className="mx-auto w-full max-w-6xl px-4 sm:px-6 pt-6">
            <CalendarHeader
              ref={headerRef}
              currentDate={currentDate}
              setCurrentDate={setCurrentDate}
              onOpenHabits={() => setOpenHabits(true)}
            />
            {hasMeasured ? (
              <div style={calendarContainerStyle}>
                <Calendar
                  className="h-full"
                  currentDate={currentDate}
                  workoutSet={workoutSet}
                  habitsDoneSet={habitsDoneSet}
                  onDayClick={onDayClick}
                />
              </div>
            ) : (
              <div
                className="flex justify-center items-center text-gray-500"
                style={{
                  height: `calc(100svh - ${headerH + OTHER_V_SPACING}px)`,
                }}
              >
                Ładowanie układu...
              </div>
            )}
          </div>
        )}

        <section className="mt-6 mx-auto w-full max-w-6xl px-4 sm:px-6">
          {view.name === "exercises" && <ExercisesPage />}
          {view.name === "habits" && <HabitsPage />}
          {view.name === "plan" && <PlanPage />}
          {view.name === "workout" && (
            <WorkoutScreen
              plan={view.plan}
              onExit={() => setView({ name: "calendar" })}
            />
          )}
        </section>
      </main>

      {view.name === "calendar" && (
        <div ref={dockRef}>
          <MenuDock
            showMenu={showMenu}
            setShowMenu={setShowMenu}
            onMainAction={() => setView({ name: "workout", plan: activePlan })}
            menuItems={[
              {
                label: "Logout",
                color: "rose",
                icon: LogOut,
                onClick: () => handleLogout(),
              },
              {
                label: "Habits",
                color: "emerald",
                icon: Target,
                onClick: () => setView({ name: "habits" }),
              },
              {
                label: "Exercises",
                color: "amber",
                icon: Dumbbell,
                onClick: () => setView({ name: "exercises" }),
              },
              {
                label: "Plan",
                color: "cyan",
                icon: CalendarCheck,
                onClick: () => setView({ name: "plan" }),
              },
            ]}
          />
        </div>
      )}

      {dayModal.open && (
        <DayDetailsModal
          dateStr={toISO(dayModal.date)}
          onClose={() => setDayModal({ open: false, date: null })}
          workoutDone={workoutSet.has(toISO(dayModal.date))}
          setWorkoutSet={setWorkoutSet}
          habits={habits}
          entriesMap={localEntriesByDate[toISO(dayModal.date)] || {}}
        />
      )}

      <HabitSidebar
        open={openHabits}
        onClose={() => setOpenHabits(false)}
        todayISO={todayISO}
        habits={habits}
        todayCounts={todayCounts}
        onIncrement={incrementHabit}
      />

      {menuElement}
    </div>
  );
}
