import { faSave } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { PortalHost } from '@gorhom/portal';
import { useNavigation } from '@react-navigation/native';
import { underscore } from 'inflected';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Keyboard, TouchableWithoutFeedback } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Button, Input, Spinner, Text, useTheme, YStack } from 'tamagui';
import BottomSheetSelect from '../components/BottomSheetSelect';
import MoneyInput from '../components/MoneyInput';
import UnitInput from '../components/UnitInput';
import { FuelReportStatus, getDriverFuelReportStatuses } from '../constants/Enums';

const FuelReportForm = ({ value = {}, onSubmit, isSubmitting = false, submitText = 'Publicar informe de combustible' }) => {
    const theme = useTheme();
    const navigation = useNavigation();
    const insets = useSafeAreaInsets();
    const [fuelReport, setFuelReport] = useState({
        status: FuelReportStatus.SUBMITTED,
        odometer: '',
        volume: '',
        cost: '',
        currency: 'USD',
        ...value,
    });
    const [isBottomSheetPresenting, setIsBottomSheetPresenting] = useState(false);

    const isValid = useMemo(() => {
        return !!fuelReport.status && !!fuelReport.odometer && !!fuelReport.volume && !!fuelReport.amount;
    }, [fuelReport.status, fuelReport.odometer, fuelReport.volume, fuelReport.amount]);

    const handleUpdateFuelReport = (key, value) => {
        setFuelReport((prev) => ({
            ...prev,
            [key]: value,
        }));
    };

    const handleSubmit = useCallback(() => {
        if (onSubmit && isValid) {
            const formattedFuelReport = {
                ...fuelReport,
                status: underscore(fuelReport.status),
            };
            onSubmit(formattedFuelReport);
        }
    }, [onSubmit, isValid, fuelReport]);

    useEffect(() => {
        navigation.setOptions({
            gestureEnabled: !isBottomSheetPresenting,
        });
    }, [isBottomSheetPresenting]);

    return (
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <YStack flex={1}>
                <YStack py='$3' space='$4'>
                    <YStack px='$3' space='$2'>
                        <Text color='$textPrimary' fontSize={18} fontWeight='bold' px='$1'>
                            Estado
                        </Text>
                        <BottomSheetSelect
                            value={fuelReport.status}
                            options={getDriverFuelReportStatuses().filter(({ key }) => key !== 'DRAFT')}
                            optionLabel='value'
                            optionValue='key'
                            onChange={(value) => handleUpdateFuelReport('status', value)}
                            title='Seleccione el estado del informe de combustible'
                            humanize={true}
                            portalHost='FuelReportFormPortal'
                            snapTo='45%'
                            onBottomSheetPositionChanged={setIsBottomSheetPresenting}
                        />
                    </YStack>
                    <YStack px='$3' space='$2'>
                        <Text color='$textPrimary' fontSize={18} fontWeight='bold' px='$1'>
                            Odómetro
                        </Text>
                        <Input
                            value={fuelReport.odometer}
                            onChangeText={(text) => handleUpdateFuelReport('odometer', text)}
                            keyboardType='phone-pad'
                            placeholder='Ingrese su kilometraje actual...'
                            placeholderTextColor='$textSecondary'
                            borderWidth={1}
                            color='$textPrimary'
                            borderColor='$gray-300'
                            borderRadius='$4'
                            bg='$background'
                            elevation={2}
                            shadowColor='#000'
                            shadowOffset={{ width: 0, height: 1 }}
                            shadowOpacity={0.1}
                            shadowRadius={2}
                        />
                    </YStack>
                    <YStack px='$3' space='$2'>
                        <Text color='$textPrimary' fontSize={18} fontWeight='bold' px='$1'>
                            Volumen
                        </Text>
                        <UnitInput
                            value={fuelReport.volume}
                            onChange={({ value, unit }) => {
                                handleUpdateFuelReport('volume', value);
                                handleUpdateFuelReport('metric_unit', unit);
                            }}
                            placeholder='Introduzca el volumen de combustible...'
                            portalHost='FuelReportFormPortal'
                            onBottomSheetPositionChanged={setIsBottomSheetPresenting}
                        />
                    </YStack>
                    <YStack px='$3' space='$2'>
                        <Text color='$textPrimary' fontSize={18} fontWeight='bold' px='$1'>
                            Costo
                        </Text>
                        <MoneyInput
                            value={fuelReport.amount}
                            defaultCurrency={fuelReport.currency}
                            onChange={({ value, currency }) => {
                                handleUpdateFuelReport('amount', value);
                                handleUpdateFuelReport('currency', currency);
                            }}
                            placeholder='Costos de combustible de entrada...'
                            portalHost='FuelReportFormPortal'
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
                <PortalHost name='FuelReportFormPortal' />
            </YStack>
        </TouchableWithoutFeedback>
    );
};

export default FuelReportForm;
