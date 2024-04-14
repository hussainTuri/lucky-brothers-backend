// TypeScript enums have built-in reverse mapping from names to values, meaning
// productTypesEnum.Trye will give you 1 and productTypesEnum[1] will give you Tyre.
// So no need of explicit mapping
export enum ProductTypesEnum {
  Tyre = 1,
  Battery = 2,
  Filter = 3,
  Service = 4,
  Oil = 5,
  Tube = 6,
  Langoti = 7,
  SparePart = 8,
  Other = 9,
}

export enum ProductSkuPrefixEnum {
  TYR = 1,
  BAT = 2,
  FLT = 3,
  SVC = 4,
  OIL = 5,
  TUB = 6,
  LNG = 7,
  SPR = 8,
  OTH = 9,
}
