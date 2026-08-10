#!/bin/bash
set -euo pipefail

REPO_URL="https://github.com/parkapcsolatikartya/egyutt-szamit-webapp.git"
REPO_DIR="$HOME/Documents/Git/egyutt-szamit-webapp"
BRANCH="v0-prototype"
SERVER_LOG="/tmp/egyutt-szamit-webapp-8080.log"

info() { printf '\n==> %s\n' "$1"; }
warn() { printf '\n[!] %s\n' "$1"; }

if [[ "$(uname -s)" != "Darwin" ]]; then
  echo "Ez a bootstrap macOS rendszerhez készült."
  exit 1
fi

info "Együtt számít – Mac fejlesztői környezet előkészítése"

# Git / Apple Command Line Tools
if ! command -v git >/dev/null 2>&1; then
  warn "A Git/Apple Command Line Tools nincs telepítve."
  xcode-select --install >/dev/null 2>&1 || true
  echo "A macOS megnyitotta a Command Line Tools telepítőjét. Telepítsd, majd futtasd újra ugyanezt a bootstrap parancsot."
  exit 2
fi

# Homebrew
if ! command -v brew >/dev/null 2>&1; then
  warn "A Homebrew nincs telepítve. A Node.js és GitHub CLI automatikus telepítéséhez szükséges."
  read -r -p "Telepítsem most a Homebrew-t a hivatalos telepítővel? [Y/n] " answer
  answer=${answer:-Y}
  if [[ "$answer" =~ ^[Yy]$ ]]; then
    /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
    if [[ -x /opt/homebrew/bin/brew ]]; then
      eval "$(/opt/homebrew/bin/brew shellenv)"
    elif [[ -x /usr/local/bin/brew ]]; then
      eval "$(/usr/local/bin/brew shellenv)"
    fi
  else
    echo "Homebrew nélkül az automatikus beállítás itt megáll."
    exit 3
  fi
fi

# Ensure brew is visible in this shell after installation.
if [[ -x /opt/homebrew/bin/brew ]]; then
  eval "$(/opt/homebrew/bin/brew shellenv)"
elif [[ -x /usr/local/bin/brew ]]; then
  eval "$(/usr/local/bin/brew shellenv)"
fi

# Node.js >=20
need_node=0
if ! command -v node >/dev/null 2>&1; then
  need_node=1
else
  node_major="$(node -p 'process.versions.node.split(".")[0]')"
  if (( node_major < 20 )); then
    need_node=1
  fi
fi
if (( need_node == 1 )); then
  info "Node.js telepítése/frissítése Homebrew-val"
  brew install node
fi

# npm comes with Node.
if ! command -v npm >/dev/null 2>&1; then
  echo "Az npm nem érhető el a Node telepítése után sem."
  exit 4
fi

# GitHub CLI
if ! command -v gh >/dev/null 2>&1; then
  info "GitHub CLI telepítése"
  brew install gh
fi

# Local clone
mkdir -p "$HOME/Documents/Git"
if [[ ! -d "$REPO_DIR/.git" ]]; then
  if [[ -e "$REPO_DIR" ]]; then
    echo "A célmappa létezik, de nem Git repository: $REPO_DIR"
    exit 5
  fi
  info "Repository klónozása"
  git clone "$REPO_URL" "$REPO_DIR"
fi

cd "$REPO_DIR"

remote_url="$(git remote get-url origin 2>/dev/null || true)"
if [[ "$remote_url" != "$REPO_URL" && "$remote_url" != "https://github.com/parkapcsolatikartya/egyutt-szamit-webapp" ]]; then
  echo "A meglévő repository origin címe eltér a várt tárolótól: $remote_url"
  exit 6
fi

if [[ -n "$(git status --porcelain)" ]]; then
  warn "A repository munkafája nem tiszta. Nem pullolok és nem írok felül helyi módosítást."
  git status --short
  exit 7
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
    exit 8
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
