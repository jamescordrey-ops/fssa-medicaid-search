@echo off
cd /d C:\Users\james\fssa-medicaid-search
git fetch origin > push_pages2.log 2>&1
git reset --hard origin/main >> push_pages2.log 2>&1
copy /Y C:\Users\james\fssa-pages-full.html index.html >> push_pages2.log 2>&1
copy /Y C:\Users\james\fssa-pages-small.html small-index.html >> push_pages2.log 2>&1
git add -A >> push_pages2.log 2>&1
git commit -q -m "v11 index: 5,188 docs (waiver applications, INvestABLE, hospice added)" >> push_pages2.log 2>&1
git push -q origin main >> push_pages2.log 2>&1
echo EXIT %ERRORLEVEL% >> push_pages2.log
git log --oneline -1 >> push_pages2.log
