import React, { useRef, useEffect } from 'react';
import { nanoid } from 'nanoid';
import { HiOutlineVolumeUp } from 'react-icons/hi';

function PronunciationView({ pronunciations, speak, fontSize }) {
    if (!pronunciations?.length) return null;
    return pronunciations.map((p, i) => (
        <div key={p.region ?? p.symbol ?? i}>
            {p.region && <span className={`text-[${fontSize}px] mr-[12px] text-default-500`}>{p.region}</span>}
            {p.symbol && <span className={`text-[${fontSize}px] mr-[12px] text-default-500`}>{p.symbol}</span>}
            {p.voice && (
                <HiOutlineVolumeUp
                    className={`text-[${fontSize}px] inline-block my-auto cursor-pointer`}
                    onClick={() => speak(p.voice)}
                />
            )}
        </div>
    ));
}

function ExplanationsView({ explanations, fontSize }) {
    if (!explanations?.length) return null;
    return explanations.map((group) => (
        <div key={nanoid()}>
            {group.explains?.map((explain, i) => (
                <span key={nanoid()}>
                    {i === 0 ? (
                        <>
                            <span className={`text-[${fontSize - 2}px] text-default-500 mr-[12px]`}>{group.trait}</span>
                            <span className={`font-bold text-[${fontSize}px] select-text`}>{explain}</span>
                            <br />
                        </>
                    ) : (
                        <span className={`text-[${fontSize - 2}px] text-default-500 select-text mr-1`}>{explain}</span>
                    )}
                </span>
            ))}
        </div>
    ));
}

function AssociationsView({ associations, fontSize }) {
    if (!associations?.length) return null;
    return associations.map((a) => (
        <div key={nanoid()}>
            <span className={`text-[${fontSize}px] text-default-500`}>{a}</span>
        </div>
    ));
}

function SentencesView({ sentences, fontSize }) {
    if (!sentences?.length) return null;
    return sentences.map((s, i) => (
        <div key={nanoid()}>
            <span className={`text-[${fontSize - 2}px] mr-[12px]`}>{i + 1}.</span>
            {s.source && (
                <span
                    className={`text-[${fontSize}px] select-text`}
                    dangerouslySetInnerHTML={{ __html: s.source }}
                />
            )}
            {s.target && (
                <div
                    className={`text-[${fontSize}px] select-text text-default-500`}
                    dangerouslySetInnerHTML={{ __html: s.target }}
                />
            )}
        </div>
    ));
}

export default function ResultContent({ result, error, appFontSize, speak, textAreaRef }) {
    const isString = typeof result === 'string';

    useEffect(() => {
        if (textAreaRef.current) {
            textAreaRef.current.style.height = '0px';
            if (result !== '') {
                textAreaRef.current.style.height = textAreaRef.current.scrollHeight + 'px';
            }
        }
    }, [result, textAreaRef]);

    return (
        <>
            {isString ? (
                <textarea
                    ref={textAreaRef}
                    className={`text-[${appFontSize}px] h-0 resize-none bg-transparent select-text outline-none`}
                    readOnly
                    value={result}
                />
            ) : (
                <div>
                    <PronunciationView
                        pronunciations={result['pronunciations']}
                        speak={speak}
                        fontSize={appFontSize}
                    />
                    <ExplanationsView
                        explanations={result['explanations']}
                        fontSize={appFontSize}
                    />
                    <br />
                    <AssociationsView
                        associations={result['associations']}
                        fontSize={appFontSize}
                    />
                    <SentencesView
                        sentences={result['sentence']}
                        fontSize={appFontSize}
                    />
                </div>
            )}
            {error !== '' &&
                error.split('\n').map((v) => (
                    <p
                        key={v}
                        className={`text-[${appFontSize}px] text-red-500`}
                    >
                        {v}
                    </p>
                ))}
        </>
    );
}
