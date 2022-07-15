### Hexlet tests and linter status:
[![Actions Status](https://github.com/elizablok/backend-project-lvl3/workflows/hexlet-check/badge.svg)](https://github.com/elizablok/backend-project-lvl3/actions)
[![Node CI](https://github.com/elizablok/backend-project-lvl3/actions/workflows/node-ci.yml/badge.svg)](https://github.com/elizablok/backend-project-lvl3/actions/workflows/node-ci.yml)
[![Maintainability](https://api.codeclimate.com/v1/badges/a884ea4306f200c315df/maintainability)](https://codeclimate.com/github/elizablok/backend-project-lvl3/maintainability)
[![Test Coverage](https://api.codeclimate.com/v1/badges/a884ea4306f200c315df/test_coverage)](https://codeclimate.com/github/elizablok/backend-project-lvl3/test_coverage)

## About Page Loader
Page Loader is an utility for downloading a page and its resources. This project was created as part of the [Hexlet](https://ru.hexlet.io/) course.

Features:
- choosing an output directory
- debug support
- downloading local resources only

## Requirements
- [Node.js](https://nodejs.org/en/) version 16.x

## Getting started
- Clone the repository
```cmd
git clone git@github.com:elizablok/backend-project-lvl3.git
```
- Install dependencies
```cmd
make install
```
- Install project
```cmd
npm ci
```

## Usage
```cmd
Usage: page-loader [options] <url>

Page loader utility

Options:
  -V, --version       output the version number
  -o, --output [dir]  output dir (default: "/home/user/current-dir")
  -h, --help          display help for command
```

### Downloading
[![asciicast](https://asciinema.org/a/508981.svg)](https://asciinema.org/a/508981)

### Error handling and logging
[![asciicast](https://asciinema.org/a/508983.svg)](https://asciinema.org/a/508983)