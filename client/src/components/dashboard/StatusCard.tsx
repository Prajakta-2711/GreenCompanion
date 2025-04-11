import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

interface StatusCardProps {
  icon: LucideIcon;
  label: string;
  count: number;
  color: string;
}

const StatusCard = ({ icon: Icon, label, count, color }: StatusCardProps) => {
  return (
    <Card className="bg-white shadow p-4">
      <div className="flex items-center">
        <div className={cn(`bg-opacity-10 rounded-full p-3 mr-3`, `bg-[${color}]`)}>
          <Icon className={cn(`text-xl`, `text-[${color}]`)} />
        </div>
        <div>
          <p className="text-sm text-[#2C3E50] opacity-70">{label}</p>
          <p className="text-lg font-bold text-[#2C3E50] font-nunito">{count}</p>
        </div>
      </div>
    </Card>
  );
};

export default StatusCard;
