// src/pages/admin/ProjectListPage.tsx
import React from 'react';
import { useTranslation } from 'react-i18next';
import { Table, Button, Space, Popconfirm, message } from 'antd';
import { EditOutlined, DeleteOutlined, PlusOutlined } from '@ant-design/icons';
import { Project } from '@/models';
import { projectService } from '@/services';
import { ProjectDialog } from '@/components/dialogs';
import { DialogModes } from '@/common/types';

const ProjectListPage: React.FC = () => {
  const { t } = useTranslation();
  const [projects, setProjects] = React.useState<Project[]>([]);
  const [loading, setLoading] = React.useState<boolean>(false);
  const [dialogVisible, setDialogVisible] = React.useState<boolean>(false);
  const [currentProject, setCurrentProject] = React.useState<Project | null>(null);
  const [dialogMode, setDialogMode] = React.useState<DialogModes>(DialogModes.CREATE);

  const fetchProjects = async () => {
    setLoading(true);
    try {
      const response = await projectService.readAll();
      setProjects(response);
    } catch (error) {
      console.error('Failed to fetch projects:', error);
      message.error(t('Error al cargar proyectos'));
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    fetchProjects();
  }, []);

  const handleAdd = () => {
    setCurrentProject(null);
    setDialogMode(DialogModes.CREATE);
    setDialogVisible(true);
  };

  const handleEdit = (project: Project) => {
    setCurrentProject(project);
    setDialogMode(DialogModes.UPDATE);
    setDialogVisible(true);
  };

  const handleDelete = async (id: number) => {
    try {
      await projectService.remove(id);
      message.success(t('Proyecto eliminado correctamente'));
      fetchProjects();
    } catch (error) {
      console.error('Failed to delete project:', error);
      message.error(t('Error al eliminar proyecto'));
    }
  };

  const handleDialogSave = async (project: Project) => {
    try {
      if (dialogMode === DialogModes.CREATE) {
        await projectService.create(project);
        message.success(t('Proyecto creado correctamente'));
      } else {
        await projectService.update(project);
        message.success(t('Proyecto actualizado correctamente'));
      }
      setDialogVisible(false);
      fetchProjects();
    } catch (error) {
      console.error('Failed to save project:', error);
      message.error(t('Error al guardar proyecto'));
    }
  };

  const handleDialogClose = () => {
    setDialogVisible(false);
    setCurrentProject(null);
  };

  const columns = [
    {
      title: t('Código'),
      dataIndex: 'code',
      key: 'code',
    },
    {
      title: t('Título'),
      dataIndex: 'title',
      key: 'title',
    },
    {
      title: t('Acciones'),
      key: 'actions',
      render: (_: any, record: Project) => (
        <Space size="middle">
          <Button icon={<EditOutlined />} onClick={() => handleEdit(record)} />
          <Popconfirm
            title={t('¿Estás seguro de que quieres eliminar este proyecto?')}
            onConfirm={() => handleDelete(record.id!)}
            okText={t('Sí')}
            cancelText={t('No')}
          >
            <Button icon={<DeleteOutlined />} danger />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <h1 className="text-2xl mb-4">{t('Lista de Proyectos')}</h1>
      <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd} className="mb-4">
        {t('Añadir Proyecto')}
      </Button>
      <Table
        columns={columns}
        dataSource={projects}
        rowKey="id"
        loading={loading}
        pagination={{ pageSize: 10 }}
      />
      <ProjectDialog
        visible={dialogVisible}
        onClose={handleDialogClose}
        onSave={handleDialogSave}
        project={currentProject}
        dialogMode={dialogMode}
      />
    </div>
  );
};

export default ProjectListPage;
