#!/bin/bash
set -e

# Start Selenium Server in the background
echo "Starting Selenium Server..."
/opt/bin/entry_point.sh &

# Wait for Selenium Server to be ready
echo "Waiting for Selenium Server to be ready..."
MAX_WAIT=60
COUNTER=0
while !  curl -s http://localhost:4444/wd/hub/status > /dev/null 2>&1; do
    sleep 1
    COUNTER=$((COUNTER + 1))
    if [ $COUNTER -ge $MAX_WAIT ]; then
        echo "Selenium Server failed to start within $MAX_WAIT seconds"
        exit 1
    fi
done

echo "Selenium Server is ready!"

# Run the Python tests
echo "Running Selenium tests..."
cd /tests
python3 selenium_tests.py
TEST_EXIT_CODE=$?

echo "Tests completed with exit code: $TEST_EXIT_CODE"
exit $TEST_EXIT_CODE
