# Prompt Engineer Pro

An advanced AI-powered prompt engineering tool that helps you transform simple text ideas into powerful, detailed prompts for AI systems. This application allows users to save, edit, and manage their prompts in a personal library.

## Features

- **AI-Powered Prompt Engineering**: Transform basic ideas into structured, detailed prompts
- **Prompt Library**: Save and organize your prompts for future use
- **User Authentication**: Secure login and registration system
- **Copy & Save**: Easily copy and save generated prompts
- **Edit & Delete**: Manage your saved prompts with full CRUD functionality
- **Responsive Design**: Beautiful, modern UI that works on all devices

## Tech Stack

- React (Frontend Framework)
- TailwindCSS (Styling)
- Framer Motion (Animations)
- Supabase (Authentication & Database)
- OpenRouter API (AI Processing)

## Getting Started

### Prerequisites

- Node.js (v14.0.0 or higher)
- npm or yarn

### Installation

1. Clone the repository:
   ```
   git clone https://github.com/itsZayan/prompt_engineer
   cd prompt-engineer-pro
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Create a `.env` file in the root directory with your API keys:
   ```
   REACT_APP_SUPABASE_URL=your_supabase_url
   REACT_APP_SUPABASE_ANON_KEY=your_supabase_anon_key
   REACT_APP_OPENROUTER_API_KEY=your_openrouter_api_key
   ```

4. Start the development server:
   ```
   npm start
   ```

5. Open [http://localhost:3000](http://localhost:3000) to view the app in your browser.

## Supabase Setup

1. Create a new Supabase project
2. Set up the following table:

```sql
CREATE TABLE prompts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users NOT NULL,
  original_text TEXT NOT NULL,
  enhanced_prompt TEXT NOT NULL,
  prompt_type TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE prompts ENABLE ROW LEVEL SECURITY;

-- Create policy for users to only access their own prompts
CREATE POLICY "Users can only access their own prompts" 
  ON prompts 
  FOR ALL 
  USING (auth.uid() = user_id);
```

## Building for Production

To build the app for production, run:

```
npm run build
```

The optimized build will be available in the `build` folder.

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- OpenRouter API for providing the AI backend
- Supabase for authentication and database services 
