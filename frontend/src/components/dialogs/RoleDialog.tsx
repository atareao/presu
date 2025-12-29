import React, { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Modal, Form, Input } from 'antd'; 
import { DialogModes, type DialogMode } from "@/common/types";
import type { Role } from "@/models";
import { roleService } from "@/services";

interface Props {
    dialogOpen: boolean;
    handleClose: (role?: Role) => void;
    dialogMode: DialogMode;
    role?: Role;
}

const getInitialRole = (): Partial<Role> => ({
    name: "",
});

const RoleDialog: React.FC<Props> = ({ dialogOpen, handleClose, dialogMode, role }) => {
    const { t } = useTranslation();
    const [form] = Form.useForm();

    useEffect(() => {
        if (dialogOpen) {
            if (role) {
                form.setFieldsValue(role);
            } else {
                form.setFieldsValue(getInitialRole());
            }
        }
    }, [dialogOpen, role, form]);

    const onOk = async () => {
        try {
            const values = await form.validateFields();
            let result: Role | undefined;

            if (dialogMode === DialogModes.CREATE) {
                result = await roleService.create(values);
            } else if (dialogMode === DialogModes.UPDATE && role) {
                result = await roleService.update({ ...role, ...values });
            }
            
            handleClose(result);
        } catch (error) {
            console.error("Validation failed:", error);
        }
    };

    const getTitle = (mode: DialogMode) => {
        const titles = {
            [DialogModes.UPDATE]: t("Editar Rol"),
            [DialogModes.CREATE]: t("Nuevo Rol"),
            [DialogModes.READ]: t("Ver Rol"),
            [DialogModes.DELETE]: t("Eliminar Rol"),
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
            okButtonProps={{ 
                style: { display: dialogMode === DialogModes.READ ? 'none' : 'inline-block' } 
            }}
        >
            <Form
                form={form}
                layout="vertical"
                initialValues={getInitialRole()}
                name="role_form"
                preserve={false}
                disabled={dialogMode === DialogModes.READ}
            >
                <Form.Item
                    label={t("Nombre del Rol")}
                    name="name"
                    extra={t("Ejemplo: SYSTEM_ADMIN, PROJECT_MANAGER")}
                    rules={[
                        { required: true, message: t("El nombre del rol es obligatorio") },
                        { 
                            pattern: /^[A-Z_]+$/, 
                            message: t("Usa solo mayúsculas y guiones bajos (SNAKE_CASE)") 
                        }
                    ]}
                >
                    <Input placeholder="ADMIN_ROLE" />
                </Form.Item>
            </Form>
        </Modal>
    );
};

export default RoleDialog;
