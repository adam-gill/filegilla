#!/usr/bin/env bash
# filegilla CLI installer
#
# Downloads the `fg` script as a release asset from GitHub and installs
# it to ~/.local/bin (or /usr/local/bin if running as root).
#
# Usage:
#     curl -fsSL https://filegilla.com/install.sh | sh
#
# After install:
#     fg setup
#
# Options (set as env vars before running):
#   FG_INSTALL_DIR   target directory (default: ~/.local/bin or /usr/local/bin)
#   FG_VERSION       release tag to install (default: latest)
#   FG_REPO          GitHub owner/repo (default: adam-gill/filegilla)

set -euo pipefail

FG_REPO="${FG_REPO:-adam-gill/filegilla}"
FG_VERSION="${FG_VERSION:-latest}"
FG_ASSET_NAME="${FG_ASSET_NAME:-fg}"

if [[ -n "${FG_INSTALL_DIR:-}" ]]; then
  INSTALL_DIR="${FG_INSTALL_DIR}"
elif [[ "$(id -u)" -eq 0 ]]; then
  INSTALL_DIR="/usr/local/bin"
else
  INSTALL_DIR="${HOME}/.local/bin"
fi

download_url="https://github.com/${FG_REPO}/releases/download/${FG_VERSION}/${FG_ASSET_NAME}"

echo "Installing fg to ${INSTALL_DIR}/fg"
echo "Source: ${download_url}"

mkdir -p "${INSTALL_DIR}"

curl -fsSL "${download_url}" -o "${INSTALL_DIR}/fg"
chmod +x "${INSTALL_DIR}/fg"

echo
echo "fg installed to ${INSTALL_DIR}/fg"
echo

# PATH warning.
if ! command -v fg >/dev/null 2>&1; then
  if [[ ":${PATH}:" != *":${INSTALL_DIR}:"* ]]; then
    echo "NOTE: ${INSTALL_DIR} is not on your PATH."
    echo "Add this to your ~/.bashrc (or equivalent):"
    echo
    echo "    export PATH=\"${INSTALL_DIR}:\${PATH}\""
    echo
  fi
fi

echo "Next step: run 'fg setup' to configure your API key."
