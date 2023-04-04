param(
[string]$PLAIN_TEXT
)

$RegPath = 'HKEY_CURRENT_USER\Software\pylogmon\pot'

$key = Get-ItemProperty -Path "Registry::$RegPath"

$potDir = $key.InstallDir

$potExe = $potDir+"pot.exe"

& $potExe popclip "$PLAIN_TEXT"