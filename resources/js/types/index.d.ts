export type UserRole = 'admin' | 'fac' | 'ven' | 'sup' | 'par';
export type BillingCycle = 'm' | 'y';
export type PostType = 'work_offer' | 'machine_available';

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
    total: number;
    from: number | null;
    to: number | null;
    links: PaginationLink[];
}

export interface FactoryRef {
    id: number;
    code: string;
    name: string;
    area?: string | null;
    phone?: string | null;
}

export interface VendorRef {
    id: number;
    code: string;
    name: string;
}

export interface SupplierRef {
    id: number;
    name: string;
}

export interface UserRef {
    id: number;
    name: string;
    phone: string;
    email?: string | null;
    role: UserRole;
    organization_name?: string | null;
    factory_id?: number | null;
}

export interface User {
    id: number;
    name: string;
    phone: string;
    email: string | null;
    role: UserRole;
    designation: string | null;
    organization_name: string | null;
    factory_id: number | null;
    vendor_id: number | null;
    supplier_id: number | null;
    partner_code: string | null;
    party_code: string | null;
    is_owner: boolean;
    is_vendor_rep: boolean;
    can_message: boolean;
    is_active: boolean;
    phone_verified_at?: string | null;
    trial_ends_at?: string | null;
    subscription_plan: string;
    billing_cycle: BillingCycle;
    last_login_label?: string | null;
    created_at: string;
    updated_at: string;
    factory?: FactoryRef | null;
    vendor?: VendorRef | null;
    supplier?: SupplierRef | null;
}

export interface FactoryMachine {
    id: number;
    factory_id: number;
    code: string;
    knit_type: 'c' | 'f';
    dia: number | null;
    gauge: number;
    spec_label: string | null;
    brand: string | null;
    status: string;
    current_order_no: string | null;
    broadcast_free: boolean;
    free_from: string | null;
    daily_capacity_kg: number;
    rate_label: string | null;
    supported_fabrics_json: string[] | null;
    note: string | null;
    created_at?: string;
    updated_at?: string;
    factory?: FactoryRef | null;
}

export interface FreeMachineRequest {
    id: number;
    request_no: string;
    factory_id: number;
    party_code: string;
    contact_person: string;
    fabrication: string;
    qty_kg: string | number;
    machines_needed: number;
    spec_label: string;
    start_date: string | null;
    message: string | null;
    status: string;
    created_at: string;
    factory?: FactoryRef | null;
}

export interface SubcontractOrderSummary {
    id: number;
    order_no: string;
    buyer: string | null;
    party_code: string;
    fabric_summary: string;
    total_qty_kg: string | number;
    done_kg: string | number;
    delivered_kg?: string | number;
    rate_tk: string | number;
    status: string;
}

export interface PlanMeta {
    code: string;
    name: string;
    bn_name: string;
    max_machines: number | null;
    monthly_tk: number;
    annual_tk: number;
}

export interface FactoryHealth {
    trial_state: 'trialing' | 'expiring' | 'expired' | 'active_paid' | string;
    days_left: number | null;
    over_quota: boolean;
    max_machines: number | null;
}

export interface OrderLine {
    id: number;
    line_index: number;
    knit_type: string;
    is_yarn_dyed: boolean;
    unit: string;
    placement: string;
    fabrication: string;
    color: string | null;
    qty: string | number;
    done_qty: string | number;
    delivered_qty: string | number;
    grey_gsm: string | null;
    finish_gsm: string | null;
    stitch_length: string | null;
    grey_dia: string | null;
    dia_gauge: string | null;
    flat_size: string | null;
    machines_json: string[] | null;
}

export interface ProductionLog {
    id: number;
    order_no: string;
    date_label: string;
    shift: string;
    machine_code: string;
    operator_name: string | null;
    qty_kg: string | number;
    rolls_count: number;
    yarn_lot: string | null;
    fault_code: string | null;
}

export interface QcSign {
    v: string | null;
    by?: string;
    at?: string;
    note?: string;
}

export interface QcInspection {
    id: number;
    qc_no: string;
    order_no: string;
    placement_index: number;
    placement_name: string | null;
    date_label: string;
    roll_no: string;
    machine_code: string | null;
    weight_kg: string | number;
    issue_description: string;
    source: string;
    factory_sign_json: QcSign | null;
    vendor_sign_json: QcSign | null;
    action_taken: string | null;
}

export interface DeliveryChallan {
    id: number;
    challan_no: string;
    factory_code: string;
    party_code: string;
    order_no: string;
    date_label: string;
    rolls_json: unknown[] | null;
    vehicle_no: string;
    driver_name: string | null;
    driver_phone: string | null;
    factory_sign_json: QcSign | null;
    vendor_sign_json: QcSign | null;
}

export interface SubcontractOrder {
    id: number;
    order_no: string;
    factory_id: number;
    party_id: number | null;
    party_code: string;
    buyer: string | null;
    fabric_summary: string;
    gsm: string | null;
    finish_gsm: string | null;
    stitch_length: string | null;
    grey_dia: string | null;
    dia_gauge: string | null;
    color: string | null;
    yarn_summary: string | null;
    total_qty_kg: string | number;
    done_kg: string | number;
    delivered_kg: string | number;
    daily_rate_kg: string | number;
    rate_tk: string | number;
    status: string;
    start_label: string;
    order_date: string | null;
    delivery_due_date: string | null;
    complete_date: string | null;
    machines_json: string[] | null;
    yarn_in_json: Array<Record<string, unknown>> | null;
    factory?: FactoryRef | null;
    party?: { id: number; code: string; name: string; type: string; phone?: string | null; payment_terms?: string | null } | null;
    lines?: OrderLine[];
    productions?: ProductionLog[];
    qc_inspections?: QcInspection[];
    delivery_challans?: DeliveryChallan[];
    lines_count?: number;
    qc_inspections_count?: number;
    productions_count?: number;
    delivery_challans_count?: number;
}

export interface BillSummaryRow {
    id: number;
    bill_no: string;
    factory_code: string;
    party_code: string;
    bill_date: string | null;
    jv_no: string;
    gross_tk: number;
    paid_tk: number;
    pending_tk: number;
    due_tk: number;
    lines_count?: number;
    payments_count?: number;
    factory?: FactoryRef | null;
}

export interface FactoryExpenseRow {
    id: number;
    factory_id: number;
    category: string;
    title: string;
    amount_tk: string | number;
    payment_method: string;
    reference_no?: string | null;
    expense_date: string;
    created_by?: string;
    notes?: string | null;
    factory?: FactoryRef | null;
}

export interface StoreItemRow {
    id: number;
    item_code: string;
    name: string;
    category: string;
    unit: string;
    stock_qty: number;
    min_qty: number;
    unit_price: string | number;
    rfq_sent: boolean;
}

export interface ThreadMessage {
    s: string;
    who: string;
    n?: string;
    t?: string;
    txt?: string | null;
    voice?: Record<string, unknown> | null;
    photo?: string | null;
    file?: Record<string, unknown> | null;
}

export interface MessageThreadRow {
    id: number;
    thread_code: string;
    factory_code: string;
    party_code: string;
    order_no: string | null;
    title: string;
    unread_count: number;
    messages_count?: number;
    last_message?: ThreadMessage | null;
    messages_json?: ThreadMessage[];
    factory?: FactoryRef | null;
    order?: SubcontractOrderSummary | null;
    updated_at?: string | null;
}

export interface Factory {
    id: number;
    code: string;
    name: string;
    area: string | null;
    address: string | null;
    phone: string | null;
    total_machines: number;
    plan_code: string;
    trial_ends_at: string | null;
    owner_id: number | null;
    billing_cycle: BillingCycle;
    qr_sticker_enabled: boolean;
    last_update_label: string;
    yearly_orders_count: number;
    ontime_delivery_pct: string | number;
    qc_reject_pct: string | number;
    created_at: string;
    updated_at: string;
    owner?: UserRef | null;
    users?: User[];
    factory_machines?: FactoryMachine[];
    free_machine_requests?: FreeMachineRequest[];
    subcontract_posts?: SubcontractPost[];
    vendors?: Vendor[];
    factory_machines_count?: number;
    users_count?: number;
    free_machine_requests_count?: number;
    subcontract_posts_count?: number;
    subcontract_orders_count?: number;
    parties_count?: number;
    employees_count?: number;
}

export interface Quotation {
    id: number;
    subcontract_post_id: number;
    factory_id: number | null;
    bidder_name: string;
    bidder_phone: string | null;
    offered_rate_tk: string | number;
    estimated_days: number;
    allocated_machines: number;
    note: string | null;
    status: 'pending' | 'accepted' | 'rejected' | string;
    created_at: string;
    factory?: FactoryRef | null;
}

export interface SubcontractPost {
    id: number;
    user_id: number | null;
    factory_id: number | null;
    post_type: PostType;
    title: string;
    fabric_type: string;
    gsm: string | null;
    dia: number | null;
    gauge: number | null;
    quantity_kg: string | number;
    target_rate_tk: string | number | null;
    yarn_count: string | null;
    location: string | null;
    delivery_deadline: string | null;
    description: string | null;
    status: string;
    created_at: string;
    user?: UserRef | null;
    factory?: FactoryRef | null;
    quotations?: Quotation[];
    quotations_count?: number;
}

export interface Supplier {
    id: number;
    user_id: number | null;
    name: string;
    category: string;
    also_categories_json: string[] | null;
    area: string;
    rating: string | number;
    reviews_count: number;
    description: string;
    is_sponsored: boolean;
    is_verified: boolean;
    created_at: string;
    user?: UserRef | null;
}

export interface SupplierRfq {
    id: number;
    rfq_no: string;
    factory_code: string;
    category: string | null;
    item_name: string;
    qty_label: string;
    area: string | null;
    phone: string | null;
    need_by_label: string;
    status: string;
    quoted_price: string | null;
    delivery_days: string | null;
    note: string | null;
    created_at: string;
    factory?: FactoryRef | null;
}

export interface Vendor {
    id: number;
    user_id: number | null;
    factory_id: number | null;
    code: string;
    name: string;
    type: string;
    contact_person: string | null;
    phone: string | null;
    email: string | null;
    area: string | null;
    address: string | null;
    is_verified: boolean;
    created_at: string;
    user?: UserRef | null;
    factory?: FactoryRef | null;
}

export interface Partner {
    id: number;
    user_id: number | null;
    partner_code: string;
    total_referrals: number;
    active_factories_count: number;
    total_commission_tk: string | number;
    withdrawn_commission_tk: string | number;
    balance_commission_tk: string | number;
    payout_method: string;
    payout_number: string | null;
    created_at: string;
    user?: UserRef | null;
}

export interface Advertisement {
    id: number;
    org_name: string;
    placement: string;
    title: string;
    description: string | null;
    cta_label: string;
    duration_label: string;
    contact_phone: string | null;
    status: string;
    created_at: string;
}

export interface JobApplication {
    id: number;
    job_listing_id: number;
    applicant_name: string;
    phone: string;
    experience: string;
    current_area: string;
    note: string | null;
    created_at: string;
}

export interface JobListing {
    id: number;
    role_title: string;
    company_name: string;
    area: string;
    category: string;
    shift_label: string | null;
    experience_label: string | null;
    salary_label: string;
    posted_label: string;
    contact_phone: string | null;
    is_new: boolean;
    vacancies: number;
    requirements_json: string[];
    created_at: string;
    applications_count?: number;
    applications?: JobApplication[];
}

export type PageProps<T extends Record<string, unknown> = Record<string, unknown>> = T & {
    auth: {
        user: {
            id: number;
            name: string;
            phone: string;
            email: string | null;
            role: UserRole;
            designation: string | null;
            organization_name: string | null;
            is_active: boolean;
            subscription_plan: string;
            billing_cycle: BillingCycle;
        } | null;
    };
    badges?: {
        newMachineRequests: number;
        newRfqs: number;
        pendingAds: number;
        unreadThreads?: number;
    };
    flash?: {
        success?: string;
        error?: string;
        importReport?: {
            created: number;
            skipped: number;
            failed: number;
            errors: string[];
        };
    };
};
