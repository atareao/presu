// src/components/dialogs/__tests__/ElementDialog.test.tsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import ElementDialog from '../ElementDialog';
import { Element } from '@/models';
import React from 'react';

// Mock react-i18next
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

// Mock Ant Design components
vi.mock('antd', async () => {
    const antd = await vi.importActual('antd');
    return {
        ...antd,
        Modal: (props: { visible: boolean; children: React.ReactNode }) => {
            if (!props.visible) {
                return null;
            }
            return React.createElement('div', {}, props.children);
        },
        Form: {
            ...antd.Form,
            useForm: vi.fn(() => [{
                setFieldsValue: vi.fn(),
                resetFields: vi.fn(),
                validateFields: vi.fn(() => Promise.resolve({}))
            }]),
        },
        Select: ({ children, value, onChange }: any) => (
            <select data-testid="select-mock" value={value} onChange={e => onChange(e.target.value)}>
                {children}
            </select>
        ),
        Input: (props: any) => <input {...props} />,
        InputNumber: (props: any) => <input type="number" {...props} />,
    };
});

describe('ElementDialog', () => {
  const onSave = vi.fn();
  const onClose = vi.fn();

  const element: Element = {
    id: 1,
    budget_id: 1,
    version_id: 1,
    element_type: 'line',
    code: 'ELEM-001',
    budget_code: 'BGT-ELEM-001',
  };

  it('renders correctly when creating a new element', () => {
    render(<ElementDialog visible={true} onClose={onClose} onSave={onSave} element={null} budgetId={1} versionId={1} />);

    expect(screen.getByText('Añadir Elemento')).toBeInTheDocument();
    expect(screen.getByLabelText('Código')).toBeInTheDocument();
    expect(screen.getByLabelText('Código de Presupuesto')).toBeInTheDocument();
    expect(screen.getByLabelText('Tipo de Elemento')).toBeInTheDocument();
  });

  it('renders correctly when updating an existing element', () => {
    render(<ElementDialog visible={true} onClose={onClose} onSave={onSave} element={element} budgetId={1} versionId={1} />);

    expect(screen.getByText('Editar Elemento')).toBeInTheDocument();
    expect(screen.getByDisplayValue('ELEM-001')).toBeInTheDocument();
    expect(screen.getByDisplayValue('BGT-ELEM-001')).toBeInTheDocument();
    expect(screen.getByDisplayValue('line')).toBeInTheDocument();
  });

  it('calls onSave when creating a new element', async () => {
    render(<ElementDialog visible={true} onClose={onClose} onSave={onSave} element={null} budgetId={1} versionId={1} />);

    fireEvent.change(screen.getByLabelText('Código'), { target: { value: 'NEW-ELEM' } });
    fireEvent.change(screen.getByLabelText('Código de Presupuesto'), { target: { value: 'NEW-BGT-ELEM' } });
    fireEvent.change(screen.getByLabelText('Tipo de Elemento'), { target: { value: 'group' } });
    fireEvent.click(screen.getByText('Guardar'));

    await waitFor(() => {
      expect(onSave).toHaveBeenCalledWith({
        budget_id: 1,
        version_id: 1,
        element_type: 'group',
        code: 'NEW-ELEM',
        budget_code: 'NEW-BGT-ELEM',
      });
    });
  });

  it('calls onSave when updating an existing element', async () => {
    render(<ElementDialog visible={true} onClose={onClose} onSave={onSave} element={element} budgetId={1} versionId={1} />);

    fireEvent.change(screen.getByLabelText('Código'), { target: { value: 'UPDATED-ELEM' } });
    fireEvent.click(screen.getByText('Guardar'));

    await waitFor(() => {
      expect(onSave).toHaveBeenCalledWith({
        ...element,
        code: 'UPDATED-ELEM',
      });
    });
  });

  it('calls onClose when cancel button is clicked', () => {
    render(<ElementDialog visible={true} onClose={onClose} onSave={onSave} element={null} budgetId={1} versionId={1} />);

    fireEvent.click(screen.getByText('Cancelar'));
    expect(onClose).toHaveBeenCalled();
  });
});
