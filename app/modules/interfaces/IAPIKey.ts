export interface IExtraApiKeyFields {
    fieldName: string,
    value: any
}

export interface IAPIKey {
    id: string
    apiKey: string
    apiSecret?: string
    extraFields?: IExtraApiKeyFields[]
}
