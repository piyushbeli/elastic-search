import RestaurantUploadJob from './jobs/uploadRestaurants';

export default async function setupJobs():Promise<void> {
    new RestaurantUploadJob().setup();
}
