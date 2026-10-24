# The weekly posting run of the Windows dev machine, started by Task Scheduler (see README): the next
# Hoandat Apps feature Short, then Miu World's lesson clip of the school week (YouTube only until the
# Fanpage has a Page token). Each ledger is committed and pushed after a post, so a later run never posts
# the same video again. Output goes to out/weekly-task.log; the token file is read by the tools, never here.
param(
	[Parameter(Mandatory = $true)][string]$TokenFile
)

$ErrorActionPreference = "Continue"
$package = $PSScriptRoot
$workspace = (Resolve-Path (Join-Path $package "..\..\..")).Path
$shared = Join-Path $workspace "shared-next"
$miu = Join-Path $workspace "miu-world-next"
New-Item -ItemType Directory -Force (Join-Path $package "out") | Out-Null
$log = Join-Path $package "out\weekly-task.log"

function Write-Log([string]$text) {
	"$(Get-Date -Format s) $text" | Out-File -FilePath $log -Append -Encoding utf8
}

# Commits and pushes the given paths of a repository when they changed; failures are logged, not fatal.
function Save-Ledger([string]$repo, [string[]]$paths, [string]$message) {
	# One path at a time: git rejects the whole list when one pattern matches nothing (no report this week).
	foreach ($path in $paths) { git -C $repo add -- $path 2>$null }
	git -C $repo diff --cached --quiet -- $paths
	if ($LASTEXITCODE -eq 0) { return }
	# Commit only the ledger, even if someone else staged other files in the meantime.
	git -C $repo commit -q -m $message -- $paths 2>&1 | Out-File -FilePath $log -Append -Encoding utf8
	git -C $repo pull -q --rebase --autostash origin main 2>&1 | Out-File -FilePath $log -Append -Encoding utf8
	git -C $repo push -q origin main 2>&1 | Out-File -FilePath $log -Append -Encoding utf8
	Write-Log "${repo}: ledger pushed (exit $LASTEXITCODE)"
}

Write-Log "start"

Push-Location $package
$env:MARKETING_TOKEN_FILE = $TokenFile
pnpm -s weekly --publish 2>&1 | Out-File -FilePath $log -Append -Encoding utf8
Write-Log "hoandat apps weekly exit $LASTEXITCODE"
Pop-Location
Save-Ledger $shared @("packages/app-shorts/posted.json") "chore(app-shorts): record this week's posted Short"

Push-Location $miu
$env:MIU_MARKETING_TOKEN_FILE = $TokenFile
pnpm -s marketing:weekly -- --publish --channel youtube 2>&1 | Out-File -FilePath $log -Append -Encoding utf8
Write-Log "miu world weekly exit $LASTEXITCODE"
Pop-Location
Save-Ledger $miu @("content/marketing/posted.json", "plans/dattqh/reports/marketing-weekly-*.md") "chore(marketing): record this week's posted clip"

Write-Log "done"
