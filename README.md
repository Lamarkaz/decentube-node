# Decentube Node
Webtorrent content delivery server that serves as a fall back for p2p seeding


## Requirements

1. Ubuntu
2. Node.js & NPM

## Installation

Clone this repo

`git clone https://github.com/Lamarkaz/decentube-node.git`

Change directory into the repo

`cd decentube-node/`

Install dependencies

`npm install`

Install Forever

`npm install -g forever`

## Usage

Seed your own videos

`forever start decentube.js -u YourUsername`

Seed all videos

`forever start decentube.js -a`

## Troubleshooting

If you get an electron error, install dependencies:

`sudo apt-get install libgtkextra-dev libgconf2-dev libnss3 libasound2 libxtst-dev libxss1`
