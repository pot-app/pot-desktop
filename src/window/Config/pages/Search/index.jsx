import Chat from '../../components/Chat';
export default function Search() {
    return (
        <>
            {/* 原本是使用next.js,所以调用了本地的/api/chat-completion 接口，现在直接以函数形式调用，fetchPath就无效了 */}
            <Chat fetchPath='/api/chat-completion' />
        </>
    );
}
