import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Modal, Form, Input, Select, InputNumber, message } from 'antd'; 
import { DialogModes, type DialogMode } from "@/common/types";
import type { Budget, Project } from "@/models";
import { BudgetStatus } from "@/models"
import { BASE_URL } from "@/constants";

interface Props {
    dialogOpen: boolean;
    handleClose: (budget?: Budget) => void;
    dialogMode: DialogMode;
    budget?: Budget;
}

const getInitialBudget = (): Budget => ({
    project_id: 0,
    code: "",
    name: "",
    version_number: 1,
    status: BudgetStatus.Draft,
    created_at: new Date(),
    updated_at: new Date()
});

const BudgetDialog: React.FC<Props> = ({ dialogOpen, handleClose, dialogMode, budget }) => {
    const { t } = useTranslation();
    const [form] = Form.useForm();

    const [projects, setProjects] = useState<Project[]>([]);
    const [loadingProjects, setLoadingProjects] = useState<boolean>(false);

    // Carga de proyectos para el Select, similar a la carga de roles en User
    useEffect(() => {
        const fetchProjects = async () => {
            setLoadingProjects(true);
            try {
                const response = await fetch(`${BASE_URL}/api/v1/projects`); 
                const data = await response.json();
                setProjects(data);
            } catch (error) {
                console.error("Error fetching projects:", error);
                message.error(t("Error al cargar los proyectos"));
            } finally {
                setLoadingProjects(false);
            }
        };

        if (dialogOpen) fetchProjects();
    }, [dialogOpen, t]);

    useEffect(() => {
        if (dialogOpen) {
            if ((dialogMode === DialogModes.UPDATE || dialogMode === DialogModes.READ) && budget) {
                form.setFieldsValue(budget);
            } else {
                form.setFieldsValue(getInitialBudget());
            }
        }
    }, [dialogOpen, dialogMode, budget, form]);

    const onOk = async () => {
        try {
            const values = await form.validateFields();
            handleClose({ ...budget, ...values });
        } catch (error) {
            console.error("Validation failed:", error);
        }
    };

    const getTitle = (mode: DialogMode) => {
        const titles = {
            [DialogModes.UPDATE]: t("Editar Presupuesto"),
            [DialogModes.CREATE]: t("Nuevo Presupuesto"),
            [DialogModes.READ]: t("Ver Presupuesto"),
            [DialogModes.DELETE]: t("Eliminar Presupuesto"),
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
            okButtonProps={{ style: { display: dialogMode === DialogModes.READ ? 'none' : 'inline-block' } }}
        >
            <Form
                form={form}
                layout="vertical"
                initialValues={getInitialBudget()}
                name="budget_form"
                preserve={false}
                disabled={dialogMode === DialogModes.READ}
            >
                {/* Proyecto Relacionado */}
                <Form.Item
                    label={t("Proyecto")}
                    name="project_id"
                    rules={[{ required: true, message: t("Selecciona un proyecto") }]}
                >
                    <Select 
                        loading={loadingProjects}
                        placeholder={t("Selecciona un proyecto")}
                    >
                        {projects.map((p) => (
                            <Select.Option key={p.id} value={p.id}>
                                {p.code} - {p.title}
                            </Select.Option>
                        ))}
                    </Select>
                </Form.Item>

                {/* Código del Presupuesto */}
                <Form.Item
                    label={t("Código Presupuesto")}
                    name="code"
                    rules={[{ required: true, message: t("El código es obligatorio") }]}
                >
                    <Input placeholder="BG-001" />
                </Form.Item>

                {/* Nombre del Presupuesto */}
                <Form.Item
                    label={t("Nombre")}
                    name="name"
                    rules={[{ required: true, message: t("El nombre es obligatorio") }]}
                >
                    <Input placeholder={t("Ej: Presupuesto ejecución material")} />
                </Form.Item>

                <div style={{ display: 'flex', gap: '16px' }}>
                    {/* Número de Versión */}
                    <Form.Item
                        label={t("Versión")}
                        name="version_number"
                        style={{ flex: 1 }}
                    >
                        <InputNumber min={1} style={{ width: '100%' }} />
                    </Form.Item>

                    {/* Estado del Presupuesto (Enum) */}
                    <Form.Item
                        label={t("Estado")}
                        name="status"
                        style={{ flex: 1 }}
                    >
                        <Select>
                            {Object.values(BudgetStatus).map((status) => (
                                <Select.Option key={status} value={status}>
                                    {t(status.charAt(0).toUpperCase() + status.slice(1))}
                                </Select.Option>
                            ))}
                        </Select>
                    </Form.Item>
                </div>
            </Form>
        </Modal>
    );
};

export default BudgetDialog;
