import './CommitPush.css';
import { useState } from 'react';

export default (props: any) => {
    const [sCommitMessage, setCommitMessage] = useState('');
    let isDisabled: boolean = false;
    let sDefaultCommitMessage: string = "0 changes";
    const commitAndPush = async () => {
        const sMessage = sCommitMessage || sDefaultCommitMessage;
        const fs = props.fs;
        let contents = '';
        try { contents = await fs.readFile(".env", 'utf-8')} catch (e) {}
        alert(`Commit and Push ${sMessage}, ${contents}`);
    };
    return (
        <div id="CommitPush">
            <input
                placeholder={sDefaultCommitMessage}
                value={sCommitMessage} // ...force the input's value to match the state variable...
                onChange={e => setCommitMessage(e.target.value)} // ... and update the state variable on any edits!
            />

            <button onClick={commitAndPush} disabled={isDisabled}>Push</button>
        </div>
    );
}
