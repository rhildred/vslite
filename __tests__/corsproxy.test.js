import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import TestFixture from '../src/testFixture.js';
import 'dotenv/config';

describe("tests proxy cloudflare worker", ()=>{
    it("fetches from other than github or wordpress", async () =>{
        const app = new TestFixture().app;
        const res = await request(app)
        .get("/corsproxy/www.w3schools.com/w3css/tryw3css_templates_band.htm").set("Authorization", `Bearer ${process.env.USER_TOKEN}`);
        expect(res.status).toBe(200);
    }, 10000);
    it("does not fetch with a bad token", async () =>{
        const app = new TestFixture().app;
        const res = await request(app)
        .get("/corsproxy/www.w3schools.com/w3css/tryw3css_templates_band.htm").set("Authorization", `Bearer 1234`);
        expect(res.status).toBe(403);
    }, 10000);
});
