# Video Generator

An AI-powered video generation tool that creates animated educational videos from text scripts using Claude Code.

## Prerequisites

- **Claude Code CLI** installed and configured. see [Claude Code Quickstart](https://code.claude.com/docs/en/quickstart)

## Quick Start

### 1. Install Dependencies

Run the initialization command in Claude Code:

```
/tools:init
```

This command will automatically:

- install the requirements needed to start generating video
- will direct you to setup the api key and will tell you how.

### 2. API Key Setup (Required)

After installation completes, you need to set up your API key (this will be instructed after the `/tools:init` comand as well):

1. **Get your API key**: Visit [https://production2.outscal.com/v2/get-video-generation-api-key](https://production2.outscal.com/v2/get-video-generation-api-key)
2. **Register or login** to get your API key
3. **Create a `.env` file** in the project root directory (if it doesn't exist)
4. **Add your API key** to the `.env` file:
   ```
   OUTSCAL_API_KEY="your_api_key_here"
   ```
   Replace `your_api_key_here` with the actual API key you received.

### 3. Optional Environment Variables

The following environment variables are **optional** and only needed for specific features:

| Variable | Description | Required |
|----------|-------------|----------|
| `ELEVENLABS_API_KEY` | ElevenLabs API key for text-to-speech | No |
| `ELEVENLABS_VOICE_ID` | Voice ID to use for narration | No |
| `ELEVENLABS_MODEL_ID` | ElevenLabs model ID | No |
| `ELEVENLABS_SPEED` | Speech speed setting | No |
| `ELEVENLABS_STABILITY` | Voice stability setting | No |
| `ELEVENLABS_SIMILARITY` | Voice similarity setting | No |

### 4. Create Your Video

Run the video creation command:

```
/create-video
```

## Video Creation Workflow

When you run `/create-video`, the tool will:

1. **Ask for Video Style** - Choose from available art styles
2. **Ask for Script** - Provide your narration script (max 2000 characters)
3. **Generate Audio** - Convert script to speech using ElevenLabs
4. **Create Direction** - Generate scene-by-scene video direction
5. **Generate Assets** - Create SVG assets for the video
6. **Design Scenes** - Generate detailed design specifications
7. **Video** - Create and deploy video (displays deployed URL)


## Video Art Styles

When creating a video, you'll be asked to choose from three distinct visual styles:

### Pencil
A hand-drawn, sketch-like aesthetic that gives videos a personal, artistic feel. Features rough edges, sketch lines, and a notebook-paper appearance. Great for educational content that wants to feel approachable and informal.

### Infographic
Clean, modern, and professional style with bold colors, geometric shapes, and data visualization elements. Uses flat design principles with clear iconography. Ideal for business presentations, explainer videos, and data-driven content.

### Neon
Vibrant, futuristic style with glowing effects, dark backgrounds, and bright accent colors. Features electric highlights and cyberpunk-inspired visuals. Perfect for tech topics, gaming content, or when you want a high-energy, modern look.

## Commands Reference (FYI)

| Command | Description |
|---------|-------------|
| `/create-video` | Start the full video creation workflow |
| `/tools:init` | Install all project dependencies |
| `/gen:audio --topic "topic-name"` | Generate audio only |
| `/gen:director --topic "topic-name"` | Generate video direction only |
| `/gen:assets --topic "topic-name"` | Generate SVG assets only |
| `/gen:design --topic "topic-name"` | Generate design specifications only |
| `/gen:video --topic "topic-name"` | Generate video components only |

## Project Structure

```
video-generator/
├── .claude/
│   ├── commands/          # Claude Code slash commands
│   └── skills/            # Claude Code skills
├── scripts/
│   ├── init/              # Installation scripts
│   ├── claude_cli/        # CLI workflow scripts
│   └── utility/           # Utility scripts (TTS, etc.)
├── visualise_video/       # React video rendering app
└── Outputs/               # Generated video outputs
```
