import { setup as setupOrderDataCaching } from './jobs/uploadRestaurants';

export default async function setupJobs():Promise<void> {
  setupOrderDataCaching();
}
