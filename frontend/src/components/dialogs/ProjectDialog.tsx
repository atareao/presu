import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Modal, Form, Input, message } from 'antd';
import { DialogModes, type DialogMode } from "@/common/types";
import type { Project } from "@/models";
import { projectService } from "@/services";

interface Props {
    dialogOpen: boolean;
    handleClose: (project?: Project) => void;
    dialogMode: DialogMode;
    project?: Project | null;
}

const getInitialProject = (): Project => ({
    code: "",
    title: "",
    created_at: new Date(),
    updated_at: new Date()
});

const ProjectDialog: React.FC<Props> = ({ dialogOpen, handleClose, dialogMode, project }) => {
    const { t } = useTranslation();
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (dialogOpen) {
            form.resetFields(); // Reset fields to ensure no old data persists
            if (dialogMode === DialogModes.CREATE || !project) {
                form.setFieldsValue(getInitialProject());
            } else {
                form.setFieldsValue(project);
            }
        }
    }, [dialogOpen, dialogMode, project, form]);

    const onOk = async () => {
        if (dialogMode === DialogModes.READ) {
            handleClose();
            return;
        }

        try {
            const values = await form.validateFields();
            setLoading(true);

            let result: Project;

            if (dialogMode === DialogModes.UPDATE && project?.id) {
                // Llamada al servicio para actualizar
                result = await projectService.update({ ...project, ...values });
                message.success(t("Proyecto actualizado con éxito"));
            } else if (dialogMode === DialogModes.DELETE && project?.id) {
                result = await projectService.delete({ ...project, ...values });
                message.success(t("Proyecto eleminado con éxito"));
            } else {
                // Llamada al servicio para crear
                const { id, ...createValues } = values; // Destructure to ensure 'id' is not sent
                result = await projectService.create(createValues);
                message.success(t("Proyecto creado con éxito"));
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
            [DialogModes.UPDATE]: t("Editar Proyecto"),
            [DialogModes.CREATE]: t("Nuevo Proyecto"),
            [DialogModes.READ]: t("Ver Proyecto"),
            [DialogModes.DELETE]: t("Eliminar Proyecto"),
            [DialogModes.NONE]: ""
        };
        return titles[mode] || "";
    };
    const disabled = dialogMode === DialogModes.DELETE || dialogMode === DialogModes.READ;

    return (
        <Modal
            title={getTitle(dialogMode)}
            open={dialogOpen}
            onOk={onOk}
            onCancel={() => handleClose()}
            confirmLoading={loading}
            okText={DialogModes.DELETE ? t("Eliminar") : t("Guardar")}
            cancelText={t("Cancelar")}
            okButtonProps={{
                style: { display: dialogMode === DialogModes.READ ? 'none' : 'inline-block' }
            }}
        >
                <Form
                    form={form}
                    layout="vertical"
                    initialValues={getInitialProject()}
                    name="project_form"
                    preserve={false}
                    disabled={dialogMode === DialogModes.READ || loading}
                >
                    <Form.Item
                        label={t("Código")}
                        name="code"
                        rules={[{ required: true, message: t("Por favor, introduce el código del proyecto") }]}
                    >
                        <Input
                            placeholder="PRJ-001"
                            disabled={disabled}
                        />
                    </Form.Item>

                    <Form.Item
                        label={t("Título")}
                        name="title"
                        rules={[{ required: true, message: t("El título es obligatorio") }]}
                    >
                        <Input.TextArea
                            placeholder={t("Nombre o descripción del proyecto")}
                            rows={4}
                            disabled={disabled}
                        />
                    </Form.Item>
                </Form>
        </Modal>
    );
};

export default ProjectDialog;
