import Chat from '../../components/Chat';
import { useParams } from 'react-router-dom';
import Preinput from '../../components/Preinput';

export default function QSearch() {
    const { key, name } = useParams();

    return (
        <>
            {key ? (
                <Chat
                    QSearch={true}
                    key_={key}
                />
            ) : (
                <Preinput
                // messages={messages}
                // addPrompt={addPrompt}
                />
            )}
        </>
    );
}
