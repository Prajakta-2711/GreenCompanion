import { Activity, Plant } from "@shared/schema";
import { DropIcon, ScissorsIcon, LeafIcon, PlantIcon } from "@/utils/icons";
import { LucideIcon } from "lucide-react";
import { getRelativeTime } from "@/utils/dateUtils";

interface ActivityItemProps {
  activity: Activity;
  plant: Plant;
}

const ActivityItem = ({ activity, plant }: ActivityItemProps) => {
  // Function to get the icon based on activity type
  const getActivityIcon = (): { icon: LucideIcon; bgColor: string; } => {
    switch(activity.type) {
      case "watered":
        return { icon: DropIcon, bgColor: "bg-[#4CAF50]" };
      case "pruned":
        return { icon: ScissorsIcon, bgColor: "bg-[#43A047]" };
      case "fertilized":
        return { icon: LeafIcon, bgColor: "bg-[#8BC34A]" };
      case "added":
        return { icon: PlantIcon, bgColor: "bg-[#FFC107]" };
      default:
        return { icon: DropIcon, bgColor: "bg-[#4CAF50]" };
    }
  };

  const { icon: ActivityIcon, bgColor } = getActivityIcon();

  return (
    <li className="p-4 flex items-center">
      <div className={`${bgColor} bg-opacity-10 rounded-full p-2 mr-3`}>
        <ActivityIcon className={`text-${bgColor.replace("bg-", "")} h-4 w-4`} />
      </div>
      <div className="flex-grow">
        <p className="text-[#2C3E50] font-medium">{activity.notes || `${activity.type} ${plant.name}`}</p>
        <p className="text-xs text-[#2C3E50] opacity-70">{getRelativeTime(activity.timestamp)}</p>
      </div>
    </li>
  );
};

export default ActivityItem;
