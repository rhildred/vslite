import { Component } from 'react';
import './CommitPush.css';

class App extends Component {

    constructor(props: any) {
        super(props);
        (this as any).fs = props.fs;
    }
    render() {
        return(
        <div id="CommitPush">
            <input placeholder="0 changes" />
            <button disabled={true}>Push</button>
        </div>
        );
    }
}

export default App;