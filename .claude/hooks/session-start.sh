#!/bin/bash
set -euo pipefail

# Only run in Claude Code on the web (remote environment)
if [ "${CLAUDE_CODE_REMOTE:-}" != "true" ]; then
  exit 0
fi

SKILLS_DIR="$HOME/.claude/skills"

install_skill() {
  local repo_url="$1"
  local repo_name
  repo_name=$(basename "$repo_url" .git)
  local tmp_dir="/tmp/$repo_name"

  # Find all SKILL.md files in the cloned repo
  if [ ! -d "$tmp_dir" ]; then
    git clone --depth=1 "$repo_url" "$tmp_dir" 2>/dev/null
  fi

  find "$tmp_dir/skills" -name "SKILL.md" | while read -r skill_file; do
    local skill_name
    skill_name=$(basename "$(dirname "$skill_file")")
    local target_dir="$SKILLS_DIR/$skill_name"
    if [ ! -f "$target_dir/SKILL.md" ]; then
      mkdir -p "$target_dir"
      cp "$skill_file" "$target_dir/SKILL.md"
      echo "Installed skill: $skill_name"
    else
      echo "Skill already installed: $skill_name"
    fi
  done

  rm -rf "$tmp_dir"
}

mkdir -p "$SKILLS_DIR"

install_skill "https://github.com/edenspiekermann/Skills.git"
install_skill "https://github.com/firebenders/sync-figma-token-skill.git"

echo "Skills setup complete."
