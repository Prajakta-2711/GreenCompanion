import { useState, useRef, ChangeEvent } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ImageIcon, DropIcon, LeafIcon, CheckCircleIcon } from "@/utils/icons";
import { analyzePlantImage } from "@/utils/plantAnalyzer";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";

const PlantScanner = () => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [analysisResult, setAnalysisResult] = useState<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleImageUpload = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Check if file is an image
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Invalid file type",
        description: "Please upload an image file (JPG, PNG, etc.)",
        variant: "destructive",
      });
      return;
    }

    // Check file size (limit to 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Please upload an image smaller than 5MB",
        variant: "destructive",
      });
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const base64String = e.target?.result as string;
      // Remove the data URL prefix (e.g., "data:image/jpeg;base64,")
      const base64Data = base64String.split(',')[1];
      setUploadedImage(base64String);
      setAnalysisResult(null);
    };
    reader.readAsDataURL(file);
  };

  const handleAnalyzeClick = async () => {
    if (!uploadedImage) return;
    
    setIsAnalyzing(true);
    try {
      // Extract base64 data from the data URL
      const base64Data = uploadedImage.split(',')[1];
      const result = await analyzePlantImage(base64Data);
      setAnalysisResult(result);
      toast({
        title: "Analysis complete",
        description: "Your plant has been successfully analyzed",
      });
    } catch (error) {
      console.error('Error analyzing plant:', error);
      toast({
        title: "Analysis failed",
        description: "An error occurred while analyzing your plant. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-[#2C3E50] font-nunito">Plant Scanner</h2>
        <p className="text-[#2C3E50] opacity-70">
          Upload a photo of your plant to identify issues and get care recommendations
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Image Upload Section */}
        <Card className="bg-white shadow rounded-lg overflow-hidden p-6">
          <div 
            className={`border-2 border-dashed rounded-lg p-6 text-center ${
              uploadedImage ? 'border-[#4CAF50]' : 'border-gray-300'
            }`}
          >
            {uploadedImage ? (
              <div className="space-y-4">
                <div className="relative w-full max-w-md mx-auto aspect-square overflow-hidden rounded-lg">
                  <img 
                    src={uploadedImage} 
                    alt="Uploaded plant" 
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex justify-center gap-2">
                  <Button 
                    variant="outline" 
                    onClick={triggerFileInput}
                    className="text-sm"
                  >
                    Change Image
                  </Button>
                  <Button 
                    onClick={handleAnalyzeClick}
                    className="bg-[#4CAF50] text-white text-sm"
                    disabled={isAnalyzing}
                  >
                    {isAnalyzing ? 'Analyzing...' : 'Analyze Plant'}
                  </Button>
                </div>
              </div>
            ) : (
              <div className="py-8 space-y-4">
                <div className="bg-gray-100 rounded-full p-4 w-20 h-20 flex items-center justify-center mx-auto">
                  <ImageIcon className="h-10 w-10 text-gray-400" />
                </div>
                <div className="space-y-2">
                  <p className="text-[#2C3E50] font-medium">Upload a plant photo</p>
                  <p className="text-sm text-gray-500">
                    For best results, take a clear photo of the plant with good lighting
                  </p>
                </div>
                <Button 
                  onClick={triggerFileInput} 
                  className="mt-4 bg-[#4CAF50] text-white"
                >
                  Upload Photo
                </Button>
                <input 
                  type="file"
                  ref={fileInputRef}
                  onChange={handleImageUpload}
                  accept="image/*"
                  className="hidden"
                />
              </div>
            )}
          </div>
        </Card>

        {/* Analysis Results Section */}
        <Card className="bg-white shadow rounded-lg overflow-hidden p-6">
          {isAnalyzing ? (
            <div className="h-full flex items-center justify-center">
              <div className="space-y-4 text-center">
                <div className="w-12 h-12 border-4 border-t-[#4CAF50] border-gray-200 rounded-full animate-spin mx-auto"></div>
                <p className="text-[#2C3E50] font-medium">Analyzing your plant...</p>
                <p className="text-sm text-gray-500">This may take a moment</p>
              </div>
            </div>
          ) : analysisResult ? (
            <div className="space-y-6">
              <div>
                <Badge className="bg-[#4CAF50] mb-2">Plant Identified</Badge>
                <h3 className="text-xl font-bold text-[#2C3E50] font-nunito mb-1">
                  {analysisResult.plantIdentification}
                </h3>
                <div className="h-1 w-16 bg-[#4CAF50] rounded-full mb-3"></div>
                <p className="text-[#2C3E50]">{analysisResult.healthAssessment}</p>
              </div>

              <div>
                <h4 className="font-semibold text-[#2C3E50] mb-2 flex items-center">
                  <LeafIcon className="h-4 w-4 text-[#4CAF50] mr-2" />
                  Care Advice
                </h4>
                <p className="text-[#2C3E50] pl-6">{analysisResult.careAdvice}</p>
              </div>

              <div>
                <h4 className="font-semibold text-[#2C3E50] mb-2">Identified Issues & Solutions</h4>
                {analysisResult.possibleIssues.length > 0 ? (
                  <div className="space-y-3">
                    {analysisResult.possibleIssues.map((item: any, index: number) => (
                      <div key={index} className="bg-[#F9FBF9] p-4 rounded-lg">
                        <p className="font-medium text-[#2C3E50] mb-1">{item.issue}</p>
                        <p className="text-sm text-[#2C3E50] opacity-80">{item.solution}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="bg-[#F0F8F0] p-4 rounded-lg flex items-center">
                    <CheckCircleIcon className="h-5 w-5 text-[#4CAF50] mr-2" />
                    <p className="text-[#2C3E50]">No major issues detected</p>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="h-full flex items-center justify-center text-center p-6">
              <div>
                <div className="bg-gray-100 rounded-full p-4 w-20 h-20 flex items-center justify-center mx-auto mb-4">
                  <DropIcon className="h-10 w-10 text-[#4CAF50] opacity-40" />
                </div>
                <h3 className="text-lg font-medium text-[#2C3E50] mb-2">
                  Plant Analysis Results
                </h3>
                <p className="text-sm text-gray-500 mb-4">
                  Upload a photo and click "Analyze Plant" to get detailed information and care advice
                </p>
              </div>
            </div>
          )}
        </Card>
      </div>
    </section>
  );
};

export default PlantScanner;