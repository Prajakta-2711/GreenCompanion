import { useState, useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  DropIcon, 
  SunIcon, 
  MapPinIcon,
  CloseIcon,
  ShareIcon
} from "@/utils/icons";
import { Plant, Activity } from "@shared/schema";
import { insertPlantSchema } from "@shared/schema";
import { apiRequest, getQueryFn } from "@/lib/queryClient";
import { formatDate, getWaterStatusText } from "@/utils/dateUtils";
import { useToast } from "@/hooks/use-toast";
import ShareProgressDialog from "@/components/sharing/ShareProgressDialog";

// Extend the schema for editing
const editPlantSchema = insertPlantSchema.extend({
  name: z.string().min(2, {
    message: "Plant name must be at least 2 characters.",
  }),
  location: z.string().min(2, {
    message: "Location must be at least 2 characters.",
  }),
  wateringFrequency: z.number().min(1, {
    message: "Please select a watering frequency.",
  }),
  lightNeeds: z.string().min(1, {
    message: "Please select light requirements.",
  }),
  // Make these optional
  species: z.string().optional(),
  notes: z.string().optional(),
  imageUrl: z.string().url().optional(),
});

type EditPlantFormValues = z.infer<typeof editPlantSchema>;

interface PlantDetailsDialogProps {
  plant: Plant;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const PlantDetailsDialog = ({ plant, open, onOpenChange }: PlantDetailsDialogProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  // Form for editing plant
  const form = useForm<EditPlantFormValues>({
    resolver: zodResolver(editPlantSchema),
    defaultValues: {
      name: plant.name,
      species: plant.species || "",
      location: plant.location,
      wateringFrequency: plant.wateringFrequency,
      lightNeeds: plant.lightNeeds,
      notes: plant.notes || "",
      imageUrl: plant.imageUrl || "",
    },
  });
  
  // Update form values when plant changes
  useEffect(() => {
    form.reset({
      name: plant.name,
      species: plant.species || "",
      location: plant.location,
      wateringFrequency: plant.wateringFrequency,
      lightNeeds: plant.lightNeeds,
      notes: plant.notes || "",
      imageUrl: plant.imageUrl || "",
    });
  }, [plant, form]);
  
  // Fetch plant activities for sharing
  const { data: activities = [] } = useQuery<Activity[]>({
    queryKey: [`/api/plants/${plant.id}/activities`],
    enabled: open
  });
  
  // Share progress dialog state
  const [isShareDialogOpen, setIsShareDialogOpen] = useState(false);
  
  const onSubmit = async (data: EditPlantFormValues) => {
    try {
      await apiRequest({
        method: "PATCH",
        url: `/api/plants/${plant.id}`,
        data: data
      });
      queryClient.invalidateQueries({ queryKey: ["/api/plants"] });
      setIsEditing(false);
      toast({
        title: "Plant updated",
        description: `${data.name} has been updated successfully.`,
      });
    } catch (error) {
      console.error("Error updating plant:", error);
      toast({
        title: "Error",
        description: "Failed to update plant. Please try again.",
        variant: "destructive",
      });
    }
  };
  
  const handleDeletePlant = async () => {
    try {
      await apiRequest({
        method: "DELETE",
        url: `/api/plants/${plant.id}`
      });
      queryClient.invalidateQueries({ queryKey: ["/api/plants"] });
      onOpenChange(false);
      toast({
        title: "Plant deleted",
        description: `${plant.name} has been deleted successfully.`,
      });
    } catch (error) {
      console.error("Error deleting plant:", error);
      toast({
        title: "Error",
        description: "Failed to delete plant. Please try again.",
        variant: "destructive",
      });
    }
  };
  
  const handleWaterNow = async () => {
    try {
      // Create a watering task and mark it as completed
      const task = {
        plantId: plant.id,
        title: `Water ${plant.name}`,
        type: "watering",
        date: new Date(),
        completed: false
      };
      
      const response = await apiRequest({
        method: "POST",
        url: "/api/tasks",
        data: task
      });
      const taskData = await response.json();
      
      // Complete the task to update plant's lastWatered
      await apiRequest({
        method: "POST",
        url: `/api/tasks/${taskData.id}/complete`
      });
      
      queryClient.invalidateQueries({ queryKey: ["/api/plants"] });
      queryClient.invalidateQueries({ queryKey: ["/api/tasks"] });
      queryClient.invalidateQueries({ queryKey: ["/api/activities"] });
      
      toast({
        title: "Plant watered",
        description: `${plant.name} has been watered successfully.`,
      });
    } catch (error) {
      console.error("Error watering plant:", error);
      toast({
        title: "Error",
        description: "Failed to water plant. Please try again.",
        variant: "destructive",
      });
    }
  };
  
  const handleShareProgress = () => {
    setIsShareDialogOpen(true);
  };
  
  const formatWateringStatus = () => {
    if (!plant.lastWatered) return "Not watered yet";
    const lastWatered = new Date(plant.lastWatered);
    return `Last watered on ${formatDate(lastWatered)}`;
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md mx-auto max-h-[90vh] overflow-y-auto">
        {!isEditing ? (
          <>
            <DialogHeader>
              <DialogTitle className="text-xl font-bold text-[#2C3E50] font-nunito">
                {plant.name}
              </DialogTitle>
              {plant.species && (
                <p className="text-sm text-[#2C3E50] opacity-70 italic">
                  {plant.species}
                </p>
              )}
            </DialogHeader>
            
            <div className="space-y-4 py-2">
              <div className="relative rounded-lg overflow-hidden">
                <img 
                  src={plant.imageUrl || "https://images.unsplash.com/photo-1463554050456-f2ed7d3fec09"} 
                  alt={plant.name} 
                  className="w-full h-48 object-cover" 
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <MapPinIcon className="h-4 w-4 text-[#2C3E50] mr-1" />
                  <span className="text-sm">{plant.location}</span>
                </div>
                <Badge variant="outline" className="bg-[#4CAF50] bg-opacity-10 text-[#4CAF50] border-0">
                  {formatWateringStatus()}
                </Badge>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-[#4CAF50] bg-opacity-10 p-3 rounded-lg">
                  <div className="flex items-center mb-1">
                    <DropIcon className="h-4 w-4 text-[#4CAF50] mr-1" />
                    <span className="text-sm font-semibold">Watering</span>
                  </div>
                  <p className="text-sm">Every {plant.wateringFrequency} days</p>
                  <p className="text-xs mt-1 text-[#4CAF50]">
                    {getWaterStatusText(plant.lastWatered, plant.wateringFrequency)}
                  </p>
                </div>
                <div className="bg-[#FF9800] bg-opacity-10 p-3 rounded-lg">
                  <div className="flex items-center mb-1">
                    <SunIcon className="h-4 w-4 text-[#FF9800] mr-1" />
                    <span className="text-sm font-semibold">Light</span>
                  </div>
                  <p className="text-sm">{plant.lightNeeds}</p>
                </div>
              </div>
              
              {plant.notes && (
                <div className="mt-4">
                  <h4 className="font-semibold mb-1">Notes</h4>
                  <p className="text-sm text-[#2C3E50]">{plant.notes}</p>
                </div>
              )}
            </div>
            
            <DialogFooter className="flex flex-col sm:flex-row gap-2">
              <Button 
                variant="secondary" 
                className="w-full sm:w-auto"
                onClick={handleWaterNow}
              >
                <DropIcon className="h-4 w-4 mr-1" /> Water Now
              </Button>
              <Button
                variant="outline"
                className="w-full sm:w-auto"
                onClick={handleShareProgress}
              >
                <ShareIcon className="h-4 w-4 mr-1" /> Share Progress
              </Button>
              <Button 
                variant="outline" 
                className="w-full sm:w-auto"
                onClick={() => setIsEditing(true)}
              >
                Edit Plant
              </Button>
              <Button 
                variant="destructive" 
                className="w-full sm:w-auto"
                onClick={() => setIsDeleting(true)}
              >
                Delete
              </Button>
            </DialogFooter>
            
            {/* Share Progress Dialog */}
            <ShareProgressDialog 
              plant={plant}
              activities={activities}
              open={isShareDialogOpen}
              onOpenChange={setIsShareDialogOpen}
            />
            
            {/* Delete Confirmation */}
            {isDeleting && (
              <div className="bg-[#F44336] bg-opacity-10 p-4 rounded-lg mt-4">
                <h4 className="font-semibold text-[#F44336] mb-2">Confirm Deletion</h4>
                <p className="text-sm mb-3">
                  Are you sure you want to delete {plant.name}? This action cannot be undone.
                </p>
                <div className="flex justify-end space-x-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setIsDeleting(false)}
                  >
                    Cancel
                  </Button>
                  <Button 
                    variant="destructive" 
                    size="sm"
                    onClick={handleDeletePlant}
                  >
                    Delete
                  </Button>
                </div>
              </div>
            )}
          </>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle className="text-xl font-bold text-[#2C3E50] font-nunito">
                Edit Plant
              </DialogTitle>
              <Button 
                variant="ghost" 
                size="icon"
                className="absolute right-4 top-4"
                onClick={() => setIsEditing(false)}
              >
                <CloseIcon className="h-4 w-4" />
              </Button>
            </DialogHeader>
            
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="imageUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Plant Photo URL</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Image URL" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Plant Name</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="e.g., Monstera Deliciosa" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="species"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Species (Optional)</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="e.g., Monstera Deliciosa" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="location"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Location</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="e.g., Living Room" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="wateringFrequency"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Watering Schedule</FormLabel>
                      <Select 
                        onValueChange={(value) => field.onChange(parseInt(value))}
                        defaultValue={field.value.toString()}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select frequency" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="1">Every day</SelectItem>
                          <SelectItem value="3">Every 3 days</SelectItem>
                          <SelectItem value="5">Every 5 days</SelectItem>
                          <SelectItem value="7">Every week</SelectItem>
                          <SelectItem value="14">Every 2 weeks</SelectItem>
                          <SelectItem value="30">Monthly</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="lightNeeds"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Light Requirements</FormLabel>
                      <Select 
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select light needs" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Low light">Low light</SelectItem>
                          <SelectItem value="Indirect light">Indirect light</SelectItem>
                          <SelectItem value="Bright indirect">Bright indirect</SelectItem>
                          <SelectItem value="Direct sunlight">Direct sunlight</SelectItem>
                          <SelectItem value="Partial shade">Partial shade</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="notes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Notes (Optional)</FormLabel>
                      <FormControl>
                        <Textarea 
                          {...field} 
                          placeholder="Any special care instructions..." 
                          rows={3}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <DialogFooter className="mt-6 flex justify-end space-x-3">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setIsEditing(false)}
                  >
                    Cancel
                  </Button>
                  <Button type="submit">Save Changes</Button>
                </DialogFooter>
              </form>
            </Form>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default PlantDetailsDialog;
