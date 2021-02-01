export interface IESDoc<T> {
    index: string;
    type: string;
    id: string;
    body: T;
}

export interface ESMapProperty {
    type: string;
    index?: boolean;
    include_in_all?: boolean;
}
