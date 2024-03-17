import os
import subprocess
import sys
import bcrypt

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

def hash_password(password):
    # Fetch the salt rounds value from environment variables, with a default of 10 if not specified
    salt_rounds = int(os.getenv("SALT_ROUNDS", 10))
    
    # Convert the password to bytes
    password_bytes = password.encode('utf-8')
    # Generate a salt with specified rounds
    salt = bcrypt.gensalt(rounds=salt_rounds)
    # Generate the hashed password
    hashed_password = bcrypt.hashpw(password_bytes, salt)
    return hashed_password

def docker_build():
    print("Building Docker image...")
    subprocess.Popen(["docker", "build", "-t", "radioescola", "-f", "docker/Dockerfile-nodejs", "."])
    subprocess.Popen(["docker", "build", "-t", "radioescoladb", "-f", "docker/Dockerfile-mariadb", "."])

def docker_refresh():
    print("Refreshing container...")
    subprocess.Popen(["docker", "cp", "/src", "radioescola_container:/usr/src/app"])
    subprocess.Popen(["docker", "exec", "-it", "radioescola_container", "bash", "-c", "npm install"])
    subprocess.Popen(["docker", "exec", "-it", "radioescola_container", "bash", "-c", "npm run dev"])

def docker_db():
    print("Launching containers...")
    subprocess.Popen(["docker", "run", "-d", "-p", "3306:3306", "--name", "radioescoladb",
                    "-e", f"MYSQL_ROOT_PASSWORD={os.getenv('MYSQL_ROOT_PASSWORD')}",
                    "-e", f"MYSQL_DATABASE={os.getenv('MYSQL_DATABASE')}",
                    "-e", f"MYSQL_USER={os.getenv('MYSQL_USER')}",
                    "-e", f"MYSQL_PASSWORD={os.getenv('MYSQL_PASSWORD')}",
                    "mariadb:latest"])




def docker_launch():
    print("Launching containers...")

    subprocess.Popen(["docker", "run", "-it", "--rm", "--name", "radioescola_container", "-e", "DISPLAY=$DISPLAY",
                    "-v", "/tmp/.X11-unix:/tmp/.X11-unix", "-p", "3000:3000", "radioescola", "--link", "radioescoladb:mariadb", "radioescola"])

def docker_noDblaunch():
    print("Launching containers...")

    subprocess.Popen(["docker", "run", "-it", "--rm", "--name", "radioescola_container", "-e", "DISPLAY=$DISPLAY",
                  "-v", "/tmp/.X11-unix:/tmp/.X11-unix", "-p", "3000:3000", "radioescola"])



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
        elif command == "noDb":
            docker_noDblaunch()
        elif command == "launch":
            docker_launch()
        else:
            print("Invalid option. Use 'python docker_script.py build' to build the image, 'python docker_script.py refresh' to refresh the container, or 'python docker_script.py launch' to start the application.")
    else:
        print("No command provided.")
