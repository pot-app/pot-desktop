import React from 'react';

import MarkdownIt from 'markdown-it';
import mdHighlight from 'markdown-it-highlightjs';
import mdKatex from 'markdown-it-katex';

const md = MarkdownIt({ html: true }).use(mdKatex).use(mdHighlight);
const fence = md.renderer.rules.fence!;
md.renderer.rules.fence = (...args) => {
    const [tokens, idx] = args;
    const token = tokens[idx];
    const rawCode = fence(...args);

    return `<div relative>
  <div data-clipboard-text=${encodeURIComponent(token.content)} class="copy-btn">
    <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 32 32"><path fill="currentColor" d="M28 10v18H10V10h18m0-2H10a2 2 0 0 0-2 2v18a2 2 0 0 0 2 2h18a2 2 0 0 0 2-2V10a2 2 0 0 0-2-2Z" /><path fill="currentColor" d="M4 18H2V4a2 2 0 0 1 2-2h14v2H4Z" /></svg>
    <div>Copy</div>
  </div>
  ${rawCode}
  </div>`;
};

const MessageItem = (props) => {
    const { message } = props;
    // console.log(message);

    return (
        <div className='message-item'>
            <div className='meta'>
                <div className='avatar'>
                    <span className={message.role}></span>
                </div>
                <div
                    className='message'
                    dangerouslySetInnerHTML={{ __html: md.render(message.content) }}
                />
            </div>
        </div>
    );
};

export default MessageItem;
