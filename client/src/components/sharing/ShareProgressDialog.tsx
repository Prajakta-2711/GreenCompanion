import { useState } from "react";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  FaXTwitter, 
  FaFacebook, 
  FaPinterest, 
  FaInstagram, 
  FaLink 
} from "react-icons/fa6";
import { useToast } from "@/hooks/use-toast";
import { Plant, Activity } from "@shared/schema";
import { formatDate, getWaterStatusText } from "@/utils/dateUtils";

interface ShareProgressDialogProps {
  plant: Plant;
  activities: Activity[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const ShareProgressDialog = ({ plant, activities, open, onOpenChange }: ShareProgressDialogProps) => {
  const [activeTab, setActiveTab] = useState("preview");
  const [customMessage, setCustomMessage] = useState("");
  const { toast } = useToast();
  
  // Generate share image URL - this would typically call an API to create a shareable image
  const shareImageUrl = plant.imageUrl || "https://images.unsplash.com/photo-1463554050456-f2ed7d3fec09";
  
  // Generate default share message
  const generateShareMessage = () => {
    const defaultMessage = `Check out my ${plant.name} plant! It's been growing beautifully.`;
    return customMessage || defaultMessage;
  };
  
  // Generate stats for sharing
  const generateStats = () => {
    const wateringActivities = activities.filter(a => a.type === "watering" && a.plantId === plant.id);
    const fertilizerActivities = activities.filter(a => a.type === "fertilizing" && a.plantId === plant.id);
    const pruningActivities = activities.filter(a => a.type === "pruning" && a.plantId === plant.id);
    
    return {
      wateringCount: wateringActivities.length,
      fertilizerCount: fertilizerActivities.length,
      pruningCount: pruningActivities.length,
      daysSincePlanted: 
        // Use timestamp of first activity or default to 30 days
        activities.length > 0 ?
        Math.floor((new Date().getTime() - new Date(activities[0].timestamp).getTime()) / (1000 * 60 * 60 * 24)) : 
        30,
      careActions: activities.filter(a => a.plantId === plant.id).length
    };
  };
  
  const stats = generateStats();
  
  // Share URLs
  const getShareUrl = (platform: string) => {
    const baseUrl = window.location.origin;
    const shareText = encodeURIComponent(generateShareMessage());
    const shareUrl = encodeURIComponent(`${baseUrl}/plant/${plant.id}`);
    const shareTitle = encodeURIComponent(`My ${plant.name} plant progress`);
    
    switch (platform) {
      case 'twitter':
        return `https://twitter.com/intent/tweet?text=${shareText}&url=${shareUrl}`;
      case 'facebook':
        return `https://www.facebook.com/sharer/sharer.php?u=${shareUrl}&quote=${shareText}`;
      case 'pinterest':
        return `https://pinterest.com/pin/create/button/?url=${shareUrl}&media=${encodeURIComponent(shareImageUrl)}&description=${shareText}`;
      default:
        return `${baseUrl}/plant/${plant.id}`;
    }
  };
  
  // Handle share
  const handleShare = (platform: string) => {
    const shareUrl = getShareUrl(platform);
    window.open(shareUrl, '_blank', 'width=600,height=400');
  };
  
  // Copy link to clipboard
  const copyLinkToClipboard = () => {
    const shareUrl = getShareUrl('direct');
    navigator.clipboard.writeText(shareUrl).then(() => {
      toast({
        title: "Link copied!",
        description: "Plant progress link copied to clipboard",
      });
    }).catch(err => {
      console.error('Could not copy text: ', err);
      toast({
        title: "Copy failed",
        description: "Could not copy link to clipboard",
        variant: "destructive",
      });
    });
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md mx-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-[#2C3E50] font-nunito">
            Share Plant Progress
          </DialogTitle>
        </DialogHeader>
        
        <Tabs defaultValue="preview" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="preview">Preview</TabsTrigger>
            <TabsTrigger value="customize">Customize</TabsTrigger>
          </TabsList>
          
          <TabsContent value="preview" className="space-y-4">
            <div className="rounded-md border overflow-hidden">
              <div className="relative">
                <img 
                  src={shareImageUrl} 
                  alt={plant.name} 
                  className="w-full h-40 object-cover" 
                />
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-3 text-white">
                  <h3 className="font-bold">{plant.name}</h3>
                  {plant.species && <p className="text-xs opacity-90">{plant.species}</p>}
                </div>
              </div>
              
              <div className="p-4 bg-white">
                <p className="text-sm mb-3">{generateShareMessage()}</p>
                
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="bg-green-50 rounded p-2">
                    <p className="text-xl font-bold text-green-600">{stats.daysSincePlanted}</p>
                    <p className="text-xs text-gray-600">Days growing</p>
                  </div>
                  <div className="bg-blue-50 rounded p-2">
                    <p className="text-xl font-bold text-blue-600">{stats.wateringCount}</p>
                    <p className="text-xs text-gray-600">Waterings</p>
                  </div>
                  <div className="bg-amber-50 rounded p-2">
                    <p className="text-xl font-bold text-amber-600">{stats.careActions}</p>
                    <p className="text-xs text-gray-600">Care actions</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex justify-center space-x-3">
              <Button 
                variant="outline" 
                className="rounded-full p-3"
                onClick={() => handleShare('twitter')}
              >
                <FaXTwitter className="h-5 w-5" />
              </Button>
              <Button 
                variant="outline" 
                className="rounded-full p-3"
                onClick={() => handleShare('facebook')}
              >
                <FaFacebook className="h-5 w-5 text-[#1877F2]" />
              </Button>
              <Button 
                variant="outline" 
                className="rounded-full p-3"
                onClick={() => handleShare('pinterest')}
              >
                <FaPinterest className="h-5 w-5 text-[#E60023]" />
              </Button>
              <Button 
                variant="outline" 
                className="rounded-full p-3"
                onClick={copyLinkToClipboard}
              >
                <FaLink className="h-5 w-5" />
              </Button>
            </div>
          </TabsContent>
          
          <TabsContent value="customize" className="space-y-4">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  Customize your message
                </label>
                <Textarea
                  placeholder="Share your plant's journey..."
                  value={customMessage}
                  onChange={(e) => setCustomMessage(e.target.value)}
                  className="resize-none h-24"
                />
              </div>
            </div>
            
            <Button
              variant="secondary"
              className="w-full" 
              onClick={() => setActiveTab("preview")}
            >
              Preview
            </Button>
          </TabsContent>
        </Tabs>
        
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ShareProgressDialog;