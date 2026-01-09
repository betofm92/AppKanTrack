import { faPenToSquare } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { format } from 'date-fns';
import { singularize } from 'inflected';
import { useCallback, useMemo, useState } from 'react';
import { FlatList, Pressable, RefreshControl } from 'react-native';
import { Button, Image, Separator, Text, useTheme, XStack, YStack } from 'tamagui';
import Badge from '../components/Badge';
import Spacer from '../components/Spacer';
import TabSwitch from '../components/TabSwitch';
import { useAuth } from '../contexts/AuthContext';
import { useTempStore } from '../contexts/TempStoreContext';
import useFleetbase from '../hooks/use-fleetbase';
import useStorage from '../hooks/use-storage';
import { later } from '../utils';
import { formatCurrency, titleize } from '../utils/format';

const DriverReportScreen = () => {
    const theme = useTheme();
    const navigation = useNavigation();
    const { driver } = useAuth();
    const { adapter } = useFleetbase();
    const { setValue } = useTempStore();
    const [issues, setIssues] = useStorage(`${driver?.id}_issues`, []);
    const [fuelReports, setFuelReports] = useStorage(`${driver?.id}_fuel_reports`, []);
    const [currentTab, setCurrentTab] = useStorage('current_reports_tab', 'issue');
    const [isRefreshing, setIsRefreshing] = useState(false);
    const reportOptions = [
        { value: 'issue', label: 'Problemas' },
        { value: 'fuel-report', label: 'Informes de combustible' },
    ];
    const currentIndex = reportOptions.findIndex((option) => option.value === currentTab);
    const content = useMemo(() => (currentTab === 'issue' ? issues : fuelReports), [currentTab, issues, fuelReports]);

    const handleCreate = useCallback(() => {
        if (currentTab === 'issue') {
            navigation.navigate('CreateIssue');
        } else {
            navigation.navigate('CreateFuelReport');
        }
    }, [currentTab, navigation]);

    const handleOpenIssue = useCallback(
        (issue) => {
            setValue('issue', issue);
            later(() => navigation.navigate('Issue'), 300);
        },
        [navigation, setValue]
    );

    const handleOpenFuelReport = useCallback(
        (fuelReport) => {
            setValue('fuelReport', fuelReport);
            later(() => navigation.navigate('FuelReport'), 300);
        },
        [navigation, setValue]
    );

    const handleRefresh = useCallback(async () => {
        setIsRefreshing(true);
        try {
            (await (currentTab === 'issue')) ? loadIssues() : loadFuelReports();
        } catch (err) {
            console.warn(`Error reloading ${titleize(currentTab)}:`, err);
        } finally {
            setIsRefreshing(false);
        }
    }, [adapter, currentTab, loadIssues, loadFuelReports]);

    const loadIssues = useCallback(
        async (params = {}) => {
            try {
                const issues = await adapter.get('issues', { driver: driver.id, sort: '-created_at', ...params });
                setIssues(issues);
            } catch (err) {
                console.warn('Error loading issues:', err);
            }
        },
        [adapter]
    );
    const loadFuelReports = useCallback(
        async (params = {}) => {
            try {
                const fuelReports = await adapter.get('fuel-reports', { driver: driver.id, sort: '-created_at', ...params });
                setFuelReports(fuelReports);
            } catch (err) {
                console.warn('Error loading fuel reports:', err);
            }
        },
        [adapter]
    );

    const renderIssues = ({ item: issue }) => {
        return (
            <Pressable onPress={() => handleOpenIssue(issue)}>
                <YStack py='$3' px='$2'>
                    <YStack borderWidth={1} borderColor='$borderColor' borderRadius='$4' gap='$3'>
                        <XStack bg='$surface' py='$3' px='$2' borderBottomWidth={1} borderColor='$borderColor' space='$2' borderTopLeftRadius='$4' borderTopRightRadius='$4'>
                            <Text size='$5' color='$textSecondary' fontWeight='bold' numberOfLines={1}>
                                Problema en:
                            </Text>
                            <Text size='$5' color='$textPrimary' fontWeight='bold' numberOfLines={1}>
                                {format(new Date(issue.created_at), 'MMM dd, yyyy HH:mm')}
                            </Text>
                        </XStack>
                        <YStack pb='$2' px='$2' gap='$2'>
                            <XStack gap='$2'>
                                <XStack gap='$2' alignItems='center'>
                                    <Text fontWeight='bold'>Estado:</Text>
                                    <Badge status={issue.status} alignSelf='flex-start' py='$1' px='$2' borderRadius='$3' numberOfLines={1} />
                                </XStack>
                                <XStack gap='$2' alignItems='center'>
                                    <Text fontWeight='bold'>Prioridad:</Text>
                                    <Badge status={issue.priority} alignSelf='flex-start' py='$1' px='$2' borderRadius='$3' numberOfLines={1} />
                                </XStack>
                            </XStack>
                            <YStack flex={1} gap='$2'>
                                <Text fontWeight='bold'>Reporte:</Text>
                                <Text color='$textSecondary' numberOfLines={3}>
                                    {issue.report}
                                </Text>
                            </YStack>
                        </YStack>
                        <Separator />
                        <YStack bg='$background' pb='$2' gap='$2' borderBottomLeftRadius='$4' borderBottomRightRadius='$4'>
                            <YStack gap='$3'>
                                <XStack gap='$2' px='$3' justifyContent='space-between'>
                                    <Text fontWeight='bold'>Tipo:</Text>
                                    <Text numberOfLines={1}>{titleize(issue.type) ?? 'N/A'}</Text>
                                </XStack>
                                <Separator />
                                <XStack gap='$2' px='$3' justifyContent='space-between'>
                                    <Text fontWeight='bold'>Categoría:</Text>
                                    <Text numberOfLines={1}>{titleize(issue.category) ?? 'N/A'}</Text>
                                </XStack>
                                <Separator />
                                <XStack gap='$2' px='$3' justifyContent='space-between'>
                                    <Text fontWeight='bold'>Vehículo:</Text>
                                    <Text numberOfLines={1}>{issue.vehicle_name ?? 'N/A'}</Text>
                                </XStack>
                                <Separator />
                                <XStack gap='$2' px='$3' pb='$2' justifyContent='space-between'>
                                    <Text fontWeight='bold'>Responsable:</Text>
                                    <Text numberOfLines={1}>{issue.reporter_name ?? 'N/A'}</Text>
                                </XStack>
                            </YStack>
                        </YStack>
                    </YStack>
                </YStack>
            </Pressable>
        );
    };

    const renderFuelReports = ({ item: fuelReport }) => {
        return (
            <Pressable onPress={() => handleOpenFuelReport(fuelReport)}>
                <YStack py='$3' px='$2'>
                    <YStack borderWidth={1} borderColor='$borderColor' borderRadius='$4' gap='$3'>
                        <XStack
                            alignItems='center'
                            justifyContent='space-between'
                            bg='$surface'
                            py='$3'
                            px='$2'
                            borderBottomWidth={1}
                            borderColor='$borderColor'
                            space='$2'
                            borderTopLeftRadius='$4'
                            borderTopRightRadius='$4'
                        >
                            <XStack space='$2'>
                                <Text size='$5' color='$textSecondary' fontWeight='bold' numberOfLines={1}>
                                    Combustible reportado:
                                </Text>
                                <Text size='$5' color='$textPrimary' fontWeight='bold' numberOfLines={1}>
                                    {format(new Date(fuelReport.created_at), 'MMM dd, yyyy HH:mm')}
                                </Text>
                            </XStack>
                            <YStack></YStack>
                        </XStack>
                        <YStack px='$2' gap='$3'>
                            <XStack gap='$2' alignItems='center'>
                                <Text fontWeight='bold'>Estado:</Text>
                                <Badge status={fuelReport.status} alignSelf='flex-start' py='$1' px='$2' borderRadius='$3' numberOfLines={1} />
                            </XStack>
                            <XStack space='$2'>
                                <YStack>
                                    <Image source={{ uri: fuelReport?.vehicle?.photo_url ?? '' }} width={42} height={42} borderRadius='$4' borderWidth={1} borderColor='$borderColor' />
                                </YStack>
                                <YStack space='$1'>
                                    <Text color='$textPrimary' fontWeight='bold'>
                                        {fuelReport?.vehicle?.name}
                                    </Text>
                                    <Text color='$textSecondary'>{fuelReport?.vehicle?.plate_number ?? fuelReport?.vehicle?.id}</Text>
                                </YStack>
                            </XStack>
                        </YStack>
                        <Separator />
                        <YStack bg='$background' pb='$2' gap='$2' borderBottomLeftRadius='$4' borderBottomRightRadius='$4'>
                            <YStack gap='$3'>
                                <XStack gap='$2' px='$3' justifyContent='space-between'>
                                    <Text fontWeight='bold'>Odometro:</Text>
                                    <Text numberOfLines={1}>{fuelReport.odometer ?? 'N/A'}</Text>
                                </XStack>
                                <Separator />
                                <XStack gap='$2' px='$3' justifyContent='space-between'>
                                    <Text fontWeight='bold'>Volumen:</Text>
                                    <Text numberOfLines={1}>{`${fuelReport?.volume} ${fuelReport?.metric_unit}` ?? 'N/A'}</Text>
                                </XStack>
                                <Separator />
                                <XStack gap='$2' px='$3' pb='$2' justifyContent='space-between'>
                                    <Text fontWeight='bold'>Costo:</Text>
                                    <Text numberOfLines={1}>{formatCurrency(fuelReport.amount, fuelReport.currency) ?? 'N/A'}</Text>
                                </XStack>
                            </YStack>
                        </YStack>
                    </YStack>
                </YStack>
            </Pressable>
        );
    };

    useFocusEffect(
        useCallback(() => {
            if (!adapter) return;
            loadIssues();
            loadFuelReports();
        }, [adapter])
    );

    return (
        <YStack flex={1} bg='$background'>
            <FlatList
                data={content}
                keyExtractor={(item, index) => index}
                renderItem={currentTab === 'issue' ? renderIssues : renderFuelReports}
                refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} tintColor={theme.borderColor.val} />}
                ItemSeparatorComponent={() => <Separator borderBottomWidth={1} borderColor='$borderColor' />}
                stickyHeaderIndices={[0]}
                ListHeaderComponent={
                    <YStack px='$2' pt='$4'>
                        <TabSwitch initialIndex={currentIndex} options={reportOptions} onTabChange={setCurrentTab} />
                    </YStack>
                }
                ListFooterComponent={<Spacer height={200} />}
                ListEmptyComponent={
                    <YStack height={500} width='100%' flex={1} alignItems='center' justifyContent='center'>
                        <Text color='$textSecondary' fontSize={22}>
                            No hay {reportOptions[currentIndex].label}
                        </Text>
                    </YStack>
                }
                showsVerticalScrollIndicator={false}
                showsHorizontalScrollIndicator={false}
            />
            <YStack bg='$background' position='absolute' bottom={0} left={0} right={0} borderTopWidth={1} borderColor='$borderColor'>
                <YStack px='$2' py='$4'>
                    <Button onPress={handleCreate} bg='$info' borderWidth={1} borderColor='$infoBorder' height={50}>
                        <Button.Icon>
                            <FontAwesomeIcon icon={faPenToSquare} color={theme['$infoText'].val} size={16} />
                        </Button.Icon>
                        <Button.Text color='$infoText' fontSize={15}>
                            Crear nuevo {singularize(reportOptions[currentIndex].label)}
                        </Button.Text>
                    </Button>
                </YStack>
            </YStack>
        </YStack>
    );
};

export default DriverReportScreen;
