# Launch Google Chrome or Microsoft Edge in full view on the user's screen
$pageUrl = "file:///C:/Users/pc/.gemini/antigravity-ide/brain/948017d2-a133-41d0-a5e1-fcac129896ac/scratch/radioescola_app.html"

$chromePath = "C:\Program Files\Google\Chrome\Application\chrome.exe"
$edgePath = "C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe"

if (Test-Path $chromePath) {
    Write-Host "Abrindo o Google Chrome em tela cheia..." -ForegroundColor Green
    Start-Process $chromePath -ArgumentList "--new-window", "--start-maximized", "`"$pageUrl`""
} elseif (Test-Path $edgePath) {
    Write-Host "Abrindo o Microsoft Edge em tela cheia..." -ForegroundColor Green
    Start-Process $edgePath -ArgumentList "--new-window", "--start-maximized", "`"$pageUrl`""
} else {
    Write-Host "Abrindo no navegador padrao..." -ForegroundColor Green
    Start-Process $pageUrl
}

Write-Host "Navegador aberto na tela com os testes executando!" -ForegroundColor Cyan
