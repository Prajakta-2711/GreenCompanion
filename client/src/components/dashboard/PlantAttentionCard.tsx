import { useQueryClient } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DropIcon, SunIcon, LeafIcon, CheckCircleIcon } from "@/utils/icons";
import { Plant, Task } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";

interface PlantAttentionCardProps {
  plant: Plant;
  task: Task;
}

const PlantAttentionCard = ({ plant, task }: PlantAttentionCardProps) => {
  const queryClient = useQueryClient();

  // Function to determine the icon and color based on task type
  const getTaskIcon = () => {
    switch(task.type) {
      case "watering":
        return { icon: DropIcon, bgColor: "bg-[#4CAF50]", textColor: "text-[#4CAF50]" };
      case "light":
        return { icon: SunIcon, bgColor: "bg-[#FF9800]", textColor: "text-[#FF9800]" };
      case "fertilizing":
        return { icon: LeafIcon, bgColor: "bg-[#8BC34A]", textColor: "text-[#8BC34A]" };
      default:
        return { icon: DropIcon, bgColor: "bg-[#4CAF50]", textColor: "text-[#4CAF50]" };
    }
  };

  // Function to format task type for display
  const getTaskTypeDisplay = () => {
    switch(task.type) {
      case "watering":
        return "Water Now";
      case "light":
        return "Check Light";
      case "fertilizing":
        return "Fertilize";
      case "pruning":
        return "Prune";
      default:
        return task.type.charAt(0).toUpperCase() + task.type.slice(1);
    }
  };

  const { icon: TaskIcon, bgColor, textColor } = getTaskIcon();

  const handleMarkDone = async () => {
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
    <Card className="bg-white shadow rounded-lg overflow-hidden">
      <div className="flex">
        <img 
          src={plant.imageUrl || "https://images.unsplash.com/photo-1463554050456-f2ed7d3fec09"} 
          alt={plant.name} 
          className="w-24 h-24 object-cover" 
        />
        <div className="p-4 flex-grow">
          <div className="flex justify-between items-start">
            <div>
              <h4 className="font-bold text-[#2C3E50] font-nunito">{plant.name}</h4>
              <p className="text-sm text-[#2C3E50] opacity-70">{plant.location}</p>
            </div>
            <span className={`${bgColor} text-white text-xs py-1 px-2 rounded-full`}>
              {getTaskTypeDisplay()}
            </span>
          </div>
          <div className="mt-2 flex items-center justify-between">
            <div className="flex items-center">
              <TaskIcon className={`${textColor} mr-1 h-4 w-4`} />
              <span className="text-sm">
                {task.type === "watering" ? `Every ${plant.wateringFrequency} days` : plant.lightNeeds}
              </span>
            </div>
            <Button 
              variant="link" 
              className={`${textColor} flex items-center text-sm p-0`}
              onClick={handleMarkDone}
            >
              <CheckCircleIcon className="mr-1 h-4 w-4" /> Mark Done
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default PlantAttentionCard;
