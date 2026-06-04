import React from 'react';
import ReactMarkdown from 'react-markdown';
import rehypeKatex from 'rehype-katex';
import remarkMath from 'remark-math';

function unwrapFencedMarkdown(value) {
    const trimmed = value.trim();
    const match = trimmed.match(/^```(?:md|markdown)?\s*\n([\s\S]*?)\n```$/i);
    return match ? match[1].trim() : value;
}

function normalizeLatex(value) {
    return value
        .split('\n')
        .map((line) => {
            const trimmed = line.trim();
            const isMarkdownTableDivider = [...trimmed].every((char) => char === '-' || char === ':' || char === '|');
            if (
                trimmed === '' ||
                trimmed.startsWith('$') ||
                trimmed.startsWith('\\[') ||
                trimmed.startsWith('\\(') ||
                trimmed.startsWith('|') ||
                isMarkdownTableDivider
            ) {
                return line;
            }

            const looksLikeDisplayMath =
                /\\(?:begin|end|frac|sum|prod|underbrace|tag|bar|mathbf|mathbb|Delta|theta|varepsilon|quad|approx|in|cdot|times)/.test(
                    trimmed
                ) && /[=<>≈∈∑∏]/.test(trimmed);

            if (!looksLikeDisplayMath) {
                return line;
            }

            const math = trimmed.replaceAll(/\\label\s*\{[^}]*\}/g, '').replaceAll(/\s+\(\d+\)\s*$/g, '');
            return `$$\n${math}\n$$`;
        })
        .join('\n');
}

function prepareMarkdown(value) {
    return normalizeLatex(unwrapFencedMarkdown(value));
}

export default function MarkdownResult({ content, fontSize }) {
    return (
        <ReactMarkdown
            className='translation-markdown select-text'
            remarkPlugins={[remarkMath]}
            rehypePlugins={[rehypeKatex]}
            components={{
                p: ({ node, ...props }) => (
                    <p
                        style={{ fontSize }}
                        {...props}
                    />
                ),
                li: ({ node, ...props }) => (
                    <li
                        style={{ fontSize }}
                        {...props}
                    />
                ),
                table: ({ node, ...props }) => (
                    <div className='translation-markdown-table'>
                        <table {...props} />
                    </div>
                ),
            }}
        >
            {prepareMarkdown(content)}
        </ReactMarkdown>
    );
}
