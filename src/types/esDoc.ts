export interface IESDoc<T> {
    index: string;
    type: string;
    id: string;
    body: T;
}

export interface ESMapProperty {
    type: string;
    index?: boolean;
}
