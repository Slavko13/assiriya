[CmdletBinding()]
param(
    [string]$EnvFile = ".env",
    [switch]$SkipBootstrap
)

$ErrorActionPreference = "Stop"
$projectRoot = (Resolve-Path -LiteralPath (Join-Path $PSScriptRoot "..")).Path
$resolvedEnvFile = if ([System.IO.Path]::IsPathRooted($EnvFile)) {
    $EnvFile
} else {
    Join-Path $projectRoot $EnvFile
}

if (-not (Get-Command docker -ErrorAction SilentlyContinue)) {
    throw "Docker CLI was not found. Install and start Docker Desktop first."
}

if (-not (Test-Path -LiteralPath $resolvedEnvFile)) {
    $example = Join-Path $projectRoot ".env.example"
    Copy-Item -LiteralPath $example -Destination $resolvedEnvFile
    Write-Host "Created $resolvedEnvFile from .env.example. Replace all change-me values, then run this script again."
    exit 1
}

$placeholder = Select-String -LiteralPath $resolvedEnvFile -Pattern "change-me|REPLACE_WITH|YOUR\.TRUSTED|SERVER_IP" -Quiet
if ($placeholder) {
    throw "The environment file still contains placeholder values: $resolvedEnvFile"
}

Push-Location $projectRoot
try {
    $composeArgs = @(
        "compose", "--env-file", $resolvedEnvFile,
        "-f", "compose.yaml", "-f", "compose.dev.yaml"
    )

    & docker @composeArgs config --quiet
    if ($LASTEXITCODE -ne 0) { throw "Docker Compose configuration validation failed." }

    & docker @composeArgs up -d --build --wait
    if ($LASTEXITCODE -ne 0) { throw "Docker Compose failed to start the development stack." }

    if (-not $SkipBootstrap) {
        & docker @composeArgs run --rm --entrypoint sh wpcli /workspace/scripts/bootstrap-wordpress.sh
        if ($LASTEXITCODE -ne 0) { throw "WordPress bootstrap failed." }
    }

    & docker @composeArgs ps
    Write-Host "АВТОЗАКУП is running. Open the WP_HOME value from $resolvedEnvFile."
} finally {
    Pop-Location
}
