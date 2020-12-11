export interface ILoggerTypes {
	log: (message, options?) => void;
	error: (message, options?) => void;
	warn: (message, options?) => void;
	verbose: (message, options?) => void;
	info: (message, options?) => void;
	debug: (message, options?) => void;
	silly: (message, options?) => void;
}