import React, { Component } from 'react';
import './DownloadAdd.css';
import { ReactComponent as CloudArrowDown } from './svgs/solid/cloud-arrow-down.svg';

class App extends Component {

    constructor(props) {
        super(props);
        this.sayHello = this.sayHello.bind(this);
    }

    sayHello() {
        alert('Hello!');
    }

    render() {
        return (
            <>
                &nbsp;
                <button id="downloadButton" onClick={this.sayHello} >
                    <CloudArrowDown />
                </button>
            </>
        );

    }
}

export default App;

