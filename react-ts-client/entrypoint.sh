#!/bin/bash

# Function to check if an executable is available
check_executable() {
    command -v "$1" &> /dev/null
}

# Check if npm is available
if check_executable "npm"; then
    echo "npm is available"
else
    echo "npm is not available. Please install npm first."
    exit 1
fi

# Try installing react-scripts globally
echo "Attempting to install react-scripts globally..."
npm install -g react-scripts

# Check if the installation was successful
if check_executable "react-scripts"; then
    echo "react-scripts is available"
else
    echo "Failed to install react-scripts or it is not available in the PATH."
    exit 1
fi

echo "Script completed successfully. Starting React App"
yarn
yarn start