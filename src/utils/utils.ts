import { ESMapProperty } from 'types/esDoc';
import { IRestaurantESDoc } from 'types/restaurant';

//TODO: make this method generic so that you can supply mappings based on indexes
export function getRestaurantIndexMappings(): { [key in keyof IRestaurantESDoc]: ESMapProperty } {
    const restaurantMappings: { [key in keyof IRestaurantESDoc]: ESMapProperty } = {
        restaurant_name: {
            type: 'text',
        },
        contact_address: {
            type: 'text',
        },
        restaurant_about_us: {
            type: 'text',
        },
        objectId: {
            type: 'text',
            index: false,
        },
        image: {
            type: 'text',
            index: false,
        },
        type: {
            type: 'text',
        },
        tags: {
            type: 'text',
        },
        restaurant_logo: {
            type: 'text',
            index: false,
        },
    };
    return restaurantMappings;
}
