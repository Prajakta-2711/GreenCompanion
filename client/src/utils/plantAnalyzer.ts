import Anthropic from '@anthropic-ai/sdk';
import { apiRequest } from '@/lib/queryClient';

// Fetch API key from server
async function getAnthropicClient() {
  try {
    const response = await apiRequest<{ apiKey: string }>('/api/anthropic-key');
    // the newest Anthropic model is "claude-3-7-sonnet-20250219" which was released February 24, 2025
    return new Anthropic({
      apiKey: response.apiKey,
      dangerouslyAllowBrowser: true, // Enable browser usage
    });
  } catch (error) {
    console.error('Failed to get Anthropic API key:', error);
    throw new Error('Failed to initialize Anthropic client: API key not available');
  }
}

export async function analyzePlantImage(base64Image: string): Promise<{ 
  plantIdentification: string;
  healthAssessment: string;
  careAdvice: string;
  possibleIssues: Array<{issue: string, solution: string}>;
}> {
  try {
    // Get Anthropic client with API key from server
    const anthropic = await getAnthropicClient();
    
    const response = await anthropic.messages.create({
      model: "claude-3-7-sonnet-20250219",
      max_tokens: 1024,
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: "You are a plant health expert. Analyze this plant image and provide the following information in a structured response:\n\n" +
                    "1. Plant identification (name and species if possible)\n" +
                    "2. Current health assessment\n" +
                    "3. Care advice for this specific plant\n" +
                    "4. Identification of any visible issues (diseases, pests, nutrient deficiencies) with specific solutions\n\n" +
                    "Format your response as JSON with these keys: plantIdentification, healthAssessment, careAdvice, and possibleIssues (array of objects with issue and solution keys)"
            },
            {
              type: "image",
              source: {
                type: "base64",
                media_type: "image/jpeg", 
                data: base64Image
              }
            }
          ]
        }
      ]
    });

    // Parse the text response as JSON
    try {
      const firstContent = response.content[0] as any; // Cast to any to bypass TS checks
      const responseText = firstContent.text || ''; // Safely access text property
      const jsonStartIndex = responseText.indexOf('{');
      const jsonEndIndex = responseText.lastIndexOf('}');
      
      if (jsonStartIndex === -1 || jsonEndIndex === -1) {
        throw new Error("Could not extract JSON from response");
      }
      
      const jsonStr = responseText.substring(jsonStartIndex, jsonEndIndex + 1);
      return JSON.parse(jsonStr);
    } catch (parseError) {
      console.error("Error parsing JSON from Claude response:", parseError);
      // Provide a fallback structured response
      return {
        plantIdentification: "Could not identify plant",
        healthAssessment: "Unable to assess health from image",
        careAdvice: "Please provide a clearer image for better analysis",
        possibleIssues: [{
          issue: "Analysis error",
          solution: "Please try again with a different image"
        }]
      };
    }
  } catch (error) {
    console.error("Error analyzing plant image with Claude:", error);
    throw error;
  }
}