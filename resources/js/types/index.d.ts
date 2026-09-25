export interface SewingCapacity {
    no_of_lines: number;
    per_line_capacity: number;
    total_capacity_per_day: number;
    rate?: number | string;
    unit?: string;
}

export interface NonSewingMachineRow {
    id?: string;
    machine_type: string;
    machine_type_id?: number | null;
    no_of_machine: number;
    capacity_per_machine: number;
    total_capacity_per_day: number;
    rate?: number | string;
    unit_type?: string;
}

export interface ProductionCapacities {
    sewing?: SewingCapacity;
    knitting?: NonSewingMachineRow[];
    yarn_dyeing?: NonSewingMachineRow[];
    fabric_dyeing?: NonSewingMachineRow[];
    print?: NonSewingMachineRow[];
    embroidery?: NonSewingMachineRow[];
}

export interface MachineType {
    id: number;
    category: string;
    name: string;
    brand_or_model?: string | null;
    default_unit: string;
    is_active: boolean;
    sort_order: number;
}

export interface Factory {
    id: number;
    user_id: number;
    business_name: string;
    industry_type?: string;
    contact_person?: string;
    phone?: string;
    email?: string;
    district?: string;
    address?: string;
    total_lines?: number;
    total_machines?: number;
    daily_capacity?: string;
    production_capacities?: ProductionCapacities | null;
    trade_license_no?: string;
    trade_license_file?: string;
    tin_no?: string;
    tin_file?: string;
    bin_no?: string;
    bin_file?: string;
    nid_file?: string;
    is_verified?: boolean;
    rating?: number | string;
    capabilities?: string[] | null;
    created_at?: string;
    updated_at?: string;
}

export interface User {
    id: number;
    name: string;
    email: string;
    phone?: string;
    customer_id?: string;
    account_type?: string;
    status: string;
    is_subscribed?: boolean;
    subscription_expires_at?: string;
    email_verified_at?: string;
    phone_verified_at?: string;
    factory?: Factory | null;
}

export interface PaginationLink {
    url: string | null;
    label: string;
    active: boolean;
}

export interface PaginatedData<T> {
    data: T[];
    current_page: number;
    last_page: number;
    per_page: number;
    from: number | null;
    to: number | null;
    total: number;
    prev_page_url: string | null;
    next_page_url: string | null;
    links: PaginationLink[];
}

export type PageProps<
    T extends Record<string, unknown> = Record<string, unknown>,
> = T & {
    auth: {
        user: User;
    };
    flash?: {
        success?: string;
        error?: string;
    };
};

