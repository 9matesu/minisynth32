#!/bin/bash
set -e

echo "=========================================="
echo "  MiniSynth32 Linux Mint Setup Wizard     "
echo "=========================================="

echo "[1/5] Updating and installing system dependencies..."
sudo apt-get update
# We install build-essential and python3 because 'serialport' node module often needs to compile native bindings on Linux if prebuilds are missing
sudo apt-get install -y curl git build-essential python3 npm nodejs jq

echo "[2/5] Installing Arduino CLI..."
if ! command -v arduino-cli &> /dev/null; then
    curl -fsSL https://raw.githubusercontent.com/arduino/arduino-cli/master/install.sh | sh
    export PATH=$PATH:$PWD/bin
    export PATH=$PATH:$HOME/bin
else
    echo "Arduino CLI is already installed."
fi

echo "[3/5] Configuring Arduino CLI for ESP32..."
arduino-cli core update-index --additional-urls https://espressif.github.io/arduino-esp32/package_esp32_index.json
arduino-cli core install esp32:esp32 --additional-urls https://espressif.github.io/arduino-esp32/package_esp32_index.json

echo "[4/5] Installing required Arduino Libraries..."
arduino-cli lib install "Adafruit GFX Library" "Adafruit SH110X" "WebSockets" "ArduinoJson"

# AudioTools and Maximilian usually need to be cloned from git if they are not indexed
echo "Cloning ESP32-audioI2S / AudioTools..."
if [ ! -d ~/Arduino/libraries/audio-tools ]; then
  mkdir -p ~/Arduino/libraries
  git clone https://github.com/pschatzmann/arduino-audio-tools.git ~/Arduino/libraries/audio-tools
else
  echo "AudioTools already exists."
fi

echo "Cloning Maximilian DSP..."
if [ ! -d ~/Arduino/libraries/Maximilian ]; then
  mkdir -p ~/Arduino/libraries
  git clone https://github.com/micknoise/Maximilian.git ~/Arduino/libraries/Maximilian
else
  echo "Maximilian already exists."
fi

echo "[5/5] Installing NPM Dependencies (Root, Frontend, Backend)..."
# This will run the 'install:all' workspace script from package.json
npm run install:all

echo "=========================================="
echo "  Setup Complete!                         "
echo "  You can now run: 'npm run dev'          "
echo "=========================================="
