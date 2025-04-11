import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import TaskFilterButtons from "@/components/tasks/TaskFilterButtons";
import TaskGroup from "@/components/tasks/TaskGroup";
import { groupTasksByDate } from "@/utils/dateUtils";
import { Task, Plant } from "@shared/schema";

const Tasks = () => {
  const [activeFilter, setActiveFilter] = useState<string>("all");
  
  // Fetch tasks data
  const { data: tasks = [], isLoading: tasksLoading } = useQuery<Task[]>({
    queryKey: ["/api/tasks"],
  });
  
  // Fetch plants data
  const { data: plants = [], isLoading: plantsLoading } = useQuery<Plant[]>({
    queryKey: ["/api/plants"],
  });
  
  const isLoading = tasksLoading || plantsLoading;
  
  // Filter tasks based on selected filter
  const filteredTasks = tasks.filter(task => {
    if (activeFilter === "all") return !task.completed;
    return task.type === activeFilter && !task.completed;
  });
  
  // Group tasks by date
  const { today, tomorrow, thisWeek, later } = groupTasksByDate(filteredTasks);
  
  // Get plant by ID
  const getPlantById = (plantId: number) => {
    return plants.find(plant => plant.id === plantId);
  };
  
  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-[#2C3E50] font-nunito">Care Tasks</h2>
        <p className="text-[#2C3E50] opacity-70">Manage your plant care schedule</p>
      </div>

      {/* Tasks Filters */}
      <TaskFilterButtons activeFilter={activeFilter} onFilterChange={setActiveFilter} />

      {/* Tasks List */}
      {isLoading ? (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-white rounded-lg h-32 animate-pulse" />
          ))}
        </div>
      ) : filteredTasks.length > 0 ? (
        <div className="space-y-4">
          {today.length > 0 && (
            <TaskGroup 
              title="Today" 
              tasks={today} 
              getPlantById={getPlantById} 
            />
          )}
          
          {tomorrow.length > 0 && (
            <TaskGroup 
              title="Tomorrow" 
              tasks={tomorrow} 
              getPlantById={getPlantById} 
            />
          )}
          
          {thisWeek.length > 0 && (
            <TaskGroup 
              title="Later This Week" 
              tasks={thisWeek} 
              getPlantById={getPlantById} 
            />
          )}
          
          {later.length > 0 && (
            <TaskGroup 
              title="Upcoming" 
              tasks={later} 
              getPlantById={getPlantById} 
            />
          )}
        </div>
      ) : (
        <div className="text-center py-10 bg-white rounded-lg shadow">
          <h3 className="text-lg font-bold text-[#2C3E50] mb-2">No tasks found</h3>
          <p className="text-[#2C3E50] opacity-70">
            {activeFilter === "all" 
              ? "You've completed all your plant care tasks!" 
              : `No ${activeFilter} tasks are currently scheduled.`}
          </p>
        </div>
      )}
    </section>
  );
};

export default Tasks;
