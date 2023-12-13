# CLI Rom Downloader

![](https://i.imgur.com/kYI0pJM.png)

A very simple command line tool that utilizes both cheerio and puppetteer to offer quick access to an expansive repository of old school ROMs. You can navigate through various console libraries and search for specific games via name.
Download takes place in the working directory you're currently situated in.

Depending on the site's traffic, loading an entire library might take a second.

![](https://i.imgur.com/KGVFhQj.png)

## Requirements
- node package manager
- a working terminal
## Installation
`npm i -g @dekaratas/cli-rom-downloader`

![](https://i.imgur.com/6EMraM1.png)

## Usage
```
Usage: rom-cli [options] [query]

Options:
    -c, --console
      Lists all available consoles and their respective query terms
    -l, --library [console]
      Scroll through a console's library
    -g, --game [gameName]
      Search for a game accross all available platforms (!Currently slightly buggy)
    -V, --version
      Outputs the current version number
    -h, --help
      Display help for commands
```
