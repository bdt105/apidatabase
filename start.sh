ps -ef | grep 'serverApiDatabase.js' | grep -v grep | awk '{print $2}' | xargs kill -9 1> killLog.out 2> killErr.out
cd ./build 
node serverApiDatabase.js 1> log.out 2> err.out &