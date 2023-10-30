import React from 'react';

const Show = (props) => {
    const { loading, fallback, children } = props;

    return <>{loading ? fallback : children}</>;
};

export default Show;
