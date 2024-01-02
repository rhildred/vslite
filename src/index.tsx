import 'react-complex-tree/lib/style-modern.css';
import 'dockview/dist/styles/dockview.css';
import 'xterm/css/xterm.css';
import './index.css';

import {createRoot} from 'react-dom/client';
import {injectStyles} from './icons';
import Tabs from './components/Tabs';

injectStyles();

const el = document.getElementById('root');
//el && createRoot(el).render(<Dock/>);
el && createRoot(el).render(<Tabs/>);
if (import.meta.env.DEV && !globalThis.localStorage?.debug) {
  console.log('To enable debug logging, run in console: ', '\`localStorage.debug = "vslite"\`');
}
