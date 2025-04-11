import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import PlantCard from "@/components/plants/PlantCard";
import AddPlantDialog from "@/components/plants/AddPlantDialog";
import PlantDetailsDialog from "@/components/plants/PlantDetailsDialog";
import { PlusIcon, SearchIcon } from "@/utils/icons";
import { Plant } from "@shared/schema";

const Plants = () => {
  const [filterValue, setFilterValue] = useState("all");
  const [searchValue, setSearchValue] = useState("");
  const [addPlantOpen, setAddPlantOpen] = useState(false);
  const [selectedPlant, setSelectedPlant] = useState<Plant | null>(null);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  
  // Fetch plants data
  const { data: plants = [], isLoading } = useQuery<Plant[]>({
    queryKey: ["/api/plants"],
  });
  
  // Filter plants based on filter and search
  const filteredPlants = plants.filter(plant => {
    // Filter by search term
    const matchesSearch = plant.name.toLowerCase().includes(searchValue.toLowerCase()) ||
      (plant.species && plant.species.toLowerCase().includes(searchValue.toLowerCase())) ||
      plant.location.toLowerCase().includes(searchValue.toLowerCase());
    
    // Apply additional filters
    if (filterValue === "needs-water" && matchesSearch) {
      if (!plant.lastWatered) return true;
      const lastWatered = new Date(plant.lastWatered);
      const today = new Date();
      const daysSinceLastWatered = Math.floor((today.getTime() - lastWatered.getTime()) / (1000 * 60 * 60 * 24));
      return daysSinceLastWatered >= plant.wateringFrequency;
    }
    
    if (filterValue === "recently-added" && matchesSearch) {
      // Assuming last 5 plants are recently added (since we don't have createdAt field)
      return plants.indexOf(plant) < 5;
    }
    
    if (filterValue === "alphabetical" && matchesSearch) {
      return true; // We'll sort alphabetically later
    }
    
    return filterValue === "all" && matchesSearch;
  });
  
  // Sort plants if needed
  if (filterValue === "alphabetical") {
    filteredPlants.sort((a, b) => a.name.localeCompare(b.name));
  }
  
  const handleOpenPlantDetails = (plant: Plant) => {
    setSelectedPlant(plant);
    setDetailsDialogOpen(true);
  };
  
  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-[#2C3E50] font-nunito">My Plants</h2>
          <p className="text-[#2C3E50] opacity-70">Manage your plant collection</p>
        </div>
        <Button 
          className="bg-[#4CAF50] text-white font-nunito"
          onClick={() => setAddPlantOpen(true)}
        >
          <PlusIcon className="h-4 w-4 mr-1" /> Add Plant
        </Button>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-grow">
          <Input 
            type="text" 
            placeholder="Search plants..." 
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            className="w-full pr-10"
          />
          <SearchIcon className="absolute right-3 top-2.5 h-5 w-5 text-gray-400" />
        </div>
        <Select 
          value={filterValue} 
          onValueChange={setFilterValue}
        >
          <SelectTrigger className="w-full sm:w-auto min-w-[150px]">
            <SelectValue placeholder="All plants" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All plants</SelectItem>
            <SelectItem value="needs-water">Needs water</SelectItem>
            <SelectItem value="recently-added">Recently added</SelectItem>
            <SelectItem value="alphabetical">Alphabetical</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Plant Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-white rounded-lg h-72 animate-pulse" />
          ))}
        </div>
      ) : filteredPlants.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPlants.map(plant => (
            <PlantCard 
              key={plant.id} 
              plant={plant} 
              onOpenDetails={handleOpenPlantDetails} 
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-10 bg-white rounded-lg shadow">
          <h3 className="text-lg font-bold text-[#2C3E50] mb-2">No plants found</h3>
          <p className="text-[#2C3E50] opacity-70 mb-4">
            {searchValue 
              ? "Try a different search term" 
              : "Add your first plant to get started"}
          </p>
          <Button 
            onClick={() => setAddPlantOpen(true)} 
            className="bg-[#4CAF50] text-white"
          >
            <PlusIcon className="h-4 w-4 mr-1" /> Add Plant
          </Button>
        </div>
      )}
      
      {/* Add Plant Dialog */}
      <AddPlantDialog open={addPlantOpen} onOpenChange={setAddPlantOpen} />
      
      {/* Plant Details Dialog */}
      {selectedPlant && (
        <PlantDetailsDialog 
          plant={selectedPlant} 
          open={detailsDialogOpen} 
          onOpenChange={setDetailsDialogOpen}
        />
      )}
    </section>
  );
};

export default Plants;
