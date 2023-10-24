import {useState, useCallback, useEffect} from 'react';
import {WebContainer} from '@webcontainer/api';
import {Terminal} from 'xterm';
import {FitAddon} from 'xterm-addon-fit';
import {useDarkMode} from '../hooks/useDarkMode';
import {FileTreeState} from '../components/FileTree';
import {startFiles, jshRC} from '../modules/webcontainer';
import Debug from '../utils/debug';

const debug = Debug('useShell');

import type {WebContainerProcess} from '@webcontainer/api';
import type {GridviewPanelApi} from 'dockview';

export interface ShellInstance {
  container: WebContainer | null,
  terminal: Terminal | null,
  process: WebContainerProcess | null,
  start: (
    root: HTMLElement,
    panel: GridviewPanelApi,
    onServerReady?: ServerReadyHandler,
  ) => void,
}

export type ServerReadyHandler = (url: string, port: number) => void;

export function useShell(): ShellInstance {
  const [container, setContainer] = useState<WebContainer | null>(null);
  const [terminal, setTerminal] = useState<Terminal | null>(null);
  const [process, setProcess] = useState<WebContainerProcess | null>(null);
  const isDark = useDarkMode();
  const theme = isDark
    ? {background: '#181818'}
    : {background: '#f3f3f3', foreground: '#000', cursor: '#666'};

  useEffect(() => {
    if (terminal) {
      terminal.options.theme = theme;
      terminal.refresh(0, terminal.rows - 1);
    }
  }, [isDark]);

  const start = useCallback(async (root: HTMLElement, panel: GridviewPanelApi, onServerReady?: ServerReadyHandler) => {
    if (container) return;
    debug('Booting...');

    // Setup shell
    const shell = await WebContainer.boot({workdirName: 'vslite'});
    await shell.fs.writeFile('.jshrc', jshRC);
    await shell.spawn('mv', ['.jshrc', '/home/.jshrc']);
    shell.mount(startFiles);
    // Get .env from localStorage
    const configRaw = globalThis.localStorage?.vslite_config;
    const config = configRaw ? JSON.parse(configRaw) : {};
    if(config && config.env){
      await shell.fs.writeFile(".env", config.env);      
    }
    
    // Setup terminal
    const terminal = new Terminal({convertEol: true, theme});
    const addon = new FitAddon();
    const {cols, rows} = terminal;
    terminal.loadAddon(addon);

    // Start file watcher
    let watchReady = false;
    const watch = await shell.spawn('npx', ['-y', 'chokidar-cli', '.', '-i', '"(**/(node_modules|.git|_tmp_)**)"']);
    watch.output.pipeTo(new WritableStream({
      async write(data) {
        const type: string = data.split(':').at(0) || ''
        if (watchReady) {          
          // need to see if it is .env and read it into local storage
          if(data.match(/\.env/)){
            debug('.env changed', data);
            const configRaw = globalThis.localStorage?.vslite_config;
            let config = configRaw ? JSON.parse(configRaw) : {};
          try{
              const bContents = await shell.fs.readFile(".env");
              const sContents = new TextDecoder().decode(bContents);
              debug('contents', sContents);
              if(!config){
                config = {};
              }
              config.env = sContents;
              globalThis.localStorage.vslite_config = JSON.stringify(config);  
            }catch(e){
              if(config && config.env){
                delete config.env;
                globalThis.localStorage.vslite_config = JSON.stringify(config);                
              }
              debug(".env file deleted", e);
            }
          }else{
            debug('Change detected: ', data);
          }
        } else if (data.includes('Watching "."')) {
          debug('File watcher ready.');
          watchReady = true;
        } else {
          debug('chokidar: ', data)
        }
        switch (type) {
          case 'change':
            break;
          case 'add':
          case 'unlink':
          case 'addDir':
          case 'unlinkDir':
          default:
            FileTreeState.refresh(data);
        }
      }
    }));

    // Start shell
    const jsh = await shell.spawn('jsh', {env: {}, terminal: {cols, rows}});

    // Setup git alias
    const init = jsh.output.getReader();
    const input = jsh.input.getWriter();
    await init.read();
    init.releaseLock();

    // Pipe terminal to shell and vice versa
    terminal.onData(data => {input.write(data)});
    jsh.output.pipeTo(new WritableStream({write(data) {terminal.write(data)}}));

    // Subscribe to events
    panel.onDidDimensionsChange(() => addon.fit());
    shell.on('server-ready', (port, url) => onServerReady && onServerReady(url, port));

    // Set state
    setContainer(shell);
    setTerminal(terminal);
    setProcess(jsh);

    // Git repo (clone repo and install)
    if (location.pathname.startsWith('/~/')) {
      const repo = location.pathname.replace('/~/gh', 'https://github.com');
      await input.write(`git clone ${repo} .\n`);
    }

    // Clear terminal and display
    terminal.clear();
    terminal.open(root);
    addon.fit();

    debug('Done.');
  }, []);

  return { terminal, container, process, start };
}
