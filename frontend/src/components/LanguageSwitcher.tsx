import React from 'react';
import { useTranslation } from "react-i18next";
import { Switch, Tooltip } from "antd";
import ESIcon from '@/assets/icons/es.svg?react';
import VAIcon from '@/assets/icons/va.svg?react';

const LanguageSwitcher: React.FC = () => {
    const { t, i18n } = useTranslation();

    const onChange = (checked: boolean) => {
        const newLanguage = checked ? 'es' : 'va';
        i18n.changeLanguage(newLanguage);
        console.log(`Language changed to: ${newLanguage}`);
    };

    // Verificamos el idioma actual para el estado del Switch
    // Usamos startsWith por si el idioma tiene variantes (ej. 'es-ES')
    const isSpanish = i18n.language.startsWith('es');

    return (
        <Tooltip title={t("Selecciona idioma")}>
            <Switch
                checkedChildren={<ESIcon />}
                unCheckedChildren={<VAIcon />}
                checked={isSpanish}
                onChange={onChange}
                style={{ marginLeft: 16 }}
                aria-label={t("Selecciona idioma")}
            />
        </Tooltip>
    );
};

export default LanguageSwitcher;
