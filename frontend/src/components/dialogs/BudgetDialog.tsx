import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Modal, Form, Input, Select, InputNumber, message } from 'antd'; 
import { DialogModes, type DialogMode } from "@/common/types";
import type { Budget, Project } from "@/models";
import { BudgetStatus } from "@/models";
import { budgetService } from "@/services"; // Removed projectService

interface Props {
    dialogOpen: boolean;
    handleClose: (budget?: Budget) => void;
    dialogMode: DialogMode;
    budget?: Budget;
    projects: Project[]; // New prop to receive projects
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

const BudgetDialog: React.FC<Props> = ({ dialogOpen, handleClose, dialogMode, budget, projects }) => {
    const { t } = useTranslation();
    const [form] = Form.useForm();

    const [loading, setLoading] = useState(false);
    // Removed loadingProjects state and useEffect for fetching projects internally

    // Sincronización del formulario
    useEffect(() => {
        if (dialogOpen) {
            form.resetFields(); // Reset fields to ensure no old data persists
            if ((dialogMode === DialogModes.UPDATE || dialogMode === DialogModes.READ) && budget) {
                form.setFieldsValue(budget);
            } else {
                form.setFieldsValue(getInitialBudget());
            }
        }
    }, [dialogOpen, dialogMode, budget, form]);

    const onOk = async () => {
        if (dialogMode === DialogModes.READ) {
            handleClose();
            return;
        }

        try {
            const values = await form.validateFields();
            setLoading(true);
            
            let result: Budget;

            if (dialogMode === DialogModes.UPDATE && budget?.id) {
                result = await budgetService.update({ ...budget, ...values });
                message.success(t("Presupuesto actualizado con éxito"));
            } else {
                result = await budgetService.create(values);
                message.success(t("Presupuesto creado con éxito"));
            }
            
            handleClose(result);
        } catch (error) {
            console.error("Error saving budget:", error);
            message.error(t("Error al guardar el presupuesto"));
        } finally {
            setLoading(false);
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
                initialValues={getInitialBudget()}
                name="budget_form"
                preserve={false}
                disabled={dialogMode === DialogModes.READ || loading}
            >
                {/* Proyecto Relacionado */}
                <Form.Item
                    label={t("Proyecto")}
                    name="project_id"
                    rules={[{ required: true, message: t("Selecciona un proyecto") }]}
                >
                    <Select 
                        // loading={loadingProjects} // Removed
                        placeholder={t("Selecciona un proyecto")}
                        options={projects.map(p => ({
                            label: `${p.code} - ${p.title}`,
                            value: p.id
                        }))}
                    />
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
                        <Select
                            options={Object.values(BudgetStatus).map((status) => ({
                                label: t(status.charAt(0).toUpperCase() + status.slice(1)),
                                value: status
                            }))}
                        />
                    </Form.Item>
                </div>
            </Form>
        </Modal>
    );
};

export default BudgetDialog;
