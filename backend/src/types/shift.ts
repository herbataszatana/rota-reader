export interface Shift {
    weekNumber: number;
    day: string;
    date: string;
    startTime: string | null;
    endTime: string | null;
    startDateTime: string | null;
    endDateTime: string | null;
    reference: string | null;
    totalHours: string | null;
    isRestDay: boolean;
    endsNextDay: boolean;
}

export interface WeekData {
    weekNumber: number;
    weekCommencing: string;
    totalHours: string;
    shifts: Shift[];
}
