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
import { LogOut, Target, Dumbbell, CalendarCheck, Activity } from "lucide-react";

export default function Dashboard() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState({ name: "calendar", plan: null });
  const [dayModal, setDayModal] = useState({ open: false, date: null });
  const [showMenu, setShowMenu] = useState(false);
  const [activePlan, setActivePlan] = useState(null);

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

  // Załaduj aktywny plan
  useEffect(() => {
    (async () => {
      try {
        const plan = await plansService.getActive();
        setActivePlan(plan);
      } catch {
        // noop
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
    onDayClick: (dateISO) => setDayModal({ open: true, date: new Date(dateISO) }),
  });

  const handleLogout = () => {
    localStorage.removeItem("token");
    sessionStorage.clear();
    window.location.href = "/login";
  };

  const handlePrevMonth = () =>
    setCurrentDate((prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  const handleNextMonth = () =>
    setCurrentDate((prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));

  // Funkcja startująca workout z delay
  const handleStartWorkout = async () => {
    await new Promise(resolve => setTimeout(resolve, 300));
    setView({ name: "workout", plan: activePlan });
    setShowMenu(false);
  };

  return (
    <div className="min-h-screen w-full bg-mesh flex flex-col relative overflow-hidden">
      {view.name !== "calendar" && (
        <FloatingBackButton onBack={() => setView({ name: "calendar" })} />
      )}

      <main className="flex-1 flex flex-col">
        {view.name === "calendar" && (
          <div className="mx-auto w-full max-w-6xl px-3 sm:px-6 pt-2 flex flex-col flex-1">
            {/* Elegant Header */}
            <CalendarHeader
              currentDate={currentDate}
              setCurrentDate={setCurrentDate}
              onOpenHabits={() => setOpenHabits(true)}
              onPrev={handlePrevMonth}
              onNext={handleNextMonth}
            />

            {/* Kalendarz z responsywnym paddingiem */}
            <div 
              className="flex-1 flex flex-col pb-24 sm:pb-4 md:pb-6"
              style={{
                paddingBottom: 'max(6rem, calc(env(safe-area-inset-bottom, 0px) + 5rem))',
              }}
            >
              <Calendar
                className="flex-1 h-full"
                currentDate={currentDate}
                workoutSet={workoutSet}
                habitsDoneSet={habitsDoneSet}
                onDayClick={onDayClick}
              />
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

      {/* MenuDock - tylko dla kalendarza */}
      {view.name === "calendar" && (
        <MenuDock
          showMenu={showMenu}
          setShowMenu={setShowMenu}
          onMainAction={handleStartWorkout}
          menuItems={[
            {
              label: "Workout",
              icon: Activity,
              onClick: () => activePlan && setView({ name: "workout", plan: activePlan }),
            },
            {
              label: "Plan",
              icon: CalendarCheck,
              onClick: () => setView({ name: "plan" }),
            },
            {
              label: "Exercises",
              icon: Dumbbell,
              onClick: () => setView({ name: "exercises" }),
            },
            {
              label: "Habits",
              icon: Target,
              onClick: () => setView({ name: "habits" }),
            },
            {
              label: "Logout",
              icon: LogOut,
              onClick: handleLogout,
            },
          ]}
        />
      )}

      {/* Modal szczegółów dnia */}
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

      {/* Sidebar nawyków */}
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