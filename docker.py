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

def refresh_nodejs_container(port):
    print("Checking for existing Node.js container...")
    list_containers = subprocess.run(["docker", "ps", "-q", "-f", "name=radioescola"], capture_output=True, text=True)
    if list_containers.stdout.strip():
        print("Stopping existing Node.js container...")
        stop_process = subprocess.run(["docker", "stop", "radioescola"], capture_output=True, text=True)
        print(stop_process.stdout if stop_process.stdout else "Container stopped.")

        print("Removing stopped Node.js container...")
        remove_process = subprocess.run(["docker", "rm", "radioescola"], capture_output=True, text=True)
        print(remove_process.stdout if remove_process.stdout else "Container removed.")
    else:
        print("No existing Node.js container to stop.")

    print("Checking for existing Docker image...")
    image_exists = subprocess.run(["docker", "images", "-q", "radioescola"], capture_output=True, text=True)
    if image_exists.stdout.strip():
        print("Removing existing Docker image...")
        rmi_process = subprocess.run(["docker", "rmi", "radioescola"], capture_output=True, text=True)
        print(rmi_process.stdout if rmi_process.stdout else "Image removed.")
    else:
        print("No existing Docker image to remove.")

    print("Rebuilding Node.js Docker image...")
    build_process = subprocess.run(["docker", "build", "-t", "radioescola", "-f", "docker/Dockerfile-nodejs", "."], capture_output=True, text=True)
    if build_process.stdout:
        print("Docker image rebuilt successfully.")
        print(build_process.stdout)
    else:
        print("Error rebuilding Docker image:")
        print(build_process.stderr)
        return

    docker_launchNode(port)

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


def docker_launchNode(port):
    print("Launching container with public access...")
    subprocess.Popen(["docker", "run", "--rm", "--name", "radioescola", 
                      "-v", "/tmp/.X11-unix:/tmp/.X11-unix", "-p", "{port}:3000", "--network=radioescola_network", "--ip", "172.18.0.4", "radioescola"])

def create_docker_network(network_name):
    try:
        subprocess.run(["docker", "network", "create", "--subnet", "172.18.0.0/16", network_name], check=True)
        print(f"Docker network '{network_name}' created successfully.")
    except subprocess.CalledProcessError:
        print(f"Failed to create Docker network '{network_name}'. It might already exist.")

def help_command():
    help_text = """
    Available Commands:
    build     - Pulls updates from git, replaces the environment file, creates a Docker network, and builds Docker images for the Node.js app and MariaDB.
    stop      - Stops all running containers related to the application and prunes them, including removing the Docker network.
    nodejs    - Launches the Node.js application container on a specified port. Requires a port number as an argument.
    refresh   - Stops the existing Node.js container, removes it, optionally removes the existing image, rebuilds the image, and relaunches the container on a specified port. Requires a port number as an argument.
    db        - Launches the MariaDB container with network and environment configurations set.
    help      - Displays the help text with available commands and descriptions.
    
    Usage:
    python script_name.py [command] [options]
    
    Examples:
    python script_name.py build
    python script_name.py stop
    python script_name.py nodejs 3000
    python script_name.py refresh 3000
    python script_name.py db
    python script_name.py help
    """
    print(help_text)

if __name__ == "__main__":
    # Load environment variables
    env_file = "src/password.env"
    load_env_variables(env_file)

    if len(sys.argv) > 1:
        command = sys.argv[1]
        if command in ["nodejs", "refresh"] and len(sys.argv) > 2:
            port = sys.argv[2]
        
        if command == "build":
            revert_and_pull_env_file()
            replace_env_file()
            create_docker_network("radioescola_network")
            docker_build()
        elif command == "stop":
            docker_stop()
        elif command == "nodejs":
            port = sys.argv[2]
            docker_launchNode(port)
        elif command == "refresh":
            port = sys.argv[2]
            replace_env_file()
            refresh_nodejs_container(port)
            revert_and_pull_env_file()
        elif command == "db":
            docker_db()

        else:
            help_command()
    else:
        help_command()
