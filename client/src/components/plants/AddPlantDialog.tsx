import { useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ImageIcon } from "@/utils/icons";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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
import { insertPlantSchema } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";

// Extend the insert plant schema with validation rules
const formSchema = insertPlantSchema.extend({
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

interface AddPlantDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const AddPlantDialog = ({ open, onOpenChange }: AddPlantDialogProps) => {
  const queryClient = useQueryClient();
  
  // Default values for the form
  const defaultValues = {
    name: "",
    species: "",
    location: "",
    wateringFrequency: 7,
    lightNeeds: "Bright indirect",
    notes: "",
    imageUrl: "https://images.unsplash.com/photo-1463554050456-f2ed7d3fec09"
  };
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues,
  });
  
  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    try {
      await apiRequest("/api/plants", { 
        method: "POST",
        data: data 
      });
      queryClient.invalidateQueries({ queryKey: ["/api/plants"] });
      form.reset(defaultValues);
      onOpenChange(false);
    } catch (error) {
      console.error("Error adding plant:", error);
    }
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md mx-auto max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-[#2C3E50] font-nunito">Add New Plant</DialogTitle>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="imageUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Plant Photo</FormLabel>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                    <ImageIcon className="h-10 w-10 mx-auto text-gray-400 mb-2" />
                    <p className="text-sm text-gray-500">Enter image URL below</p>
                    <FormControl>
                      <Input {...field} placeholder="Image URL" className="mt-2" />
                    </FormControl>
                  </div>
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
                    <Input placeholder="e.g., Monstera Deliciosa" {...field} />
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
                    <Input placeholder="e.g., Monstera Deliciosa" {...field} />
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
                    <Input placeholder="e.g., Living Room" {...field} />
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
                      placeholder="Any special care instructions..." 
                      {...field} 
                      rows={3}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <DialogFooter className="mt-6 flex justify-end space-x-3">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit">Add Plant</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default AddPlantDialog;
