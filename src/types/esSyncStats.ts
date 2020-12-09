export interface ESSyncStat {
	indexType: string;
	syncStats: SyncStats;
}

export interface SyncStats {
	lastSyncStartTime: Date;
	lastSyncEndTime: Date;
	error: string;
}