const API_BASE_URL = '/api';

export interface Compra {
    id: number;
    numeroCompra?: string;
    numeroFactura?: string;
    proveedorId: number;
    proveedorNombre?: string;
    fecha: string;
    fechaFactura: string;
    metodoPago: string;
    subtotal: number;
    iva: number;
    descuento: number;
    total: number;
    usuarioId: number;
    responsableNombre?: string;
    estado: string;
    detalles: DetalleCompra[];
}

export interface DetalleCompra {
    id?: number;
    productoId: number;
    productoNombre?: string;
    cantidad: number;
    precioUnitario: number;
    subtotal?: number;
}

export interface CreateCompraRequest {
    proveedorId: number;
    numeroFactura?: string; // Opcional desde front, pero backend lo usa
    fecha: string; // Fecha Registro
    fechaFactura: string;
    metodoPago: string;
    iva: number;
    descuento: number;
    usuarioId: number;
    detalles: {
        productoId: number;
        cantidad: number;
        precioUnitario: number;
    }[];
}

class CompraService {
    // ... (request method stays the same) ...
    private async request(endpoint: string, options: RequestInit = {}): Promise<Response> {
        const isGet = !options.method || options.method === 'GET';
        const separator = endpoint.includes('?') ? '&' : '?';
        const url = isGet ? `${API_BASE_URL}${endpoint}${separator}t=${Date.now()}` : `${API_BASE_URL}${endpoint}`;

        const defaultHeaders = {
            'Content-Type': 'application/json',
        };

        const config: RequestInit = {
            ...options,
            headers: {
                ...defaultHeaders,
                ...options.headers,
            },
        };

        try {
            console.log(`CompraService [${config.method || 'GET'}]: ${url}`);
            if (config.body) {
                console.log(`📤 Request Body:`, config.body);
            }

            const response = await fetch(url, config);

            if (!response.ok) {
                const errorText = await response.text();
                console.error(`❌ CompraService Error [${response.status}]: ${errorText}`);
                throw new Error(`Error del servidor (${response.status}): ${errorText || response.statusText}`);
            }

            return response;
        } catch (error) {
            console.error('CompraService Network/API Error:', error);
            throw error;
        }
    }

    private mapToApiFormat(data: CreateCompraRequest): any {
        // Generar un número de factura temporal si no se proporciona, para evitar error 500 en backend
        const facturaDefault = Date.now().toString().slice(-6);

        return {
            proveedorId: data.proveedorId,
            usuarioId: data.usuarioId,
            numeroFactura: data.numeroFactura || facturaDefault,
            fechaFactura: data.fechaFactura, // DateOnly en backend, string YYYY-MM-DD funciona
            metodoPago: data.metodoPago,
            iva: data.iva,
            descuento: data.descuento,
            detalles: data.detalles.map(d => ({
                productoId: d.productoId,
                cantidad: d.cantidad,
                precioUnitario: d.precioUnitario
            }))
        };
    }

    // ... (normalizeCompraData stays the same) ...
    private async normalizeCompraData(data: any): Promise<Compra> {
        if (!data) return {} as Compra;

        const detallesApi = data.detalleCompras || [];

        // Attempt to get names for consistency in UI
        let proveedorNombre = 'Proveedor desconocido';
        if (data.proveedor) {
            proveedorNombre = data.proveedor.nombre || proveedorNombre;
        }

        let responsableNombre = 'Administrador';
        if (data.usuario) {
            responsableNombre = `${data.usuario.nombre || ''} ${data.usuario.apellido || ''}`.trim() || 'Administrador';
        }

        const detalles: DetalleCompra[] = detallesApi.map((d: any) => ({
            id: d.id,
            productoId: d.productoId,
            productoNombre: d.producto?.nombre || 'Producto',
            cantidad: d.cantidad,
            precioUnitario: d.precioUnitario || d.precioCompra || 0, // Fallback
            subtotal: (d.cantidad || 0) * (d.precioUnitario || 0)
        }));

        return {
            id: data.id,
            numeroCompra: `CPR-${String(data.id).padStart(3, '0')}`,
            numeroFactura: data.numeroFactura || data.numeroCompra,
            proveedorId: data.proveedorId,
            proveedorNombre: proveedorNombre,
            fecha: data.fechaRegistro || data.fecha,
            fechaFactura: data.fechaFactura,
            metodoPago: data.metodoPago,
            subtotal: data.subtotal,
            iva: data.iva,
            descuento: data.descuento,
            total: data.total,
            usuarioId: data.usuarioId,
            responsableNombre: responsableNombre,
            estado: data.estado || 'Completada',
            detalles: detalles
        };
    }

    async getCompras(): Promise<Compra[]> {
        try {
            const response = await this.request('/Compras');
            const text = await response.text();
            const data = text ? JSON.parse(text) : [];
            return await Promise.all(data.map((item: any) => this.normalizeCompraData(item)));
        } catch (error) {
            console.error('Error fetching compras:', error);
            throw error;
        }
    }

    async createCompra(compraData: CreateCompraRequest): Promise<Compra> {
        try {
            const mapped = this.mapToApiFormat(compraData);
            const response = await this.request('/Compras', {
                method: 'POST',
                body: JSON.stringify(mapped),
            });
            const text = await response.text();
            const data = text ? JSON.parse(text) : {};
            return await this.normalizeCompraData(data);
        } catch (error) {
            console.error('Error creating compra:', error);
            throw error;
        }
    }

    async updateCompra(id: number, compraData: CreateCompraRequest): Promise<Compra> {
        try {
            const mapped = this.mapToApiFormat(compraData);
            const response = await this.request(`/Compras/${id}`, {
                method: 'PUT',
                body: JSON.stringify(mapped),
            });
            const text = await response.text();
            const data = text ? JSON.parse(text) : {};
            return await this.normalizeCompraData(data);
        } catch (error) {
            console.error('Error updating compra:', error);
            throw error;
        }
    }

    async anularCompra(id: number): Promise<void> {
        try {
            // Updated to DELETE specific verb as per Backend ComprasController
            await this.request(`/Compras/${id}`, {
                method: 'DELETE'
            });
        } catch (error) {
            console.error('Error anulando compra:', error);
            throw error;
        }
    }
    async getDetallesPorCompra(compraId: number): Promise<DetalleCompra[]> {
        try {
            const response = await this.request(`/DetallesCompra/compra/${compraId}`);
            const text = await response.text();
            const data = text ? JSON.parse(text) : [];

            return data.map((d: any) => ({
                id: d.id,
                productoId: d.productoId,
                productoNombre: d.producto?.nombre || 'Producto',
                cantidad: d.cantidad,
                precioUnitario: d.precioUnitario || d.precioCompra || 0,
                subtotal: (d.cantidad || 0) * (d.precioUnitario || d.precioCompra || 0)
            }));
        } catch (error) {
            console.error('Error fetching detalles compra:', error);
            // Return empty array to avoid breaking UI, or throw if critical
            return [];
        }
    }
}

export const compraService = new CompraService();
export default compraService;
