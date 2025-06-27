interface WeekNavigationProps {
  activeWeekIndex: number;
  setActiveWeekIndex: (week: number) => void;
  totalWeeks?: number; // si lo vas a usar más tarde
}

export default function WeekNavigation({ activeWeekIndex, setActiveWeekIndex }: WeekNavigationProps) {
  const weeks = [1, 2, 3, 4]; // o usa totalWeeks si quieres que sea dinámico

  return (
    <nav className="grid grid-cols-2 sm:grid-cols-4 gap-2">
      {weeks.map((week) => (
        <button
          key={week}
          onClick={() => setActiveWeekIndex(week - 1)} // importante: week 1 = index 0
          className={`nav-btn p-3 w-full font-semibold rounded-md text-center transition-colors ${
            activeWeekIndex === week - 1
              ? 'bg-[#007bff] text-white'
              : 'bg-gray-200 hover:bg-gray-300'
          }`}
        >
          Semana {week}
        </button>
      ))}
    </nav>
  );
}
