function convert(){

let states=document.getElementById("states").value.split(",");
let alphabet=document.getElementById("alphabet").value.split(",");
let start=document.getElementById("start").value;

let lines=document.getElementById("transitions").value.trim().split("\n");

let nfa={};

states.forEach(s=>{
nfa[s]={};
alphabet.forEach(a=>nfa[s][a]=[]);
})

lines.forEach(l=>{

let [left,right]=l.split("=");

let [state,symbol]=left.split(",");

nfa[state][symbol]=right.split(",");

})

let queue=[[start]];
let visited=[[start]];

let dfa={};

let steps="";

while(queue.length){

let current=queue.shift();

let name=current.join("");

steps+=`Processing {${name}}\n`;

dfa[name]={};

alphabet.forEach(symbol=>{

let newSet=new Set();

current.forEach(s=>{
nfa[s][symbol].forEach(t=>newSet.add(t))
})

let newState=[...newSet].sort();

if(newState.length===0) return;

dfa[name][symbol]=newState.join("");

steps+=` {${name}} --${symbol}--> {${newState}}\n`;

let exists=visited.some(v=>v.join("")===newState.join(""));

if(!exists){

visited.push(newState);
queue.push(newState);

}

})

steps+="\n";

}

document.getElementById("steps").innerText=steps;

document.getElementById("dfaTable").innerText=
JSON.stringify(dfa,null,2);

drawNFA(nfa,states,alphabet);

drawDFA(dfa);

}



function drawNFA(nfa,states,alphabet){

let elements=[];

states.forEach(s=>{

elements.push({data:{id:s}});

alphabet.forEach(a=>{

nfa[s][a].forEach(t=>{

elements.push({
data:{
source:s,
target:t,
label:a
}

})

})

})

})

let cy=cytoscape({

container:document.getElementById("nfaGraph"),

elements:elements,

style:[
{
selector:'node',
style:{
'label':'data(id)',
'background-color':'#0074D9'
}
},
{
selector:'edge',
style:{
'label':'data(label)',
'target-arrow-shape':'triangle',
'target-arrow-color':'#555',
'line-color':'#555',
'curve-style':'bezier',

/* 🔥 ADD THIS */
'text-margin-y': '-15px',
'text-background-color': '#fff',
'text-background-opacity': 1,
'text-background-padding': '2px'
}
}
],

layout:{name:'circle'}

})

}



function drawDFA(dfa){

let elements=[];

Object.keys(dfa).forEach(s=>{

elements.push({data:{id:s}});

Object.keys(dfa[s]).forEach(symbol=>{

elements.push({

data:{
source:s,
target:dfa[s][symbol],
label:symbol
}

})

})

})

cytoscape({

container:document.getElementById("dfaGraph"),

elements:elements,

style:[
{
selector:'node',
style:{
'label':'data(id)',
'background-color':'green'
}
},
{
selector:'edge',
style:{
'label':'data(label)',
'target-arrow-shape':'triangle',
'target-arrow-color':'#555',
'line-color':'#555',
'curve-style':'bezier',

/* 🔥 ADD THIS */
'text-margin-y': '-15px',
'text-background-color': '#fff',
'text-background-opacity': 1,
'text-background-padding': '2px'
}
}
],

layout:{name:'circle'}

})

}
