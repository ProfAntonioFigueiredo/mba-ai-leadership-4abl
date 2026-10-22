param([switch]$Apply)
$ErrorActionPreference='Stop'
$projectRoot=Split-Path -Parent $PSScriptRoot
Push-Location -LiteralPath $projectRoot
try {
 Write-Host 'Ativação da API de notas — SpeakUp'
 Write-Host 'Plano: verificar configuração; testar; revisar/aplicar migrações; configurar origem; publicar student-grades.'
 if(-not $Apply){
  & node scripts/check-api-setup.mjs
  Write-Host 'Nenhuma alteração foi executada. Após configurar e vincular o projeto, execute: npm run api:activate -- -Apply'
  exit 0
 }
 & node scripts/check-api-setup.mjs
 if($LASTEXITCODE -ne 0){throw 'Configuração incompleta. Execute npm run api:check e corrija as pendências.'}
 $values=@{}
 foreach($line in Get-Content -LiteralPath '.env.local'){
  if($line -match '^\s*([A-Z_][A-Z0-9_]*)\s*=\s*(.*?)\s*$'){$values[$Matches[1]]=$Matches[2].Trim().Trim('"').Trim("'")}
 }
 $projectRef=([uri]$values['VITE_SUPABASE_URL']).Host.Split('.')[0]
 $linkedFile=Join-Path $projectRoot 'supabase/.temp/project-ref'
 if(-not(Test-Path -LiteralPath $linkedFile) -or (Get-Content -Raw -LiteralPath $linkedFile).Trim() -ne $projectRef){throw 'Vincule primeiro o mesmo projeto com npx supabase link --project-ref SEU_PROJECT_REF.'}
 $localCli=Join-Path $projectRoot 'node_modules/.bin/supabase.cmd'
 if(Test-Path -LiteralPath $localCli){$cli=$localCli}else{$command=Get-Command supabase -ErrorAction SilentlyContinue;if(-not $command){throw 'Instale o CLI seguindo docs/api-notas-operacao.md.'};$cli=$command.Source}
 function Invoke-Cli([string[]]$Arguments){& $cli @Arguments;if($LASTEXITCODE -ne 0){throw ('Supabase falhou na etapa '+$Arguments[0]+'. Pare e confira o resultado antes de tentar novamente.')}}
 & npm.cmd test
 if($LASTEXITCODE -ne 0){throw 'Os testes falharam.'}
 & npm.cmd run build
 if($LASTEXITCODE -ne 0){throw 'O build falhou.'}
 Invoke-Cli -Arguments @('db','push','--dry-run')
 # O CLI apresenta as migrações pendentes e sua confirmação padrão antes de aplicá-las.
 Invoke-Cli -Arguments @('db','push')
 Invoke-Cli -Arguments @('secrets','set',('ALLOWED_ORIGIN='+$values['ALLOWED_ORIGIN']),'--project-ref',$projectRef)
 Invoke-Cli -Arguments @('functions','deploy','student-grades','--project-ref',$projectRef)
 Write-Host 'Comandos de publicação concluídos. Endpoint:'
 Write-Host ($values['VITE_SUPABASE_URL'].TrimEnd('/')+'/functions/v1/student-grades')
 Write-Host 'Próximos passos: autorizar a conta da empresa, conectar notas reais e testar pela aplicação. Publicação não comprova esses passos.'
} finally {Pop-Location}
