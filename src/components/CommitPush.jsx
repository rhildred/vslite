import './CommitPush.css';
import { Component } from 'react';
import ini from 'ini';
import git from 'isomorphic-git';
import http from 'isomorphic-git/http/web';
import FsPromises from 'webcontainer-fs-promises';
import Debug from '../utils/debug';
const debug = Debug('CommitPush');

export default class CommitPush extends Component{
    constructor(props){
        super(props);
        this.fs = props.fs;
        this.fs.promises = new FsPromises({fs:this.fs});
        this.state = {
            sCommitMessage: '',
            oEnv:{
                isDisabled:true,
                sDefaultCommitMessage: "0 changes"
            }
        }
        this.oConfig = {
            http,
            fs: this.fs,
            gitdir: '.git',
            dir: '.'            
        }
        this.commitAndPush=this.commitAndPush.bind(this);
    }
    async checkStatus(){
        try{
            await this.fs.readdir(this.oConfig.gitdir);
            const aStatus = await git.statusMatrix(this.oConfig);
            for(const file of aStatus){
                debug(file);
            }    
        }catch(e){
            debug(e);
        }
    }
    async commitAndPush(){
        const sMessage = this.state.sCommitMessage || this.state.oEnv.sDefaultCommitMessage;
        try { 
            const sContents = await this.fs.readFile(".env", 'utf-8');
            let oContents = {};
            Object.assign(oContents, this.state.oEnv, ini.parse(sContents));
            this.setState({oEnv:oContents});
        } catch (e) {
            0;
        }
        alert(`Commit and Push ${sMessage}`);
    };
    render(){
        //this.checkStatus();
        return (
            <div id="CommitPush">
                <input
                    placeholder={this.state.oEnv.sDefaultCommitMessage}
                    value={this.state.sCommitMessage} // ...force the input's value to match the state variable...
                    onChange={e => this.setState({sCommitMessage:e.target.value})} // ... and update the state variable on any edits!
                />
                {this.state.oEnv.USER_TOKEN && 
                <div>Rich is here {this.state.oEnv.USER_TOKEN}</div>
                }
    
                <button onClick={this.commitAndPush} disabled={this.state.oEnv.isDisabled}>Push</button>
            </div>
        );
    
    }
}
