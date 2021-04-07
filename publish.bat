echo off
call prettier --config ./prettier.io.json --write .
git add .
git commit -m %1
git push -u origin master
echo "Successfully commented " %1
pause