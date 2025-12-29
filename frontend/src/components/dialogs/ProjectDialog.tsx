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
    project?: Project;
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
            if ((dialogMode === DialogModes.UPDATE || dialogMode === DialogModes.READ) && project) {
                form.setFieldsValue(project);
            } else {
                form.setFieldsValue(getInitialProject());
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
            } else {
                // Llamada al servicio para crear
                result = await projectService.create(values);
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

    return (
        <Modal
            title={getTitle(dialogMode)}
            open={dialogOpen}
            onOk={onOk}
            onCancel={() => handleClose()}
            confirmLoading={loading}
            okText={t("Guardar")}
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
                    <Input placeholder="PRJ-001" />
                </Form.Item>

                <Form.Item
                    label={t("Título")}
                    name="title"
                    rules={[{ required: true, message: t("El título es obligatorio") }]}
                >
                    <Input.TextArea 
                        placeholder={t("Nombre o descripción del proyecto")} 
                        rows={4} 
                    />
                </Form.Item>
            </Form>
        </Modal>
    );
};

export default ProjectDialog;
