ps -ef | grep 'serverApiMySqlDatabase.js' | grep -v grep | awk '{print $2}' | xargs kill -9 1> serverApiMySqlDatabaseKillLog.out 2> serverApiMySqlDatabaseKillErr.out
cd ./build 
node serverApiMySqlDatabase.js 1> serverApiMySqlDatabaseLog.out 2> serverApiMySqlDatabasErr.out &