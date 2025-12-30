// src/components/dialogs/__tests__/ElementDialog.test.tsx
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
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

const mockFormInstance = {
    setFieldsValue: vi.fn(),
    resetFields: vi.fn(),
    validateFields: vi.fn(() => Promise.resolve({})),
    getFieldsValue: vi.fn(() => ({})),
};

// Ant Design Form.useForm is globally mocked in setup.ts

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

  beforeEach(() => {
    vi.clearAllMocks();
    mockFormInstance.validateFields.mockResolvedValue({});
    mockFormInstance.getFieldsValue.mockReturnValue({});
  });

  it('renders correctly when creating a new element', async () => {
    await act(async () => {
      render(<ElementDialog visible={true} onClose={onClose} onSave={onSave} element={null} budgetId={1} versionId={1} />);
    });

    expect(screen.getByText('Añadir Elemento')).toBeInTheDocument();
    expect(screen.getByLabelText('Código')).toBeInTheDocument();
    expect(screen.getByLabelText('Código de Presupuesto')).toBeInTheDocument();
    expect(screen.getByLabelText('Tipo de Elemento')).toBeInTheDocument();
  });

  it('renders correctly when updating an existing element', async () => {
    await act(async () => {
      render(<ElementDialog visible={true} onClose={onClose} onSave={onSave} element={element} budgetId={1} versionId={1} />);
    });
    
    await waitFor(() => {
        expect(mockFormInstance.setFieldsValue).toHaveBeenCalledWith(element);
    });
    expect(screen.getByText('Editar Elemento')).toBeInTheDocument();
  });

  it('calls onSave when creating a new element', async () => {
    await act(async () => {
      render(<ElementDialog visible={true} onClose={onClose} onSave={onSave} element={null} budgetId={1} versionId={1} />);
    });

    mockFormInstance.validateFields.mockResolvedValue({
        budget_id: 1,
        version_id: 1,
        element_type: 'group',
        code: 'NEW-ELEM',
        budget_code: 'NEW-BGT-ELEM',
    });

    await act(async () => {
      fireEvent.change(screen.getByLabelText('Código'), { target: { value: 'NEW-ELEM' } });
      fireEvent.change(screen.getByLabelText('Código de Presupuesto'), { target: { value: 'NEW-BGT-ELEM' } });
      fireEvent.change(screen.getByLabelText('Tipo de Elemento'), { target: { value: 'group' } });
      fireEvent.click(screen.getByText('Guardar'));
    });

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
    await act(async () => {
      render(<ElementDialog visible={true} onClose={onClose} onSave={onSave} element={element} budgetId={1} versionId={1} />);
    });

    mockFormInstance.validateFields.mockResolvedValue({
        ...element,
        code: 'UPDATED-ELEM',
    });
    
    await act(async () => {
      fireEvent.change(screen.getByLabelText('Código'), { target: { value: 'UPDATED-ELEM' } });
      fireEvent.click(screen.getByText('Guardar'));
    });

    await waitFor(() => {
      expect(onSave).toHaveBeenCalledWith({
        ...element,
        code: 'UPDATED-ELEM',
      });
    });
  });

  it('calls onClose when cancel button is clicked', async () => {
    await act(async () => {
      render(<ElementDialog visible={true} onClose={onClose} onSave={onSave} element={null} budgetId={1} versionId={1} />);
    });

    await act(async () => {
      fireEvent.click(screen.getByText('Cancelar'));
    });
    expect(onClose).toHaveBeenCalled();
  });
});
