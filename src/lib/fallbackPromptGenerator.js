/**
 * A fallback prompt generator that works offline when the API is unavailable
 * This provides basic prompt enhancement without relying on external services
 */

export const generateFallbackPrompt = (userInput, promptType) => {
  // Clean up the user input
  const cleanInput = userInput.trim();
  const lowerInput = cleanInput.toLowerCase();
  
  // Detect if this is a UI/UX request
  const isUIUXRequest = lowerInput.includes("ui") || 
                        lowerInput.includes("ux") || 
                        lowerInput.includes("user interface") || 
                        lowerInput.includes("design");
  
  // Detect if this is an app development request
  const isAppRequest = lowerInput.includes("app") || 
                       lowerInput.includes("application") || 
                       lowerInput.includes("mobile") || 
                       lowerInput.includes("development");
  
  // Detect if this is a web development request
  const isWebRequest = lowerInput.includes("web") || 
                       lowerInput.includes("website") || 
                       lowerInput.includes("frontend") || 
                       lowerInput.includes("backend");
  
  // Generate specialized template for UI/UX requests
  if (isUIUXRequest) {
    return generateUIUXPrompt(cleanInput);
  }
  
  // Generate specialized template for app development requests
  if (isAppRequest) {
    return generateAppDevelopmentPrompt(cleanInput);
  }
  
  // Generate specialized template for web development requests
  if (isWebRequest) {
    return generateWebDevelopmentPrompt(cleanInput);
  }
  
  // Basic structure for different prompt types
  const typeSpecificInstructions = {
    general: "Please provide a detailed response with clear explanations and examples where relevant.",
    creative: "Create a vivid, imaginative response with rich details, engaging narrative, and unique elements.",
    technical: "Provide a precise, structured response with technical accuracy, clear steps, and relevant specifications.",
    marketing: "Craft a persuasive, engaging response that highlights benefits, appeals to the target audience, and includes a clear call-to-action.",
    educational: "Deliver a clear, informative explanation suitable for learning, with concepts broken down step-by-step and examples to aid understanding."
  };

  // Get the correct instruction for the prompt type
  const instruction = typeSpecificInstructions[promptType] || typeSpecificInstructions.general;
  
  // Create structured sections
  const context = `Context: Based on the request for ${promptType} content about "${cleanInput}".`;
  const task = `Task: Generate ${promptType} content that thoroughly addresses this topic.`;
  const requirements = "Requirements:";
  const bulletPoints = [
    "Be comprehensive and detailed in addressing all aspects of the topic",
    "Maintain a clear, logical structure throughout the response",
    "Use appropriate tone and language for the intended purpose",
    `Include specific examples or illustrations where helpful`,
    "Avoid vague statements; be specific and actionable"
  ];
  
  // Add type-specific bullet points
  if (promptType === 'creative') {
    bulletPoints.push("Use vivid descriptive language and imagery");
    bulletPoints.push("Develop interesting characters or concepts");
  } else if (promptType === 'technical') {
    bulletPoints.push("Include precise technical specifications or parameters");
    bulletPoints.push("Provide step-by-step instructions where applicable");
  } else if (promptType === 'marketing') {
    bulletPoints.push("Highlight unique value propositions and benefits");
    bulletPoints.push("Include persuasive language and emotional appeals");
  } else if (promptType === 'educational') {
    bulletPoints.push("Explain concepts in a way appropriate for the target learning level");
    bulletPoints.push("Build from foundational to more complex ideas");
  }
  
  // Format bullet points
  const formattedBulletPoints = bulletPoints.map(point => `• ${point}`).join("\n");
  
  // Build the final prompt
  const enhancedPrompt = `
${context}

${task}

${requirements}
${formattedBulletPoints}

Specific instructions: ${instruction}

Topic: "${cleanInput}"

Please produce a high-quality, comprehensive response that fully satisfies these requirements.
`.trim();

  return enhancedPrompt;
};

/**
 * Generate a specialized UI/UX improvement prompt template
 */
const generateUIUXPrompt = (userInput) => {
  return `
# UI/UX IMPROVEMENT PROMPT

## CURRENT SITUATION ANALYSIS
The Current User interface is basic, not user-friendly and has a poor combination.
It needs more significant improvements to make it more professional, engaging, and visually appealing.
Please enhance the UI/UX across all the screens with a more attractive design, using a well-thought-out
colour scheme, that is both professional and visually striking. The goal is to create a user-friendly interface 
that is both aesthetically pleasing and functional.

## USER REQUEST
"${userInput}"

## REQUIRED IMPROVEMENTS

### 1. Visual Design Enhancements
* Create a cohesive color scheme with the following specifications:
  - Primary color (for key elements and branding)
  - Secondary color (for accents and highlights)
  - Background colors (for different sections/levels)
  - Text colors (ensuring readability and contrast)
  - Provide specific hex codes for all color recommendations
* Typography improvements:
  - Recommend header font family
  - Recommend body text font family
  - Specify font sizes for different text elements
  - Define line spacing and text alignment guidelines

### 2. Layout and Structure
* Navigation system redesign:
  - Menu organization and hierarchy
  - Navigation patterns and interactions
  - Mobile navigation considerations
* Content organization:
  - Information hierarchy recommendations
  - Content grouping strategies
  - White space utilization
  - Grid system recommendations

### 3. Interactive Elements
* Button and control design:
  - Style specifications for primary, secondary, and tertiary buttons
  - State changes (hover, active, disabled)
  - Size and placement guidelines
* Form elements:
  - Input field styling
  - Dropdown and selection controls
  - Error states and validation feedback
  - Form layout recommendations

### 4. User Experience Enhancements
* Micro-interactions:
  - Transition and animation recommendations
  - Feedback mechanisms
  - Loading states and indicators
* Accessibility improvements:
  - Color contrast requirements
  - Screen reader compatibility considerations
  - Keyboard navigation enhancements
  - Touch target sizing for mobile

### 5. Responsive Design Guidelines
* Breakpoint recommendations
* Content adaptation strategies for different screen sizes
* Mobile-specific UI considerations
* Touch interaction guidelines

## IMPLEMENTATION PRIORITY
1. High priority (implement immediately)
2. Medium priority (implement after high priority items)
3. Nice-to-have (implement as resources allow)

## SUCCESS CRITERIA
* Improved user engagement metrics
* Reduced bounce rate
* Increased time on page
* Higher conversion rates
* Positive user feedback

Please provide a comprehensive response addressing all these areas with specific, actionable recommendations that can be implemented immediately.
`.trim();
};

/**
 * Generate a specialized app development prompt template
 */
const generateAppDevelopmentPrompt = (userInput) => {
  return `
# APP DEVELOPMENT PROMPT

## PROJECT OVERVIEW
"${userInput}"

## TECHNICAL REQUIREMENTS

### 1. Tech Stack Recommendations
* Frontend framework options:
  - Option 1: [Framework] + rationale
  - Option 2: [Framework] + rationale
* Backend technology options:
  - Option 1: [Technology] + rationale
  - Option 2: [Technology] + rationale
* Database recommendations:
  - Option 1: [Database] + rationale
  - Option 2: [Database] + rationale
* Additional libraries and tools:
  - UI component libraries
  - State management solutions
  - Testing frameworks
  - Development tools

### 2. Architecture Specifications
* Application architecture pattern:
  - Recommended pattern (MVC, MVVM, Clean Architecture, etc.)
  - Component structure
  - Data flow diagram
* API design:
  - API architecture (REST, GraphQL, etc.)
  - Endpoint structure
  - Authentication mechanism
* Data modeling:
  - Key entities and relationships
  - Database schema recommendations

### 3. Feature Prioritization
* Core features (MVP):
  - [Feature 1] - Implementation details
  - [Feature 2] - Implementation details
  - [Feature 3] - Implementation details
* Secondary features:
  - [Feature 4] - Implementation details
  - [Feature 5] - Implementation details
* Future enhancements:
  - [Feature 6] - Implementation details
  - [Feature 7] - Implementation details

### 4. Development Roadmap
* Phase 1 (Foundation):
  - Setup development environment
  - Implement core architecture
  - Develop basic UI framework
* Phase 2 (Core functionality):
  - Implement authentication system
  - Develop primary features
  - Setup basic API integrations
* Phase 3 (Enhancement and polish):
  - Add secondary features
  - Implement advanced integrations
  - Optimize performance
  - Conduct testing

### 5. Implementation Considerations
* Performance optimization strategies
* Security best practices
* Scalability considerations
* Offline functionality requirements
* Testing approach:
  - Unit testing strategy
  - Integration testing requirements
  - UI/UX testing plan

## DEPLOYMENT STRATEGY
* Recommended deployment platforms
* CI/CD pipeline suggestions
* Release strategy (phased rollout, beta testing, etc.)
* App store optimization guidelines (if applicable)

## MAINTENANCE CONSIDERATIONS
* Monitoring and analytics integration
* Update and versioning strategy
* User feedback collection mechanisms
* Performance monitoring requirements

Please provide a comprehensive development plan addressing these areas with specific, actionable recommendations that can guide the entire development process.
`.trim();
};

/**
 * Generate a specialized web development prompt template
 */
const generateWebDevelopmentPrompt = (userInput) => {
  return `
# WEB DEVELOPMENT PROMPT

## PROJECT OVERVIEW
"${userInput}"

## TECHNICAL SPECIFICATIONS

### 1. Frontend Development
* Recommended frameworks/libraries:
  - Option 1: [Framework] + rationale
  - Option 2: [Framework] + rationale
* Component architecture:
  - Component hierarchy
  - State management approach
  - Routing strategy
* Responsive design specifications:
  - Breakpoint recommendations
  - Mobile-first vs. desktop-first approach
  - Fluid vs. fixed layouts

### 2. Backend Development
* Server-side technology options:
  - Option 1: [Technology] + rationale
  - Option 2: [Technology] + rationale
* API architecture:
  - REST vs. GraphQL considerations
  - Endpoint structure
  - Authentication and authorization
* Data persistence:
  - Database recommendations
  - ORM/data access layer approach
  - Caching strategy

### 3. DevOps and Infrastructure
* Hosting options:
  - Recommended providers
  - Serverless vs. traditional hosting
  - Containerization approach
* Deployment pipeline:
  - CI/CD recommendations
  - Build process
  - Testing automation
* Monitoring and maintenance:
  - Analytics integration
  - Error tracking
  - Performance monitoring

### 4. Performance Optimization
* Core Web Vitals optimization:
  - LCP (Largest Contentful Paint) strategies
  - FID (First Input Delay) optimization
  - CLS (Cumulative Layout Shift) prevention
* Asset optimization:
  - Image optimization approach
  - Code splitting and bundling
  - Lazy loading implementation
* Caching strategy:
  - Browser caching
  - CDN implementation
  - Service worker considerations

### 5. SEO and Accessibility
* SEO requirements:
  - Metadata implementation
  - Structured data/schema
  - URL structure
* Accessibility compliance:
  - WCAG level recommendations
  - Semantic HTML structure
  - Keyboard navigation support
  - Screen reader compatibility

## IMPLEMENTATION ROADMAP
* Phase 1 (Foundation):
  - Project setup and architecture
  - Core UI components
  - Basic backend structure
* Phase 2 (Feature Development):
  - Implement authentication
  - Develop primary features
  - Setup API integrations
* Phase 3 (Refinement):
  - Performance optimization
  - SEO implementation
  - Accessibility enhancements
* Phase 4 (Launch Preparation):
  - Testing and QA
  - Documentation
  - Deployment preparation

## BEST PRACTICES AND CODING STANDARDS
* Code organization guidelines
* Naming conventions
* Documentation requirements
* Testing strategy:
  - Unit testing approach
  - Integration testing requirements
  - E2E testing plan

Please provide a comprehensive web development plan addressing these areas with specific, actionable recommendations that can guide the entire development process.
`.trim();
}; 