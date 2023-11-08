import React from 'react';
import {
    AiOutlineLayout,
    AiOutlineTranslation,
    AiOutlineHighlight,
    AiOutlineExpandAlt,
    AiOutlineTags,
    AiOutlineFontColors,
    AiOutlineQuestionCircle,
    AiOutlineCode,
} from 'react-icons/ai';

export const systemPreInputs = {
    Summarize: {
        name: 'Summarize',
        icon: <AiOutlineLayout />,
        prompt: 'Condense the text in its original language.',
    },
    Translate: {
        name: 'Translate',
        icon: <AiOutlineTranslation />,
        prompt: 'Translate this text to $[lang]',
    },
    Rewrite: {
        name: 'Rewrite',
        icon: <AiOutlineHighlight />,
        prompt: 'Rephrase this text.',
    },
    Expand: {
        name: 'Expand',
        icon: <AiOutlineExpandAlt />,
        prompt: 'Expands the text and view detailed...',
    },
    Explain: {
        name: 'Explain',
        icon: <AiOutlineTags />,
        prompt: 'Clarify this text and define any technical...',
    },
    Grammar: {
        name: 'Grammar',
        icon: <AiOutlineFontColors />,
        prompt: 'Proofread and correct this text.',
    },
    QA: {
        name: 'Q&A',
        icon: <AiOutlineQuestionCircle />,
        prompt: 'Answer this question.',
    },
    ECodes: {
        name: 'Explain Codes',
        icon: <AiOutlineCode />,
        prompt: 'Explain the following codes: ```$[text]```',
    },
};

export let uSysPre = {};
const systemPreInputsKeys = Object.keys(systemPreInputs);

for (let key of systemPreInputsKeys) {
    uSysPre[key] = {
        name: systemPreInputs[key].name,
        prompt: systemPreInputs[key].prompt,
    };
}

export default function SysPreInputs() {}
