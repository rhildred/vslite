import { Component } from 'react';
import path from 'path';
import './DownloadAdd.css';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';

class App extends Component {

    constructor(props: any) {
        super(props);
        (this as any).fs = props.fs;
        this.downloadZip = this.downloadZip.bind(this);
    }
    match(first: string, second: string): boolean {
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
    isInGitignore(second: string): boolean {
        for (let first of (this as any).gitignore) {
            first = first.replace(/\/$/, '');
            if (this.match(first, second)) {
                return true;
            }
        }
        return false;
    }

    async walk(sDir: string) {
        const files = await (this as any).fs.readdir(sDir, {withFileTypes: true});

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
                (this as any).zip.file(filepath, await (this as any).fs.readFile(filepath));
            }
        }
    }

    async downloadZip() {
        let aGitIgnore: string[] = [];
        try {
            const aBuff = await (this as any).fs.readFile('.gitignore', 'utf-8');
            aGitIgnore = aBuff.split('\n');
        } catch {
            0;
        }
        (this as any).gitignore = aGitIgnore;
        (this as any).zip = new JSZip();
        await this.walk('.');
        (this as any).zip.generateAsync({type:"blob"}).then(function (blob:any) { // 1) generate the zip file
            saveAs(blob, "projectDownload.zip");                          // 2) trigger the download
        }, function (err:any) {
            console.log(err);
        });
        

    }

    render() {
        return (
            <>
                &nbsp;
                <button id="downloadButton" onClick={this.downloadZip}>
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 512"><path d="M144 480C64.5 480 0 415.5 0 336c0-62.8 40.2-116.2 96.2-135.9c-.1-2.7-.2-5.4-.2-8.1c0-88.4 71.6-160 160-160c59.3 0 111 32.2 138.7 80.2C409.9 102 428.3 96 448 96c53 0 96 43 96 96c0 12.2-2.3 23.8-6.4 34.6C596 238.4 640 290.1 640 352c0 70.7-57.3 128-128 128H144zm79-167l80 80c9.4 9.4 24.6 9.4 33.9 0l80-80c9.4-9.4 9.4-24.6 0-33.9s-24.6-9.4-33.9 0l-39 39V184c0-13.3-10.7-24-24-24s-24 10.7-24 24V318.1l-39-39c-9.4-9.4-24.6-9.4-33.9 0s-9.4 24.6 0 33.9z" /></svg>
                </button>
            </>
        );

    }
}

export default App;

