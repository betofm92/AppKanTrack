import { useNavigation } from '@react-navigation/native';
import { underscore } from 'inflected';
import { useCallback, useState } from 'react';
import { YStack } from 'tamagui';
import FuelReportForm from '../components/FuelReportForm';
import { useAuth } from '../contexts/AuthContext';
import { useTempStore } from '../contexts/TempStoreContext';
import useFleetbase from '../hooks/use-fleetbase';
import { later } from '../utils';

const EditFuelReportScreen = () => {
    const navigation = useNavigation();
    const {
        setValue,
        store: { fuelReport },
    } = useTempStore();
    const { driver } = useAuth();
    const { adapter } = useFleetbase();
    const [isLoading, setIsLoading] = useState(false);

    const handleUpdateReport = useCallback(
        async (fuelReportData) => {
            setIsLoading(true);

            try {
                const updatedFuelReport = await adapter.put(`fuel-reports/${fuelReport.id}`, {
                    ...fuelReportData,
                    driver: driver.id,
                    status: underscore(fuelReport.status),
                });
                setValue('fuelReport', updatedFuelReport);
                later(() => navigation.goBack(), 300);
            } catch (err) {
                console.warn('Error updating fuel report:', err);
            } finally {
                setIsLoading(false);
            }
        },
        [adapter, navigation]
    );

    return (
        <YStack flex={1} bg='$background'>
            <FuelReportForm value={fuelReport} onSubmit={handleUpdateReport} isSubmitting={isLoading} submitText='Actualizar informe de combustible' />
        </YStack>
    );
};

export default EditFuelReportScreen;
