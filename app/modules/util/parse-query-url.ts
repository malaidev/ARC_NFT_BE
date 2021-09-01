import queryString = require('query-string');
import { IFiltering, IQueryFilters } from "../interfaces/Query";

/**
 * Parse the url query to match `IDefaultingTableFilters` interface
 * @param queryUrl 
 * @returns 
 */
export function parseQueryUrl(queryUrl: string): IQueryFilters {
    const filters: IQueryFilters = {
        orderBy: "",
        direction: "",
        filters: [],
        cursor: 0,
        amount: 20
    };

    /**
     * @var {Object} q the parsed query string to object
     */
    const q = queryString.parse(queryUrl, { arrayFormat: 'bracket', parseNumbers: true }) as Object;

    /**
     * @var {Array<IFiltering>} filterArray array of filters
     */
    const filterArray = [] as Array<IFiltering>;

    for (let item in q) {
        // Identifiy array items to apply the `IFiltering` interface as predefined
        if (item === 'fieldName' || item === 'query' && Array.isArray(q[item])) {
            q[item].forEach((filter: string, index: number) => {
                if (filterArray[index]) {
                    filterArray[index][item] = filter;
                } else {
                    const f = {} as IFiltering;
                    f[item] = filter
                    filterArray.push(f);
                }
            });
        } else if (item === 'startAt') {
            filters.startAt = new Date(q[item]);
        } else {
            if (item in filters && typeof q[item] === typeof filters[item]) {
                filters[item] = q[item]
            }
        }

    }
    filters.filters = filterArray;

    return filters;
}