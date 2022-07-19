
export enum SourceType { Offtext='txt', TSV='tsv'  };

export interface ICompileError {
	fatality:boonlean;
	msg:string;
	line:number;
	refline:number;
	linetext:string;
	name:string;
}
export interface ICompiled {
	name:string;
	processed:string,
	errors:ICompileError[],
}
export interface ITypedef {
	
}
export interface IValidator {
	validate:Function
}
export interface ICompiler {
	ptk:string;   
	compilingname:string; 
	line:number;
	primarykeys:Map<string,any>,
	compiledFiles:Map<string,ICompiled>,
	typedefs:Map<string,ITypedef>
}