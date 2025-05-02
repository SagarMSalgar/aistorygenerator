# DayToCartoon - AI-Powered Personal Story Animation

DayToCartoon is an innovative platform that transforms your daily experiences into engaging animated cartoons. Using a multi-agent AI system, it converts your personal narrative into a complete animated story with characters, dialogue, scenes, and music that match your day's activities and emotions.

## 🌟 Key Features

- **AI-Driven Storytelling**: Transforms simple day descriptions into structured cartoon scripts
- **Dynamic Character Generation**: Creates cartoon characters with personalities that match your story
- **Contextual Dialogue Creation**: Generates natural conversation between characters based on events
- **Scene Visualization**: Produces cartoon scenes representing key moments from your day
- **Mood-Based Music Selection**: Chooses background music that fits the emotional tone of your story
- **Animated Playback**: Presents your cartoon as an interactive slideshow with player controls

## 🧠 How It Works

The system employs a multi-agent architecture where specialized AI components work together:

1. **Script Agent**: Analyzes your day description to create a structured cartoon script with scenes
2. **Character Agent**: Extracts personalities from the script to design appropriate characters
3. **Dialogue Agent**: Creates contextual conversations that match the scene content and mood
4. **Visual Agent**: Generates cartoon scenes for each key moment in the script
5. **Music Agent**: Selects background music based on story mood analysis
6. **Video Agent**: Compiles all elements into a JSON-based animated slideshow

## 🛠️ Technology Stack

- **Frontend**: React with TailwindCSS and Shadcn/UI components
- **Backend**: Node.js with Express
- **Database**: PostgreSQL with Drizzle ORM
- **AI Integration**: Hugging Face API for text generation and analysis
- **Image Generation**: Stability AI API for character and scene visualization
- **Architecture**: React Query for data fetching, context API for state management

## 🔧 System Architecture

```
┌─────────────────┐          ┌─────────────────┐
│                 │          │                 │
│  User Interface │◄────────►│  Express API    │
│  (React)        │          │  (Node.js)      │
│                 │          │                 │
└─────────────────┘          └────────┬────────┘
                                     │
                                     ▼
┌─────────────────┐          ┌─────────────────┐
│                 │          │                 │
│  AI Agents      │◄────────►│  PostgreSQL     │
│  (Specialized)  │          │  Database       │
│                 │          │                 │
└─────────────────┘          └─────────────────┘
```

## 🚀 Getting Started

### Prerequisites

- Node.js (v16+)
- PostgreSQL database
- Hugging Face API key
- Stability AI API key (optional, for enhanced image generation)

### Installation

1. Clone the repository
```bash
git clone https://github.com/yourusername/day-to-cartoon.git
```

2. Install dependencies
```bash
npm install
```

3. Set up environment variables (create a `.env` file)
```
DATABASE_URL=postgresql://user:password@localhost:5432/daytocartoon
GEMINI_API_KEY=your_gemini_api_key
STABILITY_API_KEY=your_stability_api_key
```

4. Initialize the database
```bash
npm run db:push
npm run db:seed
```

5. Start the development server
```bash
npm run dev
```

## 📱 Usage

1. Enter a detailed description of your day, including activities, people you met, and emotions you felt
2. The system analyzes your description and generates a script that captures key moments
3. Characters are designed based on personalities detected in your story
4. Dialogue is created to match the scenes and character types
5. Visual scenes are generated for each part of the story
6. Background music is selected based on the overall mood
7. The final cartoon is presented as an interactive slideshow that you can navigate

## 🧩 Extended Features

- **Fallback Systems**: Ensures content generation even when external APIs are unavailable
- **Scene Navigation**: Forward/backward controls and auto-play for the animated slideshow
- **Dialogue Synchronization**: Displays character dialogue matched to each scene
- **Mood Analysis**: Detects emotional tone from text to select appropriate music
- **Dynamic Character Personalities**: Characters reflect the context and relationships in your story


## 🙏 Acknowledgments

- Built with [React](https://reactjs.org/)
- UI components from [shadcn/ui](https://ui.shadcn.com/)
- Styling with [TailwindCSS](https://tailwindcss.com/)
- AI image generation from [Stability AI](https://stability.ai/)
- Text generation via Gemini
- Royalty-free music from [Pixabay](https://pixabay.com/)
