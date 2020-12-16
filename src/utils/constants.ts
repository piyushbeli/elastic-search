export const ES_INDEXES = {
    RESTAURANT: 'restaurant',
    DISH: 'dish',
};

export const ES_TYPES = {
    DOC: '_doc',
};

export const DB_CLASSES = {
    RESTAURANT: 'Restaurant',
    ES_SYNC_STAT: 'ESSyncStat',
    DISH: 'Dish',
};

export const DEFAULT_TIME_ZONE = 'America/Puerto_Rico';

export const DISH_BOOSTED_FIELDS = ['name^3', 'tags^2', 'description'];
export const RESTAURANT_BOOSTED_FIELDS = ['restaurant_name^3', 'tags^2', 'restaurant_about_us'];
