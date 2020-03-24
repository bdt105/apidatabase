Remove-Item -path apidatabase -recurse -force
git clone https://github.com/bdt105/apidatabase.git
cd apidatabase
npm install
cd ..
Copy-item -force configDb.json ./apidatabase/build/configuration.json
cd apidatabase
./start.bat
cd ..