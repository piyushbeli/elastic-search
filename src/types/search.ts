export interface ISearchResult {
    id: string;
    name: string;
    categoryName: string;
    imageName: string;
    restaurantName?: string;
    restaurantId?: string;
}

export interface ISearchIndicesParams {
    from: number;
    size: number;
    indexType: string;
    searchTerm: string;
    boostedFields?: string[];
    filters?: Record<string, any>[];
    showRawData: boolean;
}
