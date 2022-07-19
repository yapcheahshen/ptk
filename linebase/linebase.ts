import {loadJSONP,loadNodeJsZip,loadFetch,loadNodeJs} from './loadpage.ts'
import {bsearchNumber,lineBreaksOffset,unique} from '../utils/index.ts';
export class LineBase{
	constructor (opts={}) {
		this._pages=[];     // read time,   line not split
		this._lineoffsets=[]; // lineoffsets of each page
		this.pagestarts=[];
		this.header={starts:[],sectionnames:[],sectionstarts:[],sectiontypes:[]};
		this.name=opts.name||'';
		this.zip=opts.zip;
		this.payload;   //payload in 000.js
    	let protocol=typeof chrome!=='undefined'?'chrome-extension:':'';
        if (typeof window!=='undefined') {
            protocol=window.location.protocol;
        }
        if (protocol==='http:'||protocol==='https:'|| protocol==='chrome-extension:') {
            this._loader=loadFetch.bind(this);
        } else if (protocol=='file:') {
            this._loader=loadJSONP.bind(this);
        } else {
        	this._loader=(this.zip?loadZip:loadNodeJs).bind(this);
        }
        this.failed=false;
        this._loader(0);
	}
	async loadAll (){
		await this.loadLines([[0, this.pagestarts[this.pagestarts.length-1]]]);
	}
	pageOfLine=(line)=>{
    	if (line>=this.pagestarts[this.pagestarts.length-1]) return this.pagestarts.length-1;
    	return bsearchNumber(this.pagestarts,line,true);
    }
	pageOfRange([from,to]){
	    if (from<0) return [];
	    if (from>to) to+=from;
	    const cstart=this.pageOfLine(from);
	    const cend=this.pageOfLine(to);    
	    const notloaded=[];
	    for (let i=cstart;i<cend+1;i++) {
	        if (!this._pages[i]) notloaded.push(i);
	    }
	    return notloaded;
	}
	async loadLines(range:number[] | [number,number][] , name='',type='txt'){
	    const that=this; //load a range, or a sequence of line or range.
	    await this.isReady();
	    let toload=[];

	    const [start]=this.sectionRange(name,type);
        const notincache={};
        for (let i=0;i<range.length;i++) {
        	if (Array.isArray(range[i])) {
        		const [from,to]=range[i];
        		toload.push(...this.pageOfRange([from+start,to+start]));
        	} else {
        		notincache[this.pageOfLine(range[i]+start)]=true; 
        	}
        }
        toload.push(...Object.keys(notincache).map(it=>parseInt(it)));

	    toload=unique(toload.filter(it=> !that._pages[it]));
	    const jobs=[];
	    toload.forEach(ck=>jobs.push(this._loader(ck+1)));
	    if (jobs.length) await Promise.all(jobs);
	}	
	getPageLineOffset(page,line){
		if (page>=this._pages.length) return 0;

		if (line==0) return 0;
		if (line>= this._lineoffsets[page].length) return this._pages[page].length;
		return this._lineoffsets[page][line-1];
	}
	slice(nline,to, name='',type='txt'){ //combine array of string from loaded pages
		const [start]=this.sectionRange(name,type);
		if (!start && (name||type)) return '';
		nline+=start;
		if (!to) to=nline+1;

		const p1=this.pageOfLine(nline,this.pagestarts);
		const p2=this.pageOfLine(to,this.pagestarts);
		let i=0, out='' ,slicefrom,sliceto;
		for (let i=p1;i<=p2;i++) {
			if (!this._pages[i]) return [];//page not loaded yet
			if (i==p1 || i==p2) { // first or last part
				let slicefrom=this.getPageLineOffset(i, nline- (p1>0?this.pagestarts[p1-1]:0));
				if (p1) slicefrom++; //skip the \n for first line
				const sliceto=  this.getPageLineOffset(i, to- (p2>0?this.pagestarts[p2-1]:0) );
				if (p2>p1) {
					if (i==p1) out = this._pages[i].slice(slicefrom); //+1 skip the \n
					else out+= '\n'+this._pages[i].slice(0, sliceto);
				} else { //same block
					out= this._pages[i].slice(slicefrom,sliceto);
				}
			} else out+='\n'+this._pages[i];//middle
		}
		return out.split('\n');
	}
    setPage(page,header,payload){
    	if (page==0) {
	        this.header=header;
	        this.pagestarts=header.starts;
    	    this.payload=payload||'nopayload'; 
    	    this.opened=true;
    	} else if (page>0) {
    		this._pages[page-1]=payload;
    		this._lineoffsets[page-1] = lineBreaksOffset(payload);
    	}
    }
	isReady() {
		if (this.payload) return true;
		const that=this;
		let timer=0;
		return new Promise(resolve=>{
			timer=setInterval(()=>{
				if (that.failed) resolve(false); //set by loadScript, loadFetch
				else if (that.payload) {
					clearInterval(timer);
					resolve(true);
				}
			},50);
		})
	}
	async preloadSection(name,type){
		const [from,to]=this.sectionRange(name,type);
		if (to>from) {
			await this.loadLines([[from,to]],'','');
		}
	}
	getSection(name,type){
		const [from,to]=this.sectionRange(name,type);
		return this.slice(from+1,to,'','')
	}	
	sectionRange(sname:string,stype=''):[from,to] {
		const notfound=[0,0];
		const {sectionnames,sectionstarts,sectiontypes}=this.header;
		if (!sectionnames || !sectionnames.length) return notfound;
		for (let i=0;i<sectionnames.length;i++) {
			const name=sectionnames[i];
			const type=sectiontypes[i];
			if ( (sname && name==sname) || (!sname && stype && type==stype) ) {
				const endoflastsection=i< sectionstarts.length-1
					?sectionstarts[i+1]:this.pagestarts[this.pagestarts.length-1];

				return [sectionstarts[i], endoflastsection]				
			}
		}
		return notfound;
	}
}