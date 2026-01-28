import { Place } from '@fleetbase/sdk';
import { faPenToSquare, faTimes, faTrash } from '@fortawesome/free-solid-svg-icons';
import { Portal } from '@gorhom/portal';
import { useNavigation } from '@react-navigation/native';
import { format } from 'date-fns';
import { useCallback, useLayoutEffect, useState } from 'react';
import { Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Separator, Text, useTheme, XStack, YStack } from 'tamagui';
import Badge from '../components/Badge';
import HeaderButton from '../components/HeaderButton';
import LoadingOverlay from '../components/LoadingOverlay';
import PlaceMapView from '../components/PlaceMapView';
import { useTempStore } from '../contexts/TempStoreContext';
import useFleetbase from '../hooks/use-fleetbase';
import { formatCurrency } from '../utils/format';

const FuelReportScreen = () => {
    const theme = useTheme();
    const navigation = useNavigation();
    const insets = useSafeAreaInsets();
    const { adapter } = useFleetbase();
    const {
        store: { fuelReport },
    } = useTempStore();
    const location = new Place({ id: fuelReport.id, location: fuelReport.location });
    const [isLoading, setIsLoading] = useState(false);

    useLayoutEffect(() => {
        navigation.setOptions({
            headerLeft: (props) => (
                <Text color='$textPrimary' fontSize={18} fontWeight='bold' numberOfLines={1}>
                    {format(new Date(fuelReport.created_at), 'MMM dd, yyyy HH:mm')}
                </Text>
            ),
        });
    }, [navigation, fuelReport]);

    const handleDeleteFuelReport = useCallback(() => {
        const handleDelete = async () => {
            setIsLoading(true);

            try {
                await adapter.delete(`fuel-reports/${fuelReport.id}`);
                navigation.goBack();
            } catch (err) {
                console.warn('Error deleting fuel report:', err);
            } finally {
                setIsLoading(false);
            }
        };

        Alert.alert('Confirmar eliminación', '¿Está seguro de que desea eliminar este informe de combustible?', [
            { text: 'Cancelar', style: 'cancel' },
            { text: 'Eliminar informe de combustible', onPress: handleDelete },
        ]);
    }, [adapter]);

    return (
        <YStack flex={1} bg='$background'>
            <Portal hostName='FuelReportScreenHeaderRightPortal'>
                <XStack space='$3'>
                    <HeaderButton
                        icon={faPenToSquare}
                        onPress={() => navigation.navigate('EditFuelReport', { fuelReport })}
                        bg='$info'
                        iconColor='$infoText'
                        borderWidth={1}
                        borderColor='$infoBorder'
                    />
                    <HeaderButton icon={faTrash} onPress={handleDeleteFuelReport} bg='$error' iconColor='$errorText' borderWidth={1} borderColor='$errorBorder' />
                    <HeaderButton icon={faTimes} onPress={() => navigation.goBack()} />
                </XStack>
            </Portal>
            <LoadingOverlay visible={isLoading} text='Eliminando informe de combustible...' />
            <YStack py='$3' space='$3'>
                <XStack px='$3' alignItems='center' space='$3'>
                    <YStack alignItems='flex-start'>
                        <Text color='$textSecondary' fontSize={17} fontWeight='bold'>
                            Odómetro:
                        </Text>
                    </YStack>
                    <YStack flex={1} alignItems='flex-end'>
                        <Text color='$textPrimary' fontSize={17} numberOfLines={1}>
                            {fuelReport.odometer}
                        </Text>
                    </YStack>
                </XStack>
                <Separator />
                <XStack px='$3' alignItems='center' space='$3'>
                    <YStack alignItems='flex-start'>
                        <Text color='$textSecondary' fontSize={17} fontWeight='bold'>
                            Volumen:
                        </Text>
                    </YStack>
                    <YStack flex={1} alignItems='flex-end'>
                        <Text color='$textPrimary' fontSize={17} numberOfLines={1}>
                            {fuelReport.volume} {fuelReport.metric_unit}
                        </Text>
                    </YStack>
                </XStack>
                <Separator />
                <XStack px='$3' alignItems='center' space='$3'>
                    <YStack alignItems='flex-start'>
                        <Text color='$textSecondary' fontSize={17} fontWeight='bold'>
                            Vehículo:
                        </Text>
                    </YStack>
                    <YStack flex={1} alignItems='flex-end'>
                        <Text color='$textPrimary' fontSize={17} numberOfLines={1}>
                            {fuelReport.vehicle_name ?? 'N/A'}
                        </Text>
                    </YStack>
                </XStack>
                <Separator />
                <XStack px='$3' alignItems='center' space='$3'>
                    <YStack alignItems='flex-start'>
                        <Text color='$textSecondary' fontSize={17} fontWeight='bold'>
                            Costo:
                        </Text>
                    </YStack>
                    <YStack flex={1} alignItems='flex-end'>
                        <Text color='$textPrimary' fontSize={17} numberOfLines={1}>
                            {formatCurrency(fuelReport.amount, fuelReport.currency)}
                        </Text>
                    </YStack>
                </XStack>
                <Separator />
                <XStack px='$3' alignItems='center' space='$3'>
                    <YStack alignItems='flex-start'>
                        <Text color='$textSecondary' fontSize={17} fontWeight='bold'>
                            Estado:
                        </Text>
                    </YStack>
                    <YStack flex={1} alignItems='flex-end'>
                        <Badge status={fuelReport.status} fontSize={13} py='$2' />
                    </YStack>
                </XStack>
                <Separator />
                <YStack px='$3' space='$3'>
                    <YStack alignItems='flex-start'>
                        <Text color='$textSecondary' fontSize={17} fontWeight='bold'>
                            Ubicación reportada:
                        </Text>
                    </YStack>
                    <YStack flex={1} alignItems='flex-start'>
                        <PlaceMapView place={location} width='100%' height={200} borderWidth={1} borderColor='$borderColor' />
                    </YStack>
                </YStack>
            </YStack>
        </YStack>
    );
};

export default FuelReportScreen;
