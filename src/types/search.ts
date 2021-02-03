export interface ISearchResult {
    id: string;
    name: string;
    categoryName: string;
    imageName: string;
    restaurantName?: string;
    restaurantId?: string;
    description?: string;
}

export interface ISearchQuery {
    index: string;
    body: Record<string, any>;
    from: number;
    size: number;
}
export interface ISearchIndicesParams {
    searchQuery: ISearchQuery;
    showRawData: boolean;
}
