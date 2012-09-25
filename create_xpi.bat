@echo
rm open-henp.xpi
cd src
..\7za.exe a open-henp.xpi chrome chrome.manifest defaults install.rdf
mv open-henp.xpi ..
cd ..
explorer.exe /select,"open-henp.xpi"