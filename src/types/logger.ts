export interface ILoggerTypes {
	log: (message:string) => void;
	error: (message:string) => void;
	warn: (message:string) => void;
	verbose: (message:string) => void;
	info: (message:string) => void;
	debug: (message:string) => void;
	silly: (message:string) => void;
}