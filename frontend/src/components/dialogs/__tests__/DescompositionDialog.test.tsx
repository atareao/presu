// src/components/dialogs/__tests__/DescompositionDialog.test.tsx
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import DescompositionDialog from '../DescompositionDialog';
import { Descomposition } from '@/models';
import React from 'react';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

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
        Modal: vi.fn(({ visible, title, children, onOk, onCancel, footer }) => {
            if (!visible) {
                return null;
            }
            return (
                <div data-testid="modal-mock">
                    <div data-testid="modal-title">{title}</div>
                    <div data-testid="modal-content">{children}</div>
                    <div data-testid="modal-footer">
                        {footer ? footer : (
                            <>
                                <button onClick={onCancel}>Cancel</button>
                                <button onClick={onOk}>OK</button>
                            </>
                        )}
                    </div>
                </div>
            );
        }),
        Form: {
            ...antd.Form,
            useForm: vi.fn(() => [mockFormInstance]),
            Item: ({ children, ...props }: any) => (
                <div data-testid="form-item-mock" {...props}>
                    {children}
                </div>
            ),
        },
        Input: (props: any) => <input data-testid="input-mock" {...props} />,
        InputNumber: (props: any) => <input type="number" data-testid="input-number-mock" {...props} />,
        Select: ({ children, value, onChange }: any) => (
            <select data-testid="select-mock" value={value} onChange={e => onChange(e.target.value)}>
                {children}
            </select>
        ),
        Button: (props: any) => <button {...props} />,
    };
});

describe('DescompositionDialog', () => {
  const onSave = vi.fn();
  const onClose = vi.fn();

  const descomposition: Descomposition = {
    id: 1,
    parent_price_id: 1,
    component_price_id: 2,
    calculation_mode: 'fixed',
    fixed_quantity: 10,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockFormInstance.validateFields.mockResolvedValue({});
    mockFormInstance.getFieldsValue.mockReturnValue({});
  });

  it('renders correctly when creating a new descomposition', async () => {
    await act(async () => {
      render(<DescompositionDialog visible={true} onClose={onClose} onSave={onSave} descomposition={null} parentPriceId={1} />);
    });

    expect(screen.getByText('Añadir Descomposición')).toBeInTheDocument();
    expect(screen.getByLabelText('Precio Componente')).toBeInTheDocument();
    expect(screen.getByLabelText('Modo de Cálculo')).toBeInTheDocument();
    expect(screen.getByLabelText('Cantidad Fija')).toBeInTheDocument();
  });

  it('renders correctly when updating an existing descomposition', async () => {
    await act(async () => {
      render(<DescompositionDialog visible={true} onClose={onClose} onSave={onSave} descomposition={descomposition} parentPriceId={1} />);
    });
    
    await waitFor(() => {
        expect(mockFormInstance.setFieldsValue).toHaveBeenCalledWith(descomposition);
    });
    expect(screen.getByText('Editar Descomposición')).toBeInTheDocument();
  });

  it('calls onSave when creating a new descomposition', async () => {
    await act(async () => {
      render(<DescompositionDialog visible={true} onClose={onClose} onSave={onSave} descomposition={null} parentPriceId={1} />);
    });

    mockFormInstance.validateFields.mockResolvedValue({
        parent_price_id: 1,
        component_price_id: 3,
        calculation_mode: 'reference',
        fixed_quantity: 20,
    });

    await act(async () => {
      fireEvent.change(screen.getByLabelText('Precio Componente'), { target: { value: '3' } });
      fireEvent.mouseDown(screen.getByLabelText('Modo de Cálculo'));
      await waitFor(() => {
          fireEvent.click(screen.getByText('Referencia'));
      });
      fireEvent.change(screen.getByLabelText('Cantidad Fija'), { target: { value: '20' } });
      fireEvent.click(screen.getByText('Guardar'));
    });

    await waitFor(() => {
      expect(onSave).toHaveBeenCalledWith({
        parent_price_id: 1,
        component_price_id: 3,
        calculation_mode: 'reference',
        fixed_quantity: 20,
      });
    });
  });

  it('calls onSave when updating an existing descomposition', async () => {
    await act(async () => {
      render(<DescompositionDialog visible={true} onClose={onClose} onSave={onSave} descomposition={descomposition} parentPriceId={1} />);
    });

    mockFormInstance.validateFields.mockResolvedValue({
        ...descomposition,
        fixed_quantity: 30,
    });

    await act(async () => {
      fireEvent.change(screen.getByLabelText('Cantidad Fija'), { target: { value: '30' } });
      fireEvent.click(screen.getByText('Guardar'));
    });

    await waitFor(() => {
      expect(onSave).toHaveBeenCalledWith({
        ...descomposition,
        fixed_quantity: 30,
      });
    });
  });
});
