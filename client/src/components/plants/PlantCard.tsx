import { Card } from "@/components/ui/card";
import { Plant } from "@shared/schema";
import { DropIcon, SunIcon, MoreIcon } from "@/utils/icons";
import { 
  getRelativeTime, 
  getWaterProgress, 
  getWaterStatusText 
} from "@/utils/dateUtils";

interface PlantCardProps {
  plant: Plant;
  onOpenDetails: (plant: Plant) => void;
}

const PlantCard = ({ plant, onOpenDetails }: PlantCardProps) => {
  const waterProgress = getWaterProgress(plant.lastWatered, plant.wateringFrequency);
  const waterStatus = getWaterStatusText(plant.lastWatered, plant.wateringFrequency);
  
  // Determine progress bar color based on progress percentage
  const getProgressColor = () => {
    if (waterProgress >= 90) return "bg-[#F44336]"; // Danger - needs water now
    if (waterProgress >= 70) return "bg-[#FF9800]"; // Warning - will need water soon
    return "bg-[#4CAF50]"; // Good - recently watered
  };

  const progressBarColor = getProgressColor();
  
  return (
    <Card className="bg-white shadow rounded-lg overflow-hidden">
      <div className="relative">
        <img 
          src={plant.imageUrl || "https://images.unsplash.com/photo-1463554050456-f2ed7d3fec09"} 
          alt={plant.name} 
          className="w-full h-48 object-cover" 
        />
        <div 
          className="absolute top-3 right-3 bg-white rounded-full p-2 shadow-md cursor-pointer"
          onClick={() => onOpenDetails(plant)}
        >
          <MoreIcon className="text-[#2C3E50] h-4 w-4" />
        </div>
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-4">
          <h3 className="text-white font-bold text-lg font-nunito">{plant.name}</h3>
          <p className="text-white/80 text-sm">{plant.location}</p>
        </div>
      </div>
      <div className="p-4">
        <div className="flex justify-between items-center mb-3">
          <div className="flex items-center">
            <DropIcon className="text-[#4CAF50] mr-1 h-4 w-4" />
            <span className="text-sm">Every {plant.wateringFrequency} days</span>
          </div>
          <div className="flex items-center">
            <SunIcon className="text-[#FF9800] mr-1 h-4 w-4" />
            <span className="text-sm">{plant.lightNeeds}</span>
          </div>
        </div>
        <div className="bg-gray-100 rounded-full h-2 overflow-hidden">
          <div 
            className={`${progressBarColor} h-full rounded-full`} 
            style={{ width: `${waterProgress}%` }}
          ></div>
        </div>
        <div className="flex justify-between items-center mt-2 text-xs text-[#2C3E50] opacity-70">
          <span>
            {plant.lastWatered 
              ? `Watered ${getRelativeTime(plant.lastWatered).toLowerCase()}` 
              : "Not watered yet"}
          </span>
          <span className={waterProgress >= 90 ? "text-[#F44336]" : (waterProgress >= 70 ? "text-[#FF9800]" : "text-[#4CAF50]")}>
            {waterStatus}
          </span>
        </div>
      </div>
    </Card>
  );
};

export default PlantCard;
