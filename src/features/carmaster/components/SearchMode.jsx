import React from 'react';
import { TextInput, Button, Card, ThemeIcon, Text, Transition, Group, Stack } from '@mantine/core';
import { Car, ArrowRight, PencilLine, AlertCircle } from 'lucide-react';
import RecentSearchList from './RecentSearchList';

export default function SearchMode({ viewMode, onSearch, carNumber, setCarNumber, onBackToSearch, searchError, recentCars }) {
    const isFormMode = viewMode === 'FORM';

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            onSearch();
        }
    };

    return (
        <div className="max-w-xl mx-auto pt-4 pb-2">
            <Transition mounted={true} transition="fade" duration={400} timingFunction="ease">
                {(styles) => (
                    <Card
                        style={styles}
                        radius="xl"
                        padding={0}
                        shadow={isFormMode ? 'xl' : 'sm'}
                        withBorder
                        className={`transition-all duration-500 overflow-hidden relative !p-7 ${isFormMode
                            ? 'bg-gradient-to-br from-hyundai-navy to-[#001a3d] border-white/10'
                            : 'bg-white border-gray-100'
                            }`}
                    >
                        {!isFormMode ? (
                            <Stack gap="xs">
                                <Group align="center" wrap="nowrap" gap={6} className="w-full">
                                    <TextInput
                                        size="xl"
                                        variant="filled"
                                        radius="xl"
                                        placeholder="예)123가4567"
                                        data-testid="input-car-number"
                                        value={carNumber}
                                        onChange={(e) => setCarNumber(e.target.value.replace(/\s/g, ''))}
                                        onKeyDown={handleKeyDown}
                                        className="flex-1 min-w-0"
                                        classNames={{
                                            input: '!text-[22px] !font-black tracking-widest bg-gray-50 focus:bg-white transition-colors h-[64px] px-6',
                                        }}
                                    />
                                    <Button
                                        size="xl"
                                        radius="xl"
                                        color="hyundai-blue"
                                        data-testid="button-search-car"
                                        type="button"
                                        onClick={onSearch}
                                        className="h-[64px] w-[65px] p-0 shadow-lg shadow-hyundai-blue/20 transition-transform active:scale-95 shrink-0"
                                        style={{ height: '64px' }}
                                    >
                                        <ArrowRight size={28} strokeWidth={3} color="white" />
                                    </Button>
                                </Group>

                                {searchError && (
                                    <Group justify="center" gap="xs" className="animate-in fade-in slide-in-from-top-2">
                                        <AlertCircle size={14} className="text-rose-500" />
                                        <Text c="red.6" size="sm" fw={700}>
                                            {searchError}
                                        </Text>
                                    </Group>
                                )}

                                <RecentSearchList
                                    recentCars={recentCars}
                                    onSelect={(car) => {
                                        const normalized = car.replace(/\s/g, '');
                                        setCarNumber(normalized);
                                        // Use a small timeout to ensure state is updated before search
                                        setTimeout(() => onSearch(normalized), 50);
                                    }}
                                />
                            </Stack>
                        ) : (
                            <Group justify="center" align="center" gap="xl" w="100%" px="md">
                                <Group gap="md" wrap="nowrap" className="shrink-0">
                                    <ThemeIcon
                                        size={56}
                                        radius="md"
                                        variant="light"
                                        color="gray.0"
                                        className="bg-white/10 text-white ring-1 ring-white/10 shrink-0"
                                    >
                                        <Car size={28} strokeWidth={1.5} />
                                    </ThemeIcon>
                                    <div className="min-w-0 text-left">
                                        <Text size="xs" fw={900} tt="uppercase" opacity={0.6} c="white" ls="0.2em">
                                            Selected Vehicle
                                        </Text>
                                        <Text size="40px" fw={900} c="white" ls="0.1em" lh={1.1}>
                                            {carNumber}
                                        </Text>
                                    </div>
                                </Group>
                                <Button
                                    variant="white"
                                    color="dark"
                                    data-testid="button-change-car-number"
                                    type="button"
                                    onClick={onBackToSearch}
                                    leftSection={<PencilLine size={16} />}
                                    radius="xl"
                                    size="md"
                                    className="shadow-sm hover:shadow-md transition-all shrink-0 px-8"
                                >
                                    번호 변경
                                </Button>
                            </Group>
                        )}
                    </Card>
                )}
            </Transition>
        </div>
    );
}
