import React, { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Modal, Form, Input } from 'antd'; 
import { DialogModes, type DialogMode } from "@/common/types";
import type { Project } from "@/models";

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

    useEffect(() => {
        if (dialogOpen) {
            // Sigue la misma lógica de User: si hay datos (CREATE/NONE con objeto) o inicializa
            if ((dialogMode === DialogModes.UPDATE || dialogMode === DialogModes.READ) && project) {
                form.setFieldsValue(project);
            } else {
                form.setFieldsValue(getInitialProject());
            }
        }
    }, [dialogOpen, dialogMode, project, form]);

    const onOk = async () => {
        try {
            const values = await form.validateFields();
            handleClose({ ...project, ...values });
        } catch (error) {
            console.error("Validation failed:", error);
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
            okText={t("Guardar")}
            cancelText={t("Cancelar")}
            // Deshabilitamos el botón OK si solo estamos viendo
            okButtonProps={{ style: { display: dialogMode === DialogModes.READ ? 'none' : 'inline-block' } }}
        >
            <Form
                form={form}
                layout="vertical"
                initialValues={getInitialProject()}
                name="project_form"
                preserve={false}
                disabled={dialogMode === DialogModes.READ} // Deshabilita campos en modo lectura
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
