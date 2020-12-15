import { ESMapProperty } from '../types/esDoc';
import { IRestaurantESDoc } from '../types/restaurant';
import { ES_INDEXES } from './constants';
import { IDishESDoc } from '../types/dish';

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
            type: 'text',
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
            type: 'text',
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
