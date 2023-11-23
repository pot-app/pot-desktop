import React from 'react';
import { useConfig } from '../../../../hooks';

const [userPreInputs, setUserPreInputs] = useConfig('user_pre_inputs', JSON.stringify(uSysPre));
let userPreInputsData = userPreInputs && JSON.parse(userPreInputs);
const userPreInputsKeys = userPreInputsData && Object.keys(userPreInputsData);

export let uBarDefaultData = []
uBarDefaultData = userPreInputsData.map((item, index) => {
    return {
        key: item.name,
        selected: index < 4,
    };
});
console.log(uBarDefaultData)

export default function BarData() {
    const uBarDefaultData = userPreInputsData.map((item, index) => {
        return {
            key: item.name,
            selected: index < 4,
        };
    });
    return uBarDefaultData
}
