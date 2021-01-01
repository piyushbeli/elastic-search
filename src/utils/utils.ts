import { ESMapProperty } from '../types/esDoc';
import { IRestaurantESDoc } from '../types/restaurant';
import { ES_INDEXES } from './constants';
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
    };
    return dishMappings;
}

export const getRequiredFieldsForSearchAllQuery = (): { nGramField: string[]; basicFields: string[] } => {
    const nGrams = ['', '._2gram', '._3gram'];
    const requiredFields = ['name', 'restaurant_name'];
    const result: string[] = [];
    _.forEach(requiredFields, (field) => {
        _.forEach(nGrams, (gramValue) => {
            result.push(field + gramValue);
        });
    });
    return { nGramField: result, basicFields: requiredFields };
};

export const formatSearchItem = (value): ISearchResult => {
    const index = value._index;
    const item = value._source;
    switch (index) {
    case ES_INDEXES.DISH:
        return {
            id: _.get(item, 'objectId'),
            categoryName: 'Dish',
            name: _.get(item, 'name', ''),
            imageName: _.get(item, 'sourceImageURL', ''),
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
