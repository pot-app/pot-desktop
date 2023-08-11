import { Navigate } from 'react-router-dom';

import Translate from '../pages/Translate';
import General from '../pages/General';
import Hotkey from '../pages/Hotkey';
import About from '../pages/About';

const routes = [
    {
        path: '/general',
        element: <General />,
    },
    {
        path: '/translate',
        element: <Translate />,
    },
    {
        path: '/recognize',
        element: <div />,
    },
    {
        path: '/external',
        element: <div />,
    },
    {
        path: '/hotkey',
        element: <Hotkey />,
    },
    {
        path: '/service',
        element: <div />,
    },
    {
        path: '/history',
        element: <div />,
    },
    {
        path: '/about',
        element: <About />,
    },
    {
        path: '/',
        element: <Navigate to='/general' />,
    },
];

export default routes;
