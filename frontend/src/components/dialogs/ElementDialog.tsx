// src/components/dialogs/ElementDialog.tsx
import React from 'react';
import { Modal, Form, Input, Select, Button, InputNumber } from 'antd';
import { useTranslation } from 'react-i18next';
import { Element } from '@/models';

interface ElementDialogProps {
  visible: boolean;
  onClose: () => void;
  onSave: (element: Element) => void;
  element: Element | null;
  budgetId: number;
  versionId: number;
}

const ElementDialog: React.FC<ElementDialogProps> = ({ visible, onClose, onSave, element, budgetId, versionId }) => {
  const { t } = useTranslation();
  const [form] = Form.useForm();

  React.useEffect(() => {
    if (element) {
      form.setFieldsValue(element);
    } else {
      form.resetFields();
      form.setFieldsValue({ budget_id: budgetId, version_id: versionId, element_type: 'line' });
    }
  }, [element, form, budgetId, versionId]);

  const handleSave = () => {
    form.validateFields().then(values => {
      onSave({ ...element, ...values });
    });
  };

  return (
    <Modal
      title={element ? t('Editar Elemento') : t('Añadir Elemento')}
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
      <Form form={form} layout="vertical" name="element_form">
        <Form.Item
          name="code"
          label={t('Código')}
          rules={[{ required: true, message: t('Por favor introduce un código') }]}
        >
          <Input />
        </Form.Item>
        <Form.Item
          name="budget_code"
          label={t('Código de Presupuesto')}
          rules={[{ required: true, message: t('Por favor introduce un código de presupuesto') }]}
        >
          <Input />
        </Form.Item>
        <Form.Item
          name="element_type"
          label={t('Tipo de Elemento')}
          rules={[{ required: true, message: t('Por favor selecciona un tipo de elemento') }]}
        >
          <Select>
            <Select.Option value="line">{t('Línea')}</Select.Option>
            <Select.Option value="group">{t('Grupo')}</Select.Option>
          </Select>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default ElementDialog;
