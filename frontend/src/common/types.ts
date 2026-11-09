export interface Validation {
    check: (...args: unknown[]) => unknown;
    msg: string;
}

export interface Item {
    value: number;
    label: string;
}

export interface ReferencedItem {
    value: number;
    label: string;
    reference: string;
}

type NestedKeyOf<T> = {
    [K in keyof T & (string | number)]: T[K] extends object
        ? `${K}` | `${K}.${NestedKeyOf<T[K]>}`
        : `${K}`;
}[keyof T & (string | number)];

export interface FieldDefinition<T>{
    key: NestedKeyOf<T> & string; // La clave debe ser una clave de T y también un string
    labelKey?: NestedKeyOf<T> & string; // La clave debe ser una clave de T y también un string
    label: string;
    type: 'boolean' | 'number' | 'date' | 'string' | 'select' | null;
    value?: T[keyof T & string]; // Valor inicial de ese tipo
    customSorter?: (a: T, b: T) => number;
    render?: {
        bivarianceHack(content: unknown, record: T): React.ReactNode;
    }['bivarianceHack']; 
    editable?: boolean;
    filterKey?: string;
    fixed?: 'left' | 'right';
    width?: number;
    sortKey?: string;
    options?: { value: string | number; label: string }[];
    required?: boolean;
}

export type LanguageCode = "es" | "va";

// Define el objeto de constantes para usar como valores
export const Language = {
    ES: "es" as LanguageCode,
    VA: "va" as LanguageCode,
};

export type DialogMode = "create" | "read" | "update" | "delete" | "none";

export const DialogModes = {
    CREATE: "create" as DialogMode,
    READ:   "read"   as DialogMode,
    UPDATE: "update" as DialogMode,
    DELETE: "delete" as DialogMode,
    NONE:   "none"   as DialogMode,
};

export interface PuntoPreemerMarker {
    type: string;
    latitude: number;
    longitude: number;
    icon?: unknown;
    name: string;
    description: string;
    address?: string;
}

