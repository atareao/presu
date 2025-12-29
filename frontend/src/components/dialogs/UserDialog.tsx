import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Modal, Form, Input, Switch, Select, message } from 'antd'; 
import { DialogModes, type DialogMode } from "@/common/types";
import type { User, Role } from "@/models";
import { roleService, userService } from "@/services";

interface Props {
    dialogOpen: boolean;
    handleClose: (user?: User) => void;
    dialogMode: DialogMode;
    user?: User;
}

const getInitialUser = (): Partial<User> => ({
    username: "",
    email: "",
    hashed_password: "",
    role_id: 1,
    is_active: true,
});

const UserDialog: React.FC<Props> = ({ dialogOpen, handleClose, dialogMode, user }) => {
    const { t } = useTranslation();
    const [form] = Form.useForm();

    const [roles, setRoles] = useState<Role[]>([]);
    const [loadingRoles, setLoadingRoles] = useState<boolean>(false);

    useEffect(() => {
        const fetchRoles = async () => {
            setLoadingRoles(true);
            try {
                const data = await roleService.readAll(); 
                setRoles(data);
            } catch (error) {
                console.error("Error fetching roles:", error);
                message.error(t("Error al cargar los roles"));
            } finally {
                setLoadingRoles(false);
            }
        };

        fetchRoles();
    }, [t]);

    useEffect(() => {
        if (dialogOpen) {
            if (user) {
                form.setFieldsValue(user);
            } else {
                form.setFieldsValue(getInitialUser());
            }
        }
    }, [dialogOpen, user, form]);

    const onOk = async () => {
        try {
            const values = await form.validateFields();
            let result: User | undefined;

            if (dialogMode === DialogModes.CREATE) {
                result = await userService.create(values);
            } else if (dialogMode === DialogModes.UPDATE && user) {
                result = await userService.update({ ...user, ...values });
            }
            handleClose(result);
        } catch (error) {
            console.error("Validation failed:", error);
        }
    };

    const getTitle = (mode: DialogMode) => {
        const titles = {
            [DialogModes.UPDATE]: t("Editar Usuario"),
            [DialogModes.CREATE]: t("Nuevo Usuario"),
            [DialogModes.READ]: t("Ver Usuario"),
            [DialogModes.DELETE]: t("Eliminar Usuario"),
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
        >
            <Form
                form={form}
                layout="vertical"
                initialValues={getInitialUser()}
                name="user_form"
                preserve={false}
            >
                <Form.Item
                    label={t("Username")}
                    name="username"
                    rules={[{ required: true, message: t("Por favor, introduce el nombre de usuario") }]}
                >
                    <Input placeholder="lorenzo" />
                </Form.Item>

                <Form.Item
                    label={t("Email")}
                    name="email"
                    rules={[
                        { required: true, message: t("El email es obligatorio") },
                        { type: 'email', message: t("Introduce un email válido") }
                    ]}
                >
                    <Input placeholder="usuario@correo.es" />
                </Form.Item>

                {/* Role Select - Reemplaza al InputNumber */}
                <Form.Item
                    label={t("Rol")}
                    name="role_id"
                    rules={[{ required: true, message: t("Por favor, selecciona un rol") }]}
                >
                    <Select 
                        loading={loadingRoles}
                        placeholder={t("Selecciona un rol")}
                    >
                        {roles.map((role) => (
                            <Select.Option key={role.id} value={role.id}>
                                {role.name}
                            </Select.Option>
                        ))}
                    </Select>
                </Form.Item>

                <Form.Item 
                    label={t("Activo")} 
                    name="is_active" 
                    valuePropName="checked"
                >
                    <Switch />
                </Form.Item>
            </Form>
        </Modal>
    );
};

export default UserDialog;
