import express from 'express';
import fetch from 'node-fetch';
import { functionsAdapter } from 'cloudflare2express';
import { onRequest } from '../functions/corsproxy/[[corsproxy]].js';

export default class {
    constructor(options) {
        this.app = express();
        if (typeof (options) != "undefined") {
            Object.assign(this, options);
        }
        this.app.all(/\/corsproxy/, express.raw({
            inflate: true,
            limit: '50mb',
            type: () => true, // this matches all content types for this route
        }), async (req, res) => {
            functionsAdapter(onRequest, req, res, {fetch: fetch});
        });
    }
}
