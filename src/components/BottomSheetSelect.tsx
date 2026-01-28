import { faChevronRight } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import BottomSheet, { BottomSheetFlatList, BottomSheetTextInput, BottomSheetView } from '@gorhom/bottom-sheet';
import { Portal } from '@gorhom/portal';
import { titleize as titleizeString } from 'inflected';
import { forwardRef, useCallback, useImperativeHandle, useMemo, useRef, useState } from 'react';
import { Keyboard } from 'react-native';
import { Button, Text, useTheme, XStack, YStack } from 'tamagui';
import useAppTheme from '../hooks/use-app-theme';

const BottomSheetSelect = forwardRef(
    (
        {
            value,
            onChange,
            onSelect,
            options = [],
            optionValue,
            optionLabel,
            renderOption,
            placeholder = 'Seleccione una opción',
            searchPlaceholder = 'Opciones de búsqueda',
            title,
            portalHost = 'MainPortal',
            snapTo = '90%',
            humanize = false,
            onBottomSheetPositionChanged,
            onBottomSheetOpened,
            onBottomSheetClosed,
            virtual = false,
            renderInPlace = false,
        },
        ref
    ) => {
        const theme = useTheme();
        const { isDarkMode } = useAppTheme();
        const [selected, setSelected] = useState(value);
        const [searchTerm, setSearchTerm] = useState('');
        const bottomSheetRef = useRef(null);
        const searchInputRef = useRef(null);
        const snapPoints = useMemo(() => [snapTo], [snapTo]);

        // Expose bottomSheetRef to parent components
        useImperativeHandle(
            ref,
            () => ({
                openBottomSheet,
                closeBottomSheet,
                getRef: () => bottomSheetRef.current,
            }),
            [openBottomSheet, closeBottomSheet]
        );

        const filteredOptions = useMemo(() => {
            return options.filter((option) => {
                const lowerSearch = searchTerm.toLowerCase();
                if (lowerSearch) {
                    if (typeof option === 'string') {
                        return option.toLowerCase().includes(lowerSearch);
                    }

                    const optionLabel = typeof optionLabel === 'string' ? option[optionLabel] : '';
                    const optionValue = typeof optionValue === 'string' ? option[optionValue] : '';
                    return optionValue.toLowerCase().includes(lowerSearch) || optionLabel.toLowerCase().includes(lowerSearch);
                }

                return true;
            });
        }, [searchTerm, options, optionLabel, optionValue]);

        const openBottomSheet = () => {
            Keyboard.dismiss();
            bottomSheetRef.current?.snapToPosition(snapTo);
        };

        const closeBottomSheet = () => {
            Keyboard.dismiss();
            bottomSheetRef.current?.close();
        };

        const handleSelect = useCallback(
            (option) => {
                setSelected(option);
                closeBottomSheet();

                if (typeof onChange === 'function') {
                    onChange(option);
                }

                if (typeof onSelect === 'function') {
                    onSelect(option);
                }
            },
            [setSelected]
        );

        const renderSelected = useCallback(() => {
            if (typeof selected === 'string') {
                if (humanize === true) {
                    return titleizeString(selected);
                }
                return selected;
            }

            if (typeof optionLabel === 'string' && isObject(selected)) {
                return selected[optionLabel];
            }
        }, [selected]);

        const handleBottomSheetPositionChange = useCallback(
            (fromIndex, toIndex) => {
                const isOpen = toIndex >= 0;

                if (typeof onBottomSheetPositionChanged === 'function') {
                    onBottomSheetPositionChanged(isOpen, fromIndex, toIndex);
                }

                if (isOpen === true && typeof onBottomSheetOpened === 'function') {
                    onBottomSheetOpened(isOpen, fromIndex, toIndex);
                }

                if (isOpen === false && typeof onBottomSheetClosed === 'function') {
                    onBottomSheetClosed(isOpen, fromIndex, toIndex);
                }
            },
            [onBottomSheetPositionChanged, onBottomSheetOpened, onBottomSheetClosed]
        );

        const RenderBottomSheet = () => {
            return (
                <BottomSheet
                    ref={bottomSheetRef}
                    index={-1}
                    snapPoints={snapPoints}
                    onAnimate={handleBottomSheetPositionChange}
                    keyboardBehavior='extend'
                    keyboardBlurBehavior='none'
                    enableDynamicSizing={false}
                    enablePanDownToClose={true}
                    enableOverDrag={false}
                    style={{ flex: 1, width: '100%' }}
                    backgroundStyle={{ 
                        backgroundColor: theme.background.val, 
                        borderWidth: 1, 
                        borderColor: theme.borderColorWithShadow.val,
                        borderTopLeftRadius: 20,
                        borderTopRightRadius: 20,
                    }}
                    handleIndicatorStyle={{ 
                        backgroundColor: theme['$gray-400']?.val || theme.secondary.val,
                        width: 40,
                        height: 5,
                    }}
                >
                    {title && (
                        <YStack px='$4' pt='$2' pb='$3'>
                            <Text color='$textPrimary' fontSize={20} fontWeight='bold'>
                                {title}
                            </Text>
                        </YStack>
                    )}
                    <YStack px='$4' pb='$2'>
                        <BottomSheetTextInput
                            ref={searchInputRef}
                            placeholder={searchPlaceholder}
                            onChangeText={setSearchTerm}
                            autoCapitalize={false}
                            autoComplete='off'
                            autoCorrect={false}
                            style={{
                                color: theme.textPrimary.val,
                                backgroundColor: theme.surface.val,
                                borderWidth: 1,
                                borderColor: theme.borderColor.val,
                                padding: 14,
                                borderRadius: 13,
                                fontSize: 14,
                                marginBottom: 10,
                            }}
                        />
                    </YStack>
                    <BottomSheetView
                        style={{ flex: 1, backgroundColor: theme.background.val, paddingHorizontal: 16, borderColor: theme.borderColorWithShadow.val, borderWidth: 1, borderTopWidth: 0 }}
                    >
                        <BottomSheetFlatList
                            style={{ flex: 1 }}
                            contentContainerStyle={{ paddingBottom: 20 }}
                            data={filteredOptions}
                            keyExtractor={(item, index) => index.toString()}
                            renderItem={({ item, index }) => {
                                if (typeof renderOption === 'function') {
                                    return renderOption({ item, index, handleSelect });
                                }

                                return (
                                    <Button
                                        size='$4'
                                        onPress={() => handleSelect(typeof optionValue === 'string' ? item[optionValue] : item)}
                                        bg='$surface'
                                        justifyContent='space-between'
                                        space='$2'
                                        mb='$3'
                                        px='$4'
                                        py='$3.5'
                                        height={56}
                                        borderRadius='$4'
                                        hoverStyle={{
                                            scale: 0.98,
                                            opacity: 0.8,
                                        }}
                                        pressStyle={{
                                            scale: 0.98,
                                            opacity: 0.8,
                                        }}
                                    >
                                        <XStack flex={1} alignItems='center' justifyContent='space-between'>
                                            <Text color='$textPrimary' fontSize={16}>
                                                {typeof optionLabel === 'string' ? item[optionLabel] : item}
                                            </Text>
                                            <FontAwesomeIcon 
                                                icon={faChevronRight} 
                                                size={18} 
                                                color={theme['$textSecondary'].val} 
                                            />
                                        </XStack>
                                    </Button>
                                );
                            }}
                        />
                    </BottomSheetView>
                </BottomSheet>
            );
        };

        console.log('[BottomSheetSelect Rendered!]');

        return (
            <YStack>
                {virtual === false && (
                    <Button justifyContent='flex-start' textAlign='left' onPress={openBottomSheet} bg='$background' borderWidth={1} borderColor='$gray-300' borderRadius='$4' elevation={2} shadowColor='#000' shadowOffset={{ width: 0, height: 1 }} shadowOpacity={0.1} shadowRadius={2}>
                        {selected ? (
                            <Button.Text color='$textPrimary' fontSize={15}>
                                {renderSelected()}
                            </Button.Text>
                        ) : (
                            <Button.Text color='$textSecondary' fontSize={15}>
                                {placeholder}
                            </Button.Text>
                        )}
                    </Button>
                )}

                {renderInPlace === true ? (
                    <RenderBottomSheet />
                ) : (
                    <Portal hostName={portalHost}>
                        <RenderBottomSheet />
                    </Portal>
                )}
            </YStack>
        );
    }
);

export default BottomSheetSelect;
