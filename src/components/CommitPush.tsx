import './CommitPush.css';
import { useState } from 'react';
import ini from 'ini';
import git from 'isomorphic-git'
import http from 'isomorphic-git/http/web'
import Debug from '../utils/debug';
const debug = Debug('CommitPush');

export default (props: any) => {
    const [sCommitMessage, setCommitMessage] = useState('');
    const [oEnv, setEnv] = useState({});
    (oEnv as any).isDisabled = true;
    (oEnv as any).sDefaultCommitMessage = "0 changes";
    const checkStatus = () =>{
        const oConfig = {
            http,
            fs: props.fs,
            gitdir: '.git',
            dir: '.'            
        }
        git.statusMatrix(oConfig).then(aStatus=>{
            for(const file of aStatus){
                debug(file);
            }    
        })
    }
    const commitAndPush = async () => {
        const sMessage = sCommitMessage || (oEnv as any).sDefaultCommitMessage;
        const fs = props.fs;
        try { 
            const sContents = await fs.readFile(".env", 'utf-8');
            let oContents: any = {};
            Object.assign(oContents, oEnv, ini.parse(sContents));
            setEnv(oContents);
        } catch (e) {
            setEnv({});
        }
        alert(`Commit and Push ${sMessage}`);
    };
    checkStatus();
    return (
        <div id="CommitPush">
            <input
                placeholder={(oEnv as any).sDefaultCommitMessage}
                value={sCommitMessage} // ...force the input's value to match the state variable...
                onChange={e => setCommitMessage(e.target.value)} // ... and update the state variable on any edits!
            />
            {(oEnv as any).USER_TOKEN && 
            <div>Rich is here {(oEnv as any).USER_TOKEN}</div>
            }

            <button onClick={commitAndPush} disabled={(oEnv as any).isDisabled}>Push</button>
        </div>
    );
}
