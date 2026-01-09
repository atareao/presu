import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Modal, Form, Input, message } from 'antd';
import { DialogModes, type DialogMode } from "@/common/types";
import type { Version } from "@/models";
import { versionService } from "@/services/version.service";

interface Props {
    dialogOpen: boolean;
    handleClose: (version?: Version) => void;
    dialogMode: DialogMode;
    version?: Version | null;
}

const getInitialVersion = (): Version => ({
    id: -1,
    name: "",
    created_at: new Date(),
    updated_at: new Date()
});

const VersionDialog: React.FC<Props> = ({ dialogOpen, handleClose, dialogMode, version }) => {
    const { t } = useTranslation();
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (dialogOpen) {
            form.resetFields(); // Reset fields to ensure no old data persists
            if ((dialogMode === DialogModes.UPDATE || dialogMode === DialogModes.READ) && version) {
                form.setFieldsValue(version);
            } else {
                form.setFieldsValue(getInitialVersion());
            }
        }
    }, [dialogOpen, dialogMode, version, form]);

    const onOk = async () => {
        if (dialogMode === DialogModes.READ) {
            handleClose();
            return;
        }

        try {
            const values = await form.validateFields();
            setLoading(true);

            let result: Version;

            if (dialogMode === DialogModes.UPDATE && version?.id) {
                // Llamada al servicio para actualizar
                result = await versionService.update({ ...version, ...values });
                message.success(t("Versión actualizada con éxito"));
            } else if (dialogMode === DialogModes.DELETE && version?.id) {
                result = await versionService.delete({ ...version, ...values });
                message.success(t("Versión eleminada con éxito"));
            } else {
                // Llamada al servicio para crear
                const { id, ...createValues } = values; // Destructure to ensure 'id' is not sent
                result = await versionService.create(createValues);
                message.success(t("Versión creada con éxito"));
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
            [DialogModes.UPDATE]: t("Editar Versión"),
            [DialogModes.CREATE]: t("Nueva Versión"),
            [DialogModes.READ]: t("Ver Versión"),
            [DialogModes.DELETE]: t("Eliminar Versión"),
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
                    initialValues={getInitialVersion()}
                    name="version_form"
                    preserve={false}
                >
                    <Form.Item
                        label={t("Nombre")}
                        name="name"
                        rules={[{ required: true, message: t("Por favor, introduce el nombre de la versión") }]}
                    >
                        <Input
                            placeholder="2025.1"
                            disabled={disabled}
                        />
                    </Form.Item>
                </Form>
        </Modal>
    );
};

export default VersionDialog;
