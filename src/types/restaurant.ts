export interface IRestaurantEsDoc {
	name : string;
	email :string;
	phone: string;
	address: string;
	restaurantId : string;
}

export interface IRestaurantAggregatedData {
	restaurantId : string;
	restaurantName : string;
	restaurantName2 : string;
	restaurantContactEmail : string;
	restaurantPhone:string;
	restaurantAddress:string;
}