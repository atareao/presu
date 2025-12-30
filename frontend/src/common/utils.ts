export const mapsEqual = (map1: Map<string, string>, map2: Map<string, string>): boolean => {
    // 1. Si el tamaño es diferente, son distintos.
    if (map1.size !== map2.size) {
        return false;
    }

    // 2. Itera sobre el primer mapa y compara los valores en el segundo.
    for (const [key, val] of map1.entries()) {
        // Si la clave no existe o el valor es diferente, son distintos.
        if (val !== map2.get(key)) {
            return false;
        }
    }

    // 3. Si la iteración termina, son iguales.
    return true;
};

export const toCapital = (s: string): string => {
    return s.toLowerCase()
        .split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.substring(1)).join(' ');
}


export const debounce = (func: (...args: any[]) => void, delay: number) => {
    let timeoutId: ReturnType<typeof setTimeout>;
    return function(this: any, ...args: any[]) {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => func.apply(this, args), delay);
    };
};

/**
 * Obtiene un valor anidado de un objeto de forma segura (ej: 'value.name_es')
 * Esto resuelve el error TS2536.
 */
export const getNestedValue = (obj: any, path: string): any => {
    // Si el objeto es nulo o indefinido, o la ruta no es válida, devolvemos undefined
    if (!obj || !path) {
        return undefined;
    }

    const pathParts = path.split('.');
    let current = obj;

    for (const part of pathParts) {
        // Navegamos al siguiente nivel, asegurando que el objeto actual no sea nulo
        if (current && typeof current === 'object' && part in current) {
            current = current[part];
        } else {
            // Si el camino se rompe (ej: 'value' es null o 'name_es' no existe en 'value')
            return undefined;
        }
    }
    return current;
};


