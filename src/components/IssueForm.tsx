import { faSave } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { PortalHost } from '@gorhom/portal';
import { useNavigation } from '@react-navigation/native';
import { underscore } from 'inflected';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Button, Spinner, Text, useTheme, YStack } from 'tamagui';
import BottomSheetSelect from '../components/BottomSheetSelect';
import TextAreaSheet from '../components/TextAreaSheet';
import { getIssueCategories, getIssuePriorities, getIssueStatuses, getIssueTypes, IssuePriority, IssueStatus } from '../constants/Enums';
import { uppercase } from '../utils/format';

const IssueForm = ({ value = {}, onSubmit, isSubmitting = false, submitText = 'Publicar Problema' }) => {
    const theme = useTheme();
    const navigation = useNavigation();
    const insets = useSafeAreaInsets();
    const [issue, setIssue] = useState({
        status: IssueStatus.PENDING,
        priority: IssuePriority.LOW,
        ...value,
    });
    const [isBottomSheetPresenting, setIsBottomSheetPresenting] = useState(false);

    const isValid = useMemo(() => {
        return !!issue.type && !!issue.category && !!issue.report;
    }, [issue.type, issue.category, issue.report]);

    const handleUpdateIssue = (key, value) => {
        setIssue((prev) => ({
            ...prev,
            [key]: value,
        }));
    };

    const handleSubmit = useCallback(() => {
        if (onSubmit && isValid) {
            const formattedIssue = {
                ...issue,
                type: underscore(issue.type),
                priority: underscore(issue.priority),
                status: underscore(issue.status),
            };
            onSubmit(formattedIssue);
        }
    }, [onSubmit, isValid, issue]);

    useEffect(() => {
        navigation.setOptions({
            gestureEnabled: !isBottomSheetPresenting,
        });
    }, [isBottomSheetPresenting]);

    return (
        <YStack flex={1}>
            <YStack py='$3' space='$4'>
                <YStack px='$3' space='$2'>
                    <Text color='$textPrimary' fontSize={18} fontWeight='bold' px='$1'>
                        Tipo de Problema
                    </Text>
                    <BottomSheetSelect
                        value={issue.type}
                        options={getIssueTypes()}
                        optionLabel='value'
                        optionValue='key'
                        onChange={(value) => handleUpdateIssue('type', value)}
                        title='Seleccione el tipo de problema'
                        humanize={true}
                        portalHost='IssueFormPortal'
                        snapTo='100%'
                        onBottomSheetPositionChanged={setIsBottomSheetPresenting}
                    />
                </YStack>
                <YStack px='$3' space='$2'>
                    <Text color='$textPrimary' fontSize={18} fontWeight='bold' px='$1'>
                        Categoría de problema
                    </Text>
                    <BottomSheetSelect
                        value={issue.category}
                        options={getIssueCategories(uppercase(underscore(issue.type)))}
                        onChange={(value) => handleUpdateIssue('category', value)}
                        title='Seleccionar categoría de problema'
                        humanize={true}
                        portalHost='IssueFormPortal'
                        snapTo='100%'
                        onBottomSheetPositionChanged={setIsBottomSheetPresenting}
                    />
                </YStack>
                <YStack px='$3' space='$2'>
                    <Text color='$textPrimary' fontSize={18} fontWeight='bold' px='$1'>
                        Prioridad del problema
                    </Text>
                    <BottomSheetSelect
                        value={issue.priority}
                        options={getIssuePriorities()}
                        optionLabel='value'
                        optionValue='key'
                        onChange={(value) => handleUpdateIssue('priority', value)}
                        title='Seleccionar prioridad de problema'
                        humanize={true}
                        portalHost='IssueFormPortal'
                        snapTo='100%'
                        onBottomSheetPositionChanged={setIsBottomSheetPresenting}
                    />
                </YStack>
                <YStack px='$3' space='$2'>
                    <Text color='$textPrimary' fontSize={18} fontWeight='bold' px='$1'>
                        Estado del problema
                    </Text>
                    <BottomSheetSelect
                        value={issue.status}
                        options={getIssueStatuses()}
                        optionLabel='value'
                        optionValue='key'
                        onChange={(value) => handleUpdateIssue('status', value)}
                        title='Selecciona el estado del problema'
                        humanize={true}
                        portalHost='IssueFormPortal'
                        snapTo='100%'
                        onBottomSheetPositionChanged={setIsBottomSheetPresenting}
                    />
                </YStack>
                <YStack px='$3' space='$2'>
                    <Text color='$textPrimary' fontSize={18} fontWeight='bold' px='$1'>
                        Informe de problemas
                    </Text>
                    <TextAreaSheet
                        value={issue.report}
                        onChange={(value) => handleUpdateIssue('report', value)}
                        title='Issue Report'
                        placeholder='Escriba su informe de problemas...'
                        portalHost='IssueFormPortal'
                        snapTo='100%'
                        onBottomSheetPositionChanged={setIsBottomSheetPresenting}
                    />
                </YStack>
            </YStack>
            <YStack bg='$background' position='absolute' bottom={insets.bottom} left={0} right={0} borderTopWidth={1} borderColor='$borderColor'>
                <YStack px='$2' py='$4'>
                    <Button
                        onPress={handleSubmit}
                        bg='$info'
                        borderWidth={1}
                        borderColor='$infoBorder'
                        height={50}
                        disabled={isSubmitting || !isValid}
                        opacity={isSubmitting || !isValid ? 0.6 : 1}
                    >
                        <Button.Icon>{isSubmitting ? <Spinner color='$infoText' /> : <FontAwesomeIcon icon={faSave} color={theme['$infoText'].val} size={16} />}</Button.Icon>
                        <Button.Text color='$infoText' fontSize={15}>
                            {submitText}
                        </Button.Text>
                    </Button>
                </YStack>
            </YStack>
            <PortalHost name='IssueFormPortal' />
        </YStack>
    );
};

export default IssueForm;
