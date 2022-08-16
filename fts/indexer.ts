import {splitUTF32Char,IStringArray,packIntDelta,fromObj,alphabetically0,LEMMA_DELIMETER} from '../utils/index.ts';
import {tokenize,TokenType} from './tokenize.ts';

export class Indexer {
	constructor(content){
		this.wordscount=0;
		this.words={}, this.postingcount=[];
		this.bmp=new Int32Array(65536);
		this.tokenlist=[];
		this.postings;
		this.tokenlinepos = [];
		this.bmppostings=new Array(65536);
		this.bmptokencount= new Int32Array(65536);
		this.tokencount= null;//new Int32Array(ngramcount);
		this.finalized=false;
	}
	addLine(line:string) {
		const tokens=tokenize(line);
		for (let j=0;j<tokens.length;j++) {
			const {text,choff,tkoff,type} = tokens[j];
			const cp=text.codePointAt(0);
			if (type==TokenType.CJK_BMP) {
				this.bmp[cp]++;
				this.tokenlist.push(cp);
			} else if (type>=TokenType.SEARCHABLE){
				let at=this.words[text];
				if (typeof at=='undefined') {
					at=this.wordscount;
					this.postingcount.push(0);
					this.words[text]=at;
					this.wordscount++;
				}
				this.postingcount[at]++;
				this.tokenlist.push( at + 65536 );
			}  
		}
		this.tokenlist.push(0);//line separator
	}
    add(lines:IStringArray){
    	if (this.finalized) {
    		throw "already finalized";
    	}
		lines.reset();
		let line=lines.next();
		while (line || line===''){
			this.addLine(line);
			line=lines.next();
		}
	}
	finalize(){
		this.finalized=true;
		this.postings=new Array(this.wordscount);
		this.tokencount=new Int32Array(this.wordscount);
		for (let i=0;i<this.wordscount;i++) {
			this.postings[i] = new Int32Array( this.postingcount[i]);
		}
		for (let i=0;i<this.bmp.length;i++) {
			if (this.bmp[i]) {
				this.bmppostings[i] = new Int32Array( this.bmp[i]);	
			}
		}

		//fill posting 
		let lasti=0;
		for (let i=0;i<this.tokenlist.length;i++){
			let code=this.tokenlist[i];
			if (!code) {
				this.tokenlinepos.push(i);
			} else if (code<0x10000) {
				if (this.bmppostings[code]) {
					this.bmppostings[code][ this.bmptokencount[code]]=i;
					this.bmptokencount[code]++;
				}
			} else if (!isNaN(code)) {
				const at = code-65536;
				this.postings[at][ this.tokencount[at] ]=i;	
				this.tokencount[at]++	;
			}
		}
		this.tokenlinepos.push(this.tokenlist.length);//the terminator
	}
	serialize() {
		if (!this.finalized) {
			throw "not finalized";
		}
		const tokens=[] , postings=[];
		let packedsize=0;

		const tokentable=fromObj(this.words, (word,nposting)=>[word,nposting]);
		tokentable.sort(alphabetically0);

		const words=tokentable.map(([word,nposting])=>word);

		tokens.push(words.join(LEMMA_DELIMETER));
		const bmpWithPosting=[];
		for (let i=0;i<this.bmppostings.length;i++) {
			if (this.bmppostings[i]) bmpWithPosting.push(i);
		}
		tokens.push(packIntDelta(bmpWithPosting));

		tokens.push(packIntDelta(this.tokenlinepos));

		for (let i=0;i<this.bmppostings.length;i++) {
			if (!this.bmppostings[i]) continue;
			//原文刪去一些字或者用全集tokentable 但只索引子集，tokentable 沒更新, tokencount 會較小。
			//增加的字會找不到。
			const s=packIntDelta(this.bmppostings[i]);
			packedsize+=s.length;
			postings.push(s);
		}

		for (let i=0;i<tokentable.length;i++) {
			const nposting=tokentable[i][1];
			if (!this.postings[nposting]) continue;
			const s=packIntDelta(this.postings[nposting]);
			packedsize+=s.length;
			postings.push(s);
		}
		return [tokens,postings];
	}
}
