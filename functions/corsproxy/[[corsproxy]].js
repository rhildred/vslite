import { CorsProxyResponse } from "@rhildred/cors-proxy2";

export async function onRequest(context) {
    try {
        context.env.url = context.request.url.replace(/^.*corsproxy/, "https:/");
        if(!context.env.url.match(/github|wordpress/)){
            // there needs to be an auth header here
            const sAuth = context.request.headers.get("Authorization");
            if(sAuth){
                const oResponse = await fetch("https://api.github.com/user", {headers:{
                    Authorization: sAuth,
                    Accept: "application/vnd.github+json",
                    "X-GitHub-Api-Version": "2022-11-28"
                }});
                if(oResponse.status != 200){
                    throw new Error(`${context.env.url} unauthorized`);    
                }
            }else{
                throw new Error(`${context.env.url} is not proxy-able by this server`);
            }
        }
        return CorsProxyResponse.fetch(context.request, context.env);
    } catch (e) {
        let oResponse = new Response(`forbidden\n${context.env.url}\n${e.stack}`, { status: 403 });
        oResponse.headers.append("content-type", "text/plain");
        return oResponse;
    }
}