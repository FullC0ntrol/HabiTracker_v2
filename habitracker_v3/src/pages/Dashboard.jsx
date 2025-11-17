/* eslint-disable no-unused-vars */
import { useState, useEffect } from "react";

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

export default function Dashboard() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState({ name: "calendar", plan: null });
  const [dayModal, setDayModal] = useState({ open: false, date: null });
  const [showMenu, setShowMenu] = useState(false);
  const [activePlan, setActivePlan] = useState(null);
  const [isCompactView, setIsCompactView] = useState(false);

  const {
    workoutSet: baseWorkoutSet,
    habitsDoneSet,
    entriesByDate,
  } = useCalendarData(currentDate);

  const [workoutSet, setWorkoutSet] = useState(new Set(baseWorkoutSet));
  const [localEntriesByDate, setLocalEntriesByDate] =
    useState(entriesByDate);

  useEffect(() => {
    setWorkoutSet(new Set(baseWorkoutSet));
    setLocalEntriesByDate(entriesByDate);
  }, [baseWorkoutSet, entriesByDate]);

  const { habits, todayCounts, todayISO, incrementHabit } = useHabits();
  const [openHabits, setOpenHabits] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const plan = await plansService.getActive();
        setActivePlan(plan);
      } catch {
        // brak aktywnego planu to normalna sytuacja
      }
    })();
  }, []);

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

  const handlePrevMonth = () =>
    setCurrentDate(
      (prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1)
    );

  const handleNextMonth = () =>
    setCurrentDate(
      (prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1)
    );

  const handleStartWorkout = async () => {
    await new Promise((r) => setTimeout(r, 250));
    setView({ name: "workout", plan: activePlan });
    setShowMenu(false);
  };

  return (
    <div className="min-h-screen w-full bg-mesh relative flex flex-col overflow-hidden text-[var(--color-text-base)]">
      {/* 🔮 Glow tło */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] left-[-15%] w-[60vw] h-[60vw] bg-[rgba(var(--rgb-primary),0.25)] blur-[100px] animate-pulse-slow rounded-full" />
        <div className="absolute bottom-[-15%] right-[-15%] w-[60vw] h-[60vw] bg-[rgba(var(--rgb-secondary),0.25)] blur-[100px] animate-pulse-slow delay-1000 rounded-full" />
      </div>

      {/* 🔙 Powrót z pod-widoków */}
      {view.name !== "calendar" && (
        <FloatingBackButton onBack={() => setView({ name: "calendar" })} />
      )}

      <main className="relative z-10 flex-1 flex flex-col min-h-0 backdrop-blur-[3px] bg-[rgba(var(--rgb-black),0.12)]">
        {view.name === "calendar" && (
          <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 pt-2 sm:pt-4 flex flex-col flex-1 min-h-0">
            {/* Header */}
            <div className="relative -mb-1">
              <CalendarHeader
                currentDate={currentDate}
                setCurrentDate={setCurrentDate}
                onOpenHabits={() => setOpenHabits(true)}
                onPrev={handlePrevMonth}
                onNext={handleNextMonth}
                onTitleClick={() =>
                  setIsCompactView((prev) => !prev)
                }
              />
            </div>

            {/* Kalendarz */}
            <div
              className={[
                "flex-1 min-h-0 flex flex-col",
                "transition-all duration-700",
                isCompactView ? "scale-[0.96] -translate-y-1" : "mt-1",
              ].join(" ")}
              style={{
                paddingBottom:
                  "max(4.5rem, calc(env(safe-area-inset-bottom, 0px) + 4rem))",
              }}
            >
              <div className="flex-1 min-h-0">
                <Calendar
                  className={[
                    "w-full h-full transition-all duration-700",
                    isCompactView &&
                      "max-h-[280px] sm:max-h-[320px] rounded-2xl shadow-inner shadow-[0_0_20px_rgba(var(--rgb-primary),0.25)]",
                  ].join(" ")}
                  compact={isCompactView}
                  currentDate={currentDate}
                  workoutSet={workoutSet}
                  habitsDoneSet={habitsDoneSet}
                  onDayClick={onDayClick}
                />
              </div>
            </div>
          </div>
        )}

        {view.name === "exercises" && <ExercisesPage />}
        {view.name === "habits" && <HabitsPage />}
        {view.name === "plan" && <PlanPage />}
        {view.name === "workout" && (
          <WorkoutScreen
            plan={view.plan}
            onExit={() => setView({ name: "calendar" })}
          />
        )}
      </main>

      {/* 🧭 Dock menu */}
      {view.name === "calendar" && (
        <MenuDock
          showMenu={showMenu}
          setShowMenu={setShowMenu}
          onMainAction={handleStartWorkout}
          menuItems={[
            { label: "Wyloguj", icon: LogOut, onClick: handleLogout },
            {
              label: "Plan",
              icon: CalendarCheck,
              onClick: () => setView({ name: "plan" }),
            },
            {
              label: "Ćwiczenia",
              icon: Dumbbell,
              onClick: () => setView({ name: "exercises" }),
            },
            {
              label: "Nawyki",
              icon: Target,
              onClick: () => setView({ name: "habits" }),
            },
          ]}
        />
      )}

      {/* 📅 Modal szczegółów dnia */}
      {dayModal.open && (
        <DayDetailsModal
          dateStr={toISO(dayModal.date)}
          onClose={() => setDayModal({ open: false, date: null })}
          workoutDone={workoutSet.has(toISO(dayModal.date))}
          setWorkoutSet={setWorkoutSet}
          habits={habits}
          entriesMap={
            localEntriesByDate[toISO(dayModal.date)] || {}
          }
        />
      )}

      {/* 📋 Sidebar nawyków */}
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