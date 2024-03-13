@echo off
echo Radio Escola Docker Script

rem Load environment variables from .env file in the ../src/backend directory
set ENV_FILE=src\password.env
if exist "%ENV_FILE%" (
    echo Loading environment variables from %ENV_FILE%...
    for /f "tokens=*" %%i in (%ENV_FILE%) do set %%i
) else (
    echo Error: Environment file not found at %ENV_FILE%
)

rem Change directory to the parent directory
cd ..

if "%1" == "build" (
    echo Building Docker image...
    docker build -t radioescola -f docker/Dockerfile-nodejs .
    docker build -t radioescoladb -f docker/Dockerfile-mariadb .

) else if "%1" == "refresh" (
    echo Refreshing container...
    docker cp . radioescola_container:/usr/src/app
    docker exec -it radioescola_container bash -c "npm install"
    docker exec -it radioescola_container bash -c "npm run dev"
) else if "%1" == "launch" (
    echo Launching containers...
    docker run -d --name mariadb_container ^
        -e MYSQL_ROOT_PASSWORD=%MYSQL_ROOT_PASSWORD% ^
        -e MYSQL_DATABASE=%MYSQL_DATABASE% ^
        -e MYSQL_USER=%MYSQL_USER% ^
        -e MYSQL_PASSWORD=%MYSQL_PASSWORD% ^
        mariadb:latest
    timeout /t 10 >nul
    docker run -it --rm --name radioescola_container -e DISPLAY=%DISPLAY% ^
        -v /tmp/.X11-unix:/tmp/.X11-unix ^
        -p 3000:3000 ^
        --link mariadb_container:mariadb ^
        radioescola
) else (
    echo Invalid option. Use 'docker.bat build' to build the image, 'docker.bat refresh' to refresh the container, or 'docker.bat launch' to start the application.
)
