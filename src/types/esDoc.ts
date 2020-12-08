export interface IEsDoc<T> {
	'index': string;
	'type': string;
	'id': string;
	'body' : T
}