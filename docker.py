import os
import subprocess
import sys
import shutil


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
        sys.exit(1)

def docker_stop():
    print("Stopping containers...")
    # Stop specific containers
    subprocess.Popen(["docker", "stop", "radioescoladb"])
    subprocess.Popen(["docker", "stop", "radioescola"])
    # Prune all stopped containers with force option
    subprocess.Popen(["docker", "container", "prune", "-f"])
    # Remove the network
    subprocess.Popen(["docker", "network", "rm", "radioescola_network"])

def docker_build():
    print("Building Docker images...")
    subprocess.Popen(["docker", "build", "-t", "radioescola", "-f", "docker/Dockerfile-nodejs", "."])
    subprocess.Popen(["docker", "build", "-t", "radioescoladb", "-f", "docker/Dockerfile-mariadb", "."])

def docker_refresh():
    print("Refreshing container...")
    subprocess.Popen(["docker", "cp", "/src", "radioescola_container:/usr/src/app"])
    subprocess.Popen(["docker", "exec", "-it", "radioescola_container", "bash", "-c", "npm install"])
    subprocess.Popen(["docker", "exec", "-it", "radioescola_container", "bash", "-c", "npm run dev"])
def replace_env_file():
    original_file = 'src/password.env'
    replacement_file = 'src/password.env2'

    # Check if the replacement file exists
    if os.path.exists(replacement_file):
        # Remove the original file if it exists
        if os.path.exists(original_file):
            os.remove(original_file)
            print(f"Removed the original file: {original_file}")
        
        # the replacement file to the original file's name
        shutil.copy2(replacement_file, original_file)
        print(f"Renamed '{replacement_file}' to '{original_file}'")
    else:
        print(f"Replacement file '{replacement_file}' not found. No changes made.")

def revert_and_pull_env_file():
    file_path = 'src/password.env'

    try:
        # Revert changes to the specified file using git checkout
        subprocess.run(['git', 'checkout', '--', file_path], check=True, text=True, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
        print(f"Reverted changes to {file_path}")

        # Pull updates from the remote repository
        pull_result = subprocess.run(['git', 'pull'], check=True, text=True, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
        print("Pulled updates successfully:")
        print(pull_result.stdout)
    except subprocess.CalledProcessError as e:
        print("Failed to perform Git operations:")
        print(e.stderr)

def docker_db():
    print("Launching database container...")
    subprocess.Popen(["docker", "run", "-d", "-p", "3306:3306", "--name", "radioescoladb",
                      "--network=radioescola_network", "--ip", "172.18.0.2",
                      "-e", f"MARIADB_ROOT_PASSWORD={os.getenv('MYSQL_ROOT_PASSWORD')}",
                      "-e", f"MARIADB_DATABASE={os.getenv('MYSQL_DATABASE')}",
                      "-e", f"MARIADB_USER={os.getenv('MYSQL_USER')}",
                      "-e", f"MARIADB_PASSWORD={os.getenv('MYSQL_PASSWORD')}",
                      "mariadb:latest"])

def docker_launch():
    print("Launching application container...")
    subprocess.Popen(["docker", "run", "--rm", "--name", "radioescola", "-e", "DISPLAY=$DISPLAY",
                      "-v", "/tmp/.X11-unix:/tmp/.X11-unix", "-p", "3000:3000", "--network=radioescola_network", "--ip", "172.18.0.3", "radioescola"])

def docker_release():
    print("Launching container with public access...")
    subprocess.Popen(["docker", "run", "--rm", "--name", "radioescola", 
                      "-v", "/tmp/.X11-unix:/tmp/.X11-unix", "-p", "80:3000", "--network=radioescola_network", "--ip", "172.18.0.4", "radioescola"])

def create_docker_network(network_name):
    try:
        subprocess.run(["docker", "network", "create", "--subnet", "172.18.0.0/16", network_name], check=True)
        print(f"Docker network '{network_name}' created successfully.")
    except subprocess.CalledProcessError:
        print(f"Failed to create Docker network '{network_name}'. It might already exist.")

if __name__ == "__main__":
    # Load environment variables
    env_file = "src/password.env"
    load_env_variables(env_file)

    if len(sys.argv) > 1:
        command = sys.argv[1]
        if command == "build":
            revert_and_pull_env_file()
            replace_env_file()
            create_docker_network("radioescola_network")
            docker_build()
        elif command == "stop":
            docker_stop()
        elif command == "release":
            docker_release()
        elif command == "refresh":
            docker_refresh()
        elif command == "db":
            docker_db()
        elif command == "launch":
            docker_launch()
        else:
            print("Invalid option. Use 'build', 'release', 'refresh', 'db', or 'launch'.")
    else:
        print("No command provided.")
