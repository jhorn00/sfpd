export interface MapOption {
    label: string;
    value: string;
}
  
export interface MenuProps {
    mapOptions: MapOption[];
    mapStyle: string;
    onMapStyleChange: (mapStyle: string) => void;
    startDate: Date;
    onStartDateChange: (startDate: Date | null) => void;
    endDate: Date;
    onEndDateChange: (endDate: Date | null) => void;
    queryLimit: number;
    onQueryLimitChange: (queryLimit: number) => void;
}
