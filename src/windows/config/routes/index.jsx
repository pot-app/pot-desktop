import { Navigate } from 'react-router-dom';
import ShortCutConfig from '../pages/ShortCutConfig';
import InterfaceConfig from '../pages/InterfaceConfig';
import AppConfig from '../pages/AppConfig';
import AppInfo from '../pages/AppInfo';

const routes = [
    {
        path: "/application",
        element: <AppConfig />,
    },
    {
        path: "/shortcut",
        element: <ShortCutConfig />,
    },
    {
        path: "/interface",
        element: <InterfaceConfig />,
    },
    {
        path: "/about",
        element: <AppInfo />,
    },
    {
        path: "/",
        element: <Navigate to='/application' />
    }
]

export default routes