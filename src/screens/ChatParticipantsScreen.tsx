import { faChevronLeft, faPlus, faTrash } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { PortalHost } from '@gorhom/portal';
import { useNavigation } from '@react-navigation/native';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Alert, FlatList, Pressable } from 'react-native';
import { Button, Separator, Text, useTheme, XStack, YStack } from 'tamagui';
import BottomSheetSelect from '../components/BottomSheetSelect';
import ChatParticipantAvatar from '../components/ChatParticipantAvatar';
import { useChat } from '../contexts/ChatContext';
import useSocketClusterClient from '../hooks/use-socket-cluster-client';

const ChatParticipantsScreen = ({ route }) => {
    const theme = useTheme();
    const navigation = useNavigation();
    const { sendMessage, reloadChannel, removeParticipant, addParticipant, getAvailableParticipants, getChannelCurrentParticipant } = useChat();
    const { listen } = useSocketClusterClient();
    const [channel, setChannel] = useState(route.params.channel);
    const [availableParticipants, setAvailableParticipants] = useState([]);
    const availableParticipantSheetRef = useRef();
    const availableParticipantsLoadedRef = useRef(false);
    const currentParticipant = getChannelCurrentParticipant(channel);
    const canRemoveParticipants = useMemo(() => {
        return channel.created_by === currentParticipant.user;
    }, [channel]);

    const synchronouslyRemoveParticipant = useCallback((participant) => {
        setChannel((prevChannel) => {
            const removedAlready = !prevChannel.participants.some((chatParticipant) => chatParticipant.id === participant.id);
            if (removedAlready) return prevChannel;

            return {
                ...prevChannel,
                participants: prevChannel.participants.filter((chatParticipant) => chatParticipant.id !== participant.id),
            };
        });
    }, []);

    const synchronouslyAddParticipant = useCallback((user) => {
        setChannel((prevChannel) => {
            const addedAlready = prevChannel.participants.some((chatParticipant) => chatParticipant.user === user.id);
            if (addedAlready) return prevChannel;

            return {
                ...prevChannel,
                participants: [...prevChannel.participants, { id: 'temp', user: user.id, ...user }],
            };
        });
    }, []);

    const handleRemoveParticipant = useCallback(
        (participant) => {
            Alert.alert(
                'Confirmación',
                '¿Seguro que deseas eliminar a este participante del chat?',
                [
                    {
                        text: 'Cancelar',
                        style: 'cancel',
                    },
                    {
                        text: 'Eliminar participante',
                        onPress: async () => {
                            synchronouslyRemoveParticipant(participant);
                            await removeParticipant(channel, participant);
                            await reloadChannel(channel);
                        },
                    },
                ],
                { cancelable: false }
            );
        },
        [removeParticipant, reloadChannel]
    );

    const handleAddParticipant = useCallback(
        async (user) => {
            synchronouslyAddParticipant(user);
            await addParticipant(channel, user);
            await reloadChannel(channel);
        },
        [addParticipant, reloadChannel]
    );

    const handleOpenAvailableParticipants = useCallback(() => {
        if (availableParticipantSheetRef.current) {
            availableParticipantSheetRef.current.openBottomSheet();
        }
    }, [availableParticipantSheetRef.current]);

    useEffect(() => {
        const loadAvailableParticipants = async () => {
            try {
                const loadedAvailableParticipants = await getAvailableParticipants(channel);
                setAvailableParticipants(loadedAvailableParticipants);
            } catch (err) {
                console.warn('Error loading available participants:', err);
            }
        };
        if (availableParticipantsLoadedRef && availableParticipantsLoadedRef.current === false) {
            loadAvailableParticipants();
            availableParticipantsLoadedRef.current = true;
        }
    }, []);

    const renderParticipant = ({ item: participant }) => {
        return (
            <YStack>
                <XStack px='$3' py='$3' justifyContent='space-between' alignItems='center'>
                    <XStack flex={1} alignItems='center' space='$3'>
                        <YStack>
                            <ChatParticipantAvatar participant={participant} size='$3' />
                        </YStack>
                        <YStack>
                            <Text color='$textSecondary' fontSize={16} numberOfLines={1}>
                                {participant.name}
                            </Text>
                        </YStack>
                    </XStack>
                    <XStack>
                        {canRemoveParticipants && participant.id !== currentParticipant.id && (
                            <YStack>
                                <Button size='$2' bg='$error' borderWidth={1} borderColor='$errorBorder' onPress={() => handleRemoveParticipant(participant)}>
                                    <Button.Icon>
                                        <FontAwesomeIcon icon={faTrash} color={theme['$errorText'].val} />
                                    </Button.Icon>
                                    <Button.Text color='$errorText'>Eliminar</Button.Text>
                                </Button>
                            </YStack>
                        )}
                    </XStack>
                </XStack>
            </YStack>
        );
    };

    const ParticipantsHeaderBar = () => {
        return (
            <YStack bg='$background' justifyContent='center' height={80} borderBottomWidth={1} borderColor='$borderColor'>
                <XStack px='$3' justifyContent='space-between' alignItems='center'>
                    <XStack alignItems='center'>
                        <YStack mr='$2'>
                            <Button onPress={() => navigation.goBack()} bg='$surface' size='$3' circular>
                                <Button.Icon>
                                    <FontAwesomeIcon icon={faChevronLeft} color={theme.textPrimary.val} size={16} />
                                </Button.Icon>
                            </Button>
                        </YStack>
                        <YStack>
                            <Text color='$textPrimary' fontSize={24} fontWeight='bold'>
                                Participantes
                            </Text>
                        </YStack>
                    </XStack>
                    <YStack>
                        <Button onPress={handleOpenAvailableParticipants} size='$3' bg='$info' borderWidth={1} borderColor='$infoBorder'>
                            <Button.Icon>
                                <FontAwesomeIcon icon={faPlus} color={theme['$infoText'].val} />
                            </Button.Icon>
                            <Button.Text color='$infoText'>Agregar participante</Button.Text>
                        </Button>
                    </YStack>
                </XStack>
            </YStack>
        );
    };

    return (
        <YStack flex={1} bg='$background'>
            <FlatList
                data={channel.participants}
                keyExtractor={(item) => item.id}
                renderItem={renderParticipant}
                showsVerticalScrollIndicator={false}
                showsHorizontalScrollIndicator={false}
                ListHeaderComponent={<ParticipantsHeaderBar />}
                ItemSeparatorComponent={() => <Separator borderBottomWidth={1} borderColor='$borderColor' />}
            />
            <BottomSheetSelect
                ref={availableParticipantSheetRef}
                options={availableParticipants}
                onSelect={handleAddParticipant}
                renderOption={({ item: user, handleSelect }) => {
                    return (
                        <Pressable onPress={() => handleSelect(user)}>
                            <XStack px='$3' py='$3' justifyContent='space-between' alignItems='center'>
                                <XStack flex={1} alignItems='center' space='$3'>
                                    <YStack>
                                        <ChatParticipantAvatar participant={user} size='$3' />
                                    </YStack>
                                    <YStack>
                                        <Text color='$textSecondary' fontSize={16} numberOfLines={1}>
                                            {user.name}
                                        </Text>
                                    </YStack>
                                </XStack>
                            </XStack>
                        </Pressable>
                    );
                }}
                title='Seleccionar participante'
                virtual={true}
                renderInPlace={false}
                portalHost='ChatParticipantsPortal'
            />
            <PortalHost name='ChatParticipantsPortal' />
        </YStack>
    );
};

export default ChatParticipantsScreen;
