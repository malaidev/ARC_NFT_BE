
/**
 * Interface for table row filter attributes
 * @property {string} fieldName database field name to filter
 * @property {string} query query string to compare
 */
export interface IFiltering {
    fieldName: string
    query: string
    [key: string]: any
}

export interface IQueryFilters {
    orderBy?: string,
    direction?: string,
    filters?: Array<IFiltering>,
    cursor?: number,
    amount?: number,
    startAt?: Date
}