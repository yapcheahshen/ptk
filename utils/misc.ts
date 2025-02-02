export const escapeTemplateString=str=>str.replace(/\\/g,"\\\\").replace(/`/g,"\\`").replace(/\$\{/g,'$\\{');
export function pagejsonpfn(nchunk:number,folder:string=''){
    const jsfn=nchunk.toString().padStart(3,'0')+'.js'
    return folder?folder+'/'+jsfn:jsfn;
}
export const lineBreaksOffset=(str:string)=>{
    let i=0;
    const out=Array<number>();
    while (i<str.length) {
        const at=str.indexOf('\n',i);
        if (at==-1) break;
        out.push(at);
        i=at+1;
    }
    return out;
}
export const JSONParse=(str:string)=>{ //parse a loss json
    const at1=str.indexOf('{')
    const at2=str.lastIndexOf('}')
    if (at1>-1 && at2>at1) {
        str=str.slice(at1,at2+1);
    }
    str=str.replace(/['"]?([a-zA-Z\d]+)['"]? *\:/g,'"$1":');
    return JSON.parse(str);
}

export const humanBytes=(n:number):[number,string]=>{
    if (n<1024) {
        return [n,'B'];
    }
    if (n<1024*1024) {
        return [parseFloat((n/1024).toFixed(2)) ,'KB'];
    } else {
        return [parseFloat((n/(1024*1024)).toFixed(2)),'MB'];
    }
}
export function debounce(f,ms){
    let timer;
    return function(...args){
        clearTimeout(timer);
        timer=setTimeout( f.bind(this,...args) , ms)
    }
}