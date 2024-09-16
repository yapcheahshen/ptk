/* accelon 23 backend */
import {columnField,inlineNote,rowOf,scanColumnFields,searchColumnField} from './columns.ts';
import {parseQuery,scanText,scoreLine,hitsOfLine} from '../fts/query.ts';
import {footNoteAddress,footNoteByAddress,footNoteInTSV} from './footnote.ts';
import {foreignLinksAtTag,getParallelBook,getParallelLine,enumParallelsPtk} from './parallel.ts';
import {addBacklinks, addForeignLinks } from './links.ts';
import {enableBacklinkFeature} from './backlinks.ts'
import {enableFTSFeature} from './postings.ts';
import {enableTOCFeature} from './toc.ts'
import {enableTagFeature} from './tagfeature.ts'
import { tagAtAction } from './address.ts';

export const enableFeature=(ptk:any,feature:string)=>{
    if (feature=="tag") {
        enableTagFeature(ptk);
    } else if (feature=='toc') {
        enableTOCFeature(ptk)
    } else if (feature=='fts') {
        enableFTSFeature(ptk)
    } else if (feature=='backlink') {
        enableBacklinkFeature(ptk)
    }
}
export const enableFeatures=(ptk:any,features:Array<string>|string)=>{
    if (!Array.isArray(features)) features=[features];
    features.forEach(f=>enableFeature(ptk,f))
}

export const enableAccelon23Features=(ptk:any)=>{
    //check fields
    
    enableTagFeature(ptk);
    enableTOCFeature(ptk);
    enableFTSFeature(ptk)
    ptk.scanColumnFields=scanColumnFields;
    ptk.searchColumnField=searchColumnField;
    ptk.scanText=scanText;
    ptk.parseQuery=parseQuery;
    ptk.scoreLine=scoreLine;
    ptk.tagAtAction=tagAtAction;

    ptk.scanCache={};
    ptk.queryCache={};
    ptk.columnField=columnField;
    ptk.inlineNote=inlineNote;
    ptk.footNoteAddress=footNoteAddress;
    ptk.footNoteByAddress=footNoteByAddress;
    ptk.footNoteInTSV=footNoteInTSV;
    ptk.foreignLinksAtTag=foreignLinksAtTag;
    ptk.getParallelBook=getParallelBook;
    ptk.getParallelLine=getParallelLine;
    ptk.enumParallelsPtk=enumParallelsPtk;
    ptk.taggedLines={};
    ptk.foreignlinks={}; 
    ptk.addForeignLinks=addForeignLinks;
    ptk.addBacklinks=addBacklinks;

    ptk.backlinks={};
    ptk.rowOf=rowOf;
    ptk.hitsOfLine=hitsOfLine;
  
    ptk.parallels={}; //parallels showing flag, ptkname:string, onoff:boolean
}
