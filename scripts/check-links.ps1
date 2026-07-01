$patterns = @(
  "github\.com",
  "raw\.githubusercontent\.com",
  "gist\.github\.com",
  "gitlab\.com",
  "bitbucket\.org",
  "unpkg\.com",
  "jsdelivr\.net",
  "cdnjs\.cloudflare\.com",
  "fetch\(",
  "XMLHttpRequest",
  "WebSocket",
  "importScripts",
  "eval\(",
  "new Function",
  "document\.write"
)

foreach ($p in $patterns) {
  rg -n --hidden --glob "!node_modules" --glob "!.git" --glob "!*.map" --glob "!upstream/*.zip" $p .
}