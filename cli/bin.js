﻿#!/usr/bin/env node
import Path from 'path';
import {blue,yellow,red,bgWhite,green,bold,underline} from './colors.cjs'; // lukeed/kleur
import {dobuild} from './build.js';
import * as PTK from '../nodebundle.cjs';
import {onelexicon, text_lexicon, lexicons} from './textutils.js'
await PTK.nodefs;

const cmd=process.argv[2] || '-h';
const arg=process.argv[3];
const arg2=process.argv[4];
const foldername=process.cwd();
export const getModulePath=name=>{
    let dir=decodeURI(new URL(import.meta.url).pathname);
    if(import.meta.url.substr(0,5)==='file:' && Path.sep==='\\') dir=dir.substr(1);
    return Path.resolve(dir ,"..")+Path.sep+name;
}
const build=opts=>{
	const files=fs.readdirSync('.').filter(it=>it.endsWith('.off')||it.endsWith('.tsv'));
	let name=foldername.match(/([^\\\/]+)$/)[1];

	if (files.length) {
		dobuild(files,opts);
	} else {
		console.log(red("no source in current working directory"));
	}
}
const jsonp=()=>build({jsonp:true});
const com=()=>{
	let acceloncom=getModulePath('accelon22.com');
	if (!fs.existsSync(acceloncom)) {
		console.log('com image not found ',blue(acceloncom))
		return 
	}
	build({com:true,comfilename:acceloncom});
}
export const unique=()=>onelexicon('unique', PTK.unique);
export const dedup=()=>onelexicon('dedup', PTK.dedup);
export const listwords=()=>text_lexicon('listwords', PTK.listwords);
export const intersect=()=>lexicons('intersect',PTK.lexiconIntersect);
export const union=()=>lexicons('union', PTK.lexiconUnion);
export const xor=()=>lexicons('xor', PTK.lexiconXor);

const help=()=>{
    console.log(bold('Pitaka command line interface'));
    console.log(underline('Usage:'));
    console.log(yellow('$ ptk build'), 'build a ptk zip')
    console.log(yellow('$ ptk jsonp'), 'build a folder of jsonp')
    console.log(yellow('$ ptk com  '), 'build a com executable')
    console.log(underline('Text File Processing Utils'));
    console.log(yellow('$ ptk unique   '),green('filename'), 'remove duplicate item');
    console.log(yellow('$ ptk dedup    '),green('filename'), 'find out duplicate item');
    console.log(yellow('$ ptk listwords'),green('filename'),green('lexicon'), 'list words found in lexicon');
    console.log(yellow('$ ptk union    '),green('filename1'),green('filename1'),'combine lexicon')
    console.log(yellow('$ ptk intersect'),green('filename1'),green('filename1'),'find out common words')
    console.log(yellow('$ ptk xor      '),green('filename1'),green('filename1'), 'find out exclusive words')
}

try {
    await ({'--help':help,'-h':help,build,jsonp,com,dedup,unique,listwords,union,intersect,xor})[cmd](arg);

} catch(e) {
    console.log( red('error running command'),cmd)
    console.log(e)
}
