import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Task, Plant } from "@shared/schema";
import { PlantIcon, MapPinIcon, MoreIcon, CheckIcon } from "@/utils/icons";
import { apiRequest } from "@/lib/queryClient";

interface TaskItemProps {
  task: Task;
  plant: Plant;
}

const TaskItem = ({ task, plant }: TaskItemProps) => {
  const queryClient = useQueryClient();
  
  // Function to determine badge color based on task type
  const getTaskBadgeVariant = () => {
    switch(task.type) {
      case "watering":
        return "default"; // Primary color
      case "fertilizing":
        return "secondary";
      case "pruning":
        return "success";
      case "light":
        return "warning";
      default:
        return "default";
    }
  };
  
  // Format task type for display
  const formatTaskType = (type: string) => {
    return type.charAt(0).toUpperCase() + type.slice(1);
  };
  
  const handleCompleteTask = async () => {
    try {
      await apiRequest(`/api/tasks/${task.id}/complete`, { method: "POST" });
      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: ["/api/tasks"] });
      queryClient.invalidateQueries({ queryKey: ["/api/plants"] });
      queryClient.invalidateQueries({ queryKey: ["/api/activities"] });
    } catch (error) {
      console.error("Error completing task:", error);
    }
  };
  
  return (
    <li className="p-4">
      <div className="flex items-center">
        <div className="mr-3">
          <Button 
            className={`w-6 h-6 rounded-full border-2 border-${task.type === "watering" ? "[#4CAF50]" : 
              task.type === "fertilizing" ? "[#8BC34A]" : 
              task.type === "pruning" ? "[#43A047]" : 
              "[#FF9800]"} flex items-center justify-center p-0 min-w-0 min-h-0`}
            variant="ghost"
            onClick={handleCompleteTask}
          >
            {task.completed && <CheckIcon className="h-3 w-3 text-white" />}
          </Button>
        </div>
        <div className="flex-grow">
          <div className="flex justify-between">
            <h4 className="font-medium text-[#2C3E50]">{task.title}</h4>
            <Badge variant={getTaskBadgeVariant()}>
              {formatTaskType(task.type)}
            </Badge>
          </div>
          <div className="flex items-center text-sm text-[#2C3E50] opacity-70">
            <PlantIcon className="mr-1 h-3 w-3" />
            <span>{plant.name}</span>
            <span className="mx-2">•</span>
            <MapPinIcon className="mr-1 h-3 w-3" />
            <span>{plant.location}</span>
          </div>
        </div>
        <Button 
          variant="ghost" 
          size="icon" 
          className="ml-2 text-gray-400"
        >
          <MoreIcon className="h-4 w-4" />
        </Button>
      </div>
    </li>
  );
};

export default TaskItem;
