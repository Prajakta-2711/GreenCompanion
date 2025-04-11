import { useQuery } from "@tanstack/react-query";
import { Droplet, Sun, Leaf, Scissors } from "lucide-react";
import StatusCard from "@/components/dashboard/StatusCard";
import PlantAttentionCard from "@/components/dashboard/PlantAttentionCard";
import ActivityItem from "@/components/dashboard/ActivityItem";
import UserProfileCard from "@/components/dashboard/UserProfileCard";
import { Card } from "@/components/ui/card";
import { Link } from "wouter";
import { Plant, Task, Activity } from "@shared/schema";
import { useAuth } from "@/hooks/use-auth";

const Dashboard = () => {
  const { user } = useAuth();
  
  // Fetch plants data
  const { data: plants = [] } = useQuery<Plant[]>({
    queryKey: ["/api/plants"],
  });
  
  // Fetch tasks data
  const { data: tasks = [] } = useQuery<Task[]>({
    queryKey: ["/api/tasks"],
  });
  
  // Fetch activities data
  const { data: activities = [] } = useQuery<Activity[]>({
    queryKey: ["/api/activities"],
  });
  
  // Count plants by care needs
  const needsWatering = plants.filter(plant => {
    if (!plant.lastWatered) return true;
    const lastWatered = new Date(plant.lastWatered);
    const today = new Date();
    const daysSinceLastWatered = Math.floor((today.getTime() - lastWatered.getTime()) / (1000 * 60 * 60 * 24));
    return daysSinceLastWatered >= plant.wateringFrequency;
  }).length;
  
  // Get tasks grouped by type
  const tasksByType = tasks.reduce<Record<string, number>>((acc, task) => {
    if (!task.completed) {
      acc[task.type] = (acc[task.type] || 0) + 1;
    }
    return acc;
  }, {});
  
  // Get plants needing attention
  const plantsNeedingAttention = tasks
    .filter(task => !task.completed)
    .map(task => {
      const plant = plants.find(p => p.id === task.plantId);
      return { task, plant };
    })
    .filter(({ plant }) => plant !== undefined)
    .slice(0, 3);
  
  // Get recent activities
  const recentActivities = activities.slice(0, 4);
  
  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-[#2C3E50] font-nunito">Dashboard</h2>
        <p className="text-[#2C3E50] opacity-70">Welcome back! Here's your plant care overview.</p>
      </div>
      
      {/* User Profile */}
      {user && (
        <div className="mb-8">
          <UserProfileCard user={user} />
        </div>
      )}

      {/* Status Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <StatusCard 
          icon={Droplet} 
          label="Needs Water" 
          count={needsWatering} 
          color="#4CAF50" 
        />
        <StatusCard 
          icon={Sun} 
          label="Check Light" 
          count={tasksByType.light || 0} 
          color="#FF9800" 
        />
        <StatusCard 
          icon={Leaf} 
          label="Fertilize" 
          count={tasksByType.fertilizing || 0} 
          color="#8BC34A" 
        />
        <StatusCard 
          icon={Scissors} 
          label="Need Pruning" 
          count={tasksByType.pruning || 0} 
          color="#43A047" 
        />
      </div>

      {/* Plants Needing Attention */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold text-[#2C3E50] font-nunito">Plants Needing Attention</h3>
          <Link href="/plants">
            <a className="text-[#4CAF50] font-medium text-sm">View All</a>
          </Link>
        </div>
        
        <div className="space-y-4">
          {plantsNeedingAttention.length > 0 ? (
            plantsNeedingAttention.map(({ plant, task }) => (
              plant && <PlantAttentionCard key={task.id} plant={plant} task={task} />
            ))
          ) : (
            <Card className="bg-white shadow p-6 text-center">
              <p className="text-[#2C3E50]">All your plants are taken care of! 🌱</p>
            </Card>
          )}
        </div>
      </div>

      {/* Recent Activity */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold text-[#2C3E50] font-nunito">Recent Activity</h3>
          <Link href="/tasks">
            <a className="text-[#4CAF50] font-medium text-sm">View All</a>
          </Link>
        </div>
        
        <Card className="bg-white shadow rounded-lg overflow-hidden">
          <ul className="divide-y divide-gray-200">
            {recentActivities.length > 0 ? (
              recentActivities.map(activity => {
                const plant = plants.find(p => p.id === activity.plantId);
                return plant && (
                  <ActivityItem key={activity.id} activity={activity} plant={plant} />
                );
              })
            ) : (
              <li className="p-6 text-center">
                <p className="text-[#2C3E50]">No recent activities.</p>
              </li>
            )}
          </ul>
        </Card>
      </div>
    </section>
  );
};

export default Dashboard;
