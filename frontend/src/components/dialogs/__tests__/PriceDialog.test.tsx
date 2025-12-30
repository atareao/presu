// src/components/dialogs/__tests__/PriceDialog.test.tsx
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import PriceDialog from '../PriceDialog';
import { Price, PriceType } from '@/models';
import { priceService } from '@/services';
import React from 'react';

// Mock react-i18next
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

// Mock services
vi.mock('@/services', () => ({
    priceService: {
        create: vi.fn(),
        update: vi.fn(),
    },
    // Mock unitService as it's used in PriceDialog
    unitService: {
        readAll: vi.fn(() => Promise.resolve([
            { id: 1, name: 'Kilogramo', symbol: 'kg' },
            { id: 2, name: 'Metro', symbol: 'm' },
            { id: 3, name: 'Unidad', symbol: 'ud' },
        ])),
    },
    budgetService: vi.fn(),
    descompositionService: vi.fn(),
    elementService: vi.fn(),
    measurementService: vi.fn(),
    projectService: vi.fn(),
    roleService: vi.fn(),
    userService: vi.fn(),
}));

const mockFormInstance = {
    setFieldsValue: vi.fn(),
    resetFields: vi.fn(),
    validateFields: vi.fn(() => Promise.resolve({})),
    getFieldsValue: vi.fn(() => ({})),
};

// Ant Design Form.useForm is globally mocked in setup.ts

describe('PriceDialog', () => {
  const onSave = vi.fn();
  const onClose = vi.fn();

  const price: Price = {
    id: 1,
    version_id: 1,
    code: 'P-001',
    description: 'Test Price',
    base_price: 10.50,
    unit_id: 1,
    price_type: PriceType.Base,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockFormInstance.validateFields.mockResolvedValue({});
    mockFormInstance.getFieldsValue.mockReturnValue({});
  });

  it('renders correctly when creating a new price', async () => {
    await act(async () => {
      render(<PriceDialog visible={true} onClose={onClose} onSave={onSave} price={null} versionId={1} />);
    });

    expect(screen.getByText('Añadir Precio')).toBeInTheDocument();
    expect(screen.getByLabelText('Código')).toBeInTheDocument();
    expect(screen.getByLabelText('Descripción')).toBeInTheDocument();
    expect(screen.getByLabelText('Precio Base')).toBeInTheDocument();
    expect(screen.getByLabelText('Unidad')).toBeInTheDocument();
    expect(screen.getByLabelText('Tipo de Precio')).toBeInTheDocument();
    await waitFor(() => {
        expect(vi.mocked(priceService.unitService.readAll)).toHaveBeenCalled();
    });
  });

  it('renders correctly when updating an existing price', async () => {
    await act(async () => {
      render(<PriceDialog visible={true} onClose={onClose} onSave={onSave} price={price} versionId={1} />);
    });
    
    await waitFor(() => {
        expect(vi.mocked(priceService.unitService.readAll)).toHaveBeenCalled();
        expect(mockFormInstance.setFieldsValue).toHaveBeenCalledWith(price);
    });
    expect(screen.getByText('Editar Precio')).toBeInTheDocument();
  });

  it('calls onSave when creating a new price', async () => {
    await act(async () => {
      render(<PriceDialog visible={true} onClose={onClose} onSave={onSave} price={null} versionId={1} />);
    });

    const newPrice = {
        version_id: 1,
        code: 'P-002',
        description: 'New Test Price',
        base_price: 20.75,
        unit_id: 2,
        price_type: PriceType.Decomposed,
    };
    mockFormInstance.validateFields.mockResolvedValue(newPrice);

    await act(async () => {
      fireEvent.change(screen.getByLabelText('Código'), { target: { value: newPrice.code } });
      fireEvent.change(screen.getByLabelText('Descripción'), { target: { value: newPrice.description } });
      fireEvent.change(screen.getByLabelText('Precio Base'), { target: { value: newPrice.base_price } });
      fireEvent.change(screen.getByLabelText('Unidad'), { target: { value: newPrice.unit_id } });
      fireEvent.change(screen.getByLabelText('Tipo de Precio'), { target: { value: newPrice.price_type } });
      fireEvent.click(screen.getByText('Guardar'));
    });

    await waitFor(() => {
      expect(onSave).toHaveBeenCalledWith({
        ...newPrice,
        version_id: 1,
      });
    });
  });

  it('calls onSave when updating an existing price', async () => {
    await act(async () => {
      render(<PriceDialog visible={true} onClose={onClose} onSave={onSave} price={price} versionId={1} />);
    });

    const updatedPrice = {
        ...price,
        base_price: 15.00,
    };
    mockFormInstance.validateFields.mockResolvedValue(updatedPrice);
    
    await act(async () => {
      fireEvent.change(screen.getByLabelText('Precio Base'), { target: { value: updatedPrice.base_price } });
      fireEvent.click(screen.getByText('Guardar'));
    });

    await waitFor(() => {
      expect(onSave).toHaveBeenCalledWith({
        ...updatedPrice,
        version_id: 1,
      });
    });
  });

  it('calls onClose when cancel button is clicked', async () => {
    await act(async () => {
      render(<PriceDialog visible={true} onClose={onClose} onSave={onSave} price={null} versionId={1} />);
    });

    await act(async () => {
      fireEvent.click(screen.getByText('Cancelar'));
    });
    expect(onClose).toHaveBeenCalled();
  });
});
