import { ESMapProperty } from '../types/esDoc';
import { IRestaurantESDoc } from '../types/restaurant';
import { DB_CLASSES, ES_INDEXES } from './constants';
import { IDishESDoc } from '../types/dish';
import _ from 'lodash';
import { ISearchResult } from '../types/search';

export function getMappings(indexType: string): { [key: string]: ESMapProperty } {
    switch (indexType) {
    case ES_INDEXES.RESTAURANT:
        return getRestaurantIndexMappings();
    case ES_INDEXES.DISH:
        return getDishIndexMappings();
    default:
        throw 'Please select a valid index type';
    }
}

function getRestaurantIndexMappings(): { [key in keyof IRestaurantESDoc]: ESMapProperty } {
    const restaurantMappings: { [key in keyof IRestaurantESDoc]: ESMapProperty } = {
        restaurant_name: {
            type: 'search_as_you_type',
        },
        restaurant_about_us: {
            type: 'text',
        },
        tags: {
            type: 'text',
        },
        contact_address: {
            type: 'text',
            index: false,
        },
        objectId: {
            type: 'text',
            index: false,
        },
        image: {
            type: 'text',
            index: false,
        },
        restaurant_logo: {
            type: 'text',
            index: false,
        },
    };
    return restaurantMappings;
}
// a keyword type is not broken and helps in exact matching
// a text type is broken and can be used for partial matching
// by using keyword type we can implement filtering
// also only indexed fields can be searched and filtered
// https://discuss.elastic.co/t/filter-query-gives-empty-result/75140
function getDishIndexMappings(): { [key in keyof IDishESDoc]: ESMapProperty } {
    const dishMappings: { [key in keyof IDishESDoc]: ESMapProperty } = {
        name: {
            type: 'search_as_you_type',
        },
        tags: {
            type: 'text',
        },
        description: {
            type: 'text',
        },
        objectId: {
            type: 'text',
            index: false,
        },
        sourceImageURL: {
            type: 'text',
            index: false,
        },
        restaurantId: {
            type: 'keyword',
        },
        restaurantName: {
            type: 'keyword',
        },
    };
    return dishMappings;
}

export const getRequiredFieldsForSearchAllQuery = (requiredFields = ['name', 'restaurant_name']): { nGramField: string[]; basicFields: string[] } => {
    const nGrams = ['', '._2gram', '._3gram'];
    const result: string[] = [];
    _.forEach(requiredFields, (field) => {
        _.forEach(nGrams, (gramValue) => {
            result.push(field + gramValue);
        });
    });
    return { nGramField: result, basicFields: requiredFields };
};

export const formatSearchItem = (value: Record<string, any>): ISearchResult => {
    const index = value._index;
    const item = value._source;
    switch (index) {
    case ES_INDEXES.DISH:
        return {
            id: _.get(item, 'objectId'),
            categoryName: 'Dish',
            name: _.get(item, 'name', ''),
            imageName: _.get(item, 'sourceImageURL', ''),
            restaurantId: _.get(item, 'restaurantId', ''),
            restaurantName: _.get(item, 'restaurantName', ''),
            description: _.get(item, 'description'),
        };
    case ES_INDEXES.RESTAURANT:
        return {
            id: _.get(item, 'objectId'),
            categoryName: 'Restaurant',
            name: _.get(item, 'restaurant_name', ''),
            imageName: _.get(item, 'image', ''),
        };
    default:
        return {
            id: '',
            categoryName: '',
            imageName: '',
            name: '',
        };
    }
};

export const getDishAggregationPipeline = (matchQuery = {}): any[] => {
    return [
        {
            $addFields: {
                restaurantId: { $substr: ['$_p_restaurant', DB_CLASSES.RESTAURANT.length + 1, -1] },
            },
        },
        { $match: { ...matchQuery }},
        {
            $lookup: {
                from: 'Restaurant',
                localField: 'restaurantId',
                foreignField: '_id',
                as: 'restaurants',
            },
        },
        {
            $addFields: {
                restaurantName: { $arrayElemAt: ['$restaurants.restaurant_name', 0] },
            },
        },
    ];
};
