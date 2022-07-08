#!/usr/bin/env node

import { Command } from 'commander';
import loadPage from '../src/pageLoader.js';

const program = new Command();

program
  .description('loads site pages and saves to the picked directory')
  .version('0.0.1', '-V, --version', 'output version number')
  .option('-o, --output [dir]', 'output dir (default: "/home/user/current-dir")', process.cwd())
  .helpOption('-h, --help', 'display help for command')
  .arguments('<url>')
  .action((url) => {
    const options = program.opts();
    console.log(loadPage(url, options.output));
  })
  .parse(process.argv);
