import { Navigate } from 'react-router-dom';

const routes = [
    {
        path: '/general',
        element: <div />,
    },
    {
        path: '/translate',
        element: <div />,
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
