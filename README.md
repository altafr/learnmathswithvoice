# ElevenLabs Voice Agent Demo

An interactive voice agent demo using ElevenLabs AI, featuring a dynamic p5.js visualization that responds to the agent's speech.

## Features

- Real-time voice interaction with ElevenLabs AI agent
- Dynamic sphere visualization that responds to speech
- Smooth color transitions and animations
- Simple and elegant user interface

## Technologies Used

- ElevenLabs Voice AI SDK
- p5.js for visualization
- Vite for development and building
- Modern JavaScript (ES6+)

## Getting Started

1. Clone the repository:
```bash
git clone [your-repo-url]
cd elevenlabs-demo
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
# Copy the example environment file
cp .env.example .env

# Edit .env and add your ElevenLabs agent ID
VITE_ELEVENLABS_AGENT_ID=your_agent_id_here
```

4. Start the development server:
```bash
npm start
```

5. Open your browser and navigate to `http://localhost:5173`

## Usage

1. Click the "Start Conversation" button to begin
2. Speak with the AI agent
3. Watch the visualization respond to the conversation
4. Click "End Conversation" when finished

## Development

This project uses Vite for development. The main files are:
- `index.html`: Main HTML file
- `main.js`: Core application logic and p5.js visualization
- `package.json`: Project dependencies and scripts

## License

MIT
