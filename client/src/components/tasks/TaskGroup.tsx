import { Card } from "@/components/ui/card";
import TaskItem from "@/components/tasks/TaskItem";
import { Task, Plant } from "@shared/schema";

interface TaskGroupProps {
  title: string;
  tasks: Task[];
  getPlantById: (plantId: number) => Plant | undefined;
}

const TaskGroup = ({ title, tasks, getPlantById }: TaskGroupProps) => {
  if (tasks.length === 0) return null;
  
  return (
    <div>
      <h3 className="text-lg font-bold mb-3 font-nunito">{title}</h3>
      <Card className="bg-white shadow rounded-lg overflow-hidden">
        <ul className="divide-y divide-gray-200">
          {tasks.map(task => {
            const plant = getPlantById(task.plantId);
            return plant && (
              <TaskItem key={task.id} task={task} plant={plant} />
            );
          })}
        </ul>
      </Card>
    </div>
  );
};

export default TaskGroup;
