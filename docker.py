import os
import subprocess
import sys

def load_env_variables(env_file_path):
    if os.path.exists(env_file_path):
        print(f"Loading environment variables from {env_file_path}...")
        with open(env_file_path) as f:
            for line in f:
                if "=" in line:
                    key, value = line.strip().split('=', 1)
                    os.environ[key] = value
    else:
        print(f"Error: Environment file not found at {env_file_path}")
        exit(1)

def docker_build():
    print("Building Docker image...")
    subprocess.Popen(["docker", "build", "-t", "radioescola", "-f", "docker/Dockerfile-nodejs", "."])
    subprocess.Popen(["docker", "build", "-t", "radioescoladb", "-f", "docker/Dockerfile-mariadb", "."])
    subprocess.Popen(["docker", "run", "-d", "-p", "3306:3306", "--name", "my-mariadb-container", "radioescoladb"])

def docker_refresh():
    print("Refreshing container...")
    subprocess.Popen(["docker", "cp", ".", "radioescola_container:/usr/src/app"])
    subprocess.Popen(["docker", "exec", "-it", "radioescola_container", "bash", "-c", "npm install"])
    subprocess.Popen(["docker", "exec", "-it", "radioescola_container", "bash", "-c", "npm Popen dev"])

def docker_db():
    print("Launching containers...")
    subprocess.Popen(["docker", "run", "-d", "-p", "3306:3306", "--name", "mariadb_container",
                    "-e", f"MYSQL_ROOT_PASSWORD={os.getenv('MYSQL_ROOT_PASSWORD')}",
                    "-e", f"MYSQL_DATABASE={os.getenv('MYSQL_DATABASE')}",
                    "-e", f"MYSQL_USER={os.getenv('MYSQL_USER')}",
                    "-e", f"MYSQL_PASSWORD={os.getenv('MYSQL_PASSWORD')}",
                    "mariadb:latest"])

def docker_launch():
    print("Launching containers...")
    subprocess.Popen(["docker", "run", "-d", "-p", "3306:3306", "--name", "mariadb_container",
                    "-e", f"MYSQL_ROOT_PASSWORD={os.getenv('MYSQL_ROOT_PASSWORD')}",
                    "-e", f"MYSQL_DATABASE={os.getenv('MYSQL_DATABASE')}",
                    "-e", f"MYSQL_USER={os.getenv('MYSQL_USER')}",
                    "-e", f"MYSQL_PASSWORD={os.getenv('MYSQL_PASSWORD')}",
                    "mariadb:latest"])
    subprocess.Popen(["timeout", "/t", "10"], shell=True)
    subprocess.Popen(["docker", "run", "-it", "--rm", "--name", "radioescola_container", "-e", "DISPLAY=" + os.getenv('DISPLAY'),
                    "-v", "/tmp/.X11-unix:/tmp/.X11-unix", "-p", "3000:3000", "--link", "mariadb_container:mariadb", "radioescola"])

if __name__ == "__main__":
    # Change to the parent directory
    

    # Load environment variables
    env_file = "src/password.env"
    load_env_variables(env_file)

    if len(sys.argv) > 1:
        command = sys.argv[1]
        if command == "build":
            docker_build()
        elif command == "refresh":
            docker_refresh()
        elif command == "db":
            docker_db()
        elif command == "launch":
            docker_launch()
        else:
            print("Invalid option. Use 'python docker_script.py build' to build the image, 'python docker_script.py refresh' to refresh the container, or 'python docker_script.py launch' to start the application.")
    else:
        print("No command provided.")
