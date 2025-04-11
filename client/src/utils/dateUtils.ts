import { formatDistance, format, isToday, isTomorrow, addDays, isBefore, isAfter } from "date-fns";

// Format date for display (e.g. "Aug 12, 2023")
export function formatDate(date: Date | string): string {
  const dateObj = typeof date === "string" ? new Date(date) : date;
  return format(dateObj, "MMM d, yyyy");
}

// Format time for display (e.g. "9:30 AM")
export function formatTime(date: Date | string): string {
  const dateObj = typeof date === "string" ? new Date(date) : date;
  return format(dateObj, "h:mm a");
}

// Format date and time for display (e.g. "Aug 12, 2023, 9:30 AM")
export function formatDateTime(date: Date | string): string {
  const dateObj = typeof date === "string" ? new Date(date) : date;
  return format(dateObj, "MMM d, yyyy, h:mm a");
}

// Get relative time (e.g. "Today", "Yesterday", "2 days ago")
export function getRelativeTime(date: Date | string): string {
  const dateObj = typeof date === "string" ? new Date(date) : date;
  
  if (isToday(dateObj)) {
    return `Today, ${format(dateObj, "h:mm a")}`;
  }
  
  return formatDistance(dateObj, new Date(), { addSuffix: true });
}

// Calculate days until next watering
export function getDaysUntilWatering(lastWatered: Date | string | null, frequency: number): number | null {
  if (!lastWatered) return null;
  
  const lastWateredDate = typeof lastWatered === "string" ? new Date(lastWatered) : lastWatered;
  const nextWateringDate = addDays(lastWateredDate, frequency);
  const today = new Date();
  
  // If next watering date is in the past, return 0 (water now)
  if (isBefore(nextWateringDate, today)) {
    return 0;
  }
  
  // Calculate days difference
  const diffTime = nextWateringDate.getTime() - today.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

// Get water status text (e.g. "Water now!", "2 days until next")
export function getWaterStatusText(lastWatered: Date | string | null, frequency: number): string {
  const daysUntil = getDaysUntilWatering(lastWatered, frequency);
  
  if (daysUntil === null) return "Not watered yet";
  if (daysUntil === 0) return "Water now!";
  if (daysUntil === 1) return "1 day until next";
  return `${daysUntil} days until next`;
}

// Calculate water progress (percentage until next watering)
export function getWaterProgress(lastWatered: Date | string | null, frequency: number): number {
  if (!lastWatered) return 0;
  
  const lastWateredDate = typeof lastWatered === "string" ? new Date(lastWatered) : lastWatered;
  const nextWateringDate = addDays(lastWateredDate, frequency);
  const today = new Date();
  
  // If next watering date is in the past, return 100%
  if (isBefore(nextWateringDate, today)) {
    return 100;
  }
  
  // Calculate percentage
  const totalDuration = nextWateringDate.getTime() - lastWateredDate.getTime();
  const elapsedDuration = today.getTime() - lastWateredDate.getTime();
  
  return Math.min(100, Math.round((elapsedDuration / totalDuration) * 100));
}

// Sort tasks by date
export function groupTasksByDate(tasks: Array<{ date: string | Date; title: string; id: number; [key: string]: any }>) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const tomorrow = addDays(today, 1);
  tomorrow.setHours(0, 0, 0, 0);
  
  const nextWeek = addDays(today, 7);
  nextWeek.setHours(0, 0, 0, 0);
  
  const todayTasks: typeof tasks = [];
  const tomorrowTasks: typeof tasks = [];
  const thisWeekTasks: typeof tasks = [];
  const laterTasks: typeof tasks = [];
  
  tasks.forEach(task => {
    const taskDate = typeof task.date === "string" ? new Date(task.date) : task.date;
    taskDate.setHours(0, 0, 0, 0);
    
    if (taskDate.getTime() === today.getTime()) {
      todayTasks.push(task);
    } else if (taskDate.getTime() === tomorrow.getTime()) {
      tomorrowTasks.push(task);
    } else if (isAfter(taskDate, today) && isBefore(taskDate, nextWeek)) {
      thisWeekTasks.push(task);
    } else {
      laterTasks.push(task);
    }
  });
  
  return {
    today: todayTasks,
    tomorrow: tomorrowTasks,
    thisWeek: thisWeekTasks,
    later: laterTasks
  };
}

// Get calendar days for a month
export function getCalendarDays(month: number, year: number) {
  const firstDayOfMonth = new Date(year, month, 1);
  const lastDayOfMonth = new Date(year, month + 1, 0);
  
  const daysInMonth = lastDayOfMonth.getDate();
  const firstDayOfWeek = firstDayOfMonth.getDay(); // 0 for Sunday, 1 for Monday, etc.
  
  // Previous month days to display
  const previousMonthDays = [];
  if (firstDayOfWeek > 0) {
    const lastDayOfPreviousMonth = new Date(year, month, 0).getDate();
    for (let i = firstDayOfWeek - 1; i >= 0; i--) {
      previousMonthDays.push({
        date: new Date(year, month - 1, lastDayOfPreviousMonth - i),
        isCurrentMonth: false,
        isToday: false
      });
    }
  }
  
  // Current month days
  const currentMonthDays = [];
  const today = new Date();
  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(year, month, day);
    currentMonthDays.push({
      date,
      isCurrentMonth: true,
      isToday: isToday(date)
    });
  }
  
  // Next month days to display (to fill remaining cells in the grid)
  const nextMonthDays = [];
  const totalDaysDisplayed = previousMonthDays.length + currentMonthDays.length;
  const remainingCells = Math.ceil(totalDaysDisplayed / 7) * 7 - totalDaysDisplayed;
  
  for (let day = 1; day <= remainingCells; day++) {
    nextMonthDays.push({
      date: new Date(year, month + 1, day),
      isCurrentMonth: false,
      isToday: false
    });
  }
  
  return [...previousMonthDays, ...currentMonthDays, ...nextMonthDays];
}

// Generate month options for select inputs
export function getMonthOptions() {
  return [
    { value: 0, label: "January" },
    { value: 1, label: "February" },
    { value: 2, label: "March" },
    { value: 3, label: "April" },
    { value: 4, label: "May" },
    { value: 5, label: "June" },
    { value: 6, label: "July" },
    { value: 7, label: "August" },
    { value: 8, label: "September" },
    { value: 9, label: "October" },
    { value: 10, label: "November" },
    { value: 11, label: "December" }
  ];
}

// Generate year options for select inputs (5 years before and after current year)
export function getYearOptions() {
  const currentYear = new Date().getFullYear();
  const years = [];
  
  for (let year = currentYear - 5; year <= currentYear + 5; year++) {
    years.push({ value: year, label: year.toString() });
  }
  
  return years;
}
