param(
[string]$PLAIN_TEXT
)

$encode_text = [System.Text.Encoding]::UTF8.GetBytes($PLAIN_TEXT)

curl 127.0.0.1:60828 -Method POST -Body $encode_text -UseBasicParsing
