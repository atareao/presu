import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Modal, Form, Input, message } from 'antd';
import { DialogModes, type DialogMode } from "@/common/types";
import type { Unit } from "@/models";
import { unitService } from "@/services/unit.service";

interface Props {
    dialogOpen: boolean;
    handleClose: (unit?: Unit) => void;
    dialogMode: DialogMode;
    unit?: Unit | null;
}

const getInitialUnit = (): Unit => ({
    id: -1,
    name: "",
    symbol: "",
    description: "",
    formula: "",
    created_at: new Date(),
    updated_at: new Date()
});

const UnitDialog: React.FC<Props> = ({ dialogOpen, handleClose, dialogMode, unit }) => {
    const { t } = useTranslation();
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (dialogOpen) {
            form.resetFields(); // Reset fields to ensure no old data persists
            if ((dialogMode === DialogModes.UPDATE || dialogMode === DialogModes.READ) && unit) {
                form.setFieldsValue(unit);
            } else {
                form.setFieldsValue(getInitialUnit());
            }
        }
    }, [dialogOpen, dialogMode, unit, form]);

    const onOk = async () => {
        if (dialogMode === DialogModes.READ) {
            handleClose();
            return;
        }

        try {
            const values = await form.validateFields();
            setLoading(true);

            let result: Unit;

            if (dialogMode === DialogModes.UPDATE && unit?.id) {
                // Llamada al servicio para actualizar
                result = await unitService.update({ ...unit, ...values });
                message.success(t("Unidad actualizada con éxito"));
            } else if (dialogMode === DialogModes.DELETE && unit?.id) {
                result = await unitService.delete({ ...unit, ...values });
                message.success(t("Unidad eleminada con éxito"));
            } else {
                // Llamada al servicio para crear
                const { id, ...createValues } = values; // Destructure to ensure 'id' is not sent
                result = await unitService.create(createValues);
                message.success(t("Unidad creada con éxito"));
            }

            handleClose(result);
        } catch (error) {
            console.error("Operation failed:", error);
            message.error(t("Error al procesar la solicitud"));
        } finally {
            setLoading(false);
        }
    };

    const getTitle = (mode: DialogMode) => {
        const titles = {
            [DialogModes.UPDATE]: t("Editar Unidad"),
            [DialogModes.CREATE]: t("Nueva Unidad"),
            [DialogModes.READ]: t("Ver Unidad"),
            [DialogModes.DELETE]: t("Eliminar Unidad"),
            [DialogModes.NONE]: ""
        };
        return titles[mode] || "";
    };
    const disabled = dialogMode === DialogModes.DELETE || dialogMode === DialogModes.READ || loading;

    return (
        <Modal
            title={getTitle(dialogMode)}
            open={dialogOpen}
            onOk={onOk}
            onCancel={() => handleClose()}
            confirmLoading={loading}
            okText={dialogMode === DialogModes.DELETE ? t("Eliminar") : t("Guardar")}
            cancelText={t("Cancelar")}
            okButtonProps={{
                danger: dialogMode === DialogModes.DELETE,
                style: { display: dialogMode === DialogModes.READ ? 'none' : 'inline-block' }
            }}
        >
                <Form
                    form={form}
                    layout="vertical"
                    initialValues={getInitialUnit()}
                    name="unit_form"
                    preserve={false}
                >
                    <Form.Item
                        label={t("Nombre")}
                        name="name"
                        rules={[{ required: true, message: t("Por favor, introduce el nombre de la unidad") }]}
                    >
                        <Input
                            placeholder="m2s"
                            disabled={disabled}
                        />
                    </Form.Item>
                    <Form.Item
                        label={t("Símbolo")}
                        name="symbol"
                        rules={[{ required: true, message: t("Por favor, introduce el símbolod de la unidad") }]}
                    >
                        <Input
                            placeholder="m2"
                            disabled={disabled}
                        />
                    </Form.Item>

                    <Form.Item
                        label={t("Descripción")}
                        name="description"
                    >
                        <Input.TextArea
                            placeholder={t("Descripción de la unidad")}
                            rows={4}
                            disabled={disabled}
                        />
                    </Form.Item>

                    <Form.Item
                        label={t("Fórmula")}
                        name="formula"
                        rules={[{ required: true, message: t("Por favor, introduce la fórmula") }]}
                    >
                        <Input
                            placeholder="a * b"
                            disabled={disabled}
                        />
                    </Form.Item>
                </Form>
        </Modal>
    );
};

export default UnitDialog;
