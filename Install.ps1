param()
$ErrorActionPreference = 'Stop'
$source = $PSScriptRoot
$destination = Join-Path $env:APPDATA 'Adobe\CEP\extensions\ImageSpacer'
$backupRoot = Join-Path $env:APPDATA 'Adobe\CEP\ImageSpacer-backups'
if (Test-Path -LiteralPath $destination) {
    $backup = Join-Path $backupRoot ('ImageSpacer-' + (Get-Date -Format 'yyyyMMdd-HHmmss') + '-' + [Guid]::NewGuid().ToString('N').Substring(0,8))
    New-Item -ItemType Directory -Force -Path $backupRoot | Out-Null
    Copy-Item -LiteralPath $destination -Destination $backup -Recurse
    Write-Host "Previous installation backed up to $backup"
}
New-Item -ItemType Directory -Force -Path $destination | Out-Null
foreach ($relative in @('CSXS\manifest.xml','index.html','js\layout.js','js\panel.js','jsx\host.jsx','README.md','CHANGELOG.md')) {
    $from = Join-Path $source $relative
    $to = Join-Path $destination $relative
    New-Item -ItemType Directory -Force -Path (Split-Path -Parent $to) | Out-Null
    Copy-Item -LiteralPath $from -Destination $to -Force
    if ((Get-FileHash -LiteralPath $from -Algorithm SHA256).Hash -ne (Get-FileHash -LiteralPath $to -Algorithm SHA256).Hash) { throw "File verification failed: $relative" }
}
Write-Host 'Image Spacer 1.1 installed and verified. Restart Illustrator and open Window > Extensions > Image Spacer.'
Write-Host 'No registry or security settings were changed.'
