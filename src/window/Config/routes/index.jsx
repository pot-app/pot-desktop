import { Navigate } from 'react-router-dom';

import Translate from '../pages/Translate';
import General from '../pages/General';

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
        element: <div />,
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
        element: <div />,
    },
    {
        path: '/',
        element: <Navigate to='/general' />,
    },
];

export default routes;
