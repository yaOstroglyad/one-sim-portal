export interface UsageInfo {
  /**
   * Type of usage
   */
  type: UsageInfo.UsageTypeEnum,
  /**
   * Total usage
   */
  total?: number;
  /**
   * Used usage
   */
  used?: number;
  /**
   * Remaining usage
   */
  remaining?: number;
  /**
   * Unit of usage
   */
  unitType?: UsageInfo.UnitTypeDataEnum | UsageInfo.UnitTypeAmountEnum;
}

export namespace UsageInfo {
  export type UsageTypeEnum = 'data' | 'voice' | 'sms';
  export type UnitTypeDataEnum = 'KB' | 'MB' | 'GB' | 'TB' | 'Gigabyte';
  export type UnitTypeAmountEnum = 'SMS' | 'Min';
  export const UsageTypeEnum = {
    data: 'data' as UsageTypeEnum,
    voice: 'voice' as UsageTypeEnum,
    sms: 'sms' as UsageTypeEnum
  };
  export const UnitTypeDataEnum = {
    Byte: 'BYTE' as UnitTypeDataEnum,
    Kb: 'KB' as UnitTypeDataEnum,
    Mb: 'MB' as UnitTypeDataEnum,
    Gb: 'GB' as UnitTypeDataEnum,
    Tb: 'TB' as UnitTypeDataEnum
  };
  export const UnitTypeAmountEnum = {
    Sms: 'SMS' as UnitTypeAmountEnum,
    Min: 'Min' as UnitTypeAmountEnum
  };
}


