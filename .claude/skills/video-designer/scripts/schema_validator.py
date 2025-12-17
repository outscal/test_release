"""
Schema Validation Script for Video Design JSON

This script validates a video design JSON file against the rules defined in
'video-designer/references/schema-validation-rules.md'.

It checks for:
1.  JSON syntax errors.
2.  Missing or extra (forbidden) fields.
3.  Correct data types for all fields.
4.  Valid values, formats, and enum constraints.
5.  Logical consistency (e.g., timing, unique IDs).
6.  Instances pattern validation.

Usage:
    python schema_validator.py <path_to_design_file.json>
    python schema_validator.py --topic TOPIC --asset-type ASSET_TYPE --scene-index SCENE_INDEX
"""

import json
import os
import sys
import argparse
import re
from typing import Dict, List, Any, Optional, Set, Tuple, Union

# --- Data Classes for Issues ---

class Issue:
    """A class to represent a single validation issue."""
    def __init__(self, category: str, message: str, element_id: Optional[str] = None, path: Optional[str] = None):
        self.category = category
        self.message = message
        self.element_id = element_id
        self.path = path

    def __str__(self):
        if self.element_id:
            return f"[{self.category}] Element '{self.element_id}': {self.message}"
        return f"[{self.category}] {self.message}"

# --- Main Validation Logic ---

class SchemaValidator:
    """A class to encapsulate the validation logic."""

    # Valid element types
    VALID_ELEMENT_TYPES = ["text", "shape", "icon", "character", "path"]

    # Valid path types
    VALID_PATH_TYPES = [
        "linear", "arc", "bezier", "bounce", "circular", "elliptical",
        "parabolic", "s_curve", "sine_wave", "spiral", "spline", "zigzag"
    ]

    # Valid arrow marker types
    VALID_ARROW_MARKERS = ["hollow", "fill", "line"]

    # Valid layout strategies
    VALID_LAYOUT_STRATEGIES = ["three-column", "two-column", "centered", "freeform"]

    # Valid text alignment values
    VALID_TEXT_ALIGN = ["left", "center", "right"]

    # Valid background types
    VALID_BACKGROUND_TYPES = ["none", "solid", "gradient", "frosted-glass", "highlight"]

    # Valid gradient directions
    VALID_GRADIENT_DIRECTIONS = ["to-right", "to-left", "to-bottom", "to-top", "to-br", "to-bl"]

    # Valid backdrop blur values
    VALID_BACKDROP_BLUR = ["sm", "md", "lg", "xl"]

    def __init__(self, filepath: str):
        self.filepath = filepath
        self.issues: List[Issue] = []
        self.element_ids: Set[str] = set()
        self.json_data: Optional[Dict] = None

    def validate(self) -> bool:
        """Main method to run all validation checks. Returns True if valid."""
        if not os.path.exists(self.filepath):
            self.issues.append(Issue("FILE_NOT_FOUND", f"The file '{self.filepath}' does not exist."))
            self.print_issues()
            return False

        # 1. JSON Syntax Check
        try:
            with open(self.filepath, 'r', encoding='utf-8') as f:
                self.json_data = json.load(f)
        except json.JSONDecodeError as e:
            error_message = (
                f"Error: {e.msg}\n"
                f"        - Location: Line {e.lineno}, Column {e.colno}\n"
                "        - Hint: The JSON structure is broken. Check for missing commas (,), misplaced brackets ([]), or braces ({}) around this line."
            )
            self.issues.append(Issue("SYNTAX_ERROR", error_message))
            self.print_issues()
            return False

        # 2. Schema Validation
        self._validate_toplevel()
        self.print_issues()
        return len(self.issues) == 0

    def _add_issue(self, category: str, message: str, element_id: Optional[str] = None, path: Optional[str] = None):
        self.issues.append(Issue(category, message, element_id, path))

    def _validate_toplevel(self):
        """Validates the top-level structure of the JSON."""
        if not isinstance(self.json_data, dict):
            self._add_issue("INVALID_TYPE", "Top-level structure must be a JSON object.")
            return

        # Required top-level fields
        # Note: scene_description is optional
        required_fields = {
            "scene": int,
            "startTime": int,
            "endTime": int,
            "video_metadata": dict,
            "elements": list
        }
        self._check_fields("Top-level", self.json_data, required_fields)

        # Basic value checks
        start_time = self.json_data.get("startTime", 0)
        end_time = self.json_data.get("endTime", 0)

        if isinstance(start_time, int) and start_time < 0:
            self._add_issue("INVALID_VALUE", f"'startTime' ({start_time}) must be >= 0.")
        if isinstance(end_time, int) and isinstance(start_time, int) and end_time <= start_time:
            self._add_issue("TIMING_INVALID", f"'endTime' ({end_time}) must be > 'startTime' ({start_time}).")

        scene = self.json_data.get("scene")
        if isinstance(scene, int) and scene < 0:
            self._add_issue("INVALID_VALUE", f"'scene' ({scene}) must be >= 0.")

        # Validate nested structures
        if "video_metadata" in self.json_data and isinstance(self.json_data["video_metadata"], dict):
            self._validate_video_metadata(self.json_data["video_metadata"])

        if "elements" in self.json_data and isinstance(self.json_data["elements"], list):
            if not self.json_data["elements"]:
                self._add_issue("INVALID_VALUE", "'elements' array cannot be empty.")
            else:
                self._validate_elements(self.json_data["elements"], start_time, end_time)

    def _validate_video_metadata(self, metadata: Dict):
        """Validates the 'video_metadata' object (FLAT structure)."""
        path = "video_metadata"

        # Required fields - backgroundColor is FLAT, not inside canvas
        required_fields = {
            "viewport_size": str,
            "backgroundColor": str,
            "layout": dict
        }
        self._check_fields(path, metadata, required_fields)

        # Validate viewport_size format
        if "viewport_size" in metadata and isinstance(metadata["viewport_size"], str):
            if not re.match(r"^\d+x\d+$", metadata["viewport_size"]):
                self._add_issue("INVALID_FORMAT", f"'{path}.viewport_size' format is invalid. Expected 'WIDTHxHEIGHT', got '{metadata['viewport_size']}'.")

        # Validate backgroundColor format
        if "backgroundColor" in metadata and isinstance(metadata["backgroundColor"], str):
            self._validate_color_format(metadata["backgroundColor"], "backgroundColor", path)

        # Validate layout
        if "layout" in metadata and isinstance(metadata["layout"], dict):
            self._validate_layout(metadata["layout"])

    def _validate_layout(self, layout: Dict):
        """Validates the 'layout' object within video_metadata."""
        path = "video_metadata.layout"

        # Only strategy is required (no description or vertical_padding_percent)
        required_fields = {"strategy": str}
        self._check_fields(path, layout, required_fields)

        # Validate strategy enum
        strategy = layout.get("strategy")
        if isinstance(strategy, str) and strategy not in self.VALID_LAYOUT_STRATEGIES:
            self._add_issue("INVALID_ENUM",
                f"'{path}.strategy' has invalid value '{strategy}', must be one of: {', '.join(self.VALID_LAYOUT_STRATEGIES)}.")

    def _validate_color_format(self, color: str, field_name: str, parent_path: str):
        """Validates a hex color format."""
        if not re.match(r"^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$", color):
            self._add_issue("INVALID_FORMAT",
                f"'{parent_path}.{field_name}' has invalid color format '{color}'. Expected hex format like '#FFFFFF' or '#FFF'.")

    def _validate_elements(self, elements: List[Dict], scene_start_time: int, scene_end_time: int):
        """Validates the 'elements' array."""
        for i, element in enumerate(elements):
            if not isinstance(element, dict):
                self._add_issue("INVALID_TYPE", f"Item at index {i} in 'elements' is not a JSON object.")
                continue

            element_id = element.get("id")
            if not element_id:
                self._add_issue("MISSING_REQUIRED_FIELD", f"Element at index {i} is missing 'id'.")
                element_id = f"unknown_at_index_{i}"
            elif not isinstance(element_id, str):
                self._add_issue("INVALID_TYPE", f"Element 'id' must be a string.", element_id=str(element_id))
            elif element_id in self.element_ids:
                self._add_issue("DUPLICATE_ID", f"Duplicate element ID found.", element_id=element_id)
            else:
                self.element_ids.add(element_id)

            self._validate_single_element(element, scene_start_time, scene_end_time, element_id)

    def _validate_single_element(self, element: Dict, scene_start_time: int, scene_end_time: int, element_id: str):
        """Validates a single element object (FLAT structure)."""
        path = f"Element '{element_id}'"
        elem_type = element.get("type")

        # Common required fields for ALL elements (FLAT - no nesting)
        # Note: x, y are optional for path elements (coordinates are implicit in path_params)
        # Note: x, y are optional when instances is present (each instance can provide its own x, y)
        common_required = {
            "id": str,
            "type": str,
            "content": str,
            "enterOn": int,
            "exitOn": int,
            "zIndex": int
        }

        has_instances = "instances" in element and isinstance(element.get("instances"), list)

        # x, y are required for non-path elements UNLESS instances is present
        if elem_type != "path" and not has_instances:
            common_required["x"] = (int, float)
            common_required["y"] = (int, float)

        self._check_fields(path, element, common_required, element_id=element_id)

        # Validate x, y if present (even for path elements, validate type if provided)
        if "x" in element and not isinstance(element["x"], (int, float)):
            self._add_issue("INVALID_TYPE", f"'x' must be a number, got '{type(element['x']).__name__}'.", element_id)
        if "y" in element and not isinstance(element["y"], (int, float)):
            self._add_issue("INVALID_TYPE", f"'y' must be a number, got '{type(element['y']).__name__}'.", element_id)

        # Validate timing (FLAT - enterOn/exitOn are direct fields)
        enter_on = element.get("enterOn")
        exit_on = element.get("exitOn")

        if isinstance(enter_on, int) and isinstance(exit_on, int):
            self._validate_timing_values(enter_on, exit_on, scene_start_time, scene_end_time, element_id)

        # Validate optional common fields
        self._validate_optional_common_fields(element, element_id)

        # Validate animation (if present)
        if "animation" in element:
            animation = element.get("animation")
            if isinstance(animation, dict):
                self._validate_animation(animation, scene_start_time, scene_end_time, element_id)
            else:
                self._add_issue("INVALID_TYPE", "Field 'animation' must be a dictionary.", element_id)

        # Validate instances pattern (if present)
        if "instances" in element:
            self._validate_instances(element.get("instances"), element_id, "element", element)

        # Type-specific validation
        elem_type = element.get("type")
        if elem_type == "text":
            self._validate_text_element(element, element_id)
        elif elem_type in ["shape", "icon", "character"]:
            self._validate_shape_element(element, element_id)
        elif elem_type == "path":
            self._validate_path_element(element, element_id, scene_start_time, scene_end_time)
        elif elem_type and elem_type not in self.VALID_ELEMENT_TYPES:
            self._add_issue("UNKNOWN_TYPE",
                f"Unknown element type '{elem_type}'. Currently validated types: {', '.join(self.VALID_ELEMENT_TYPES)}. Skipping type-specific validation.",
                element_id=element_id)

    def _validate_timing_values(self, enter_on: int, exit_on: int, scene_start_time: int, scene_end_time: int, element_id: str):
        """Validates timing values for an element."""
        # Basic value checks
        if enter_on < 0:
            self._add_issue("INVALID_VALUE", f"'enterOn' ({enter_on}) must be >= 0.", element_id)
        if exit_on <= enter_on:
            self._add_issue("TIMING_INVALID", f"'exitOn' ({exit_on}) must be > 'enterOn' ({enter_on}).", element_id)

        # Element timing must be within scene bounds [startTime, endTime]
        if enter_on < scene_start_time:
            self._add_issue("TIMING_INVALID",
                f"'enterOn' ({enter_on}) must be >= scene 'startTime' ({scene_start_time}). "
                f"All timings must use absolute video timestamps.", element_id)
        if enter_on > scene_end_time:
            self._add_issue("TIMING_INVALID",
                f"'enterOn' ({enter_on}) cannot be greater than scene 'endTime' ({scene_end_time}).", element_id)
        if exit_on < scene_start_time:
            self._add_issue("TIMING_INVALID",
                f"'exitOn' ({exit_on}) must be >= scene 'startTime' ({scene_start_time}). "
                f"All timings must use absolute video timestamps.", element_id)
        if exit_on > scene_end_time:
            self._add_issue("TIMING_INVALID",
                f"'exitOn' ({exit_on}) cannot be greater than scene 'endTime' ({scene_end_time}).", element_id)

    def _validate_optional_common_fields(self, element: Dict, element_id: str):
        """Validates optional common fields that apply to all element types."""
        # rotation (optional, default 0)
        if "rotation" in element:
            rotation = element.get("rotation")
            if not isinstance(rotation, (int, float)):
                self._add_issue("INVALID_TYPE", f"'rotation' must be a number, got '{type(rotation).__name__}'.", element_id)

        # scale (optional, default 1)
        if "scale" in element:
            scale = element.get("scale")
            if not isinstance(scale, (int, float)):
                self._add_issue("INVALID_TYPE", f"'scale' must be a number, got '{type(scale).__name__}'.", element_id)
            elif scale <= 0:
                self._add_issue("INVALID_VALUE", f"'scale' ({scale}) must be > 0.", element_id)

        # opacity (optional, default 1)
        if "opacity" in element:
            opacity = element.get("opacity")
            if not isinstance(opacity, (int, float)):
                self._add_issue("INVALID_TYPE", f"'opacity' must be a number, got '{type(opacity).__name__}'.", element_id)
            elif opacity < 0 or opacity > 1:
                self._add_issue("INVALID_VALUE", f"'opacity' ({opacity}) must be between 0 and 1.", element_id)

        # fill (optional)
        if "fill" in element:
            fill = element.get("fill")
            if isinstance(fill, str) and fill != "none":
                self._validate_color_format(fill, "fill", f"Element '{element_id}'")

        # stroke (optional)
        if "stroke" in element:
            stroke = element.get("stroke")
            if isinstance(stroke, str) and stroke != "none":
                self._validate_color_format(stroke, "stroke", f"Element '{element_id}'")

        # strokeWidth (optional)
        if "strokeWidth" in element:
            stroke_width = element.get("strokeWidth")
            if not isinstance(stroke_width, (int, float)):
                self._add_issue("INVALID_TYPE", f"'strokeWidth' must be a number, got '{type(stroke_width).__name__}'.", element_id)
            elif stroke_width < 0:
                self._add_issue("INVALID_VALUE", f"'strokeWidth' ({stroke_width}) must be >= 0.", element_id)

    def _validate_animation(self, animation: Dict, scene_start_time: int, scene_end_time: int, element_id: str):
        """Validates the 'animation' object."""
        path = f"Element '{element_id}'.animation"

        # Validate entrance animation (optional)
        if "entrance" in animation:
            entrance = animation.get("entrance")
            if not isinstance(entrance, dict):
                self._add_issue("INVALID_TYPE", f"'{path}.entrance' must be a dictionary.", element_id)
            else:
                self._validate_animation_config(entrance, "entrance", element_id)

        # Validate exit animation (optional)
        if "exit" in animation:
            exit_anim = animation.get("exit")
            if not isinstance(exit_anim, dict):
                self._add_issue("INVALID_TYPE", f"'{path}.exit' must be a dictionary.", element_id)
            else:
                self._validate_animation_config(exit_anim, "exit", element_id)

        # Validate actions array (optional)
        if "actions" in animation:
            actions = animation.get("actions")
            if not isinstance(actions, list):
                self._add_issue("INVALID_TYPE", f"'{path}.actions' must be an array.", element_id)
            else:
                for i, action in enumerate(actions):
                    if not isinstance(action, dict):
                        self._add_issue("INVALID_TYPE", f"'{path}.actions[{i}]' must be a dictionary.", element_id)
                        continue
                    self._validate_animation_action(action, i, scene_start_time, scene_end_time, element_id)

    def _validate_animation_config(self, config: Dict, anim_type: str, element_id: str):
        """Validates an entrance or exit animation config."""
        path = f"Element '{element_id}'.animation.{anim_type}"

        # type is required and must be a string (no enum validation - video-coder handles any type)
        if "type" not in config:
            self._add_issue("MISSING_REQUIRED_FIELD", f"Field 'type' is missing from '{path}'.", element_id)
        else:
            anim_type_val = config.get("type")
            if not isinstance(anim_type_val, str):
                self._add_issue("INVALID_TYPE", f"'{path}.type' must be a string.", element_id)

        # duration is required
        if "duration" not in config:
            self._add_issue("MISSING_REQUIRED_FIELD", f"Field 'duration' is missing from '{path}'.", element_id)
        else:
            duration = config.get("duration")
            if not isinstance(duration, (int, float)):
                self._add_issue("INVALID_TYPE", f"'{path}.duration' must be a number.", element_id)
            elif duration <= 0:
                self._add_issue("INVALID_VALUE", f"'{path}.duration' ({duration}) must be > 0.", element_id)

    def _validate_animation_action(self, action: Dict, index: int, scene_start_time: int, scene_end_time: int, element_id: str):
        """Validates a single animation action."""
        path = f"Element '{element_id}'.animation.actions[{index}]"

        # Required fields for actions
        required_fields = {
            "on": (int, float),
            "duration": (int, float),
            "targetProperty": str,
            "value": None  # Any type allowed
        }

        for field, expected_type in required_fields.items():
            if field not in action:
                self._add_issue("MISSING_REQUIRED_FIELD", f"Field '{field}' is missing from '{path}'.", element_id)
            elif expected_type is not None and not isinstance(action[field], expected_type):
                actual_type = type(action[field]).__name__
                if isinstance(expected_type, tuple):
                    type_names = ' or '.join(t.__name__ for t in expected_type)
                else:
                    type_names = expected_type.__name__
                self._add_issue("INVALID_TYPE", f"'{path}.{field}' has type '{actual_type}', expected '{type_names}'.", element_id)

        # Validate action.on timing
        action_on = action.get("on")
        if isinstance(action_on, (int, float)):
            if action_on < scene_start_time:
                self._add_issue("TIMING_INVALID",
                    f"'{path}.on' ({action_on}) must be >= scene 'startTime' ({scene_start_time}). "
                    f"All timings must use absolute video timestamps.", element_id)
            if action_on > scene_end_time:
                self._add_issue("TIMING_INVALID",
                    f"'{path}.on' ({action_on}) cannot be greater than scene 'endTime' ({scene_end_time}).", element_id)

        # Validate duration
        duration = action.get("duration")
        if isinstance(duration, (int, float)) and duration <= 0:
            self._add_issue("INVALID_VALUE", f"'{path}.duration' ({duration}) must be > 0.", element_id)

        # easing is optional, no validation needed for its value

    def _validate_instances(self, instances: Any, element_id: str, context: str, parent_element: Optional[Dict] = None):
        """Validates the instances pattern."""
        path = f"Element '{element_id}'.instances"

        if not isinstance(instances, list):
            self._add_issue("INVALID_TYPE", f"'{path}' must be an array.", element_id)
            return

        if len(instances) < 2:
            self._add_issue("INVALID_INSTANCES",
                f"'{path}' must have at least 2 instances (otherwise just use a single element).", element_id)
            return

        # First instance must have { "useDefaults": true }
        first_instance = instances[0]
        if not isinstance(first_instance, dict):
            self._add_issue("INVALID_TYPE", f"'{path}[0]' must be a dictionary.", element_id)
        elif first_instance.get("useDefaults") != True:
            self._add_issue("INVALID_INSTANCES",
                f"'{path}[0]' must have 'useDefaults': true.", element_id)

        # Check if x/y are missing at element level (only for element context, not path_params)
        element_has_x = parent_element and "x" in parent_element
        element_has_y = parent_element and "y" in parent_element

        # Validate all instances
        for i, instance in enumerate(instances):
            if not isinstance(instance, dict):
                self._add_issue("INVALID_TYPE", f"'{path}[{i}]' must be a dictionary.", element_id)
                continue

            # If x/y missing at element level, each instance must provide them
            if parent_element and context == "element":
                if not element_has_x and "x" not in instance:
                    self._add_issue("MISSING_REQUIRED_FIELD",
                        f"'{path}[{i}]' must have 'x' since element-level 'x' is not defined.", element_id)
                if not element_has_y and "y" not in instance:
                    self._add_issue("MISSING_REQUIRED_FIELD",
                        f"'{path}[{i}]' must have 'y' since element-level 'y' is not defined.", element_id)

            # Validate x/y types if present in instance
            if "x" in instance and not isinstance(instance["x"], (int, float)):
                self._add_issue("INVALID_TYPE", f"'{path}[{i}].x' must be a number.", element_id)
            if "y" in instance and not isinstance(instance["y"], (int, float)):
                self._add_issue("INVALID_TYPE", f"'{path}[{i}].y' must be a number.", element_id)

    def _validate_text_element(self, element: Dict, element_id: str):
        """Validates a text element (FLAT structure)."""
        path = f"Element '{element_id}'"

        # Required fields for text elements (FLAT)
        # Note: container is OPTIONAL - only needed when background box is required
        text_required = {
            "text": str,
            "fontColor": str,
            "fontSize": (int, float),
            "textAlign": str,
            "fontWeight": (int, str),
            "lineHeight": (int, float)
        }
        self._check_fields(path, element, text_required, element_id)

        # bgID is optional - can be empty string or missing
        if "bgID" in element and not isinstance(element["bgID"], str):
            self._add_issue("INVALID_TYPE", f"'bgID' must be a string, got '{type(element['bgID']).__name__}'.", element_id)

        # Validate fontColor format
        font_color = element.get("fontColor")
        if isinstance(font_color, str):
            self._validate_color_format(font_color, "fontColor", path)

        # Validate fontSize value
        font_size = element.get("fontSize")
        if isinstance(font_size, (int, float)) and font_size <= 0:
            self._add_issue("INVALID_VALUE", f"'fontSize' ({font_size}) must be > 0.", element_id)

        # Validate textAlign enum
        text_align = element.get("textAlign")
        if isinstance(text_align, str) and text_align not in self.VALID_TEXT_ALIGN:
            self._add_issue("INVALID_ENUM",
                f"'textAlign' has invalid value '{text_align}', must be one of: {', '.join(self.VALID_TEXT_ALIGN)}.", element_id)

        # Validate lineHeight value
        line_height = element.get("lineHeight")
        if isinstance(line_height, (int, float)) and line_height <= 0:
            self._add_issue("INVALID_VALUE", f"'lineHeight' ({line_height}) must be > 0.", element_id)

        # Validate container (optional - only needed when background box is required)
        if "container" in element:
            container = element.get("container")
            if isinstance(container, dict):
                self._validate_container(container, element_id)
            else:
                self._add_issue("INVALID_TYPE", f"'container' must be a dictionary, got '{type(container).__name__}'.", element_id)

        # Forbidden fields for text elements
        forbidden = ["width", "height"]
        for key in forbidden:
            if key in element:
                self._add_issue("FORBIDDEN_FIELD", f"Text elements cannot have '{key}' (auto-sized).", element_id)

    def _validate_container(self, container: Dict, element_id: str):
        """Validates the container object for text elements."""
        path = f"Element '{element_id}'.container"

        # Required fields
        required_fields = {
            "padding": (int, float),
            "background": dict
        }
        self._check_fields(path, container, required_fields, element_id)

        # Validate padding
        padding = container.get("padding")
        if isinstance(padding, (int, float)) and padding < 0:
            self._add_issue("INVALID_VALUE", f"'{path}.padding' ({padding}) must be >= 0.", element_id)

        # Validate background
        background = container.get("background")
        if isinstance(background, dict):
            self._validate_background(background, element_id)

        # Validate border (optional)
        if "border" in container:
            border = container.get("border")
            if isinstance(border, dict):
                self._validate_border(border, element_id)
            else:
                self._add_issue("INVALID_TYPE", f"'{path}.border' must be a dictionary.", element_id)

        # Validate backdropBlur (conditional - required if background.type is frosted-glass)
        bg_type = background.get("type") if isinstance(background, dict) else None
        if bg_type == "frosted-glass":
            if "backdropBlur" not in container:
                self._add_issue("MISSING_REQUIRED_FIELD",
                    f"'{path}.backdropBlur' is required when background.type is 'frosted-glass'.", element_id)
            else:
                blur = container.get("backdropBlur")
                if not isinstance(blur, str):
                    self._add_issue("INVALID_TYPE", f"'{path}.backdropBlur' must be a string.", element_id)
                elif blur not in self.VALID_BACKDROP_BLUR:
                    self._add_issue("INVALID_ENUM",
                        f"'{path}.backdropBlur' has invalid value '{blur}'. Valid: {', '.join(self.VALID_BACKDROP_BLUR)}.", element_id)

    def _validate_background(self, background: Dict, element_id: str):
        """Validates the background object within container."""
        path = f"Element '{element_id}'.container.background"

        # type is required
        if "type" not in background:
            self._add_issue("MISSING_REQUIRED_FIELD", f"Field 'type' is missing from '{path}'.", element_id)
            return

        bg_type = background.get("type")
        if not isinstance(bg_type, str):
            self._add_issue("INVALID_TYPE", f"'{path}.type' must be a string.", element_id)
            return

        if bg_type not in self.VALID_BACKGROUND_TYPES:
            self._add_issue("INVALID_ENUM",
                f"'{path}.type' has invalid value '{bg_type}'. Valid: {', '.join(self.VALID_BACKGROUND_TYPES)}.", element_id)
            return

        # Validate color (optional)
        if "color" in background:
            color = background.get("color")
            if isinstance(color, str):
                self._validate_color_format(color, "color", path)

        # Validate opacity (optional)
        if "opacity" in background:
            opacity = background.get("opacity")
            if not isinstance(opacity, (int, float)):
                self._add_issue("INVALID_TYPE", f"'{path}.opacity' must be a number.", element_id)
            elif opacity < 0 or opacity > 1:
                self._add_issue("INVALID_VALUE", f"'{path}.opacity' ({opacity}) must be between 0 and 1.", element_id)

        # Validate gradient (conditional - required if type is gradient)
        if bg_type == "gradient":
            if "gradient" not in background:
                self._add_issue("MISSING_REQUIRED_FIELD",
                    f"'{path}.gradient' is required when type is 'gradient'.", element_id)
            else:
                gradient = background.get("gradient")
                if isinstance(gradient, dict):
                    self._validate_gradient(gradient, element_id)
                else:
                    self._add_issue("INVALID_TYPE", f"'{path}.gradient' must be a dictionary.", element_id)

    def _validate_gradient(self, gradient: Dict, element_id: str):
        """Validates the gradient object."""
        path = f"Element '{element_id}'.container.background.gradient"

        # Required fields
        required_fields = {"from": str, "to": str}
        self._check_fields(path, gradient, required_fields, element_id)

        # Validate color formats
        if "from" in gradient and isinstance(gradient["from"], str):
            self._validate_color_format(gradient["from"], "from", path)
        if "to" in gradient and isinstance(gradient["to"], str):
            self._validate_color_format(gradient["to"], "to", path)

        # Validate direction (optional)
        if "direction" in gradient:
            direction = gradient.get("direction")
            if not isinstance(direction, str):
                self._add_issue("INVALID_TYPE", f"'{path}.direction' must be a string.", element_id)
            elif direction not in self.VALID_GRADIENT_DIRECTIONS:
                self._add_issue("INVALID_ENUM",
                    f"'{path}.direction' has invalid value '{direction}'. Valid: {', '.join(self.VALID_GRADIENT_DIRECTIONS)}.", element_id)

    def _validate_border(self, border: Dict, element_id: str):
        """Validates the border object within container."""
        path = f"Element '{element_id}'.container.border"

        # All border fields are optional
        if "radius" in border:
            radius = border.get("radius")
            if not isinstance(radius, (int, float)):
                self._add_issue("INVALID_TYPE", f"'{path}.radius' must be a number.", element_id)
            elif radius < 0:
                self._add_issue("INVALID_VALUE", f"'{path}.radius' ({radius}) must be >= 0.", element_id)

        if "width" in border:
            width = border.get("width")
            if not isinstance(width, (int, float)):
                self._add_issue("INVALID_TYPE", f"'{path}.width' must be a number.", element_id)
            elif width < 0:
                self._add_issue("INVALID_VALUE", f"'{path}.width' ({width}) must be >= 0.", element_id)

        if "color" in border:
            color = border.get("color")
            if isinstance(color, str):
                self._validate_color_format(color, "color", path)

    def _validate_shape_element(self, element: Dict, element_id: str):
        """Validates a shape/icon/character element (FLAT structure)."""
        path = f"Element '{element_id}'"

        # Required fields (FLAT - width/height are direct fields)
        shape_required = {
            "width": (int, float),
            "height": (int, float)
        }
        self._check_fields(path, element, shape_required, element_id)

        # Validate width/height values
        width = element.get("width")
        height = element.get("height")
        if isinstance(width, (int, float)) and width <= 0:
            self._add_issue("INVALID_VALUE", f"'width' ({width}) must be > 0.", element_id)
        if isinstance(height, (int, float)) and height <= 0:
            self._add_issue("INVALID_VALUE", f"'height' ({height}) must be > 0.", element_id)

        # Forbidden fields for shape elements
        forbidden = ["text", "bgID", "container", "fontColor", "fontSize", "textAlign", "fontWeight", "lineHeight"]
        for key in forbidden:
            if key in element:
                self._add_issue("FORBIDDEN_FIELD", f"Shape/icon/character elements cannot have '{key}'.", element_id)

    def _validate_path_element(self, element: Dict, element_id: str, scene_start_time: int, scene_end_time: int):
        """Validates a path element (FLAT structure).

        Note: For path elements, x, y, width, height are OPTIONAL because
        path coordinates are absolute screen positions (implied by path_params).
        """
        path = f"Element '{element_id}'"

        # Path elements have OPTIONAL width/height (coordinates are implicit in path_params)
        # Validate if present
        width = element.get("width")
        height = element.get("height")
        if width is not None:
            if not isinstance(width, (int, float)):
                self._add_issue("INVALID_TYPE", f"'width' must be a number, got '{type(width).__name__}'.", element_id)
            elif width <= 0:
                self._add_issue("INVALID_VALUE", f"'width' ({width}) must be > 0.", element_id)
        if height is not None:
            if not isinstance(height, (int, float)):
                self._add_issue("INVALID_TYPE", f"'height' must be a number, got '{type(height).__name__}'.", element_id)
            elif height <= 0:
                self._add_issue("INVALID_VALUE", f"'height' ({height}) must be > 0.", element_id)

        # Check for either path_params OR merge_path_params (mutually exclusive)
        has_path_params = "path_params" in element
        has_merge_path_params = "merge_path_params" in element

        if has_path_params and has_merge_path_params:
            self._add_issue("INVALID_STRUCTURE",
                "Cannot have both 'path_params' and 'merge_path_params'. Use only one.", element_id)
        elif not has_path_params and not has_merge_path_params:
            self._add_issue("MISSING_REQUIRED_FIELD",
                "Path elements must have either 'path_params' or 'merge_path_params'.", element_id)

        # Validate path_params (single path)
        if has_path_params:
            path_params = element.get("path_params")
            if not isinstance(path_params, dict):
                self._add_issue("INVALID_TYPE",
                    f"'path_params' must be a dictionary, got '{type(path_params).__name__}'.", element_id)
            else:
                self._validate_single_path_params(path_params, element_id, "path_params")

        # Validate merge_path_params (composite path - array of paths)
        if has_merge_path_params:
            merge_path_params = element.get("merge_path_params")
            if not isinstance(merge_path_params, list):
                self._add_issue("INVALID_TYPE",
                    f"'merge_path_params' must be an array, got '{type(merge_path_params).__name__}'.", element_id)
            elif len(merge_path_params) == 0:
                self._add_issue("INVALID_VALUE",
                    "'merge_path_params' array cannot be empty.", element_id)
            else:
                for i, path_segment in enumerate(merge_path_params):
                    if not isinstance(path_segment, dict):
                        self._add_issue("INVALID_TYPE",
                            f"'merge_path_params[{i}]' must be a dictionary.", element_id)
                    else:
                        self._validate_single_path_params(path_segment, element_id, f"merge_path_params[{i}]")

        # Validate arrow_marker (optional)
        if "arrow_marker" in element:
            arrow_marker = element.get("arrow_marker")
            if not isinstance(arrow_marker, str):
                self._add_issue("INVALID_TYPE",
                    f"'arrow_marker' must be a string, got '{type(arrow_marker).__name__}'.", element_id)
            elif arrow_marker not in self.VALID_ARROW_MARKERS:
                self._add_issue("INVALID_ENUM",
                    f"'arrow_marker' has invalid value '{arrow_marker}'. Valid: {', '.join(self.VALID_ARROW_MARKERS)}.", element_id)

        # Forbidden fields for path elements
        forbidden = ["text", "bgID", "container", "fontColor", "fontSize", "textAlign", "fontWeight", "lineHeight"]
        for key in forbidden:
            if key in element:
                self._add_issue("FORBIDDEN_FIELD", f"Path elements cannot have '{key}'.", element_id)

    def _validate_single_path_params(self, path_params: Dict, element_id: str, params_path: str):
        """Validates a single path_params object."""
        # Check for required 'type' field
        if "type" not in path_params:
            self._add_issue("MISSING_REQUIRED_FIELD",
                f"Field 'type' is missing from '{params_path}'.", element_id)
            return

        path_type = path_params.get("type")
        if not isinstance(path_type, str):
            self._add_issue("INVALID_TYPE",
                f"'{params_path}.type' must be a string, got '{type(path_type).__name__}'.", element_id)
            return

        if path_type not in self.VALID_PATH_TYPES:
            self._add_issue("INVALID_ENUM",
                f"'{params_path}.type' has invalid value '{path_type}'. Valid: {', '.join(self.VALID_PATH_TYPES)}.", element_id)
            return

        # Type-specific required fields validation
        type_required_fields = {
            "linear": {"start_x": (int, float), "start_y": (int, float), "end_x": (int, float), "end_y": (int, float)},
            "arc": {"start_x": (int, float), "start_y": (int, float), "end_x": (int, float), "end_y": (int, float), "radius": (int, float)},
            "bezier": {"start_x": (int, float), "start_y": (int, float), "cp1_x": (int, float), "cp1_y": (int, float),
                      "cp2_x": (int, float), "cp2_y": (int, float), "end_x": (int, float), "end_y": (int, float)},
            "bounce": {"start_x": (int, float), "start_y": (int, float), "end_x": (int, float),
                      "ground_y": (int, float), "initial_height": (int, float), "bounces": (int, float)},
            "circular": {"center_x": (int, float), "center_y": (int, float), "radius": (int, float)},
            "elliptical": {"center_x": (int, float), "center_y": (int, float), "radius_x": (int, float), "radius_y": (int, float)},
            "parabolic": {"start_x": (int, float), "start_y": (int, float), "end_x": (int, float), "end_y": (int, float), "arc_height": (int, float)},
            "sine_wave": {"start_x": (int, float), "start_y": (int, float), "wavelength": (int, float), "amplitude": (int, float), "cycles": (int, float)},
            "spiral": {"center_x": (int, float), "center_y": (int, float), "max_radius": (int, float), "revolutions": (int, float)},
            "s_curve": {"start_x": (int, float), "start_y": (int, float), "end_x": (int, float), "end_y": (int, float)},
            "spline": {"points": list},
            "zigzag": {"start_x": (int, float), "start_y": (int, float), "segment_length": (int, float), "amplitude": (int, float), "segments": (int, float)}
        }

        if path_type in type_required_fields:
            required_fields = type_required_fields[path_type]
            self._check_fields(params_path, path_params, required_fields, element_id)

            # Special validation for spline points
            # Points must be in array format [[x, y], [x, y], ...]
            if path_type == "spline" and "points" in path_params:
                points = path_params["points"]
                if isinstance(points, list):
                    if len(points) < 2:
                        self._add_issue("INVALID_VALUE",
                            f"'{params_path}.points' must have at least 2 points.", element_id)
                    for i, point in enumerate(points):
                        if not isinstance(point, list) or len(point) != 2:
                            self._add_issue("INVALID_TYPE",
                                f"'{params_path}.points[{i}]' must be an array of [x, y] coordinates.", element_id)
                        elif not all(isinstance(coord, (int, float)) for coord in point):
                            self._add_issue("INVALID_TYPE",
                                f"'{params_path}.points[{i}]' coordinates must be numbers.", element_id)

        # Validate instances pattern within path_params (optional)
        if "instances" in path_params:
            self._validate_instances(path_params.get("instances"), element_id, "path_params")

    def _check_fields(self, path: str, data: Dict, field_map: Dict[str, Any], element_id: Optional[str] = None):
        """Helper to check for required fields and their types."""
        for field, expected_type in field_map.items():
            if field not in data:
                if element_id:
                    self._add_issue("MISSING_REQUIRED_FIELD", f"Field '{field}' is missing from '{path}'.", element_id, path=path)
                else:
                    self._add_issue("MISSING_REQUIRED_FIELD", f"Field '{field}' is missing from '{path}'.", path=path)
            elif expected_type is not None and not isinstance(data[field], expected_type):
                actual_type = type(data[field]).__name__
                # Handle tuple of types (e.g., (int, float))
                if isinstance(expected_type, tuple):
                    type_names = ' or '.join(t.__name__ for t in expected_type)
                else:
                    type_names = expected_type.__name__
                self._add_issue("INVALID_TYPE", f"Field '{path}.{field}' has type '{actual_type}', expected '{type_names}'.", element_id)

    def print_issues(self):
        """Prints all collected issues to the console."""
        if not self.issues:
            print("Validation passed.")
            return

        # Separate warnings (UNKNOWN_TYPE) from errors
        warning_categories = ["UNKNOWN_TYPE"]
        errors = [issue for issue in self.issues if issue.category not in warning_categories]
        warnings = [issue for issue in self.issues if issue.category in warning_categories]

        # Group issues by category
        grouped_issues = {}
        for issue in self.issues:
            if issue.category not in grouped_issues:
                grouped_issues[issue.category] = []
            grouped_issues[issue.category].append(issue)

        # Print header based on what we have
        if errors:
            print(f"\n[FAIL] Found {len(errors)} validation error(s) in '{os.path.basename(self.filepath)}':\n")
        elif warnings:
            print(f"\n[WARNING] Found {len(warnings)} warning(s) in '{os.path.basename(self.filepath)}':\n")

        # Print Syntax Errors first
        if "SYNTAX_ERROR" in grouped_issues:
            print("JSON Syntax Error:")
            for issue in grouped_issues["SYNTAX_ERROR"]:
                print(f"  {issue.message}")
            print()
            print("Fix all these errors and re-run this script.\n")
            return  # Cannot validate schema if there's a syntax error

        # Define display order for categories (errors only)
        category_order = [
            "FILE_NOT_FOUND",
            "MISSING_REQUIRED_FIELD",
            "INVALID_TYPE",
            "INVALID_VALUE",
            "INVALID_FORMAT",
            "INVALID_ENUM",
            "TIMING_INVALID",
            "DUPLICATE_ID",
            "FORBIDDEN_FIELD",
            "INVALID_STRUCTURE",
            "INVALID_INSTANCES"
        ]

        # Print errors in order
        for category in category_order:
            if category in grouped_issues:
                category_name = category.replace('_', ' ').title()
                print(f"{category_name}:")
                for i, issue in enumerate(grouped_issues[category]):
                    if issue.element_id:
                        print(f"  {i + 1}. [{issue.element_id}] {issue.message}")
                    else:
                        print(f"  {i + 1}. {issue.message}")
                print()

        # Print any remaining error categories not in the order list (excluding warnings)
        for category, issues in grouped_issues.items():
            if category not in category_order and category not in warning_categories:
                category_name = category.replace('_', ' ').title()
                print(f"{category_name}:")
                for i, issue in enumerate(issues):
                    if issue.element_id:
                        print(f"  {i + 1}. [{issue.element_id}] {issue.message}")
                    else:
                        print(f"  {i + 1}. {issue.message}")
                print()

        # Print "Fix all errors" message if there are actual errors
        if errors:
            print("Fix all these errors and re-run this script.\n")

        # Print warnings separately (UNKNOWN_TYPE)
        if warnings:
            if errors:
                print("--- Warnings (informational only) ---\n")
            print("Unknown Type:")
            for i, issue in enumerate(warnings):
                if issue.element_id:
                    print(f"  {i + 1}. [{issue.element_id}] {issue.message}")
                else:
                    print(f"  {i + 1}. {issue.message}")
            print()


def main():
    """Main entry point for the script."""
    parser = argparse.ArgumentParser(description='Validate a video design JSON file against schema rules.')
    parser.add_argument('--scene-index', type=int, help='Scene index')
    parser.add_argument('--topic', help='Topic name')
    parser.add_argument('--asset-type', default='Design', help='Asset folder name (default: Design)')
    parser.add_argument('file_path', nargs='?', help='Design file path (alternative to --scene-index and --topic)')
    args = parser.parse_args()

    # Determine the file path
    scene_index = getattr(args, 'scene_index', None)
    asset_type = getattr(args, 'asset_type', 'Design')

    if scene_index is not None and args.topic:
        # Sanitize topic name to prevent path traversal
        if '..' in args.topic or '/' in args.topic or '\\' in args.topic:
            print("Error: Invalid topic name. Topic cannot contain '..' or path separators.", file=sys.stderr)
            sys.exit(1)
        # Sanitize asset type to prevent path traversal
        if '..' in asset_type or '/' in asset_type or '\\' in asset_type:
            print("Error: Invalid asset type. Asset type cannot contain '..' or path separators.", file=sys.stderr)
            sys.exit(1)
        # Key-value pair mode: construct path from topic, asset-type, and scene-index
        file_path = os.path.join("Outputs", args.topic, asset_type, "Latest", f"latest_{scene_index}.json")
    elif args.file_path:
        # Direct file path mode
        file_path = args.file_path
    else:
        print("Usage: python schema_validator.py --scene-index SCENE_INDEX --topic TOPIC [--asset-type ASSET_TYPE]", file=sys.stderr)
        print("       python schema_validator.py <design_file_path>", file=sys.stderr)
        sys.exit(1)

    if not file_path.lower().endswith('.json'):
        print(f"Error: The provided file '{file_path}' is not a .json file.", file=sys.stderr)
        sys.exit(1)

    validator = SchemaValidator(file_path)
    is_valid = validator.validate()
    sys.exit(0 if is_valid else 1)


if __name__ == "__main__":
    main()
