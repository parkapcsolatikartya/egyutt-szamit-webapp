#!/bin/bash
set -euo pipefail

REPO_URL="https://github.com/parkapcsolatikartya/egyutt-szamit-webapp.git"
REPO_DIR="$HOME/Documents/Git/egyutt-szamit-webapp"
BRANCH="v0-prototype"
SERVER_LOG="/tmp/egyutt-szamit-webapp-8080.log"
LOCAL_BIN="$HOME/.local/bin"
NODE_ROOT="$HOME/.local/node"
NODE_CURRENT="$HOME/.local/node-current"
SHELL_RC="$HOME/.zshrc"
PATH_LINE='export PATH="$HOME/.local/node-current/bin:$HOME/.local/bin:$PATH"'

info() { printf '\n==> %s\n' "$1"; }
warn() { printf '\n[!] %s\n' "$1"; }

if [[ "$(uname -s)" != "Darwin" ]]; then
  echo "Ez a bootstrap macOS rendszerhez készült."
  exit 1
fi

MACOS_VERSION="$(sw_vers -productVersion)"
MACOS_MAJOR="${MACOS_VERSION%%.*}"
MACHINE_ARCH="$(uname -m)"

case "$MACHINE_ARCH" in
  x86_64)
    NODE_ARCH="x64"
    GH_ARCH="amd64"
    ;;
  arm64)
    NODE_ARCH="arm64"
    GH_ARCH="arm64"
    ;;
  *)
    echo "Nem támogatott Mac architektúra: $MACHINE_ARCH"
    exit 1
    ;;
esac

info "Együtt számít – Mac fejlesztői környezet előkészítése"
printf 'macOS: %s\nArchitektúra: %s\n' "$MACOS_VERSION" "$MACHINE_ARCH"

# Git / Apple Command Line Tools
if ! command -v git >/dev/null 2>&1 || ! git --version >/dev/null 2>&1; then
  warn "A Git/Apple Command Line Tools nincs használható állapotban."
  xcode-select --install >/dev/null 2>&1 || true
  echo "A macOS megnyitotta a Command Line Tools telepítőjét. Telepítsd, majd futtasd újra ugyanezt a bootstrap parancsot."
  exit 2
fi

# User-local PATH. This avoids Homebrew source builds on older macOS releases.
mkdir -p "$LOCAL_BIN" "$NODE_ROOT"
if [[ ! -f "$SHELL_RC" ]]; then
  touch "$SHELL_RC"
fi
if ! grep -Fq "$PATH_LINE" "$SHELL_RC"; then
  printf '\n# Együtt számít fejlesztői eszközök\n%s\n' "$PATH_LINE" >> "$SHELL_RC"
fi
export PATH="$NODE_CURRENT/bin:$LOCAL_BIN:$PATH"

# Node.js >=20. Install the official prebuilt Node 24 binary directly from nodejs.org.
need_node=0
if ! command -v node >/dev/null 2>&1; then
  need_node=1
else
  node_major="$(node -p 'process.versions.node.split(".")[0]' 2>/dev/null || echo 0)"
  if (( node_major < 20 )); then
    need_node=1
  fi
fi

if (( need_node == 1 )); then
  info "Node.js 24 LTS hivatalos előre fordított bináris telepítése"
  NODE_BASE="https://nodejs.org/dist/latest-v24.x"
  NODE_FILE="$(curl -fsSL "$NODE_BASE/SHASUMS256.txt" | awk '{print $2}' | grep "^node-v24.*-darwin-${NODE_ARCH}\.tar\.gz$" | head -n 1)"
  if [[ -z "$NODE_FILE" ]]; then
    echo "Nem találtam megfelelő hivatalos Node.js macOS binárist az architektúrához: $NODE_ARCH"
    exit 3
  fi
  NODE_DIR_NAME="${NODE_FILE%.tar.gz}"
  TMP_NODE="$(mktemp -d /tmp/egyutt-node.XXXXXX)"
  trap 'rm -rf "$TMP_NODE" 2>/dev/null || true' EXIT
  curl -fL "$NODE_BASE/$NODE_FILE" -o "$TMP_NODE/$NODE_FILE"
  tar -xzf "$TMP_NODE/$NODE_FILE" -C "$TMP_NODE"
  rm -rf "$NODE_ROOT/$NODE_DIR_NAME"
  mv "$TMP_NODE/$NODE_DIR_NAME" "$NODE_ROOT/$NODE_DIR_NAME"
  ln -sfn "$NODE_ROOT/$NODE_DIR_NAME" "$NODE_CURRENT"
  export PATH="$NODE_CURRENT/bin:$LOCAL_BIN:$PATH"
  rm -rf "$TMP_NODE"
  trap - EXIT
fi

if ! command -v npm >/dev/null 2>&1; then
  echo "Az npm nem érhető el a Node telepítése után sem."
  exit 4
fi

# GitHub CLI. Use the official GitHub release binary instead of Homebrew.
if ! command -v gh >/dev/null 2>&1; then
  info "GitHub CLI hivatalos macOS bináris telepítése"
  GH_URL="$(curl -fsSL https://api.github.com/repos/cli/cli/releases/latest \
    | grep '"browser_download_url":' \
    | sed -E 's/.*"([^"]+)".*/\1/' \
    | grep "_macOS_${GH_ARCH}\.zip$" \
    | head -n 1)"
  if [[ -z "$GH_URL" ]]; then
    echo "Nem találtam megfelelő GitHub CLI macOS binárist az architektúrához: $GH_ARCH"
    exit 5
  fi
  TMP_GH="$(mktemp -d /tmp/egyutt-gh.XXXXXX)"
  trap 'rm -rf "$TMP_GH" 2>/dev/null || true' EXIT
  curl -fL "$GH_URL" -o "$TMP_GH/gh.zip"
  unzip -q "$TMP_GH/gh.zip" -d "$TMP_GH"
  GH_BIN="$(find "$TMP_GH" -type f -path '*/bin/gh' -print | head -n 1)"
  if [[ -z "$GH_BIN" ]]; then
    echo "A GitHub CLI archívumban nem található a gh bináris."
    exit 6
  fi
  cp "$GH_BIN" "$LOCAL_BIN/gh"
  chmod +x "$LOCAL_BIN/gh"
  rm -rf "$TMP_GH"
  trap - EXIT
fi

# Local clone
mkdir -p "$HOME/Documents/Git"
if [[ ! -d "$REPO_DIR/.git" ]]; then
  if [[ -e "$REPO_DIR" ]]; then
    echo "A célmappa létezik, de nem Git repository: $REPO_DIR"
    exit 7
  fi
  info "Repository klónozása"
  git clone "$REPO_URL" "$REPO_DIR"
fi

cd "$REPO_DIR"

remote_url="$(git remote get-url origin 2>/dev/null || true)"
if [[ "$remote_url" != "$REPO_URL" && "$remote_url" != "https://github.com/parkapcsolatikartya/egyutt-szamit-webapp" ]]; then
  echo "A meglévő repository origin címe eltér a várt tárolótól: $remote_url"
  exit 8
fi

if [[ -n "$(git status --porcelain)" ]]; then
  warn "A repository munkafája nem tiszta. Nem pullolok és nem írok felül helyi módosítást."
  git status --short
  exit 9
fi

info "Fejlesztési ág frissítése"
git fetch origin
if git show-ref --verify --quiet "refs/heads/$BRANCH"; then
  git switch "$BRANCH"
else
  git switch --track "origin/$BRANCH"
fi
git pull --ff-only origin "$BRANCH"

# GitHub authentication. Browser approval is intentionally user-controlled.
if ! gh auth status -h github.com >/dev/null 2>&1; then
  info "GitHub bejelentkezés szükséges"
  echo "A következő lépés böngészőt nyithat. A GitHub oldalon neked kell jóváhagynod a hozzáférést."
  gh auth login --hostname github.com --git-protocol https --web
fi
gh auth setup-git

# Tests
info "Projekt tesztek"
npm test

# Local server
if curl -fsS "http://localhost:8080" >/dev/null 2>&1; then
  info "A localhost:8080 már fut"
else
  info "Localhost szerver indítása"
  nohup npm run serve >"$SERVER_LOG" 2>&1 &
  server_pid=$!
  sleep 2
  if curl -fsS "http://localhost:8080" >/dev/null 2>&1; then
    echo "Localhost elindult (PID: $server_pid). Log: $SERVER_LOG"
  else
    warn "A localhost nem válaszol. Log: $SERVER_LOG"
    tail -n 30 "$SERVER_LOG" 2>/dev/null || true
    exit 10
  fi
fi

# Open project in VS Code when available.
if open -Ra "Visual Studio Code" >/dev/null 2>&1; then
  info "Projekt megnyitása VS Code-ban"
  open -a "Visual Studio Code" "$REPO_DIR"
else
  warn "Visual Studio Code nincs telepítve ezen a Macen. A fejlesztői környezet ettől függetlenül elkészült."
fi

open "http://localhost:8080" >/dev/null 2>&1 || true

info "Kész"
printf 'Repository: %s\n' "$REPO_DIR"
printf 'Ág: %s\n' "$(git branch --show-current)"
printf 'Git: %s\n' "$(git --version)"
printf 'Node: %s\n' "$(node --version)"
printf 'npm: %s\n' "$(npm --version)"
printf 'gh: %s\n' "$(gh --version | head -n 1)"
printf 'GitHub: %s\n' "$(gh api user --jq .login 2>/dev/null || echo 'nincs bejelentkezve')"
printf 'Localhost: http://localhost:8080\n'
echo "A gép projektfejlesztésre elő van készítve. VS Code + Codex esetén a következő napi parancs: WORKSTART"
