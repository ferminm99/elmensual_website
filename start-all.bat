@echo off

echo Starting admin...
start cmd /k "cd admin && yarn dev"

echo Starting client...
start cmd /k "cd client && yarn dev"

echo Starting API...
start cmd /k "cd api && nodemon index.js"
