import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeftIcon, ArrowRightIcon } from "@/utils/icons";
import { getCalendarDays, formatDate } from "@/utils/dateUtils";
import { Task, Plant } from "@shared/schema";
import { cn } from "@/lib/utils";

interface CalendarViewProps {
  tasks: Task[];
  plants: Plant[];
}

const CalendarView = ({ tasks, plants }: CalendarViewProps) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState<'month' | 'week' | 'day'>('month');
  
  const month = currentDate.getMonth();
  const year = currentDate.getFullYear();
  
  const calendarDays = getCalendarDays(month, year);
  
  // Get tasks for each day
  const getTasksForDay = (date: Date) => {
    return tasks.filter(task => {
      const taskDate = new Date(task.date);
      return (
        taskDate.getDate() === date.getDate() &&
        taskDate.getMonth() === date.getMonth() &&
        taskDate.getFullYear() === date.getFullYear()
      );
    });
  };
  
  // Get indicators for each day (colors for different task types)
  const getIndicatorsForDay = (date: Date) => {
    const tasksForDay = getTasksForDay(date);
    const indicators = new Set<string>();
    
    tasksForDay.forEach(task => {
      indicators.add(task.type);
    });
    
    return Array.from(indicators);
  };
  
  // Get plant by ID
  const getPlantById = (plantId: number): Plant | undefined => {
    return plants.find(plant => plant.id === plantId);
  };
  
  // Get task type color
  const getTaskTypeColor = (type: string): string => {
    switch(type) {
      case "watering":
        return "bg-[#4CAF50] text-white";
      case "fertilizing":
        return "bg-[#8BC34A] text-white";
      case "pruning":
        return "bg-[#43A047] text-white";
      case "light":
        return "bg-[#FF9800] text-white";
      default:
        return "bg-[#4CAF50] text-white";
    }
  };
  
  // Get task type background opacity
  const getTaskTypeBgOpacity = (type: string): string => {
    switch(type) {
      case "watering":
        return "bg-[#4CAF50] bg-opacity-10 text-[#4CAF50]";
      case "fertilizing":
        return "bg-[#8BC34A] bg-opacity-10 text-[#8BC34A]";
      case "pruning":
        return "bg-[#43A047] bg-opacity-10 text-[#43A047]";
      case "light":
        return "bg-[#FF9800] bg-opacity-10 text-[#FF9800]";
      default:
        return "bg-[#4CAF50] bg-opacity-10 text-[#4CAF50]";
    }
  };
  
  // Navigation functions
  const goToPreviousMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };
  
  const goToNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };
  
  const getMonthName = () => {
    return currentDate.toLocaleString('default', { month: 'long', year: 'numeric' });
  };
  
  return (
    <div>
      {/* Calendar Navigation */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={goToPreviousMonth} 
            className="rounded-full hover:bg-gray-100"
          >
            <ArrowLeftIcon className="h-4 w-4 text-[#2C3E50]" />
          </Button>
          <h3 className="text-lg font-bold mx-4 font-nunito">{getMonthName()}</h3>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={goToNextMonth} 
            className="rounded-full hover:bg-gray-100"
          >
            <ArrowRightIcon className="h-4 w-4 text-[#2C3E50]" />
          </Button>
        </div>
        <div className="flex space-x-2">
          <Button 
            size="sm" 
            variant={view === 'month' ? 'default' : 'ghost'} 
            onClick={() => setView('month')}
            className="px-3 py-1 text-sm"
          >
            Month
          </Button>
          <Button 
            size="sm" 
            variant={view === 'week' ? 'default' : 'ghost'} 
            onClick={() => setView('week')}
            className="px-3 py-1 text-sm"
          >
            Week
          </Button>
          <Button 
            size="sm" 
            variant={view === 'day' ? 'default' : 'ghost'} 
            onClick={() => setView('day')}
            className="px-3 py-1 text-sm"
          >
            Day
          </Button>
        </div>
      </div>

      {/* Calendar Grid */}
      <Card className="bg-white shadow rounded-lg overflow-hidden">
        {/* Days of Week */}
        <div className="grid grid-cols-7 border-b">
          <div className="py-2 text-center font-medium text-[#2C3E50]">Sun</div>
          <div className="py-2 text-center font-medium text-[#2C3E50]">Mon</div>
          <div className="py-2 text-center font-medium text-[#2C3E50]">Tue</div>
          <div className="py-2 text-center font-medium text-[#2C3E50]">Wed</div>
          <div className="py-2 text-center font-medium text-[#2C3E50]">Thu</div>
          <div className="py-2 text-center font-medium text-[#2C3E50]">Fri</div>
          <div className="py-2 text-center font-medium text-[#2C3E50]">Sat</div>
        </div>

        {/* Calendar Days */}
        <div className="grid grid-cols-7 gap-px bg-gray-100">
          {calendarDays.map((day, index) => {
            const dayTasks = getTasksForDay(day.date);
            const indicators = getIndicatorsForDay(day.date);
            
            return (
              <div 
                key={index} 
                className={cn(
                  "p-2 min-h-[100px]",
                  !day.isCurrentMonth && "text-gray-400 bg-white",
                  day.isCurrentMonth && "bg-white", 
                  day.isToday && "bg-[#4CAF50] bg-opacity-5 border border-[#4CAF50]"
                )}
              >
                <div className="flex justify-between items-center">
                  <span className={cn(
                    "font-medium",
                    day.isToday && "text-[#4CAF50]"
                  )}>
                    {day.date.getDate()}
                  </span>
                  {indicators.length > 0 && (
                    <div className="flex">
                      {indicators.map((indicator, i) => (
                        <div 
                          key={i} 
                          className={cn(
                            "w-2 h-2 rounded-full ml-0.5",
                            indicator === "watering" && "bg-[#4CAF50]",
                            indicator === "fertilizing" && "bg-[#8BC34A]",
                            indicator === "pruning" && "bg-[#43A047]",
                            indicator === "light" && "bg-[#FF9800]"
                          )}
                        ></div>
                      ))}
                    </div>
                  )}
                </div>
                
                {/* Tasks for this day */}
                <div className="mt-1 space-y-1 max-h-20 overflow-y-auto">
                  {dayTasks.map(task => {
                    const plant = getPlantById(task.plantId);
                    if (!plant) return null;
                    
                    return (
                      <div 
                        key={task.id} 
                        className={`text-xs p-1 rounded ${getTaskTypeBgOpacity(task.type)} truncate`}
                      >
                        {task.type === "watering" && <span>💧</span>}
                        {task.type === "fertilizing" && <span>🌱</span>}
                        {task.type === "pruning" && <span>✂️</span>}
                        {task.type === "light" && <span>☀️</span>}
                        {` ${plant.name}`}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
};

export default CalendarView;
