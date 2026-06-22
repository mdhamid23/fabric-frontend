export interface iAxios<ParamObjectType, DataObjectType> {
  url?: string;
  params?: ParamObjectType;
  data?: DataObjectType;
  method?: string;
  dataType?: string;
}
