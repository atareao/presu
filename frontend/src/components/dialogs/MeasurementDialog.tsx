// src/components/dialogs/MeasurementDialog.tsx
import React from 'react';
import { Modal, Form, Input, InputNumber, Select, Button } from 'antd';
import { useTranslation } from 'react-i18next';
import { Measurement, Element, Price } from '@/models';
import { measurementService, elementService, priceService } from '@/services';

interface MeasurementDialogProps {
  visible: boolean;
  onClose: () => void;
  onSave: (measurement: Measurement) => void;
  measurement: Measurement | null;
}

const MeasurementDialog: React.FC<MeasurementDialogProps> = ({ visible, onClose, onSave, measurement }) => {
  const { t } = useTranslation();
  const [form] = Form.useForm();
  const [elements, setElements] = React.useState<Element[]>([]);
  const [prices, setPrices] = React.useState<Price[]>([]);

  React.useEffect(() => {
    const fetchDependencies = async () => {
      try {
        const fetchedElements = await elementService.readAll();
        setElements(fetchedElements);
        const fetchedPrices = await priceService.readAll();
        setPrices(fetchedPrices);
      } catch (error) {
        console.error('Failed to fetch elements or prices', error);
      }
    };
    fetchDependencies();
  }, []);

  React.useEffect(() => {
    if (measurement) {
      form.setFieldsValue(measurement);
    } else {
      form.resetFields();
      form.setFieldsValue({ params_json: {}, measured_quantity: 0 });
    }
  }, [measurement, form]);

  const handleSave = () => {
    form.validateFields().then(values => {
      onSave({ ...measurement, ...values });
    });
  };

  return (
    <Modal
      title={measurement ? t('Editar Medición') : t('Añadir Medición')}
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
      <Form form={form} layout="vertical" name="measurement_form">
        <Form.Item
          name="element_id"
          label={t('Elemento')}
          rules={[{ required: true, message: t('Por favor selecciona un elemento') }]}
        >
          <Select placeholder={t('Selecciona un elemento')}>
            {elements.map(element => (
              <Select.Option key={element.id} value={element.id}>
                {element.code} - {element.description}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>
        <Form.Item
          name="price_id"
          label={t('Precio')}
          rules={[{ required: true, message: t('Por favor selecciona un precio') }]}
        >
          <Select placeholder={t('Selecciona un precio')}>
            {prices.map(price => (
              <Select.Option key={price.id} value={price.id}>
                {price.code} - {price.description}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>
        <Form.Item
          name="measured_quantity"
          label={t('Cantidad Medida')}
          rules={[{ required: true, message: t('Por favor introduce la cantidad medida') }]}
        >
          <InputNumber min={0} style={{ width: '100%' }} />
        </Form.Item>
        <Form.Item
          name="measurement_text"
          label={t('Texto de Medición')}
        >
          <Input.TextArea rows={4} />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default MeasurementDialog;
