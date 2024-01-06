import { semanticColors } from '@nextui-org/theme';
import { useTheme } from 'next-themes';

export const useToastStyle = () => {
    const { theme } = useTheme();
    const toastStyle = {
        background: theme == 'dark' ? semanticColors.dark.content1.DEFAULT : semanticColors.light.content1.DEFAULT,
        color: theme == 'dark' ? semanticColors.dark.foreground.DEFAULT : semanticColors.light.foreground.DEFAULT,
        wordBreak: 'break-all',
        select: 'text',
    };

    return toastStyle;
};
