#!/usr/bin/env python3
"""
Log Metadata Extractor for Claude Code Hook Logs

Extracts metadata from subagent-stop-hook log files without loading full content.
This prevents context window overflow when analyzing large log files.

Usage:
    python extract_log_metadata.py --logs-dir <path> --topic <topic> [--step <step>] [--output json|summary]
"""

import argparse
import json
import os
import re
from datetime import datetime
from pathlib import Path
from typing import Optional


def parse_log_filename(filename: str) -> dict:
    """
    Parse log filename to extract metadata.
    Pattern: {timestamp}_{topic}_{Step}_{scene}.log
    Examples:
        2025-12-17_11-19-14_hypersonic-warfare-m9k3_Video_0.log
        2025-12-16_17-21-25_hypersonic-warfare-m9k3_Direction_root.log
    """
    pattern = r"(\d{4}-\d{2}-\d{2}_\d{2}-\d{2}-\d{2})_(.+?)_(Direction|Assets|Design|Video)_(.+)\.log"
    match = re.match(pattern, filename)

    if match:
        timestamp_str, topic, step, scene = match.groups()
        return {
            "filename": filename,
            "timestamp": timestamp_str,
            "topic": topic,
            "step": step,
            "scene": scene,
            "parsed": True
        }

    # Fallback for older format: {timestamp}_Outputs_{Step}_{scene}.log
    pattern_old = r"(\d{4}-\d{2}-\d{2}_\d{2}-\d{2}-\d{2})_Outputs_(Direction|Assets|Design|Video)_(.+)\.log"
    match_old = re.match(pattern_old, filename)

    if match_old:
        timestamp_str, step, scene = match_old.groups()
        return {
            "filename": filename,
            "timestamp": timestamp_str,
            "topic": "Outputs",
            "step": step,
            "scene": scene,
            "parsed": True
        }

    return {"filename": filename, "parsed": False}


def extract_metadata_from_log(filepath: Path) -> dict:
    """
    Extract metadata from a log file without loading full content.
    Uses streaming JSON parsing to extract only needed fields.
    """
    metadata = {
        "file": str(filepath.name),
        "file_size_kb": round(filepath.stat().st_size / 1024, 2),
        "hook_name": None,
        "timestamp": None,
        "session_id": None,
        "agent_id": None,
        "total_messages": 0,
        "tool_calls": [],
        "errors": [],
        "token_usage": {
            "total_input_tokens": 0,
            "total_output_tokens": 0,
            "total_cache_creation_tokens": 0,
            "total_cache_read_tokens": 0
        },
        "start_time": None,
        "end_time": None,
        "duration_seconds": None,
        "completion_status": "unknown",
        "models_used": set()
    }

    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            data = json.load(f)

        # Extract top-level metadata
        metadata["hook_name"] = data.get("hook_name")
        metadata["timestamp"] = data.get("timestamp")

        input_data = data.get("input", {})
        metadata["session_id"] = input_data.get("session_id")
        metadata["agent_id"] = input_data.get("agent_id")

        # Process transcript data
        transcript = input_data.get("agent_transcript_data", [])
        metadata["total_messages"] = len(transcript)

        for i, msg in enumerate(transcript):
            msg_type = msg.get("type")
            timestamp = msg.get("timestamp")

            # Track start/end times
            if timestamp:
                if metadata["start_time"] is None:
                    metadata["start_time"] = timestamp
                metadata["end_time"] = timestamp

            if msg_type == "assistant":
                message_content = msg.get("message", {})

                # Track model
                model = message_content.get("model")
                if model:
                    metadata["models_used"].add(model)

                # Track token usage
                usage = message_content.get("usage", {})
                if usage:
                    metadata["token_usage"]["total_input_tokens"] += usage.get("input_tokens", 0)
                    metadata["token_usage"]["total_output_tokens"] += usage.get("output_tokens", 0)
                    metadata["token_usage"]["total_cache_creation_tokens"] += usage.get("cache_creation_input_tokens", 0)
                    metadata["token_usage"]["total_cache_read_tokens"] += usage.get("cache_read_input_tokens", 0)

                # Track tool calls
                content = message_content.get("content", [])
                for item in content:
                    if isinstance(item, dict):
                        if item.get("type") == "tool_use":
                            tool_name = item.get("name", "unknown")
                            metadata["tool_calls"].append({
                                "name": tool_name,
                                "id": item.get("id"),
                                "message_index": i
                            })
                        elif item.get("type") == "text":
                            text = item.get("text", "")
                            # Check for completion markers
                            if "AGENT COMPLETED RUNNING" in text:
                                if "Status: success" in text:
                                    metadata["completion_status"] = "success"
                                elif "Status: failed" in text:
                                    metadata["completion_status"] = "failed"

            elif msg_type == "user":
                # Check tool results for errors
                message_content = msg.get("message", {})
                content = message_content.get("content", [])

                for item in content:
                    if isinstance(item, dict) and item.get("type") == "tool_result":
                        if item.get("is_error", False):
                            metadata["errors"].append({
                                "tool_use_id": item.get("tool_use_id"),
                                "content_preview": str(item.get("content", ""))[:200],
                                "message_index": i
                            })
                        # Also check for error patterns in content
                        content_str = str(item.get("content", ""))
                        if any(err in content_str.lower() for err in ["error", "failed", "exception", "traceback"]):
                            if not item.get("is_error", False):  # Not already marked as error
                                metadata["errors"].append({
                                    "tool_use_id": item.get("tool_use_id"),
                                    "content_preview": content_str[:200],
                                    "message_index": i,
                                    "type": "potential_error"
                                })

        # Calculate duration
        if metadata["start_time"] and metadata["end_time"]:
            try:
                start = datetime.fromisoformat(metadata["start_time"].replace("Z", "+00:00"))
                end = datetime.fromisoformat(metadata["end_time"].replace("Z", "+00:00"))
                metadata["duration_seconds"] = round((end - start).total_seconds(), 2)
            except:
                pass

        # Convert set to list for JSON serialization
        metadata["models_used"] = list(metadata["models_used"])

        # Summarize tool calls
        tool_summary = {}
        for tc in metadata["tool_calls"]:
            name = tc["name"]
            tool_summary[name] = tool_summary.get(name, 0) + 1
        metadata["tool_call_summary"] = tool_summary

    except json.JSONDecodeError as e:
        metadata["parse_error"] = f"JSON decode error: {str(e)}"
    except Exception as e:
        metadata["parse_error"] = f"Error: {str(e)}"

    return metadata


def filter_logs(logs_dir: Path, topic: Optional[str] = None, step: Optional[str] = None) -> list:
    """
    Filter log files by topic and step.
    """
    log_files = []

    for log_file in logs_dir.glob("*.log"):
        file_meta = parse_log_filename(log_file.name)

        if not file_meta.get("parsed"):
            continue

        # Apply filters
        if topic and file_meta.get("topic") != topic:
            continue

        if step and file_meta.get("step").lower() != step.lower():
            continue

        file_meta["full_path"] = str(log_file)
        log_files.append(file_meta)

    # Sort by timestamp
    log_files.sort(key=lambda x: x.get("timestamp", ""))

    return log_files


def analyze_logs(logs_dir: Path, topic: Optional[str] = None, step: Optional[str] = None) -> dict:
    """
    Analyze all matching log files and return aggregated analysis.
    """
    filtered_files = filter_logs(logs_dir, topic, step)

    analysis = {
        "summary": {
            "total_files": len(filtered_files),
            "topic": topic,
            "step": step,
            "logs_dir": str(logs_dir)
        },
        "files": [],
        "aggregated_metrics": {
            "total_input_tokens": 0,
            "total_output_tokens": 0,
            "total_cache_creation_tokens": 0,
            "total_cache_read_tokens": 0,
            "total_errors": 0,
            "total_tool_calls": 0,
            "success_count": 0,
            "failed_count": 0,
            "unknown_count": 0,
            "total_duration_seconds": 0
        },
        "tool_usage": {},
        "errors_by_file": [],
        "execution_flow": []
    }

    for file_meta in filtered_files:
        filepath = Path(file_meta["full_path"])
        metadata = extract_metadata_from_log(filepath)

        # Merge file metadata
        metadata.update({
            "topic": file_meta.get("topic"),
            "step": file_meta.get("step"),
            "scene": file_meta.get("scene")
        })

        analysis["files"].append(metadata)

        # Aggregate metrics
        agg = analysis["aggregated_metrics"]
        agg["total_input_tokens"] += metadata["token_usage"]["total_input_tokens"]
        agg["total_output_tokens"] += metadata["token_usage"]["total_output_tokens"]
        agg["total_cache_creation_tokens"] += metadata["token_usage"]["total_cache_creation_tokens"]
        agg["total_cache_read_tokens"] += metadata["token_usage"]["total_cache_read_tokens"]
        agg["total_errors"] += len(metadata.get("errors", []))
        agg["total_tool_calls"] += len(metadata.get("tool_calls", []))

        if metadata.get("completion_status") == "success":
            agg["success_count"] += 1
        elif metadata.get("completion_status") == "failed":
            agg["failed_count"] += 1
        else:
            agg["unknown_count"] += 1

        if metadata.get("duration_seconds"):
            agg["total_duration_seconds"] += metadata["duration_seconds"]

        # Aggregate tool usage
        for tool, count in metadata.get("tool_call_summary", {}).items():
            analysis["tool_usage"][tool] = analysis["tool_usage"].get(tool, 0) + count

        # Track errors
        if metadata.get("errors"):
            analysis["errors_by_file"].append({
                "file": metadata["file"],
                "step": file_meta.get("step"),
                "scene": file_meta.get("scene"),
                "error_count": len(metadata["errors"]),
                "errors": metadata["errors"][:3]  # First 3 errors only
            })

        # Track execution flow
        analysis["execution_flow"].append({
            "file": metadata["file"],
            "step": file_meta.get("step"),
            "scene": file_meta.get("scene"),
            "timestamp": file_meta.get("timestamp"),
            "status": metadata.get("completion_status"),
            "duration_seconds": metadata.get("duration_seconds"),
            "tool_calls": len(metadata.get("tool_calls", [])),
            "errors": len(metadata.get("errors", []))
        })

    return analysis


def format_summary(analysis: dict) -> str:
    """
    Format analysis as human-readable summary.
    """
    lines = []
    lines.append("=" * 60)
    lines.append("LOG ANALYSIS SUMMARY")
    lines.append("=" * 60)

    summary = analysis["summary"]
    lines.append(f"\nTopic: {summary.get('topic', 'All')}")
    lines.append(f"Step: {summary.get('step', 'All')}")
    lines.append(f"Total Files Analyzed: {summary['total_files']}")

    agg = analysis["aggregated_metrics"]
    lines.append("\n--- TOKEN USAGE ---")
    lines.append(f"Total Input Tokens: {agg['total_input_tokens']:,}")
    lines.append(f"Total Output Tokens: {agg['total_output_tokens']:,}")
    lines.append(f"Cache Creation Tokens: {agg['total_cache_creation_tokens']:,}")
    lines.append(f"Cache Read Tokens: {agg['total_cache_read_tokens']:,}")

    lines.append("\n--- COMPLETION STATUS ---")
    lines.append(f"Success: {agg['success_count']}")
    lines.append(f"Failed: {agg['failed_count']}")
    lines.append(f"Unknown: {agg['unknown_count']}")

    lines.append(f"\n--- ERRORS ---")
    lines.append(f"Total Errors: {agg['total_errors']}")

    if analysis["errors_by_file"]:
        lines.append("\nFiles with Errors:")
        for err_file in analysis["errors_by_file"][:5]:
            lines.append(f"  - {err_file['file']} ({err_file['step']}_{err_file['scene']}): {err_file['error_count']} errors")

    lines.append("\n--- TOOL USAGE ---")
    sorted_tools = sorted(analysis["tool_usage"].items(), key=lambda x: x[1], reverse=True)
    for tool, count in sorted_tools[:10]:
        lines.append(f"  {tool}: {count}")

    lines.append(f"\n--- EXECUTION FLOW ---")
    lines.append(f"Total Duration: {agg['total_duration_seconds']:.2f} seconds")

    for flow in analysis["execution_flow"][:15]:
        status_icon = "✓" if flow["status"] == "success" else "✗" if flow["status"] == "failed" else "?"
        lines.append(f"  [{status_icon}] {flow['step']}_{flow['scene']} - {flow.get('duration_seconds', '?')}s, {flow['tool_calls']} tools, {flow['errors']} errors")

    if len(analysis["execution_flow"]) > 15:
        lines.append(f"  ... and {len(analysis['execution_flow']) - 15} more files")

    lines.append("\n" + "=" * 60)
    return "\n".join(lines)


def main():
    parser = argparse.ArgumentParser(description="Extract metadata from Claude Code hook logs")
    parser.add_argument("--logs-dir", required=True, help="Directory containing log files")
    parser.add_argument("--topic", help="Filter by topic name")
    parser.add_argument("--step", choices=["Direction", "Assets", "Design", "Video"], help="Filter by step type")
    parser.add_argument("--output", choices=["json", "summary"], default="summary", help="Output format")
    parser.add_argument("--list-topics", action="store_true", help="List all unique topics in logs")

    args = parser.parse_args()

    logs_dir = Path(args.logs_dir)
    if not logs_dir.exists():
        print(f"Error: Logs directory not found: {logs_dir}")
        return 1

    if args.list_topics:
        all_files = filter_logs(logs_dir)
        topics = set(f.get("topic") for f in all_files if f.get("topic"))
        print("Available topics:")
        for topic in sorted(topics):
            count = sum(1 for f in all_files if f.get("topic") == topic)
            print(f"  - {topic}: {count} files")
        return 0

    analysis = analyze_logs(logs_dir, args.topic, args.step)

    if args.output == "json":
        print(json.dumps(analysis, indent=2, default=str))
    else:
        print(format_summary(analysis))

    return 0


if __name__ == "__main__":
    exit(main())
