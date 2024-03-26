cd ./pkt
call npm run build-dist

cd ..

set currentDirectory=%cd%
set sourceFile=%currentDirectory%\pkt\dist\api.js
set destination=%currentDirectory%\ui\electron\pkt\api.cjs
copy /Y "%sourceFile%" "%destination%"

cd ui
start "Svelte UI" npm run dev