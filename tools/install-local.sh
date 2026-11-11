#!/bin/sh
# Install the bot of a commit (default HEAD) into the local 0 A.D. as the
# "strategos" mod: ~/.local/share/0ad/mods/strategos becomes a copy of that
# commit's bot/ (never a link to the working tree), and the mod is enabled
# in the user config so Strategos shows up in the game setup's AI list.
# The installed commit is recorded in the mod's .installed-commit file.
#
# Usage: tools/install-local.sh [<commit>]
set -eu
rev=${1:-HEAD}
repo=$(git -C "$(dirname "$0")" rev-parse --show-toplevel)
sha=$(git -C "$repo" rev-parse --short "$rev")
mods=${XDG_DATA_HOME:-$HOME/.local/share}/0ad/mods
cfg=${XDG_CONFIG_HOME:-$HOME/.config}/0ad/config/user.cfg

if ! git -C "$repo" cat-file -e "$rev:bot/mod.json" 2>/dev/null; then
	echo "install-local.sh: no bot/mod.json in $sha" >&2
	exit 1
fi
# A running game keeps the mod mounted and rewrites user.cfg on exit.
if pgrep -a pyrogenesis | grep -qv -- -autostart; then
	echo "install-local.sh: 0 A.D. is running, quit it first" >&2
	exit 1
fi

tmp=$(mktemp -d)
trap 'rm -rf "$tmp"' EXIT
git -C "$repo" archive "$rev" bot | tar -x -C "$tmp"
echo "$sha" > "$tmp/bot/.installed-commit"
mkdir -p "$mods"
rm -rf "$mods/strategos"
mv "$tmp/bot" "$mods/strategos"

mkdir -p "$(dirname "$cfg")"
touch "$cfg"
if ! grep -q '^mod.enabledmods' "$cfg"; then
	echo 'mod.enabledmods = "mod public strategos"' >> "$cfg"
elif ! grep -q '^mod.enabledmods = ".*\bstrategos\b' "$cfg"; then
	sed -i 's/^\(mod.enabledmods = ".*\)"$/\1 strategos"/' "$cfg"
fi
echo "installed strategos $sha -> $mods/strategos ($(grep '^mod.enabledmods' "$cfg"))"
