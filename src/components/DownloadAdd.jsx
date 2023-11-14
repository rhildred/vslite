import { Component } from 'react';
import path from 'path';
import './DownloadAdd.css';
import JSZip from 'jszip';

class App extends Component {

    constructor(props) {
        super(props);
        this.fs = props.fs;
        this.downloadZip = this.downloadZip.bind(this);
        this.upload = this.upload.bind(this);
    }
    loadFiles(evt){
        const files = evt.target.files;
        for(const file of files){
            const oReader = new FileReader();
            oReader.onload = async ()=>{
                let arrayBuffer = new Uint8Array(oReader.result);
                if(file.name.match(/\.zip$/)){
                    const oJsZip = new JSZip();
                    const oResult = await oJsZip.loadAsync(arrayBuffer);
                    const oKeys = Object.keys(oResult.files);
                    for(let key of oKeys){
                        const oItem = oResult.files[key];
                        const sPath = oItem.name;
                        if(oItem.dir){
                            try{
                                await this.fs.readdir(sPath);
                            }catch{
                                await this.fs.mkdir(sPath, {recursive: true});
                            }
                        }else{
                            this.fs.writeFile(sPath, await oItem.async('uint8array'));
                        }
                    }            
                }else{
                    this.fs.writeFile(file.name, arrayBuffer);
                }
            }
            oReader.readAsArrayBuffer(file);
        }
    }
    buildFileSelector(){
        const fileSelector = document.createElement('input');
        fileSelector.setAttribute('type', 'file');
        fileSelector.setAttribute('multiple', 'multiple');
        fileSelector.addEventListener("change", this.loadFiles.bind(this));
        return fileSelector;
    }
    componentDidMount(){
        this.fileSelector = this.buildFileSelector();
    }
    match(first, second){
        // If we reach at the end of both strings we are done

        if (first.length == 0 && second.length == 0) return true;

        // Make sure that the characters after '*'
        // are present in second string.
        // This function assumes that the first
        // string will not contain two consecutive '*'
        if (first.length > 1 && first[0] == '*' && second.length == 0) return false;

        // If the first string contains '?',
        // or current characters of both strings match
        if (
            (first.length > 1 && first[0] == '?') ||
            (first.length != 0 && second.length != 0 && first[0] == second[0])
        )
            return this.match(first.substring(1), second.substring(1));

        // If there is *, then there are two possibilities
        // a) We consider current character of second string
        // b) We ignore current character of second string.
        if (first.length > 0 && first[0] == '*')
            return (
                this.match(first.substring(1), second) ||
                this.match(first, second.substring(1))
            );

        return false;
    }
    isInGitignore(second) {
        for (let first of this.gitignore) {
            first = first.replace(/\/$/, '');
            if (this.match(first, second)) {
                return true;
            }
        }
        return false;
    }

    async walk(sDir) {
        const files = await this.fs.readdir(sDir, {withFileTypes: true});

        for (const file of files) {
            if (this.isInGitignore(file.name)) continue;
            const filepath = path.join(sDir, file.name);
            if (file._type == 2) {
                await this.walk(filepath);
            } else {
                let filepath = file.name;
                if (sDir != '.') {
                    filepath = `${sDir}/${file.name}`;
                }
                // insert file into zip here
                this.zip.file(filepath, await this.fs.readFile(filepath));
            }
        }
    }

    async upload(e){
        e.preventDefault();
        this.fileSelector.click();
    }

    async downloadZip() {
        let aGitIgnore = [];
        try {
            const aBuff = await this.fs.readFile('.gitignore', 'utf-8');
            aGitIgnore = aBuff.split('\n');
        } catch {
            0;
        }
        this.gitignore = aGitIgnore;
        this.zip = new JSZip();
        await this.walk('.');
        this.zip.generateAsync({type:"blob"}).then(function (blob) { // 1) generate the zip file
            saveAs(blob, "projectDownload.zip");                          // 2) trigger the download
        }, function (err) {
            console.log(err);
        });
        

    }

    render() {
        return (
            <div id="fileTreeToolbar">
                &nbsp;
                <span id="buttons">
                    <button id="uploadButton" onClick={this.upload}>
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 576 512"><path d="M88.7 223.8L0 375.8V96C0 60.7 28.7 32 64 32H181.5c17 0 33.3 6.7 45.3 18.7l26.5 26.5c12 12 28.3 18.7 45.3 18.7H416c35.3 0 64 28.7 64 64v32H144c-22.8 0-43.8 12.1-55.3 31.8zm27.6 16.1C122.1 230 132.6 224 144 224H544c11.5 0 22 6.1 27.7 16.1s5.7 22.2-.1 32.1l-112 192C453.9 474 443.4 480 432 480H32c-11.5 0-22-6.1-27.7-16.1s-5.7-22.2 .1-32.1l112-192z" /></svg>
                    </button>
                    <button id="downloadButton" onClick={this.downloadZip}>
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 512"><path d="M144 480C64.5 480 0 415.5 0 336c0-62.8 40.2-116.2 96.2-135.9c-.1-2.7-.2-5.4-.2-8.1c0-88.4 71.6-160 160-160c59.3 0 111 32.2 138.7 80.2C409.9 102 428.3 96 448 96c53 0 96 43 96 96c0 12.2-2.3 23.8-6.4 34.6C596 238.4 640 290.1 640 352c0 70.7-57.3 128-128 128H144zm79-167l80 80c9.4 9.4 24.6 9.4 33.9 0l80-80c9.4-9.4 9.4-24.6 0-33.9s-24.6-9.4-33.9 0l-39 39V184c0-13.3-10.7-24-24-24s-24 10.7-24 24V318.1l-39-39c-9.4-9.4-24.6-9.4-33.9 0s-9.4 24.6 0 33.9z" /></svg>
                    </button>
                </span>
            </div>
        );

    }
}

export default App;