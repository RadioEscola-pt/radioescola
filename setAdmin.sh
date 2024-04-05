#!/bin/bash

# Path to the environment file
ENV_FILE="src/password.env"

echo "Loading environment variables from $ENV_FILE..."

# Load environment variables from the provided environment file
if [ -f "$ENV_FILE" ]; then
    while IFS='=' read -r key value
    do
        key=$(echo "$key" | tr -d '[:space:]\r')  # Trim whitespace and carriage returns from key
        value=$(echo "$value" | tr -d '[:space:]\r')  # Trim whitespace and carriage returns from value
        export "$key"="$value"
        echo "$key set to $value"
    done < "$ENV_FILE"
else
    echo "Error: Environment file not found at $ENV_FILE"
    exit 1
fi

# User ID to be updated
USER_ID=$1

echo "User ID to update: $USER_ID"

# New role value
NEW_ROLE="admin"

echo "Setting role to: $NEW_ROLE"

# Check if user ID is provided
if [ -z "$USER_ID" ]; then
    echo "Error: No user ID provided."
    echo "Usage: $0 <user_id>"
    exit 1
fi

echo "Connecting to MySQL at $MYSQL_SEVER with user $MYSQL_USER..."

# Connect to the database and update user role
mysql -h $MYSQL_SEVER -u $MYSQL_USER -p$MYSQL_PASSWORD $MYSQL_DATABASE <<EOF
UPDATE users SET role='$NEW_ROLE' WHERE userId=$USER_ID;
EOF

if [ $? -eq 0 ]; then
    echo "User ID $USER_ID has been successfully set as an admin."
else
    echo "Failed to update user role."
fi

