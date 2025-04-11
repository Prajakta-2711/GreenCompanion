import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import CalendarView from "@/components/calendar/CalendarView";
import { Plant, Task } from "@shared/schema";

const Calendar = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  
  // Fetch plants data
  const { data: plants = [], isLoading: plantsLoading } = useQuery<Plant[]>({
    queryKey: ["/api/plants"],
  });
  
  // Fetch tasks data
  const { data: tasks = [], isLoading: tasksLoading } = useQuery<Task[]>({
    queryKey: ["/api/tasks"],
  });
  
  const isLoading = plantsLoading || tasksLoading;
  
  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-[#2C3E50] font-nunito">Plant Care Calendar</h2>
        <p className="text-[#2C3E50] opacity-70">Schedule and view your plant care activities</p>
      </div>

      {isLoading ? (
        <div className="bg-white rounded-lg h-96 animate-pulse"></div>
      ) : (
        <CalendarView tasks={tasks} plants={plants} />
      )}
    </section>
  );
};

export default Calendar;
