const OPENROUTER_API_KEY = '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';
const SITE_URL = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000';
const SITE_NAME = 'Prompt Engineer Pro';

// Test function to check API connectivity with a simple request
export const testApiConnection = async () => {
  try {
    console.log("Testing API connection...");
    
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
        "HTTP-Referer": SITE_URL,
        "X-Title": SITE_NAME,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        "model": "deepseek/deepseek-chat-v3-0324:free",
        "messages": [
          {
            "role": "user",
            "content": "Hi, this is a test message. Please respond with 'API is working'."
          }
        ]
      })
    });
    
    const responseText = await response.text();
    
    if (!response.ok) {
      console.error("API Test Failed:", responseText);
      return {
        success: false,
        status: response.status,
        message: `API test failed with status ${response.status}: ${responseText}`
      };
    }
    
    // Try to parse the response
    try {
      const data = JSON.parse(responseText);
      return {
        success: true,
        message: "API connection successful",
        response: data
      };
    } catch (e) {
      return {
        success: false,
        message: "API responded but returned invalid JSON",
        response: responseText
      };
    }
  } catch (error) {
    console.error("API Connection Test Error:", error);
    return {
      success: false,
      message: `Connection error: ${error.message}`,
      error
    };
  }
};

export const generatePromptResult = async (prompt, promptType = 'general') => {
  try {
    console.log("Sending request to OpenRouter API with new key and model...");
    
    // Enhanced system prompt that provides more detailed instructions based on prompt type
    let systemPrompt = "You are a highly skilled prompt engineer. Your job is to take user inputs and transform them into effective, well-structured prompts for AI systems. Provide clear, detailed, and enhanced versions of user requests.";
    
    // Add specific instructions for UI/UX improvements
    if (prompt.toLowerCase().includes("ui") || 
        prompt.toLowerCase().includes("ux") || 
        prompt.toLowerCase().includes("user interface") || 
        prompt.toLowerCase().includes("design")) {
      systemPrompt += `
Your specialty is crafting detailed UI/UX improvement prompts.

When generating UI/UX prompts, always include:
1. Clear analysis of current UI issues
2. Detailed recommendations structured by component (navigation, forms, layout, etc.)
3. Specific color schemes with hex codes
4. Typography suggestions with font pairings
5. Accessibility considerations
6. Responsive design recommendations
7. User journey/flow improvements
8. Visual hierarchy enhancements
9. Interactive element design (buttons, forms, etc.)
10. Micro-interactions and animation suggestions

Include this standard UI evaluation criteria in all UI/UX prompts:
"The Current User interface is basic, not user-friendly and has a poor combination.
It needs more significant improvements to make it more professional, engaging, and visually appealing.
Please enhance the UI/UX across all the screens with a more attractive design, using a well-thought-out
colour scheme, that is both professional and visually striking. The goal is to create a user-friendly interface 
that is both aesthetically pleasing and functional."

Format your UI/UX prompts with clear headers, bullet points, and numbered lists for readability.`;
    }
    
    // Add specific instructions for app development requests
    if (prompt.toLowerCase().includes("app") || 
        prompt.toLowerCase().includes("application") || 
        prompt.toLowerCase().includes("mobile") || 
        prompt.toLowerCase().includes("development")) {
      systemPrompt += `
When generating app development prompts, always include:
1. Tech stack recommendations (frameworks, libraries)
2. Architecture suggestions
3. Feature prioritization
4. Development roadmap
5. Potential challenges and solutions
6. Performance considerations
7. Security best practices
8. Testing approaches
9. Deployment strategies
10. Maintenance considerations

Format app development prompts with clear technical specifications, code examples where relevant, and implementation guidelines.`;
    }
    
    // Add specific instructions for web development
    if (prompt.toLowerCase().includes("web") || 
        prompt.toLowerCase().includes("website") || 
        prompt.toLowerCase().includes("frontend") || 
        prompt.toLowerCase().includes("backend")) {
      systemPrompt += `
When generating web development prompts, always include:
1. Frontend tech stack options (framework recommendations)
2. Backend architecture suggestions
3. Database considerations
4. API design principles
5. Responsive design guidelines
6. Performance optimization strategies
7. SEO considerations
8. Accessibility requirements (WCAG guidelines)
9. Security best practices
10. Hosting and deployment options

Format web development prompts with technical specifications, structured development approaches, and prioritized implementation steps.`;
    }
    
    // Final formatting instructions
    systemPrompt += `
Always create prompts that are immediately usable, comprehensive, and structured with:
- Clear sections with headers
- Numbered lists for steps/instructions
- Bullet points for options/considerations
- Specific examples that illustrate key points
- Priority indicators for implementation order
- Success criteria for evaluation

Make your prompts detailed enough that anyone could use them without needing additional clarification.`;
    
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
        "HTTP-Referer": SITE_URL,
        "X-Title": SITE_NAME,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        "model": "deepseek/deepseek-chat-v3-0324:free",
        "messages": [
          {
            "role": "system",
            "content": systemPrompt
          },
          {
            "role": "user",
            "content": prompt
          }
        ]
      })
    });

    // Log the request details for debugging
    console.log("Request made to:", "https://openrouter.ai/api/v1/chat/completions");
    console.log("With model:", "deepseek/deepseek-chat-v3-0324:free");
    
    // Get the full response text to help with debugging
    const responseText = await response.text();
    
    if (!response.ok) {
      console.error("API Error Response:", responseText);
      console.error("Status:", response.status);
      console.error("Status Text:", response.statusText);
      throw new Error(`API request failed: ${response.status} - ${responseText}`);
    }
    
    console.log("Response received:", responseText);
    
    // Parse the response text as JSON
    let data;
    try {
      data = JSON.parse(responseText);
    } catch (e) {
      console.error("Failed to parse response as JSON:", responseText);
      throw new Error("Invalid JSON response from API");
    }
    
    if (!data.choices || !data.choices[0] || !data.choices[0].message || !data.choices[0].message.content) {
      console.error("Unexpected API response structure:", data);
      throw new Error("Unexpected response format from API");
    }
    
    console.log("Successfully received response from OpenRouter API");
    return data.choices[0].message.content;
  } catch (error) {
    console.error("Error generating prompt result:", error);
    throw error;
  }
}; 