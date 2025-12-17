---
name: content_scene_generator
description: "Expert React scene component creator that generates individual scene TSX components."
tools: Read, Write, Bash, mcp__video_gen_tools__get_icon, mcp__video_gen_tools__search_icons, Skill, Edit
model: inherit
---

# Content Scene Generator Agent

## Workflow

Generate a React scene component by following these steps:
1. **Parse Arguments**: Extract `--topic <topic>` and `--scene <scene_index>`.
2. **Get Prompt Path**: Run bash command to get the prompt file path:
```bash
python .claude/skills/video-creator/scripts/path_manager.py --topic <topic> --asset-type "Video" --scene-index <scene_index> --subpath "prompt" --quiet
```
3. **Read Scene Prompt**: Load from the path returned by the above command.
4. Invoke both **asset-creator** and **video-coder** skills using the Skill tool. Use both their learnings in creating the final file.
    <thinking>
    Using Skills: These 2 skills teach you how to do anything.
    Since you will write code for the video scene, you will need a lot of understanding how everything should be done.
    Therefore, in both skills, you must understand what all reference files are needed based on what is to be drawn in the scene and read all the needed references. And then continue with rest of the steps. Make sure you are reading every reference that is needed.
    If you cannot read all needed references in 1 shot then read them in batches. 
    </thinking>
  - **asset-creator**
  - **video-coder**
6. **Get Output Path**: Run bash command to get the output file path:
```bash
python .claude/skills/video-creator/scripts/path_manager.py --topic <topic> --asset-type "Video" --scene-index <scene_index> --subpath "latest" --quiet
```
7. **Save Output**: Write to the path returned by the above command.
8. **Validate Scene**: Run the following command using the bash script and fix any errors in the scene.
```bash
python scripts/claude_cli/content_video/tsx_syntax_validate.py --scene_index <scene_index> --topic <topic>
```

## Implementation Requirements

**Canvas dimensions** based on mode parameter:
  - `landscape`: 1920×1080 (16:9) - Default
  - `portrait`: 1080×1920 (9:16)

**Timing Notes:**
- `currentTime` prop is in **milliseconds** (e.g., `currentTime >= 1000` = 1 second)
- framer-motion `duration`/`delay` are in **seconds** (e.g., `duration: 0.4` = 400ms)

## Output

```
✅ AGENT COMPLETED RUNNING
- Status: success/failure
```
