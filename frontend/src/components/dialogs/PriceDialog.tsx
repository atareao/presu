// src/components/dialogs/PriceDialog.tsx
import React from 'react';
import { Modal, Form, Input, InputNumber, Select, Button } from 'antd';
import { useTranslation } from 'react-i18next';
import type { Price } from '@/models';
import { PriceType } from '@/models';

// Placeholder for Unit type and service until they are implemented
interface Unit { 
    id: number;
    name: string;
    symbol: string;
}

// Mock unitService for now
const unitService = {
    readAll: async (): Promise<Unit[]> => {
        return [
            { id: 1, name: 'Kilogramo', symbol: 'kg' },
            { id: 2, name: 'Metro', symbol: 'm' },
            { id: 3, name: 'Unidad', symbol: 'ud' },
        ];
    }
};

interface PriceDialogProps {
  visible: boolean;
  onClose: () => void;
  onSave: (price: Price) => void;
  price: Price | null;
  versionId: number;
}

const PriceDialog: React.FC<PriceDialogProps> = ({ visible, onClose, onSave, price, versionId }) => {
  const { t } = useTranslation();
  const [form] = Form.useForm();
  const [units, setUnits] = React.useState<Unit[]>([]);

  React.useEffect(() => {
    const fetchUnits = async () => {
      try {
        const fetchedUnits = await unitService.readAll();
        setUnits(fetchedUnits);
      } catch (error) {
        console.error('Failed to fetch units', error);
      }
    };
    fetchUnits();
  }, []);

  React.useEffect(() => {
    if (price) {
      form.setFieldsValue(price);
    } else {
      form.resetFields();
      form.setFieldsValue({ version_id: versionId, price_type: PriceType.Base, base_price: 0 });
    }
  }, [price, form, versionId]);

  const handleSave = () => {
    form.validateFields().then(values => {
      onSave({ ...price, ...values, version_id: versionId });
    });
  };

  return (
    <Modal
      title={price ? t('Editar Precio') : t('Añadir Precio')}
      visible={visible}
      onCancel={onClose}
      onOk={handleSave}
      footer={[
        <Button key="back" onClick={onClose}>
          {t('Cancelar')}
        </Button>,
        <Button key="submit" type="primary" onClick={handleSave}>
          {t('Guardar')}
        </Button>,
      ]}
    >
      <Form form={form} layout="vertical" name="price_form">
        <Form.Item
          name="code"
          label={t('Código')}
          rules={[{ required: true, message: t('Por favor introduce un código') }]}
        >
          <Input />
        </Form.Item>
        <Form.Item
          name="description"
          label={t('Descripción')}
          rules={[{ required: true, message: t('Por favor introduce una descripción') }]}
        >
          <Input.TextArea rows={4} />
        </Form.Item>
        <Form.Item
          name="base_price"
          label={t('Precio Base')}
          rules={[{ required: true, message: t('Por favor introduce un precio base') }]}
        >
          <InputNumber min={0} precision={2} style={{ width: '100%' }} />
        </Form.Item>
        <Form.Item
          name="unit_id"
          label={t('Unidad')}
          rules={[{ required: true, message: t('Por favor selecciona una unidad') }]}
        >
          <Select placeholder={t('Selecciona una unidad')}>
            {units.map(unit => (
              <Select.Option key={unit.id} value={unit.id}>
                {unit.name} ({unit.symbol})
              </Select.Option>
            ))}
          </Select>
        </Form.Item>
        <Form.Item
          name="price_type"
          label={t('Tipo de Precio')}
          rules={[{ required: true, message: t('Por favor selecciona un tipo de precio') }]}
        >
          <Select>
            <Select.Option value={PriceType.Base}>{t('Base')}</Select.Option>
            <Select.Option value={PriceType.Decomposed}>{t('Descompuesto')}</Select.Option>
          </Select>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default PriceDialog;
