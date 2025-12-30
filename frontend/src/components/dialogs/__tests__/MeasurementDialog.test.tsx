// src/components/dialogs/__tests__/MeasurementDialog.test.tsx
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import MeasurementDialog from '../MeasurementDialog';
import { Measurement, Element, Price } from '@/models';
import { elementService, priceService } from '@/services';
import React from 'react';

// Mock react-i18next
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

// Mock services
vi.mock('@/services', () => ({
    elementService: {
        readAll: vi.fn(),
    },
    priceService: {
        readAll: vi.fn(),
    },
    budgetService: vi.fn(),
    descompositionService: vi.fn(),
    measurementService: vi.fn(),
    projectService: vi.fn(),
    roleService: vi.fn(),
    userService: vi.fn(),
}));

// Mock Ant Design components
const mockFormInstance = {
    setFieldsValue: vi.fn(),
    resetFields: vi.fn(),
    validateFields: vi.fn(() => Promise.resolve({})),
    getFieldsValue: vi.fn(() => ({})),
};

vi.mock('antd', async () => {
    const antd = await vi.importActual('antd');
    return {
        ...antd,
        Form: {
            ...antd.Form,
            useForm: vi.fn(() => [mockFormInstance]),
        },
    };
});

describe('MeasurementDialog', () => {
  const onSave = vi.fn();
  const onClose = vi.fn();

  const mockElements: Element[] = [
    { id: 1, budget_id: 1, version_id: 1, element_type: 'line', code: 'E1', description: 'Element 1', budget_code: 'B1' },
    { id: 2, budget_id: 1, version_id: 1, element_type: 'line', code: 'E2', description: 'Element 2', budget_code: 'B2' },
  ];

  const mockPrices: Price[] = [
    { id: 1, version_id: 1, code: 'P1', description: 'Price 1', base_price: 10, unit_id: 1, price_type: 'base' },
    { id: 2, version_id: 1, code: 'P2', description: 'Price 2', base_price: 20, unit_id: 1, price_type: 'base' },
  ];

  const measurement: Measurement = {
    id: 1,
    element_id: 1,
    price_id: 1,
    params_json: {},
    measured_quantity: 100,
    measurement_text: 'Test Measurement',
  };

  beforeEach(() => {
    vi.clearAllMocks();
    (elementService.readAll as vi.Mock).mockResolvedValue(mockElements);
    (priceService.readAll as vi.Mock).mockResolvedValue(mockPrices);
    mockFormInstance.validateFields.mockResolvedValue({});
    mockFormInstance.getFieldsValue.mockReturnValue({});
  });

  it('renders correctly when creating a new measurement', async () => {
    await act(async () => {
      render(<MeasurementDialog visible={true} onClose={onClose} onSave={onSave} measurement={null} />);
    });

    expect(screen.getByText('Añadir Medición')).toBeInTheDocument();
    expect(screen.getByLabelText('Elemento')).toBeInTheDocument();
    expect(screen.getByLabelText('Precio')).toBeInTheDocument();
    expect(screen.getByLabelText('Cantidad Medida')).toBeInTheDocument();
    expect(screen.getByLabelText('Texto de Medición')).toBeInTheDocument();
    await waitFor(() => {
        expect(elementService.readAll).toHaveBeenCalled();
        expect(priceService.readAll).toHaveBeenCalled();
    });
  });

  it('renders correctly when updating an existing measurement', async () => {
    await act(async () => {
      render(<MeasurementDialog visible={true} onClose={onClose} onSave={onSave} measurement={measurement} />);
    });
    
    await waitFor(() => {
        expect(elementService.readAll).toHaveBeenCalled();
        expect(priceService.readAll).toHaveBeenCalled();
        expect(mockFormInstance.setFieldsValue).toHaveBeenCalledWith(measurement);
    });
    expect(screen.getByText('Editar Medición')).toBeInTheDocument();
  });

  it('calls onSave when creating a new measurement', async () => {
    await act(async () => {
      render(<MeasurementDialog visible={true} onClose={onClose} onSave={onSave} measurement={null} />);
    });

    mockFormInstance.validateFields.mockResolvedValue({
        element_id: 2,
        price_id: 2,
        measured_quantity: 150,
        measurement_text: 'New Measurement',
        params_json: {},
    });

    await act(async () => {
      fireEvent.change(screen.getByLabelText('Elemento'), { target: { value: '2' } });
      fireEvent.change(screen.getByLabelText('Precio'), { target: { value: '2' } });
      fireEvent.change(screen.getByLabelText('Cantidad Medida'), { target: { value: '150' } });
      fireEvent.change(screen.getByLabelText('Texto de Medición'), { target: { value: 'New Measurement' } });
      fireEvent.click(screen.getByText('Guardar'));
    });

    await waitFor(() => {
      expect(onSave).toHaveBeenCalledWith({
        element_id: 2,
        price_id: 2,
        measured_quantity: 150,
        measurement_text: 'New Measurement',
        params_json: {},
      });
    });
  });

  it('calls onSave when updating an existing measurement', async () => {
    await act(async () => {
      render(<MeasurementDialog visible={true} onClose={onClose} onSave={onSave} measurement={measurement} />);
    });

    mockFormInstance.validateFields.mockResolvedValue({
        ...measurement,
        measured_quantity: 200,
    });
    
    await act(async () => {
      fireEvent.change(screen.getByLabelText('Cantidad Medida'), { target: { value: '200' } });
      fireEvent.click(screen.getByText('Guardar'));
    });

    await waitFor(() => {
      expect(onSave).toHaveBeenCalledWith({
        ...measurement,
        measured_quantity: 200,
      });
    });
  });

  it('calls onClose when cancel button is clicked', async () => {
    await act(async () => {
      render(<MeasurementDialog visible={true} onClose={onClose} onSave={onSave} measurement={null} />);
    });

    await act(async () => {
      fireEvent.click(screen.getByText('Cancelar'));
    });
    expect(onClose).toHaveBeenCalled();
  });
});
