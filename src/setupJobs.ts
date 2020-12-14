import setupRestaurantJob from './jobs/uploadRestaurants';
import setupDishesJob from './jobs/uploadDishes';

const setupJobs = async (): Promise<void> => {
    setupRestaurantJob();
    setupDishesJob();
};

export default setupJobs;
