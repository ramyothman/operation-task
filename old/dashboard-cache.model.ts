import * as _ from "lodash";

export class Cache {
    
    private static instance: Cache;
    private cache: any;

    private Cache() {}

    public static get getInstance(): Cache {
        return this.instance || (this.instance = new this());
    }

    public getCache(index: string, obj: any[], field: string) {
        if (!this.cache[index])
            this.cache[index] = _.sumBy(obj, field);
        return this.cache[index];
    }
    public setCache(index: string, value:any)
    {
        this.cache[index] = value;
    }
    public resetCache() {
        this.cache = [];
    }
}