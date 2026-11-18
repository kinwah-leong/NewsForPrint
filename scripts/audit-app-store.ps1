param(
  [datetime]$Since = [datetime]'2025-11-18'
)

$apps = @(
  @{ Name = 'FlashToy / 闪电打印'; Id = '6738379656'; Region = 'us' },
  @{ Name = 'Fun Tattoo'; Id = '6544783958'; Region = 'us' },
  @{ Name = 'Tattoo Go'; Id = '6737122641'; Region = 'us' },
  @{ Name = 'Nada Print'; Id = '6739829512'; Region = 'us' },
  @{ Name = 'Jadens Printer'; Id = '1615277532'; Region = 'us' },
  @{ Name = 'AiYin / 爱印'; Id = '6476474665'; Region = 'us' },
  @{ Name = 'RONGTA'; Id = '6469987269'; Region = 'cn' },
  @{ Name = '知无涯'; Id = '1539625064'; Region = 'cn' },
  @{ Name = 'Fun Print / 喵学王'; Id = '1592740556'; Region = 'us' },
  @{ Name = 'HereLabel'; Id = '1561322584'; Region = 'us' },
  @{ Name = '汉印美照'; Id = '1451152779'; Region = 'cn' },
  @{ Name = 'Liene Photo / 极印Photo'; Id = '1568005162'; Region = 'us' },
  @{ Name = 'Cricut Design Space'; Id = '749471884'; Region = 'us' }
)

$pattern = '<li><div class="container detail[\s\S]*?HTML_TAG_START -->(?<notes>[\s\S]*?)<!-- HTML_TAG_END -->[\s\S]*?<div class="metadata[\s\S]*?<span[^>]*>(?<version>[^<]+)</span>\s*<time datetime="(?<date>[^"]+)"'

$results = foreach ($app in $apps) {
  $url = "https://apps.apple.com/$($app.Region)/app/id$($app.Id)"
  try {
    $html = (Invoke-WebRequest -UseBasicParsing $url).Content
    $versions = @([regex]::Matches($html, $pattern) | ForEach-Object {
      $plainNotes = [System.Net.WebUtility]::HtmlDecode(($_.Groups['notes'].Value -replace '<[^>]+>', ' ' -replace '\s+', ' ').Trim())
      [pscustomobject]@{
        version = $_.Groups['version'].Value.Trim()
        date = $_.Groups['date'].Value
        notes = $plainNotes
      }
    })
    $latest = $versions | Sort-Object { [datetime]$_.date } -Descending | Select-Object -First 1
    [pscustomobject]@{
      name = $app.Name
      region = $app.Region
      latestVersion = $latest.version
      latestDate = $latest.date
      latestNotes = $latest.notes
      updatesLast12Months = @($versions | Where-Object { [datetime]$_.date -ge $Since }).Count
      visibleHistoryCount = $versions.Count
      source = $url
      status = if ($versions.Count) { 'ok' } else { 'no-history' }
    }
  } catch {
    [pscustomobject]@{
      name = $app.Name
      region = $app.Region
      latestVersion = $null
      latestDate = $null
      latestNotes = $null
      updatesLast12Months = $null
      visibleHistoryCount = 0
      source = $url
      status = $_.Exception.Message
    }
  }
}

$results | ConvertTo-Json -Depth 4
