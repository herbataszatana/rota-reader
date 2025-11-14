export interface EmployeeSelection {
    name: string;
    link: string;
    wk: number;
    startDate?: string;
    endDate?: string;
}

export interface Employee {
    name: string;
    wk: number;
}

export interface Link {
    link: string;
    employees: Employee[];
}
