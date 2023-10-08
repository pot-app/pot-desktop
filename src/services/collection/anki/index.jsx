import { fetch, Body } from '@tauri-apps/api/http';
import { store } from '../../../utils/store';

export async function collection(source, target, options = {}) {
    const { config } = options;

    let ankiConfig = (await store.get('anki')) ?? {};
    if (config !== undefined) {
        ankiConfig = config;
    }
    const port = ankiConfig['port'] ?? 8765;

    async function ankiConnect(action, version, params = {}) {
        let res = await fetch(`http://127.0.0.1:${port}`, {
            method: 'POST',
            body: Body.json({ action, version, params }),
        });
        return res.data;
    }

    function ankiText(target){
        let result = "";
        if (typeof target === "object") {
            for (let explanation of target.explanations) {
                result += explanation.trait + ". ";
                let index=0;
                for (let explain of explanation.explains) {
                    index++;
                    if (index !== explanation.explains.length) {
                        result += explain + "; "
                    } else {
                        result += explain + "<br>"
                    }
                }
            }
        } else {
            return target;
        }

        return result;
    }

    await ankiConnect('createDeck', 6, { deck: 'Pot' });
    await ankiConnect('createModel', 6, {
        modelName: 'Pot Card',
        inOrderFields: ['Front', 'Back'],
        isCloze: false,
        cardTemplates: [
            {
                Name: 'Pot Card',
                Front: '{{Front}}',
                Back: '{{FrontSide}}<hr id=answer>{{Back}}',
            },
        ],
    });
    await ankiConnect('addNote', 6, {
        note: {
            deckName: 'Pot',
            modelName: 'Pot Card',
            fields: {
                Front: source,
                Back: ankiText(target),
            },
        },
    });
}

export * from './Config';
export * from './info';
