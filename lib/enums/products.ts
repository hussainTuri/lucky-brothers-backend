// TypeScript enums have built-in reverse mapping from names to values, meaning
// productTypesEnum.Trye will give you 1 and productTypesEnum[1] will give you Tyre.
// So no need of explicit mapping
export enum ProductTypesEnum {
  Tyre = 1,
  Battery = 2,
  Filter = 3,
  Service = 4,
}

export enum ProductSkuPrefixEnum {
  TRY = 1,
  BAT = 2,
  FLT = 3,
  SVC = 4,
}
