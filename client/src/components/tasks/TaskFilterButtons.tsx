import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { DropIcon, LeafIcon, ScissorsIcon, SunIcon } from "@/utils/icons";

interface TaskFilterButtonsProps {
  activeFilter: string;
  onFilterChange: (filter: string) => void;
}

const TaskFilterButtons = ({ activeFilter, onFilterChange }: TaskFilterButtonsProps) => {
  const filters = [
    { id: "all", label: "All Tasks", icon: null },
    { id: "watering", label: "Watering", icon: DropIcon },
    { id: "fertilizing", label: "Fertilizing", icon: LeafIcon },
    { id: "pruning", label: "Pruning", icon: ScissorsIcon },
    { id: "light", label: "Light", icon: SunIcon },
  ];
  
  return (
    <div className="flex overflow-x-auto pb-2 mb-6 gap-2">
      {filters.map(filter => {
        const isActive = activeFilter === filter.id;
        const Icon = filter.icon;
        
        return (
          <Button 
            key={filter.id}
            className={cn(
              "px-4 py-2 whitespace-nowrap",
              isActive 
                ? "bg-[#4CAF50] text-white" 
                : "bg-white text-[#2C3E50]"
            )}
            onClick={() => onFilterChange(filter.id)}
          >
            {Icon && <Icon className="h-4 w-4 mr-1" />}
            {filter.label}
          </Button>
        );
      })}
    </div>
  );
};

export default TaskFilterButtons;
