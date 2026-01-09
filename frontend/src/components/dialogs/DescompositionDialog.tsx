// src/components/dialogs/DescompositionDialog.tsx
import React from 'react';
import { Modal, Form, InputNumber, Select, Button } from 'antd';
import { useTranslation } from 'react-i18next';
import type { Descomposition } from '@/models';

interface DescompositionDialogProps {
  visible: boolean;
  onClose: () => void;
  onSave: (descomposition: Descomposition) => void;
  descomposition: Descomposition | null;
  parentPriceId: number;
}

const DescompositionDialog: React.FC<DescompositionDialogProps> = ({ visible, onClose, onSave, descomposition, parentPriceId }) => {
  const { t } = useTranslation();
  const [form] = Form.useForm();

  React.useEffect(() => {
    if (descomposition) {
      form.setFieldsValue(descomposition);
    } else {
      form.resetFields();
      form.setFieldsValue({ parent_price_id: parentPriceId });
    }
  }, [descomposition, form, parentPriceId]);

  const handleSave = () => {
    form.validateFields().then(values => {
      onSave({ ...descomposition, ...values });
    });
  };

  return (
    <Modal
      title={descomposition ? t('Editar Descomposición') : t('Añadir Descomposición')}
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
      <Form form={form} layout="vertical" name="descomposition_form">
        <Form.Item
          name="component_price_id"
          label={t('Precio Componente')}
          rules={[{ required: true, message: t('Por favor selecciona un precio componente') }]}
        >
          <InputNumber style={{ width: '100%' }} />
        </Form.Item>
        <Form.Item
          name="calculation_mode"
          label={t('Modo de Cálculo')}
          rules={[{ required: true, message: t('Por favor selecciona un modo de cálculo') }]}
        >
          <Select>
            <Select.Option value="fixed">{t('Fijo')}</Select.Option>
            <Select.Option value="reference">{t('Referencia')}</Select.Option>
          </Select>
        </Form.Item>
        <Form.Item
          name="fixed_quantity"
          label={t('Cantidad Fija')}
          rules={[{ required: true, message: t('Por favor introduce una cantidad fija') }]}
        >
          <InputNumber style={{ width: '100%' }} />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default DescompositionDialog;
