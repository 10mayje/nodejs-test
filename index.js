const express=require('express');
const fetch=require('node-fetch');
const redis=require('redis');

const PORT=process.env.PORT || 5000;
const REDIS_PORT=process.env.PORT || 6379;
const redis_address='redis://etarkredis.jgdvsl.ng.0001.aps1.cache.amazonaws.com:6379';

const client =redis.createClient(REDIS_PORT);
const app=express();
 
function setResponse(username,repos){
    return `<h2>${username} has ${repos} Github repos</h2>`
}
async function getRepos(req,res,next){
    try {
        console.log('fetching data ...');
        const { username }=req.params;
        console.log(username);
        const response =await fetch(`https://api.github.com/users/${username}`);
        const data =await response.json();
        const repos=data.public_repos;
        client.setex(username,3600,repos);
        res.send(setResponse(username,repos));

    } catch (error) {
        console.log(error);
    }
}

function cache(req,res,next){
    const {username}=req.params;

    client.get(username,(err,data)=>{
        if(err) throw err;
        if(data!==null){
            res.send(setResponse(username,data));
        }else{
            next();
        }
    })
}

app.get('/repo/:username',cache,getRepos);
app.get("/",(req,res)=>{
    res.send({
        data:"data flutter",
    });
});


app.listen(5000,()=>{
    console.log(`app listening on port ${PORT}`)
})