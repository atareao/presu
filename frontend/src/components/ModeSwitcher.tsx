import React, { useContext } from 'react';
import { Switch } from "antd";
import { MoonOutlined, SunOutlined } from '@ant-design/icons';

import ModeContext from "@/components/ModeContext";

const ModeSwitcher: React.FC = () => {
    // Accedemos directamente al contexto usando el hook useContext
    const { isDarkMode, toggleMode } = useContext(ModeContext);

    // Opcional: mantener el log para depuración como tenías en la clase
    // console.log(`Rendering ModeSwitcher with isDarkMode ${isDarkMode}`);

    return (
        <Switch
            checkedChildren={<MoonOutlined />}
            unCheckedChildren={<SunOutlined />}
            checked={isDarkMode}
            onChange={toggleMode} // No es necesario envolverlo en () => si no pasas argumentos
            style={{ marginLeft: 16 }}
            aria-label="Toggle dark mode"
        />
    );
};

export default ModeSwitcher;
