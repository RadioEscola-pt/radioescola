#!/bin/bash
#!/bin/bash

# This script checks for new Git tags and checks out the latest tag if found.
# Replace '/path/to/your/git/repo' with the actual path to your Git repository.
# To schedule this script to run every hour, you can add a cron job as follows:

# Edit your crontab using the crontab command:
# crontab -e

# Add the following line to run the script every hour:
# 0 * * * * /path/to/your/script.sh

# Save the file and exit the text editor.

# Set the path to your Git repository

repo_path="/path/to/your/git/repo"

# Change the working directory to the Git repository
cd "$repo_path" || exit

# Get the current checked-out tag (if any)
current_tag=$(git describe --tags --abbrev=0)

# Fetch updates from the remote repository
git fetch --tags

# Get the latest tag
latest_tag=$(git describe --tags --abbrev=0)

# Check if a new tag is available
if [ "$current_tag" != "$latest_tag" ]; then
  echo "New tag found: $latest_tag"
  echo "Checking out the latest tag..."
  git checkout "$latest_tag"
else
  echo "No new tags found."
fi

