// src/components/dialogs/__tests__/DescompositionDialog.test.tsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import DescompositionDialog from '../DescompositionDialog';
import { Descomposition } from '@/models';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

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

  it('renders correctly when creating a new descomposition', () => {
    render(<DescompositionDialog visible={true} onClose={onClose} onSave={onSave} descomposition={null} parentPriceId={1} />);

    expect(screen.getByText('Añadir Descomposición')).toBeInTheDocument();
    expect(screen.getByLabelText('Precio Componente')).toBeInTheDocument();
    expect(screen.getByLabelText('Modo de Cálculo')).toBeInTheDocument();
    expect(screen.getByLabelText('Cantidad Fija')).toBeInTheDocument();
  });

  it('renders correctly when updating an existing descomposition', () => {
    render(<DescompositionDialog visible={true} onClose={onClose} onSave={onSave} descomposition={descomposition} parentPriceId={1} />);

    expect(screen.getByText('Editar Descomposición')).toBeInTheDocument();
    expect(screen.getByDisplayValue('2')).toBeInTheDocument();
    expect(screen.getByText('Fijo')).toBeInTheDocument();
    expect(screen.getByDisplayValue('10')).toBeInTheDocument();
  });

  it('calls onSave when creating a new descomposition', async () => {
    render(<DescompositionDialog visible={true} onClose={onClose} onSave={onSave} descomposition={null} parentPriceId={1} />);

    fireEvent.change(screen.getByLabelText('Precio Componente'), { target: { value: '3' } });
    fireEvent.mouseDown(screen.getByLabelText('Modo de Cálculo'));
    await waitFor(() => {
        fireEvent.click(screen.getByText('Referencia'));
    });
    fireEvent.change(screen.getByLabelText('Cantidad Fija'), { target: { value: '20' } });
    fireEvent.click(screen.getByText('Guardar'));

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
    render(<DescompositionDialog visible={true} onClose={onClose} onSave={onSave} descomposition={descomposition} parentPriceId={1} />);

    fireEvent.change(screen.getByLabelText('Cantidad Fija'), { target: { value: '30' } });
    fireEvent.click(screen.getByText('Guardar'));

    await waitFor(() => {
      expect(onSave).toHaveBeenCalledWith({
        ...descomposition,
        fixed_quantity: 30,
      });
    });
  });
});
